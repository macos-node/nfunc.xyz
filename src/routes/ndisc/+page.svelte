<script lang="ts">
	import { apps } from '$lib/apps';

	// One place for the things that change with a release.
	const version = '0.4.1';
	const repo = 'https://github.com/xjmzx/ndisc';
	const asset = (file: string) => `${repo}/releases/download/v${version}/${file}`;
	const downloads = [
		{ os: 'Apple', arch: 'aarch64', href: asset(`ndisc_${version}_aarch64.dmg`) },
		{ os: 'Linux', arch: 'amd64', href: asset(`ndisc_${version}_amd64.deb`) },
		{ os: 'Windows', arch: 'x64', href: asset(`ndisc_${version}_x64-setup.exe`) }
	];

	// Event kinds ndisc reads or writes, and where the README says what each
	// one is. 31237–31239 are the suite's own; the rest belong to a NIP.
	const kindHelp: Record<number, string> = {
		0: 'your profile — read for your name and NIP-05',
		5: 'a deletion request (NIP-09)',
		7: 'a reaction (NIP-25)',
		4550: 'an approval of a feed note (NIP-72)',
		30000: 'a people set: who may contribute (NIP-51)',
		31237: 'a release — the suite’s own convention',
		31238: 'the label library — the suite’s own convention',
		31239: 'a feed note — the suite’s own convention'
	};
	const own = (k: number) => k >= 31237 && k <= 31239;
	const kindHref = (k: number) =>
		k === 31237 ? `${repo}#nostr-schema-experimental--kind31237` : `${repo}#companion-event-kinds`;

	const nips: { n: string; what: string; planned?: boolean }[] = [
		{ n: '01', what: 'the base event protocol' },
		{ n: '09', what: 'deletion requests — Unpublish' },
		{ n: '19', what: 'naddr links to a published release' },
		{ n: '25', what: 'reactions on releases' },
		{ n: '51', what: 'the people set of feed contributors' },
		{ n: '72', what: 'approvals of feed notes' },
		{ n: '73', what: 'external ids — the Discogs release' },
		{ n: '65', what: 'relay lists — not emitted yet', planned: true }
	];

	// The pages form a cycle through the suite, in the order of the list.
	const here = apps.findIndex((a) => a.name === 'ndisc');
	const next = apps[(here + 1) % apps.length];
</script>

