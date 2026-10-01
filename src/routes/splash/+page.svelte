<script lang="ts">
	import { onMount } from 'svelte';
	import Blocks from '$lib/Blocks.svelte';
	import { apps } from '$lib/apps';

	// The name is n + a suffix, like every app in the suite. The n never moves;
	// the suffix takes turns: func — the home — then each app's, with that app's
	// one line underneath. The list is the front page's own, so the two cannot
	// drift apart.
	const turns = [
		{ suffix: 'func', line: 'Own your catalogue.' },
		...apps.map((app) => ({ suffix: app.name.slice(1), line: app.role }))
	];
	let shown = $state(0); // which turn is on the page
	let swapping = $state(false); // mid-fade: the old text is on its way out

	onMount(() => {
		// With reduced motion it simply stays nfunc.
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		let holding = false;
		let timer = 0;
		let swap = 0;
		const hold = () => (holding = true);
		const release = () => (holding = false);
		const words = document.querySelector('.words');
		words?.addEventListener('pointerenter', hold);
		words?.addEventListener('pointerleave', release);

		const step = () => {
			if (!holding && !document.hidden) {
				swapping = true;
				swap = window.setTimeout(() => {
					shown = (shown + 1) % turns.length;
					swapping = false;
				}, 320);
			}
			// nfunc stays a good while; each app passes more briefly.
			const next = (shown + 1) % turns.length;
			timer = window.setTimeout(step, next === 0 ? 7000 : 2800);
		};
		// Not until the blocks have finished arriving.
		timer = window.setTimeout(step, 13000);

		return () => {
			clearTimeout(timer);
			clearTimeout(swap);
			words?.removeEventListener('pointerenter', hold);
			words?.removeEventListener('pointerleave', release);
		};
	});
</script>

<svelte:head>
	<title>nfunc</title>
</svelte:head>

<main>
	<div class="stage"><Blocks /></div>
	<div class="words">
		<!-- Read aloud as the name, whatever the suffix is showing. -->
		<h1 class="wordmark" aria-label="nfunc">
			<span aria-hidden="true">n</span><span class="turn" class:out={swapping} class:app={shown > 0} aria-hidden="true">{turns[shown].suffix}</span>
		</h1>
		<p class="dim line"><span class="turn" class:out={swapping}>{turns[shown].line}</span></p>
		<p><a href="/">enter</a></p>
	</div>
</main>

<style>
	main { position: fixed; inset: 0; display: grid; grid-template-columns: 1.2fr 1fr; align-items: center; background: var(--bg); }
	.stage { height: min(100vh, 100%); min-height: 0; }
	.words { padding: 0 6vw 0 2vw; }
	/* The words arrive after the outlines, as quietly. */
	.words { animation: arrive 1.6s ease 1.2s both; }
	@keyframes arrive { from { opacity: 0; } }
	h1 { font-size: clamp(2.4rem, 7vw, 5.2rem); letter-spacing: -0.02em; white-space: nowrap; }
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
		.stage { height: 100%; }
		.words { padding: 0 24px; align-self: start; }
	}
</style>
