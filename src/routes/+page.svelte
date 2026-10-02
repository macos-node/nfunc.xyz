<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { turns } from '$lib/apps';
	import { slab } from '$lib/slab.svelte';

	// The name is n + a suffix, like every app in the suite. The n never moves;
	// the suffix takes turns: func — the home — then each app's, with that app's
	// one line underneath (the turns are in $lib/apps). A turn whose app has a
	// page carries its address; the link under the name then opens that page
	// instead of the list.
	let shown = $state(0); // which turn is on the page
	let swapping = $state(false); // mid-fade: the old text is on its way out

	// The slab and the name are one control. The N has ten cubes and there are
	// ten turns — home and nine apps — so each cube is a turn, in stroke order.
	// The cube of the turn on the page is lit; pointing at a cube brings its
	// turn to the page; a click or tap holds it there for a while, and a click
	// on the cube already showing opens its page, if it has one. Clicking
	// anywhere else on the slab moves on to the next.
	//
	// The slab itself belongs to the layout (it stays while pages change); this
	// page tells it which cube is current and hears about the pointer.
	$effect(() => {
		slab.active = shown;
	});
	let overSlab = false; // the pointer is on a cube
	let overWords = false;
	let heldUntil = 0; // after a click or tap: leave it be until then
	let swap = 0;
	const go = (to: number) => {
		clearTimeout(swap);
		if (to === shown) {
			swapping = false;
			return;
		}
		swapping = true;
		swap = window.setTimeout(() => {
			shown = to;
			swapping = false;
		}, 220);
	};
	const hover = (n: number) => {
		overSlab = n >= 0;
		if (n >= 0 && n < turns.length) go(n);
	};
	const select = (n: number) => {
		// With a mouse the cube under the pointer is already showing, so one
		// click opens it; with a finger the first tap shows, the second opens.
		if (n === shown && !swapping && turns[n]?.href) return goto(turns[n].href!);
		heldUntil = performance.now() + 7000;
		go(n >= 0 && n < turns.length ? n : (shown + 1) % turns.length);
	};

	onMount(() => {
		slab.onhover = hover;
		slab.onselect = select;
		const leave = () => {
			slab.onhover = slab.onselect = undefined;
		};
		// With reduced motion it simply stays nfunc.
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return leave;
		let timer = 0;
		const hold = () => (overWords = true);
		const release = () => (overWords = false);
		const words = document.querySelector('.words');
		words?.addEventListener('pointerenter', hold);
		words?.addEventListener('pointerleave', release);

		const step = () => {
			if (!overSlab && !overWords && !document.hidden && performance.now() > heldUntil) {
				go((shown + 1) % turns.length);
			}
			// nfunc stays a good while; each app passes more briefly.
			const next = (shown + 1) % turns.length;
			timer = window.setTimeout(step, next === 0 ? 7000 : 2800);
		};
		// Not until the blocks have finished arriving.
		timer = window.setTimeout(step, 13000);

		return () => {
			leave();
			clearTimeout(timer);
			clearTimeout(swap);
			words?.removeEventListener('pointerenter', hold);
			words?.removeEventListener('pointerleave', release);
		};
	});
</script>

<svelte:head>
	<title>nfunc — the n-suite</title>
	<meta name="description" content="The n-suite: Nostr-native apps for music libraries, publishing, messaging and signing." />
</svelte:head>

<main>
	<!-- The slab is the layout's, and sits in this first column. -->
	<div aria-hidden="true"></div>
	<div class="words">
		<!-- Read aloud as the name, whatever the suffix is showing. -->
		<h1 class="wordmark" aria-label="nfunc">
			<span class="n" aria-hidden="true">n</span><span class="turn" class:out={swapping} class:app={shown > 0} aria-hidden="true">{turns[shown].suffix}</span>
		</h1>
		<p class="dim line"><span class="turn" class:out={swapping}>{turns[shown].line}</span></p>
		<p>
			{#if turns[shown].href}
				<a class="turn" class:out={swapping} href={turns[shown].href}>open n{turns[shown].suffix}</a>
			{:else}
				<a class="turn" class:out={swapping} href="/apps">enter</a>
			{/if}
		</p>
	</div>
</main>

<style>
	/* Over the slab's column this lets the pointer through to the slab. */
	main { position: fixed; inset: 0; z-index: 1; overflow: hidden; display: grid; grid-template-columns: 1.2fr 1fr; align-items: center; pointer-events: none; }
	.words { position: relative; padding: 0 6vw 0 2vw; pointer-events: auto; }

	/* The words arrive after the outlines, as quietly. */
	.words { animation: arrive 1.6s ease 1.2s both; }
	@keyframes arrive { from { opacity: 0; } }
	h1 { font-size: clamp(2.4rem, 7vw, 5.2rem); letter-spacing: -0.02em; white-space: nowrap; }
	/* The n never changes, so it carries the colour: the slab's diagonal in
	   miniature, one unbroken blend from emerald at the top left to coral at
	   the bottom right, softened a little toward the type's grey. Solid
	   enough to set the n apart from whichever suffix is beside it. */
	.n {
		background: linear-gradient(135deg, color-mix(in srgb, #34d399 80%, var(--fg)) 20%, color-mix(in srgb, #ff7849 80%, var(--fg)) 80%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	/* A turn fades out quickly and in slowly; nothing slides or jumps. */
	.turn { transition: opacity 0.7s ease, color 0.7s ease; }
	.turn.out { opacity: 0; transition-duration: 0.3s; }
	/* An app's suffix sits a step back from func, so nfunc reads as home. */
	.turn.app { color: #9a9aa0; }
	/* Room for two lines, so a longer description never moves the link. */
	.line { min-height: 3.1em; }
	@media (prefers-reduced-motion: reduce) {
		.words { animation: none; }
		.turn { transition: none; }
	}
	@media (max-width: 720px) {
		main { grid-template-columns: 1fr; grid-template-rows: 1.2fr 1fr; }
		.words { padding: 0 24px; align-self: start; }
	}
</style>
