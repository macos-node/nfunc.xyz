<script lang="ts">
	import AppPage from '$lib/AppPage.svelte';
	import Downloads from '$lib/Downloads.svelte';
	import KeyStore from '$lib/KeyStore.svelte';
	import Kinds from '$lib/Kinds.svelte';
	import NostrRefs from '$lib/NostrRefs.svelte';

	const version = '0.2.0-beta.5';
	const repo = 'https://github.com/macos-node/radio-scan';
</script>

<AppPage
	name="ntune"
	{version}
	lead="A tuner for internet radio and podcasts: keep your stations and shows, play them, and share the list over Nostr."
	description="ntune: an internet radio and podcast player — the listening front-end of radio-scan, with stations and shows followed over Nostr."
>
	<h2>What it is</h2>
	<p>
		A desktop app for Apple and Linux, and a beta. Add a station by its stream address, or a podcast by
		its feed, and play it. The lists live on your machine and need no key; sign in, and what you follow can
		also be published, so another of your machines — or another person — can pick it up.
	</p>
	<p>
		It is the listening half of <a href={repo}>radio-scan</a>, a small logger that records what a station
		plays, track by track, so you can see the shape of its playlist over time.
	</p>
	<details>
		<summary>The stack</summary>
		<p>Tauri 2, React 19, TypeScript, Tailwind v3 — the same as nplay and ndisc. It lives in the radio-scan repository, under <code>gui/tauri</code>.</p>
		<p>
			Streams play in the web view’s audio element. A small proxy in Rust sits in between where a web view
			cannot play a stream directly. Podcast feeds are read in Rust.
		</p>
	</details>

	<h2>Get it</h2>
	<Downloads
		{repo}
		{version}
		tag="ntune-v{version}"
		files={[
			{ os: 'Apple', arch: 'aarch64', file: `ntune_${version}_aarch64.dmg` },
			{ os: 'Linux', arch: 'amd64', file: `ntune_${version}_amd64.deb` }
		]}
	/>

	<h2>Features</h2>
	<dl class="features">
		<div>
			<dt>Stations <Kinds list={[31241]} /></dt>
			<dd>A list of streams, started off with a handful from SomaFM that you can remove. Add your own, play, stop, set the volume. What a stream says about itself — name, genre, bitrate, home page — is kept.</dd>
		</div>
		<div>
			<dt>Podcasts <Kinds list={[31242]} /></dt>
			<dd>
				Subscribe by feed. Sort by recent, name or when you added it; narrow to the last day, week or two;
				skip back and forward through an episode.
				<details>
					<summary>more</summary>
					<p>A feed’s own account of the show — author, categories, language, support links — is stored, and you can fill in what a feed leaves out. “Refresh feeds” reads every feed again.</p>
				</details>
			</dd>
		</div>
		<div>
			<dt>Keeping and sharing are separate</dt>
			<dd>Removing something from your list and withdrawing it from the network are two different actions, and each row shows which state it is in.</dd>
		</div>
		<div>
			<dt>Logged shows</dt>
			<dd>
				Where radio-scan’s logger runs, ntune shows the latest episode of each logged show — its tracklist
				in running order — and marks a show that has a new one.
				<details>
					<summary>more</summary>
					<p>This is the Linux surface; on macOS the RadioBar menubar app reads the same logs. From the tray, the logger can be paused and resumed.</p>
				</details>
			</dd>
		</div>
		<div>
			<dt>Tray companion</dt>
			<dd>A now-playing companion in the menubar or tray. On by default from the Linux desktop entry; on macOS it is a launch option.</dd>
		</div>
		<div>
			<dt>Backup</dt>
			<dd>Export your stations and shows to a file, exactly as they are stored, and bring them back.</dd>
		</div>
		<div>
			<dt>Themes</dt>
			<dd>Three — mono, fizx and upleb. Click the name in the header to change, as in the other apps.</dd>
		</div>
	</dl>

	<h2>Nostr</h2>
	<dl class="features">
		<div>
			<dt>Your key</dt>
			<dd>
				Optional: everything plays without one. With a key — kept in the operating system’s own store —
				ntune can publish what you follow.
				<KeyStore windows={false} />
			</dd>
		</div>
		<div>
			<dt>Follow <Kinds list={[31241, 31242]} /></dt>
			<dd>Publish a station or a show you follow, one at a time or the whole list, and add to your list what you have published from elsewhere.</dd>
		</div>
	</dl>
	<details>
		<summary>How Nostr does it</summary>
		<p>
			A followed station and a followed show are each an addressable event. Both kinds are <b>the suite’s own
			convention, not a Nostr standard</b>; the design is in radio-scan’s schema notes.
		</p>
		<NostrRefs kinds={[31241, 31242, 5]} nips={['01', { n: '09', what: 'deletions: an unfollow withdrawn from the relays' }]} />
	</details>

	<h2>Still to come</h2>
	<ul class="todo">
		<li>Logging several stations at once; the live logger follows one.</li>
		<li>Signing with a remote signer, and the suite’s feed notes.</li>
		<li>A Windows build. Parts of it already run there, but none is published.</li>
	</ul>
</AppPage>
