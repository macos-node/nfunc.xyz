<script lang="ts">
	// The event kinds behind a feature, as chips.
	import { kinds } from '$lib/nostr-refs';
	let { list }: { list: number[] } = $props();
</script>

<span class="chips">
	{#each list as k}
		<a class="chip kind" class:own={kinds[k].own} href={kinds[k].href} title={kinds[k].what}>kind:{k}</a>
	{/each}
</span>
