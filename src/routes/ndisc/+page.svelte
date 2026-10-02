<script lang="ts">
	import AppPage from '$lib/AppPage.svelte';
	import Downloads from '$lib/Downloads.svelte';
	import KeyStore from '$lib/KeyStore.svelte';
	import Kinds from '$lib/Kinds.svelte';
	import NostrRefs from '$lib/NostrRefs.svelte';

	// One place for the things that change with a release.
	const version = '0.4.1';
	const repo = 'https://github.com/xjmzx/ndisc';
</script>

<AppPage
	name="ndisc"
	{version}
	lead="A catalogue for your music collection — the records on the shelf and the files on disk — kept on your own machine, and shared over Nostr when you choose."
	description="ndisc: a catalogue for a collection of physical and digital music releases, on your own machine, shared over Nostr."
>
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
	<Downloads
		{repo}
		{version}
		files={[
			{ os: 'Apple', arch: 'aarch64', file: `ndisc_${version}_aarch64.dmg` },
			{ os: 'Linux', arch: 'amd64', file: `ndisc_${version}_amd64.deb` },
			{ os: 'Windows', arch: 'x64', file: `ndisc_${version}_x64-setup.exe` }
		]}
	/>

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
			<dt>Cover art <Kinds list={[31237]} /></dt>
			<dd>Shows the cover from an https address, and falls back to the file in the album folder. It can pull artwork out of the audio files themselves.</dd>
		</div>
		<div>
			<dt>Labels <Kinds list={[31238]} /></dt>
			<dd>A library of record labels and their artwork, which you can publish so other apps show the same images.</dd>
		</div>
		<div>
			<dt>Genres <Kinds list={[31237]} /></dt>
			<dd>Up to three per release, from a fixed list, so the same word means the same thing everywhere.</dd>
		</div>
		<div>
			<dt>Where it came from, and duplicates <Kinds list={[5]} /></dt>
			<dd>
				Note where you got each release — Bandcamp, a shop, a marketplace. That stays on your machine and is
				never published. A record you own twice, on the shelf and on disk, can be merged into one entry; the
				spare one is withdrawn from the network first.
			</dd>
		</div>
		<div>
			<dt>Current <Kinds list={[31239, 4550, 30000]} /></dt>
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
			<dt>Your key <Kinds list={[0]} /></dt>
			<dd>
				Make a new keypair or bring one. The secret key is never written to a plain file: it goes into the
				operating system’s own store.
				<KeyStore />
			</dd>
		</div>
		<div>
			<dt>Publish <Kinds list={[31237, 5, 7]} /></dt>
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

		<NostrRefs
			kinds={[31237, 31238, 31239, 0, 5, 7, 4550, 30000]}
			nips={[
				'01',
				{ n: '09', what: 'deletion requests — Unpublish' },
				{ n: '19', what: 'naddr links to a published release' },
				{ n: '25', what: 'reactions on releases' },
				{ n: '51', what: 'the people set of feed contributors' },
				{ n: '72', what: 'approvals of feed notes' },
				{ n: '73', what: 'external ids — the Discogs release' },
				{ n: '65', what: 'relay lists — not emitted yet', planned: true }
			]}
		/>

		<h3>The release event</h3>
		<div class="scroll">
			<table>
				<thead><tr><th>Tag</th><th></th><th>Carries</th></tr></thead>
				<tbody>
					<tr><td><code>d</code></td><td class="dim">required</td><td>a stable id for the release</td></tr>
					<tr><td><code>title</code></td><td class="dim">required</td><td>album or release title</td></tr>
					<tr><td><code>artist</code></td><td class="dim">required</td><td>the album-level artist</td></tr>
					<tr><td><code>medium</code></td><td class="dim">required</td><td><code>physical</code> or <code>digital</code></td></tr>
					<tr><td><code>type</code></td><td></td><td>music, sample, stem, field-recording, message, other</td></tr>
					<tr><td><code>category</code></td><td></td><td>album, ep, single, compilation, mix, live, soundtrack…</td></tr>
					<tr><td><code>format</code></td><td></td><td>LP, CD, FLAC 24/96, MP3 320…</td></tr>
					<tr><td><code>year</code></td><td></td><td>four digits</td></tr>
					<tr><td><code>label</code></td><td></td><td>record label</td></tr>
					<tr><td><code>catalog</code></td><td></td><td>catalogue number</td></tr>
					<tr><td><code>country</code></td><td></td><td>two letters, or free text</td></tr>
					<tr><td><code>condition</code></td><td></td><td>physical only: M, NM, VG+…</td></tr>
					<tr><td><code>source</code></td><td></td><td>a link to the listing, only when it is a real URL</td></tr>
					<tr><td><code>i</code></td><td class="dim">repeats</td><td>external ids (NIP-73) — the Discogs release</td></tr>
					<tr><td><code>t</code></td><td class="dim">repeats</td><td>one per genre</td></tr>
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
</AppPage>
