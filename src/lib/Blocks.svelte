<script lang="ts">
	// The avatar's grid of rounded squares, as rounded cubes. See
	// docs/splash-design.md for the thinking; in short:
	//
	//   - every cube is always outlined; how solid it looks is one number per
	//     cube, changed smoothly. Nothing switches.
	//   - the solid squares spell an N. Those cubes stand forward, fill in along
	//     the stroke when the page opens, then drift between half-faded and solid.
	//   - the dark squares are the gaps. Those cubes sit behind; the two inner
	//     columns fill from the bottom up like two level meters, faintly.
	//   - the N is grey, with emerald and coral on its diagonal. A wash of the
	//     same two colours travels along it now and then.
	//   - now and then one cube flashes its colour, or a gap flicks solid.
	//
	// Kept deliberately cheap so it holds up on weak hardware and odd browsers:
	// one instanced mesh, no shadow maps, no transparency, no post-processing,
	// device pixel ratio capped at 2, 30 frames a second, and nothing drawn
	// while the canvas is off screen or the tab is hidden. Without WebGL — or if
	// the context is lost — the still image stays. With reduced motion, one
	// still frame.
	import { onMount } from 'svelte';
	import { CORAL, EMERALD, GRID, N_GREY, N_STROKE, PITCH, RADIUS } from '$lib/avatar-grid';

	let { poster = '/splash-still.webp' }: { poster?: string } = $props();

	let host: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let live = $state(false);
	// The poster is a fallback, not a first frame: showing a bright, finished
	// picture and then cutting to the opening outlines would be a jolt. It
	// appears only if the 3D can't run, or is taking too long to arrive.
	let fallback = $state(false);

	const BLEED = 0.2; // how far the canvas extends past its box, each side; matches the styles
	const GAP_REST = -0.45; // how far the gaps sit back when nothing moves

	onMount(() => {
		let disposed = false;
		let cleanup = () => {};

		const slow = setTimeout(() => {
			if (!live) fallback = true;
		}, 4000);

		(async () => {
			let THREE: typeof import('$lib/three-kit');
			try {
				THREE = await import('$lib/three-kit');
			} catch {
				fallback = true;
				return;
			}
			if (disposed) return;

			let renderer: InstanceType<typeof THREE.WebGLRenderer>;
			try {
				renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
			} catch {
				fallback = true; // no WebGL: the poster
				return;
			}
			renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

			// A wireframe cube is painted in the page colour, so take that from
			// the page: a theme that changes --bg must not leave dark patches.
			const page = new THREE.Color(
				getComputedStyle(host).getPropertyValue('--bg').trim() || '#0b0b0c'
			);

			const scene = new THREE.Scene();
			const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
			const slab = new THREE.Group();
			scene.add(slab);

			scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1a22, 1.1));
			const key = new THREE.DirectionalLight(0xffffff, 2.2);
			key.position.set(-3, 4, 6);
			scene.add(key);
			const rim = new THREE.DirectionalLight(0x88aaff, 0.8);
			rim.position.set(4, -2, -3);
			scene.add(rim);

			// One geometry, sixteen instances. The polygon offset nudges the
			// faces back in depth so a cube's own outline never fights with it:
			// a "wireframe" cube is the cube drawn in the page colour, hiding
			// what is behind it, with its outline on top.
			const box = new THREE.RoundedBoxGeometry(1, 1, 1, 4, RADIUS);
			const material = new THREE.MeshStandardMaterial({
				roughness: 0.5,
				metalness: 0.05,
				polygonOffset: true,
				polygonOffsetFactor: 1,
				polygonOffsetUnits: 1
			});
			const mesh = new THREE.InstancedMesh(box, material, 16);
			slab.add(mesh);

			// The outline: a rounded square on the front and back faces, joined
			// at the corners — the avatar's own shape, given depth.
			const pts: number[] = [];
			const h = 0.5;
			const k = h - RADIUS;
			const arc = 6;
			const ring: [number, number][] = [];
			for (let q = 0; q < 4; q++) {
				const cx = q === 0 || q === 3 ? k : -k;
				const cy = q < 2 ? k : -k;
				for (let i = 0; i <= arc; i++) {
					const a = (q + i / arc) * (Math.PI / 2);
					ring.push([cx + Math.cos(a) * RADIUS, cy + Math.sin(a) * RADIUS]);
				}
			}
			for (const z of [h, -h]) {
				for (let i = 0; i < ring.length; i++) {
					const [x0, y0] = ring[i];
					const [x1, y1] = ring[(i + 1) % ring.length];
					pts.push(x0, y0, z, x1, y1, z);
				}
			}
			for (const [x, y] of [[h, k], [k, h], [-k, h], [-h, k], [-h, -k], [-k, -h], [k, -h], [h, -k]]) {
				pts.push(x, y, h, x, y, -h);
			}
			const outline = new THREE.BufferGeometry();
			outline.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));

			type Cube = {
				x: number;
				y: number;
				isN: boolean;
				col: number;
				up: number; // rows above the bottom
				rest: boolean; // wears its colour all the time
				stroke: number; // place along the N, or -1
				colour: InstanceType<typeof THREE.Color>;
				line: InstanceType<typeof THREE.LineSegments>;
				lineMat: InstanceType<typeof THREE.LineBasicMaterial>;
				level: number;
				f1: number;
				phase: number;
				glitch: 'flip' | 'colour' | null;
				glitchEnd: number;
			};
			const centre = (GRID.length - 1) / 2;
			const cubes: Cube[] = GRID.flatMap((row, r) =>
				row.map((cell, c) => {
					const lineMat = new THREE.LineBasicMaterial();
					const line = new THREE.LineSegments(outline, lineMat);
					slab.add(line);
					return {
						x: (c - centre) * PITCH,
						y: (centre - r) * PITCH,
						isN: cell.solid,
						col: c,
						up: GRID.length - 1 - r,
						rest: cell.rest,
						stroke: N_STROKE.findIndex(([sr, sc]) => sr === r && sc === c),
						colour: new THREE.Color(cell.colour),
						line,
						lineMat,
						level: 0,
						f1: 0.7 + Math.random() * 1.1,
						phase: Math.random() * Math.PI * 2,
						glitch: null,
						glitchEnd: 0
					};
				})
			);

			// Hints of the space the slab sits in, the way a modelling viewport
			// shows them: three axes through its centre — which never moves — and
			// a ground grid under it, on the cubes' own pitch. They belong to the
			// slab, so they turn with it. Each line fades out with distance from
			// the centre (alpha per vertex), and the whole set fades in with the
			// lead-in and firms up while the slab is being turned.
			const REACH = 5.2;
			const FLOOR = -(2 * PITCH + 0.3);
			const sp: number[] = [];
			const sa: number[] = [];
			const hint = (
				a: [number, number, number],
				b: [number, number, number],
				colour: InstanceType<typeof THREE.Color>,
				weight: number,
				planar: boolean // measure the fade along the ground, not from the centre
			) => {
				const steps = 14;
				const at = (i: number) => a.map((v, n) => v + ((b[n] - v) * i) / steps);
				const alpha = ([x, y, z]: number[]) =>
					weight * Math.max(0, 1 - Math.hypot(x, planar ? 0 : y, z) / REACH) ** 1.6;
				for (let i = 0; i < steps; i++) {
					const p = at(i);
					const q = at(i + 1);
					sp.push(...p, ...q);
					sa.push(colour.r, colour.g, colour.b, alpha(p), colour.r, colour.g, colour.b, alpha(q));
				}
			};
			const axisGrey = new THREE.Color(0xb8b8c0);
			// X in coral, the depth axis in emerald — a viewport's red and green,
			// in this site's two colours. Up is grey.
			hint([-REACH, 0, 0], [REACH, 0, 0], new THREE.Color(CORAL), 1, false);
			hint([0, 0, -REACH], [0, 0, REACH], new THREE.Color(EMERALD), 1, false);
			hint([0, -REACH, 0], [0, REACH, 0], axisGrey, 0.8, false);
			for (let i = -3; i <= 3; i++) {
				hint([i * PITCH, FLOOR, -REACH], [i * PITCH, FLOOR, REACH], axisGrey, 0.5, true);
				hint([-REACH, FLOOR, i * PITCH], [REACH, FLOOR, i * PITCH], axisGrey, 0.5, true);
			}
			const spaceGeo = new THREE.BufferGeometry();
			spaceGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
			spaceGeo.setAttribute('color', new THREE.Float32BufferAttribute(sa, 4));
			const spaceMat = new THREE.LineBasicMaterial({
				vertexColors: true,
				transparent: true,
				opacity: 0,
				depthWrite: false
			});
			slab.add(new THREE.LineSegments(spaceGeo, spaceMat));
			const SPACE_REST = 0.3; // how visible at rest
			let turning = 0; // 0 at rest → 1 while it is being turned

			const m = new THREE.Matrix4();
			const tint = new THREE.Color();
			const base = new THREE.Color();
			const gapFill = new THREE.Color(0x77777e);
			const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
			// `empty` paints the cube in the page colour; `outlined` draws its edges.
			const put = (i: number, cube: Cube, z: number, empty: boolean, outlined: boolean, lineBright: number) => {
				m.makeTranslation(cube.x, cube.y, z);
				mesh.setMatrixAt(i, m);
				mesh.setColorAt(i, empty ? page : tint);
				cube.line.visible = outlined;
				if (outlined) {
					cube.line.position.set(cube.x, cube.y, z);
					cube.lineMat.color.setScalar(lineBright);
				}
			};

			// The still: every cube outlined, the N solid — grey, with the diagonal
			// in its two colours — and the gaps empty behind it, so the letter
			// reads without any motion. Also the reduced-motion view and the
			// frame the poster image was captured from.
			const drawStill = () => {
				spaceMat.opacity = SPACE_REST;
				cubes.forEach((cube, i) => {
					if (cube.isN) tint.set(cube.rest ? cube.colour : N_GREY);
					put(i, cube, cube.isN ? 0 : GAP_REST, !cube.isN, true, cube.isN ? 0.72 : 0.42);
				});
			};

			let nextGlitch = 1500;
			// Wireframe first: every cube is always outlined, and how solid it
			// looks is one number — its level — eased so that nothing pops.
			//
			//   N cubes    fill in along the stroke when the page opens, then stay
			//              mostly solid and breathe a little.
			//   gap cubes  the two inner columns are two level meters. They fill
			//              from the bottom up as the column's level rises, and
			//              only ever faintly, so the N stays the loudest thing.
			//
			// The signal is three slow sines per column at unrelated rates: smooth,
			// and it does not visibly repeat. No beat, no shared pulse.
			let born = -1;
			let prev = 0;
			let washFrom = 0; // seconds: when the next wash sets off
			const meter = (ts: number, c: number) =>
				0.5 + 0.26 * Math.sin(ts * 0.83 + c * 2.1) + 0.16 * Math.sin(ts * 1.37 + c * 4.3) + 0.08 * Math.sin(ts * 2.9 + c);
			const drawLive = (t: number) => {
				const ts = t / 1000;
				if (born < 0) {
					born = prev = ts;
					// Nothing erratic and no wash until the picture has formed.
					nextGlitch = t + 9000;
					washFrom = ts + 11;
				}
				const age = ts - born;
				// Ease by elapsed time, not per frame, so a slow or throttled
				// browser gets the same motion in fewer steps, not a slower one.
				const ease = 1 - Math.exp(-Math.min(1, ts - prev) * 3.2);
				prev = ts;
				// The lead-in, in order: faint outlines; the outlines firm up; the N
				// fills in, grey, along its stroke; the two colours arrive; the
				// meters start. After about ten seconds it is the running piece.
				const lines = 0.25 + 0.75 * clamp01(age / 2);
				const bloom = clamp01((age - 6) / 2.5);
				const meters = clamp01((age - 5) / 3);
				// The space arrives after the outlines and before the N fills; it
				// is faint at rest and firms up while the slab is being turned.
				const moving = spin.dragging || Math.abs(spin.vx) + Math.abs(spin.vy) > 0.0005 || t < spin.until;
				turning += ((moving ? 1 : 0) - turning) * ease;
				spaceMat.opacity = clamp01((age - 2.5) / 3) * (SPACE_REST + (0.85 - SPACE_REST) * turning);
				// The wash walks the N, then waits a while — not on a fixed clock.
				let washAt = (ts - washFrom) * 3.2 - 2;
				if (washAt > N_STROKE.length + 2) {
					washFrom = ts + 6 + Math.random() * 8;
					washAt = -9;
				}

				if (t > nextGlitch) {
					const cube = cubes[Math.floor(Math.random() * cubes.length)];
					cube.glitch = !cube.isN && Math.random() < 0.55 ? 'flip' : 'colour';
					cube.glitchEnd = t + 70 + Math.random() * 170;
					nextGlitch = t + (Math.random() < 0.3 ? 90 + Math.random() * 120 : 600 + Math.random() * 2600);
				}

				cubes.forEach((cube, i) => {
					if (cube.glitch && t > cube.glitchEnd) cube.glitch = null;
					let target: number;
					if (cube.isN) {
						const shown = clamp01((age - 1.6 - cube.stroke * 0.32) / 1.6);
						// Each N cube drifts between half-faded and solid on its own slow
						// clock, so the letter keeps re-forming without ever going missing.
						target = shown * (0.7 + 0.3 * Math.sin(ts * cube.f1 * 0.4 + cube.phase));
						const wash = Math.max(0, 1 - Math.abs(cube.stroke - washAt) / 1.6);
						base.set(N_GREY).lerp(cube.colour, cube.rest ? bloom : wash * wash);
					} else {
						target = clamp01(meter(ts, cube.col) * 4.4 - cube.up - 0.6) * 0.5 * meters;
						base.copy(gapFill);
					}
					cube.level += (target - cube.level) * ease;
					let fill = cube.level;
					if (cube.glitch === 'flip') fill = 1 - fill;
					else if (cube.glitch === 'colour') {
						fill = 1;
						base.copy(cube.colour);
					}
					// Fading in is the page colour turning into the cube's colour.
					tint.copy(page).lerp(base, fill);
					const z = cube.isN ? 0 : GAP_REST + cube.level * 0.5;
					put(i, cube, z, false, true, (0.42 + 0.3 * fill) * lines);
				});
			};

			const flush = () => {
				mesh.instanceMatrix.needsUpdate = true;
				if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
				renderer.render(scene, camera);
				live = true;
				fallback = false;
			};

			// The canvas is larger than its box by BLEED on every side (see the
			// styles): the extra is where the space lines fade away, so they end
			// softly instead of at a hard rectangle. The slab is framed to the
			// box, not the canvas, so it keeps its size.
			const fit = (bleed = BLEED) => {
				const w = host.clientWidth * (1 + 2 * bleed);
				const hgt = host.clientHeight * (1 + 2 * bleed);
				if (!w || !hgt) return;
				renderer.setSize(w, hgt, false);
				camera.aspect = w / hgt;
				// Far enough back that the slab fits the narrower side.
				const half = ((GRID.length * PITCH) / 2 + 0.9) * (1 + 2 * bleed);
				const fov = (camera.fov * Math.PI) / 180;
				const dist = half / Math.tan(fov / 2) / Math.min(1, camera.aspect);
				camera.position.set(0, 0, dist);
				camera.updateProjectionMatrix();
			};

			const still =
				window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
				new URLSearchParams(location.search).has('still');
			const rest = { x: -0.3, y: 0.42 };
			const aim = { ...rest };
			slab.rotation.set(rest.x, rest.y, 0);

			// Drag to turn it — all the way round, sideways. Released, it coasts,
			// holds a moment, then eases back to the resting pose (the nearest
			// full turn of it, so it never unwinds).
			const spin = { dragging: false, px: 0, py: 0, vx: 0, vy: 0, until: 0 };
			const TILT = 1.1; // how far it may tip up or down
			const onPointer = (e: PointerEvent) => {
				if (spin.dragging) {
					spin.vy = (e.clientX - spin.px) * 0.008;
					spin.vx = (e.clientY - spin.py) * 0.008;
					spin.px = e.clientX;
					spin.py = e.clientY;
					slab.rotation.y += spin.vy;
					slab.rotation.x = Math.max(-TILT, Math.min(TILT, slab.rotation.x + spin.vx));
					return;
				}
				aim.y = rest.y + (e.clientX / window.innerWidth - 0.5) * 0.3;
				aim.x = rest.x + (e.clientY / window.innerHeight - 0.5) * 0.2;
			};
			const onDown = (e: PointerEvent) => {
				spin.dragging = true;
				spin.px = e.clientX;
				spin.py = e.clientY;
				spin.vx = spin.vy = 0;
				host.setPointerCapture(e.pointerId);
			};
			const onUp = () => {
				if (!spin.dragging) return;
				spin.dragging = false;
				// A hard flick shouldn't send it spinning for seconds.
				const cap = (v: number) => Math.max(-0.2, Math.min(0.2, v));
				spin.vx = cap(spin.vx);
				spin.vy = cap(spin.vy);
				spin.until = performance.now() + 2500;
			};

			let visible = true;
			let raf = 0;
			let last = -1000;
			const frame = (t: number) => {
				raf = 0;
				if (disposed) return;
				if (still) {
					drawStill();
					flush();
					return;
				}
				if (t - last >= 32) {
					last = t;
					if (spin.dragging) {
						// the pointer handler is turning it
					} else if (Math.abs(spin.vx) + Math.abs(spin.vy) > 0.0005) {
						slab.rotation.y += spin.vy;
						slab.rotation.x = Math.max(-TILT, Math.min(TILT, slab.rotation.x + spin.vx));
						spin.vx *= 0.93;
						spin.vy *= 0.93;
						spin.until = t + 2500;
					} else if (t > spin.until) {
						const turns = Math.round((slab.rotation.y - rest.y) / (Math.PI * 2)) * Math.PI * 2;
						const ease = 0.06;
						slab.rotation.x += (aim.x - slab.rotation.x) * ease;
						// No idle sway: it only moves when the pointer does.
						slab.rotation.y += (aim.y + turns - slab.rotation.y) * ease;
					}
					drawLive(t);
					flush();
				}
				if (visible && !document.hidden) raf = requestAnimationFrame(frame);
			};
			const wake = () => {
				if (!raf && !disposed) raf = requestAnimationFrame(frame);
			};

			const sizes = new ResizeObserver(() => {
				fit();
				wake();
			});
			sizes.observe(host);
			const seen = new IntersectionObserver(([entry]) => {
				visible = entry.isIntersecting;
				if (visible) wake();
			});
			seen.observe(host);
			const lost = (e: Event) => {
				e.preventDefault();
				live = false; // back to the poster
				fallback = true;
			};
			canvas.addEventListener('webglcontextlost', lost);
			document.addEventListener('visibilitychange', wake);
			if (!still) {
				window.addEventListener('pointermove', onPointer, { passive: true });
				host.addEventListener('pointerdown', onDown);
				host.addEventListener('pointerup', onUp);
				host.addEventListener('pointercancel', onUp);
				host.classList.add('turnable');
			}

			// Dev only: capture the still as an image, to save as the poster.
			if (import.meta.env.DEV) {
				(window as unknown as Record<string, unknown>).__blocksStill = (size = 1000) => {
					renderer.setPixelRatio(1);
					renderer.setSize(size, size, false);
					camera.aspect = 1;
					fit(0);
					renderer.setSize(size, size, false);
					camera.aspect = 1;
					camera.updateProjectionMatrix();
					slab.rotation.set(rest.x, rest.y, 0);
					drawStill();
					flush();
					return canvas.toDataURL('image/webp', 0.9);
				};
			}

			fit();
			wake();

			cleanup = () => {
				cancelAnimationFrame(raf);
				sizes.disconnect();
				seen.disconnect();
				canvas.removeEventListener('webglcontextlost', lost);
				document.removeEventListener('visibilitychange', wake);
				window.removeEventListener('pointermove', onPointer);
				host.removeEventListener('pointerdown', onDown);
				host.removeEventListener('pointerup', onUp);
				host.removeEventListener('pointercancel', onUp);
				box.dispose();
				outline.dispose();
				material.dispose();
				spaceGeo.dispose();
				spaceMat.dispose();
				for (const cube of cubes) cube.lineMat.dispose();
				renderer.dispose();
			};
		})();

		return () => {
			disposed = true;
			clearTimeout(slow);
			cleanup();
		};
	});
