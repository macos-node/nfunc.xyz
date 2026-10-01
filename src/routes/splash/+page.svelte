<script lang="ts">
	import Blocks from '$lib/Blocks.svelte';
</script>

<svelte:head>
	<title>nfunc</title>
</svelte:head>

<main>
	<div class="stage"><Blocks /></div>
	<div class="words">
		<h1 class="wordmark">nfunc</h1>
		<p class="dim">Own your catalogue.</p>
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
	@media (prefers-reduced-motion: reduce) { .words { animation: none; } }
	h1 { font-size: clamp(2rem, 6vw, 4.5rem); letter-spacing: -0.02em; }
	@media (max-width: 720px) {
		main { grid-template-columns: 1fr; grid-template-rows: 1.2fr 1fr; }
		.stage { height: 100%; }
		.words { padding: 0 24px; align-self: start; }
	}
</style>
