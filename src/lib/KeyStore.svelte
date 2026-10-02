<script lang="ts">
	// Where the secret key is kept, per operating system.
	let { windows = true }: { windows?: boolean } = $props();
</script>

<ul class="plain">
	<li><b>Linux</b> — the Secret Service (libsecret)</li>
	<li><b>macOS</b> — the Keychain</li>
	{#if windows}<li><b>Windows</b> — Credential Manager</li>{/if}
</ul>