{#snippet kinds(list: number[])}
	<span class="chips">
		{#each list as k}
			<a class="chip kind" class:own={own(k)} href={kindHref(k)} title={kindHelp[k]}>kind:{k}</a>
		{/each}
	</span>
{/snippet}

<svelte:head>
	<title>ndisc — nfunc</title>
	<meta name="description" content="ndisc: a catalogue for a collection of physical and digital music releases, on your own machine, shared over Nostr." />
</svelte:head>

<header>
	<h1 class="wordmark" aria-label="ndisc"><span class="n" aria-hidden="true">n</span><span aria-hidden="true">disc</span></h1>
	<span class="chip">v{version}</span>
</header>
<p class="lead">
	A catalogue for your music collection — the records on the shelf and the files on disk — kept on your own
	machine, and shared over Nostr when you choose.
</p>

<h2>What it is</h2>
<p>
	A desktop app for Apple, Linux and Windows. Your catalogue lives in a single database file that the app
	carries with it. ndisc reads the tags in your audio files, and can write them. It publishes with a
	<a href="https://njump.me">Nostr</a> keypair that is yours. You can open, create, import and export
	databases.
</p>
<details>
	<summary>The stack</summary>
	<p>Tauri 2 desktop binary, React 19, TypeScript, Tailwind v3.</p>
	<p>
		SQLite (through <code>rusqlite</code>, bundled), <code>lofty</code> to read audio tags and pull out
		embedded artwork, <code>nostr-sdk</code> to publish to relays, <code>keyring</code> to hold the secret
		key in the operating system’s keychain, and <code>reqwest</code> to fetch cover images.
	</p>
	<p>
		The catalogue is at <code>~/.local/share/uk.upleb.ndisc/discography.db</code> on Linux by default. The
		path is set per install, from the database switcher in the header.
	</p>
</details>

<h2>Get it</h2>
<ul class="downloads">
	{#each downloads as d}
		<li><a href={d.href}>{d.os}</a> <span class="dim">{d.arch}</span></li>
	{/each}
</ul>
<p class="dim small">Version {version}. Every release, and the source: <a href="{repo}/releases">GitHub</a>.</p>

<h2>Features</h2>
<dl class="features">
	<div>
		<dt>Library import</dt>
		<dd>
			Point it at a music folder and each directory of audio files becomes a release: FLAC, MP3, M4A, AAC,
			Ogg, Opus, WAV, AIFF, APE, WavPack, DSD and more, with the cover beside them. Records come in from a
			Discogs collection export.
		</dd>
	</div>
	<div>
		<dt>Cover art {@render kinds([31237])}</dt>
		<dd>Shows the cover from an https address, and falls back to the file in the album folder. It can pull artwork out of the audio files themselves.</dd>
	</div>
	<div>
		<dt>Labels {@render kinds([31238])}</dt>
		<dd>A library of record labels and their artwork, which you can publish so other apps show the same images.</dd>
	</div>
	<div>
		<dt>Genres {@render kinds([31237])}</dt>
		<dd>Up to three per release, from a fixed list, so the same word means the same thing everywhere.</dd>
	</div>
	<div>
		<dt>Where it came from, and duplicates {@render kinds([5])}</dt>
		<dd>
			Note where you got each release — Bandcamp, a shop, a marketplace. That stays on your machine and is
			never published. A record you own twice, on the shelf and on disk, can be merged into one entry; the
			spare one is withdrawn from the network first.
		</dd>
	</div>
	<div>
		<dt>Current {@render kinds([31239, 4550, 30000])}</dt>
		<dd>Short notes — now playing, just added — published as a feed the other apps read.</dd>
	</div>
	<div>
		<dt>Refresh from disk</dt>
		<dd>Rescan the library when files change. A scan never overwrites what you have curated: it reports the disagreement and you decide.</dd>
	</div>
	<div>
		<dt>Content audit</dt>
		<dd>Compares what the relays are serving with what your catalogue would publish today, tag by tag, and changes nothing.</dd>
	</div>
</dl>

<h2>Identity and publishing</h2>
<dl class="features">
	<div>
		<dt>Your key {@render kinds([0])}</dt>
		<dd>
			Make a new keypair or bring one. The secret key is never written to a plain file: it goes into the
			operating system’s own store.
			<ul class="plain">
				<li><b>Linux</b> — the Secret Service (libsecret)</li>
				<li><b>macOS</b> — the Keychain</li>
				<li><b>Windows</b> — Credential Manager</li>
			</ul>
		</dd>
	</div>
	<div>
		<dt>Publish {@render kinds([31237, 5, 7])}</dt>
		<dd>
			One release or the whole library. Each release is its own event that can be replaced in place, with
			a link you can share. Unpublish asks the relays to delete it. Listeners can react to a release.
		</dd>
	</div>
</dl>
<p class="note">
	Publishing is public, permanent and indexable, and a list of the music you own is a personal disclosure.
	ndisc asks you to confirm before it publishes a whole library.
</p>

<details>
	<summary>How Nostr does it</summary>
	<p>
		There is no NIP for a personal music collection, so the release event is <b>the suite’s own
		convention, not a Nostr standard</b>: an addressable event of kind 31237, experimental and not
		registered. Its address is <code>31237:&lt;pubkey&gt;:&lt;d&gt;</code>, shared as an <code>naddr1…</code> link.
	</p>

	<h3>Event kinds</h3>
	<ul class="defs">
		{#each [31237, 31238, 31239, 0, 5, 7, 4550, 30000] as k}
			<li>{@render kinds([k])} <span>{kindHelp[k]}</span></li>
		{/each}
	</ul>

	<h3>NIPs in play</h3>
	<ul class="defs">
		{#each nips as nip}
			<li>
				<a class="chip nip" class:planned={nip.planned} href="https://github.com/nostr-protocol/nips/blob/master/{nip.n}.md">NIP-{nip.n}</a>
				<span>{nip.what}</span>
			</li>
		{/each}
	</ul>

	<h3>The release event</h3>
	<div class="scroll">
		<table>
			<thead><tr><th>Tag</th><th></th><th>Carries</th></tr></thead>
			<tbody>
				<tr><td><code>d</code></td><td>required</td><td>a stable id for the release</td></tr>
				<tr><td><code>title</code></td><td>required</td><td>album or release title</td></tr>
				<tr><td><code>artist</code></td><td>required</td><td>the album-level artist</td></tr>
				<tr><td><code>medium</code></td><td>required</td><td><code>physical</code> or <code>digital</code></td></tr>
				<tr><td><code>type</code></td><td></td><td>music, sample, stem, field-recording, message, other</td></tr>
				<tr><td><code>category</code></td><td></td><td>album, ep, single, compilation, mix, live, soundtrack…</td></tr>
				<tr><td><code>format</code></td><td></td><td>LP, CD, FLAC 24/96, MP3 320…</td></tr>
				<tr><td><code>year</code></td><td></td><td>four digits</td></tr>
				<tr><td><code>label</code></td><td></td><td>record label</td></tr>
				<tr><td><code>catalog</code></td><td></td><td>catalogue number</td></tr>
				<tr><td><code>country</code></td><td></td><td>two letters, or free text</td></tr>
				<tr><td><code>condition</code></td><td></td><td>physical only: M, NM, VG+…</td></tr>
				<tr><td><code>source</code></td><td></td><td>a link to the listing, only when it is a real URL</td></tr>
				<tr><td><code>i</code></td><td>repeats</td><td>external ids (NIP-73) — the Discogs release</td></tr>
				<tr><td><code>t</code></td><td>repeats</td><td>one per genre</td></tr>
				<tr><td><code>image</code></td><td></td><td>cover art address; relays do not store images</td></tr>
				<tr><td><code>tracks</code></td><td></td><td>track count</td></tr>
				<tr><td><code>video</code></td><td></td><td>video count, when there is any</td></tr>
			</tbody>
		</table>
	</div>
	<p class="dim small">The event’s content carries your notes. The full contract is in the <a href="{repo}#nostr-schema-experimental--kind31237">README</a>.</p>
</details>

<h2>glmps, the companion site</h2>
<p>
	A public, read-only view of a published discography, in a browser:
	<a href="https://glmps.upleb.uk">glmps.upleb.uk</a> and <a href="https://glmps.fizx.uk">glmps.fizx.uk</a>.
</p>

<footer class="cycle">
	<a href="/apps">← all apps</a>
	{#if next.page}
		<a href="/{next.name}">{next.name} →</a>
	{:else}
		<span class="dim">next: {next.name}, to come</span>
	{/if}
</footer>

<style>
	header { display: flex; align-items: center; gap: 1.5ch; }
	h1 { font-size: clamp(2.4rem, 9vw, 3.6rem); letter-spacing: -0.02em; margin: 0; }
	/* The same n as on the front page: the slab's diagonal, in the letter that never changes. */
	.n {
		background: linear-gradient(135deg, color-mix(in srgb, #34d399 80%, var(--fg)) 20%, color-mix(in srgb, #ff7849 80%, var(--fg)) 80%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.lead { font-size: 1.1rem; margin: 1rem 0 0; }
	h3 { font-size: 0.85rem; font-weight: normal; color: var(--dim); margin: 1.5rem 0 0.5rem; }
	.small { font-size: 0.85rem; }
	/* A path is one long word; let it break on a narrow screen. */
	code { font-size: 0.92em; overflow-wrap: anywhere; }

	/* Chips. A kind and a NIP are different things, so each takes one of the
	   site's two colours — and only as a border, to stay quiet. */
	.chips { display: inline-flex; flex-wrap: wrap; gap: 0.5ch; margin-left: 0.5ch; vertical-align: 0.1em; }
	.chip {
		display: inline-block; font-size: 0.72rem; line-height: 1.5; padding: 0 0.9ch; white-space: nowrap;
		border: 1px solid var(--line); border-radius: 999px; color: var(--dim); text-decoration: none;
	}
	a.chip:hover { color: var(--fg); }
	.chip.kind { border-color: #3a3a40; }
	.chip.kind.own { border-color: rgb(52 211 153 / 0.5); }
	.chip.nip { border-color: rgb(255 120 73 / 0.5); }
	.chip.planned { border-style: dashed; }

	/* Second and third level: closed until asked for. */
	details { border: 1px solid var(--line); border-radius: 8px; padding: 0 1rem; margin: 1rem 0; }
	summary { cursor: pointer; padding: 0.6rem 0; color: var(--accent); list-style: none; }
	summary::-webkit-details-marker { display: none; }
	summary::before { content: '+'; display: inline-block; width: 2ch; color: var(--dim); }
	details[open] > summary::before { content: '−'; }
	details[open] { padding-bottom: 0.5rem; }

	.downloads { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.75rem; }
	.downloads li { border: 1px solid var(--line); border-radius: 8px; padding: 0.5rem 1rem; }

	.features { margin: 0; border-top: 1px solid var(--line); }
	.features > div { padding: 0.75rem 0; border-bottom: 1px solid var(--line); }
	dt { color: var(--fg); }
	dd { margin: 0.25rem 0 0; color: var(--dim); }
	.plain { list-style: none; margin: 0.5rem 0 0; padding: 0; }
	.plain b { color: var(--fg); font-weight: normal; }
	.note { border-left: 2px solid rgb(255 120 73 / 0.6); padding-left: 1rem; margin: 1.25rem 0; }

	.defs { list-style: none; margin: 0; padding: 0; }
	.defs li { display: grid; grid-template-columns: 13ch 1fr; gap: 1ch; align-items: baseline; padding: 0.2rem 0; color: var(--dim); }
	.defs .chips { margin: 0; }
	.defs .chip { justify-self: start; }

	.scroll { overflow-x: auto; }
	table { border-collapse: collapse; width: 100%; font-size: 0.85rem; }
	th { text-align: left; font-weight: normal; color: var(--dim); }
	th, td { padding: 0.3rem 1.5ch 0.3rem 0; border-bottom: 1px solid var(--line); vertical-align: top; }
	td:nth-child(2) { color: var(--dim); white-space: nowrap; }

	.cycle { display: flex; justify-content: space-between; gap: 1rem; margin-top: 4rem; font-size: 0.9rem; }
</style>
