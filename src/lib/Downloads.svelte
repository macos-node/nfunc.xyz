<script lang="ts">
	// The files of one release on GitHub.
	let { repo, version, files }: { repo: string; version: string; files: { os: string; arch: string; file: string }[] } = $props();
</script>

<ul class="downloads">
	{#each files as f}
		<li><a href="{repo}/releases/download/v{version}/{f.file}">{f.os}</a> <span class="dim">{f.arch}</span></li>
	{/each}
</ul>
<p class="dim small">Version {version}. Every release, and the source: <a href="{repo}/releases">GitHub</a>.</p>
