<script lang="ts">
	// The avatar's grid of rounded squares, as rounded cubes. See
	// docs/splash-design.md for the thinking; in short:
	//
	//   - the solid squares spell an N. Those cubes stand forward and hold still.
	//   - the half-opacity squares are the gaps. Those cubes sit behind and move
	//     like the bars of a spectrum analyser: wireframe when the level is low,
	//     solid as it rises.
	//   - colour is occasional: a wash that travels along the N, and stray hints.
	//   - now and then one cube glitches — flips look, or flashes its colour.
	//
	// Kept deliberately cheap so it holds up on weak hardware and odd browsers:
	// one instanced mesh, no shadow maps, no transparency, no post-processing,
	// device pixel ratio capped at 2, 30 frames a second, and nothing drawn
	// while the canvas is off screen or the tab is hidden. Without WebGL — or if
	// the context is lost — the still image stays. With reduced motion, one
	// still frame.
	import { onMount } from 'svelte';
	import { GRID, N_STROKE, PITCH, RADIUS } from '$lib/avatar-grid';

	let { poster = '/splash-still.webp' }: { poster?: string } = $props();

	let host: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let live = $state(false);

	const PAGE = 0x0b0b0c;
	const N_GREY = 0xd0d0d4;
	const GAP_GREY = 0x6a6a70;
	const GAP_REST = -0.45; // how far the gaps sit back when nothing moves

	onMount(() => {
		let disposed = false;
		let cleanup = () => {};

		(async () => {
			const THREE = await import('$lib/three-kit');
			if (disposed) return;

			let renderer: InstanceType<typeof THREE.WebGLRenderer>;
			try {
				renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
			} catch {
				return; // no WebGL: the poster stays
			}
			renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

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
				stroke: number; // place along the N, or -1
				colour: InstanceType<typeof THREE.Color>;
				line: InstanceType<typeof THREE.LineSegments>;
				lineMat: InstanceType<typeof THREE.LineBasicMaterial>;
				level: number;
				f1: number;
				f2: number;
				phase: number;
				weight: number; // how hard the beat hits this cube
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
						stroke: N_STROKE.findIndex(([sr, sc]) => sr === r && sc === c),
						colour: new THREE.Color(cell.colour),
						line,
						lineMat,
						level: 0.5,
						f1: 0.7 + Math.random() * 1.1,
						f2: 2.1 + Math.random() * 2.3,
						phase: Math.random() * Math.PI * 2,
						weight: 0.4 + Math.random() * 0.6,
						glitch: null,
						glitchEnd: 0
					};
				})
			);

			const m = new THREE.Matrix4();
			const tint = new THREE.Color();
			const gapDark = new THREE.Color(0x34343a);
			const gapLight = new THREE.Color(0x9a9aa0);
			const put = (i: number, cube: Cube, z: number, wire: boolean, lineBright: number) => {
				m.makeTranslation(cube.x, cube.y, z);
				mesh.setMatrixAt(i, m);
				mesh.setColorAt(i, wire ? tint.set(PAGE) : tint);
				cube.line.visible = wire;
				if (wire) {
					cube.line.position.set(cube.x, cube.y, z);
					cube.lineMat.color.setScalar(lineBright);
				}
			};

			// The still: achromatic, shaded, N forward. Also the reduced-motion
			// view and the frame the poster image was captured from.
			const drawStill = () => {
				cubes.forEach((cube, i) => {
					tint.set(cube.isN ? N_GREY : GAP_GREY);
					put(i, cube, cube.isN ? 0 : GAP_REST, false, 0);
				});
			};

			let nextGlitch = 1500;
			const drawLive = (t: number) => {
				const ts = t / 1000;
				// A synthetic signal — no audio needed. A beat that decays, over
				// two slow sines per cube so no two move together.
				const beat = Math.exp(-((ts % 0.62) / 0.62) * 4);
				// The wash: a pulse of colour that walks the N every nine seconds.
				const washAt = (ts % 9) * 3.2 - 2;

				if (t > nextGlitch) {
					const cube = cubes[Math.floor(Math.random() * cubes.length)];
					cube.glitch = Math.random() < 0.55 ? 'flip' : 'colour';
					cube.glitchEnd = t + 70 + Math.random() * 170;
					// Usually a pause; sometimes a quick stutter of two or three.
					nextGlitch = t + (Math.random() < 0.3 ? 90 + Math.random() * 120 : 600 + Math.random() * 2600);
				}

				cubes.forEach((cube, i) => {
					if (cube.glitch && t > cube.glitchEnd) cube.glitch = null;
					let z: number;
					let wire: boolean;
					let lineBright = 0.5;
					if (cube.isN) {
						z = 0;
						wire = false;
						const wash = Math.max(0, 1 - Math.abs(cube.stroke - washAt) / 1.6);
						tint.set(N_GREY).lerp(cube.colour, wash * wash);
						lineBright = 0.9;
					} else {
						const target =
							0.38 +
							0.28 * Math.sin(ts * cube.f1 + cube.phase) +
							0.18 * Math.sin(ts * cube.f2 + cube.phase * 2) +
							0.4 * beat * cube.weight;
						cube.level += (Math.min(1, Math.max(0, target)) - cube.level) * 0.25;
						z = -1.05 + cube.level * 0.95; // never past the N
						wire = cube.level < 0.5;
						// Brightness follows the level once it is solid.
						tint.copy(gapDark).lerp(gapLight, Math.max(0, (cube.level - 0.5) * 2));
						lineBright = 0.28 + cube.level * 0.5;
					}
					if (cube.glitch === 'flip') wire = !wire;
					else if (cube.glitch === 'colour') {
						wire = false;
						tint.copy(cube.colour);
					}
					put(i, cube, z, wire, lineBright);
				});
			};

			const flush = () => {
				mesh.instanceMatrix.needsUpdate = true;
				if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
				renderer.render(scene, camera);
				live = true;
			};

			const fit = () => {
				const w = host.clientWidth;
				const hgt = host.clientHeight;
				if (!w || !hgt) return;
				renderer.setSize(w, hgt, false);
				camera.aspect = w / hgt;
				// Far enough back that the slab fits the narrower side.
				const half = (GRID.length * PITCH) / 2 + 0.9;
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
				aim.y = rest.y + (e.clientX / window.innerWidth - 0.5) * 0.6;
				aim.x = rest.x + (e.clientY / window.innerHeight - 0.5) * 0.4;
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
						slab.rotation.y += (aim.y + turns + Math.sin(t / 4000) * 0.06 - slab.rotation.y) * ease;
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
					fit();
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
				for (const cube of cubes) cube.lineMat.dispose();
				renderer.dispose();
			};
		})();

		return () => {
			disposed = true;
			cleanup();
		};
	});
</script>

<div class="blocks" bind:this={host}>
	<img class:hidden={live} src={poster} alt="nfunc" draggable="false" />
	<canvas class:hidden={!live} bind:this={canvas} aria-hidden="true"></canvas>
</div>

<style>
	.blocks { position: relative; width: 100%; height: 100%; }
	/* Dragging turns the cubes, so the browser must not scroll or select. */
	.blocks:global(.turnable) { cursor: grab; touch-action: none; user-select: none; }
	.blocks:global(.turnable:active) { cursor: grabbing; }
	canvas, img { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
	img { object-fit: contain; }
	.hidden { visibility: hidden; }
</style>
