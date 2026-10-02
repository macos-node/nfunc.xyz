<script lang="ts">
	// The two reference lists of an app page's deepest level: the event kinds
	// it reads or writes, and the NIPs in play. A NIP can carry its own note
	// for this app, and can be marked as planned.
	import Kinds from '$lib/Kinds.svelte';
	import { kinds as kindRefs, nips as nipRefs, nipHref } from '$lib/nostr-refs';
	type Nip = string | { n: string; what?: string; planned?: boolean };
	let { kinds, nips }: { kinds: number[]; nips: Nip[] } = $props();
	const list = $derived(nips.map((nip) => (typeof nip === 'string' ? { n: nip } : nip)));
</script>

<h3>Event kinds</h3>
<ul class="defs">
	{#each kinds as k}
		<li><Kinds list={[k]} /> <span>{kindRefs[k].what}</span></li>
	{/each}
</ul>

<h3>NIPs in play</h3>
<ul class="defs">
	{#each list as nip}
		<li>
			<a class="chip nip" class:planned={nip.planned} href={nipHref(nip.n)}>NIP-{nip.n}</a>
			<span>{nip.what ?? nipRefs[nip.n]}</span>
		</li>
	{/each}
</ul>
