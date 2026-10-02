<script lang="ts">
	// The frame every app's page shares: its name, version and one-line lead
	// at the top, and the way on at the bottom. The pages form a cycle through
	// the suite in the order of the list, skipping apps that have no page yet.
	import type { Snippet } from 'svelte';
	import { apps } from '$lib/apps';
	let { name, version, lead, description, children }: { name: string; version: string; lead: string; description: string; children: Snippet } = $props();

	const paged = apps.filter((a) => a.page);
	const next = $derived(paged[(paged.findIndex((a) => a.name === name) + 1) % paged.length]);
</script>

<svelte:head>
	<title>{name} — nfunc</title>
	<meta name="description" content={description} />
</svelte:head>

<header class="app-head">
	<h1 class="wordmark" aria-label={name}><span class="n" aria-hidden="true">n</span><span aria-hidden="true">{name.slice(1)}</span></h1>
	<span class="chip">v{version}</span>
</header>
<p class="lead">{lead}</p>

{@render children()}

<nav class="cycle" aria-label="More apps">
	<a href="/apps">← all apps</a>
	{#if next && next.name !== name}<a href="/{next.name}">{next.name} →</a>{/if}
</nav>
