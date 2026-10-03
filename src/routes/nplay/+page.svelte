<script lang="ts">
	import AppPage from '$lib/AppPage.svelte';
	import Downloads from '$lib/Downloads.svelte';
	import Kinds from '$lib/Kinds.svelte';
	import NostrRefs from '$lib/NostrRefs.svelte';

	const version = '0.3.1';
	const repo = 'https://github.com/xjmzx/nplay';
</script>

<AppPage
	name="nplay"
	{version}
	lead="A simple player for the music and video on your own machine — the playback companion to the rest of the suite."
	description="nplay: a local music and video player with a library index, playlists, BPM and a spectrum visualiser."
>
	<h2>What it is</h2>
	<p>
		A desktop app for Apple, Linux and Windows. It indexes your music folder, plays it through its own audio
		engine, plays video too, and keeps your playlists. It shares what the other apps know — tempo, the suite’s
		feed — rather than working it out again.
	</p>
	<details>
		<summary>The stack</summary>
		<p>Tauri 2 desktop binary, React 19, TypeScript, Tailwind v3, with the rest of the suite’s palette and parts.</p>
		<p>
			Audio plays through a native Rust engine (<code>rodio</code>, on a thread of its own), because the web
			view on Linux cannot play local media. Video plays in the web view, fed by a small HTTP server inside the
			app. The library is indexed into SQLite, with tags and embedded covers read by <code>lofty</code>.
		</p>
	</details>

	<h2>Get it</h2>
	<Downloads
		{repo}
		{version}
		files={[
			{ os: 'Apple', arch: 'aarch64', file: `nplay_${version}_aarch64.dmg` },
			{ os: 'Linux', arch: 'amd64 .deb', file: `nplay_${version}_amd64.deb` },
			{ os: 'Linux', arch: 'AppImage', file: `nplay_${version}_amd64.AppImage` },
			{ os: 'Windows', arch: 'x64', file: `nplay_${version}_x64-setup.exe` }
		]}
	/>

	<h2>Features</h2>
	<dl class="features">
		<div>
			<dt>Library</dt>
			<dd>
				Scans a music folder into a local index: artist, album, title, year, track number, length, codec and
				cover. Edit a tag in place and it is written back to the file.
			</dd>
		</div>
		<div>
			<dt>Two ways to browse</dt>
			<dd>A collection tree — artist, album, track — and a flat table you can sort.</dd>
		</div>
		<div>
			<dt>Playback</dt>
			<dd>Play, pause, stop, previous, next, seek and volume; the space bar plays and pauses. Shuffle, and repeat one or all.</dd>
		</div>
		<div>
			<dt>Video</dt>
			<dd>mp4 and m4v play with picture.</dd>
		</div>
		<div>
			<dt>Now playing</dt>
			<dd>Large cover art with the title, artist and album, and a spectrum visualiser that moves with the sound.</dd>
		</div>
		<div>
			<dt>Playlists and queue</dt>
			<dd>
				A working playlist that saves itself, with drag-to-reorder, and the queue of what plays next.
				<details>
					<summary>more</summary>
					<p>Playlists load and save as <code>.xspf</code>, the format Strawberry uses.</p>
				</details>
			</dd>
		</div>
		<div>
			<dt>Tempo</dt>
			<dd>Shows each track’s BPM from the store the suite shares with nsmpl, and works it out when the store has none.</dd>
		</div>
		<div>
			<dt>Library health</dt>
			<dd>Flags files it cannot play or decode, until you acknowledge them.</dd>
		</div>
		<div>
			<dt>Current <Kinds list={[31239]} /></dt>
			<dd>Reads the suite’s feed of short notes — now playing, just added.</dd>
		</div>
		<div>
			<dt>Themes</dt>
			<dd>Three, in turn: fizx, upleb and mono.</dd>
		</div>
	</dl>

	<details>
		<summary>How Nostr does it</summary>
		<p>
			nplay holds no key and publishes nothing. It only reads the feed, a kind that is <b>the suite’s own
			convention, not a Nostr standard</b>.
		</p>
		<NostrRefs kinds={[31239, 30000, 4550, 5]} nips={['01', { n: '51', what: 'who may contribute to the feed' }, { n: '72', what: 'approvals of feed notes' }]} />
	</details>

	<h2>Still to come</h2>
	<ul class="todo">
		<li>More work on video, beyond today’s playback.</li>
		<li>Panels that fold away on a narrow window.</li>
		<li>A “verify library” pass that decodes every file, to catch corrupt ones of a format the scan accepts.</li>
	</ul>
</AppPage>
