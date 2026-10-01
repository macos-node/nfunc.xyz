<script lang="ts">
	import { apps } from '$lib/apps';
</script>

<svelte:head>
	<title>nfunc — the n-suite</title>
	<meta name="description" content="The n-suite: Nostr-native apps for music libraries, publishing, messaging and signing." />
</svelte:head>

<h1 class="wordmark">nfunc</h1>
<p class="dim">The n-suite: Nostr-native apps for music libraries, publishing, messaging and signing.</p>

<h2>Apps</h2>
<ul class="apps">
	{#each apps as app}
		<li><b>{app.name}</b><span>{app.role}</span></li>
	{/each}
</ul>

<h2>Relay</h2>
<p><code>wss://relay.nfunc.xyz</code> <span class="dim">— read-open, write by whitelist.</span></p>