</script>

<div class="blocks" bind:this={host}>
	<img class:show={fallback} src={poster} alt="nfunc" draggable="false" />
	<canvas class:show={live} bind:this={canvas} aria-hidden="true"></canvas>
	<noscript><style>.blocks img { opacity: 1 !important; }</style></noscript>
</div>

<style>
	.blocks { position: relative; width: 100%; height: 100%; }
	/* Dragging turns the cubes, so the browser must not scroll or select. */
	.blocks:global(.turnable) { cursor: grab; touch-action: none; user-select: none; }
	.blocks:global(.turnable:active) { cursor: grabbing; }
	/* Both start invisible and fade in, so nothing arrives with a cut. */
	canvas, img { position: absolute; inset: 0; width: 100%; height: 100%; display: block; opacity: 0; transition: opacity 1.4s ease; }
	img { object-fit: contain; }
	/* The canvas bleeds 20% past the box on every side and fades to nothing
	   across that margin, so the space lines end softly and can reach under
	   whatever sits beside the slab. The box, not the canvas, takes the drag. */
	canvas {
		inset: -20%;
		width: 140%;
		height: 140%;
		pointer-events: none;
		-webkit-mask-image: linear-gradient(to right, transparent, #000 16%, #000 84%, transparent),
			linear-gradient(to bottom, transparent, #000 16%, #000 84%, transparent);
		-webkit-mask-composite: source-in;
		mask-image: linear-gradient(to right, transparent, #000 16%, #000 84%, transparent),
			linear-gradient(to bottom, transparent, #000 16%, #000 84%, transparent);
		mask-composite: intersect;
	}
	.show { opacity: 1; }
	@media (prefers-reduced-motion: reduce) {
		canvas, img { transition: none; }
	}
</style>
