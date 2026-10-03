<script lang="ts">
	// The files of one release on GitHub.
	// `tag` is the release's tag when it is not simply v<version>.
	let { repo, version, files, tag = `v${version}` }: { repo: string; version: string; files: { os: string; arch: string; file: string }[]; tag?: string } = $props();
</script>

<ul class="downloads">
	{#each files as f}
		<li><a href="{repo}/releases/download/{tag}/{f.file}">{f.os}</a> <span class="dim">{f.arch}</span></li>
	{/each}
</ul>
<p class="dim small">Version {version}. Every release, and the source: <a href="{repo}/releases">GitHub</a>.</p>
