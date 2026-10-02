<script lang="ts">
	import { apps } from '$lib/apps';
</script>

<svelte:head>
	<title>The apps — nfunc</title>
	<meta name="description" content="The n-suite: Nostr-native apps for music libraries, publishing, messaging and signing." />
</svelte:head>

<h1 class="wordmark"><a class="home" href="/">nfunc</a></h1>
<p class="dim">The n-suite: Nostr-native apps for music libraries, publishing, messaging and signing.</p>

<h2>Apps</h2>
<ul class="apps">
	{#each apps as app}
		<li>
			{#if app.page}<a href="/{app.name}">{app.name}</a>{:else}<b>{app.name}</b>{/if}
			<span>{app.role}</span>
		</li>
	{/each}
</ul>

<h2>Relay</h2>
<p><code>wss://relay.nfunc.xyz</code> <span class="dim">— read-open, write by whitelist.</span></p>

<style>
	.home { color: inherit; text-decoration: none; }
</style>
