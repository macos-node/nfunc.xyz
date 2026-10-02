<script lang="ts">
	import '../app.css';
	import { goto, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import Blocks from '$lib/Blocks.svelte';
	import { apps, turns } from '$lib/apps';
	import { slab } from '$lib/slab.svelte';
	let { children } = $props();

	// One slab for the whole site. It is made here, once, and stays while the
	// pages change: large on the front page, small in the header everywhere
	// else. Each of the N's ten cubes is a turn — home, then the nine apps.
	const front = $derived(page.url.pathname === '/');
	// The cube of the page being read; home's when the page is not an app's.
	const here = $derived(Math.max(0, turns.findIndex((t) => t.href === page.url.pathname)));
	let peek = $state(-1); // small slab: the cube under the pointer

	const hover = (n: number) => {
		if (front) slab.onhover?.(n);
		else peek = n;
	};
	const select = (n: number) => {
		if (front) return slab.onselect?.(n);
		// A finger cannot pick out a cube this small: the whole slab leads home.
		if (window.matchMedia('(pointer: coarse)').matches) return goto('/');
		const href = turns[n]?.href;
		if (href) goto(href);
		else if (n <= 0) goto('/'); // home's cube, a gap, or the space around
	};

	// Moving between pages cross-fades where the browser can do it (the View
	// Transitions API), and the slab — which carries its own name there —
	// travels from one size to the other. Elsewhere the page simply changes.
	onNavigate((navigation) => {
		peek = -1;
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<!-- Behind everything: one soft field of colour from each family. Plain CSS,
     so it costs nothing to draw and sits behind the still fallback too. -->
<div class="backdrop" aria-hidden="true"></div>

<div class="shell" class:front>
	<div class="stage">
		<Blocks active={front ? slab.active : here} compact={!front} onhover={hover} onselect={select} />
	</div>

	{#if !front}
		<header class="site">
			<nav aria-label="Site"><a href="/">nfunc</a> <span aria-hidden="true">/</span> <a href="/apps">apps</a></nav>
			<!-- What the cube under the pointer is. Only a hint: the links are in the footer. -->
			<span class="peek" class:on={peek >= 0} aria-hidden="true">
				{#if peek >= 0}n{turns[peek].suffix}{#if peek > 0 && !turns[peek].href}<i>to come</i>{/if}{/if}
			</span>
		</header>
	{/if}

	{@render children()}

	<!-- The plain way round the site: every app by name, for the keyboard, a
	     screen reader, a search engine, and anyone without the 3D. -->
	<footer class="site">
		<nav aria-label="Apps">
			{#each apps as app}
				{#if app.page}<a href="/{app.name}" aria-current={page.url.pathname === `/${app.name}` ? 'page' : undefined}>{app.name}</a>{:else}<span>{app.name}</span>{/if}
			{/each}
		</nav>
		<a href="https://github.com/xjmzx">GitHub</a>
	</footer>
</div>

<style>
	/* One field from each family, on the same sides as in the slab: emerald
	   (fizx) low on the left, coral (upleb) high on the right. It arrives once
	   and stays far quieter than anything in front of it. */
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		animation: arrive 4s ease 2.5s both;
		background:
			radial-gradient(ellipse 55% 60% at 8% 92%, rgb(52 211 153 / 0.13), transparent 70%),
			radial-gradient(ellipse 50% 55% at 96% 6%, rgb(255 120 73 / 0.11), transparent 70%);
	}
	@keyframes arrive { from { opacity: 0; } }

	.shell { position: relative; }
	/* The slab's two places. The browser moves it between them (app.css). */
	.stage { view-transition-name: slab; position: absolute; left: 0; top: 0; width: 72px; height: 72px; z-index: 1; }
	.front .stage { position: fixed; width: calc(100vw * 1.2 / 2.2); height: 100vh; }

	header.site { display: flex; align-items: center; justify-content: space-between; gap: 2ch; min-height: 72px; padding-left: calc(72px + 2ch); margin-bottom: 2.5rem; font-size: 0.85rem; color: var(--dim); }
	header.site a { color: inherit; }
	.peek { opacity: 0; transition: opacity 0.3s ease; white-space: nowrap; }
	.peek.on { opacity: 1; }
	.peek i { font-style: normal; opacity: 0.7; margin-left: 1.5ch; }

	footer.site { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.5rem 3ch; margin-top: 4rem; padding-top: 1rem; border-top: 1px solid var(--line); font-size: 0.8rem; color: var(--dim); }
	footer.site nav { display: flex; flex-wrap: wrap; gap: 0.25rem 2ch; }
	footer.site a { color: var(--dim); }
	footer.site a:hover, footer.site a[aria-current] { color: var(--fg); }
	footer.site span { opacity: 0.6; }
	/* On the front page it sits along the bottom edge, out of the way. */
	.front footer.site { position: fixed; left: 0; right: 0; bottom: 0; z-index: 2; margin: 0; padding: 12px 24px; border-top: 0; font-size: 0.75rem; }

	@media (prefers-reduced-motion: reduce) {
		.backdrop { animation: none; }
		.peek { transition: none; }
	}
	@media (max-width: 720px) {
		.front .stage { width: 100vw; height: calc(100vh * 1.2 / 2.2); }
		.stage { width: 56px; height: 56px; }
		.front .stage { position: fixed; }
		header.site { min-height: 56px; padding-left: calc(56px + 2ch); }
	}
</style>
