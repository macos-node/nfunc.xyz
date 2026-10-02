<script lang="ts">
	import AppPage from '$lib/AppPage.svelte';
	import Downloads from '$lib/Downloads.svelte';
	import KeyStore from '$lib/KeyStore.svelte';
	import Kinds from '$lib/Kinds.svelte';
	import NostrRefs from '$lib/NostrRefs.svelte';

	const version = '0.5.1';
	const repo = 'https://github.com/xjmzx/nsmpl';
</script>

<AppPage
	name="nsmpl"
	{version}
	lead="A two-deck sample tool for the audio on your own machine: loop, trim, fade and mix, then publish a sample with Nostr."
	description="nsmpl: a two-deck audio sample tool — loop, trim, fade, gain, mix bounce — with Nostr publishing."
>
	<h2>What it is</h2>
	<p>
		A desktop app for Apple and Linux. Load two files side by side, find the part you want, shape it, and
		save or publish the result. What you publish plays on <a href="https://smpl.fizx.uk">smpl.fizx.uk</a>.
	</p>
	<details>
		<summary>The stack</summary>
		<p>Tauri 2 desktop binary, React 19, TypeScript, Tailwind v3. The frontend is Vite, and builds with bun or npm.</p>
		<p>
			Access to your files goes through Rust commands. Edits run through <code>ffmpeg</code>, and tempo
			detection through <code>aubio</code>.
		</p>
		<p>
			Why this stack: web technology matches the smpl.fizx.uk site, so the Nostr and audio code is shared,
			while Tauri ships it as a real desktop app that fits the rest of the suite.
		</p>
	</details>

	<h2>Get it</h2>
	<Downloads
		{repo}
		{version}
		files={[
			{ os: 'Apple', arch: 'aarch64', file: `nsmpl_${version}_aarch64.dmg` },
			{ os: 'Linux', arch: 'amd64', file: `nsmpl_${version}_amd64.deb` }
		]}
	/>

	<h2>Features</h2>
	<dl class="features">
		<div>
			<dt>Browse a samples folder</dt>
			<dd>Type a path and see every audio file in it, or work down through a tree of folders.</dd>
		</div>
		<div>
			<dt>Two decks</dt>
			<dd>
				Two players with their waveforms, and a master strip between them.
				<details>
					<summary>more</summary>
					<p>Two WaveSurfer players. The master strip has one play/pause for both, transport, cue, and click-to-seek.</p>
				</details>
			</dd>
		</div>
		<div>
			<dt>Loop regions</dt>
			<dd>Drag across a waveform to mark an in and an out on each deck; playback wraps round the loop.</dd>
		</div>
		<div>
			<dt>Edits</dt>
			<dd>
				Trim, prune, fade in and out, gain, and padding at the start or end.
				<details>
					<summary>more</summary>
					<p>A two-track mix bounce renders both decks to a single WAV file. The edits run through ffmpeg.</p>
				</details>
			</dd>
		</div>
		<div>
			<dt>Tempo</dt>
			<dd>Detects the BPM for you, with a calculator that works from a count of bars. The result goes into a store that nplay and the other apps share.</dd>
		</div>
		<div>
			<dt>Knows where a clip came from <Kinds list={[31237]} /></dt>
			<dd>
				Traces a clip back to the release it was cut from, and can narrow the view to releases ndisc has
				published.
				<details>
					<summary>how</summary>
					<p>
						Clip and source are linked through <code>~/.config/ndisc-suite/roots.json</code>, a file the suite’s
						apps share on your machine. Nothing here is read from the network.
					</p>
				</details>
			</dd>
		</div>
		<div>
			<dt>Clip-coverage bars</dt>
			<dd>
				In a folder of clips, each one shows how much of its source track it covers.
				<details>
					<summary>more</summary>
					<p>
						The length is measured when the folder is opened, as a fraction of the source track, with a total
						for the folder. It matches ntree’s library bar and copes with clips of any length.
					</p>
				</details>
			</dd>
		</div>
	</dl>

	<h2>Nostr</h2>
	<dl class="features">
		<div>
			<dt>Your key</dt>
			<dd>
				Make a key, bring one, or forget it. It is kept in the operating system’s own store, never in browser
				storage.
				<KeyStore windows={false} />
			</dd>
		</div>
		<div>
			<dt>Publish a sample <Kinds list={[1063]} /></dt>
			<dd>The file is uploaded to a file host — nostr.build unless you choose another — then announced on a relay, with a link you can share.</dd>
		</div>
	</dl>
	<details>
		<summary>How Nostr does it</summary>
		<p>
			A sample is uploaded over HTTP (NIP-96), with the request signed by your key (NIP-98). The address that
			comes back goes into a file event of kind 1063 (NIP-94), sent to a relay. These are Nostr standards:
			smpl.fizx.uk reads the same events, and so can any other client.
		</p>
		<p><b>One limit today:</b> nsmpl only publishes. It does not yet read a feed or other people’s samples.</p>
		<NostrRefs
			kinds={[1063, 31237]}
			nips={[
				{ n: '94', what: 'file metadata — the sample event' },
				{ n: '96', what: 'uploading the sample over HTTP' },
				{ n: '98', what: 'signing the upload request' },
				{ n: '19', what: 'the share link to a published sample' }
			]}
		/>
	</details>

	<h2>Still to come</h2>
	<ul class="todo">
		<li>A normalise edit, and a choice of format on export (AAC); the bounce is WAV only for now.</li>
		<li>Reading the shared feed <Kinds list={[31239]} /> and reacting to other people’s samples.</li>
		<li>Coverage for a whole tree at a glance; the bars are measured one open folder at a time.</li>
	</ul>

	<h2>smpl.fizx.uk, the companion site</h2>
	<p>
		A web page that plays the samples this app publishes: <a href="https://smpl.fizx.uk">smpl.fizx.uk</a>.
	</p>
</AppPage>
