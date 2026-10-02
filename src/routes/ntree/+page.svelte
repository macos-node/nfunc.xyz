<script lang="ts">
	import AppPage from '$lib/AppPage.svelte';
	import Downloads from '$lib/Downloads.svelte';
	import KeyStore from '$lib/KeyStore.svelte';
	import Kinds from '$lib/Kinds.svelte';
	import NostrRefs from '$lib/NostrRefs.svelte';

	const version = '0.3.5';
	const repo = 'https://github.com/xjmzx/ntree';
</script>

<AppPage
	name="ntree"
	{version}
	lead="A bench for auditing and staging a FLAC music library: a spectral quality scanner, a sampler, a mirror-tree builder and a video normaliser."
	description="ntree: a FLAC library quality scanner, clip sampler, mirror-tree builder and Nostr clip publisher."
>
	<h2>What it is</h2>
	<p>
		A desktop app for Apple and Linux. It listens above 16 kHz to tell real lossless audio from a lossy file
		dressed as FLAC, and sorts a library into five verdicts: lossless, uncertain, probably lossy, lossy and
		unknown. It cuts short preview clips of your tracks, and can publish them with Nostr.
	</p>
	<details>
		<summary>The stack</summary>
		<p>Tauri 2 desktop binary, React 19, TypeScript, Tailwind v3. The frontend is Vite.</p>
		<p>
			Scanning runs in Rust commands that shell out to <code>ffmpeg</code> and <code>ffprobe</code>, in
			parallel through <code>rayon</code>. Both need to be installed.
		</p>
	</details>
	<details>
		<summary>How the scan decides</summary>
		<p>For each file under the folder you choose:</p>
		<p>
			<code>ffprobe</code> verifies the stream is really FLAC and reads its sample rate. Then
			<code>ffmpeg -af highpass=f=16000,volumedetect</code> measures the peak sample, in dBFS, in the high
			band.
		</p>
		<p>
			Genuine lossless 44.1 kHz audio keeps measurable energy above 16 kHz — a peak typically between −10
			and −45 dBFS. Lossy codecs cut everything above their bandwidth limit, so that peak is close to
			silence: well below −65 dBFS.
		</p>
		<div class="scroll">
			<table>
				<thead><tr><th>Verdict</th><th>Meaning</th></tr></thead>
				<tbody>
					<tr><td><code>LOSSLESS</code></td><td>FLAC with a peak above 16 kHz of −35 dB or more, or a codec that is lossless by nature (ALAC, PCM, APE…)</td></tr>
					<tr><td><code>UNCERTAIN</code></td><td>FLAC between the two thresholds — check by hand; quiet or ambient lossless can land here</td></tr>
					<tr><td><code>PROBABLY-LOSSY</code></td><td>FLAC with a peak above 16 kHz of −65 dB or less — likely a lossy source re-encoded as FLAC</td></tr>
					<tr><td><code>LOSSY</code></td><td>a codec that is lossy by design (MP3, AAC, Opus…) — honest about it</td></tr>
					<tr><td><code>UNKNOWN</code></td><td>ffprobe or ffmpeg failed, or the codec is not recognised</td></tr>
				</tbody>
			</table>
		</div>
		<p class="dim small">It does not go by file size or compression ratio: those cannot tell real lossless from a re-encode.</p>
	</details>
	<p class="note">
		The verdict is a heuristic, not proof. Drone, sub-bass and near-silent ambient tracks have nothing above
		16 kHz even when they are fully lossless, and will read as probably lossy. Check a suspect track by
		listening, by its metadata, or in a spectrum viewer.
	</p>

	<h2>Get it</h2>
	<Downloads
		{repo}
		{version}
		files={[
			{ os: 'Apple', arch: 'aarch64', file: `ntree_${version}_aarch64.dmg` },
			{ os: 'Linux', arch: 'amd64', file: `ntree_${version}_amd64.deb` }
		]}
	/>

	<h2>Features</h2>
	<dl class="features">
		<div>
			<dt>Quality scan</dt>
			<dd>Every track in the library gets a verdict, and the window restores the last scan when you open it again.</dd>
		</div>
		<div>
			<dt>Sampler</dt>
			<dd>Cuts a short preview clip — about ten seconds — of each track, one release at a time or in a batch, and finds and prunes clips whose track has gone.</dd>
		</div>
		<div>
			<dt>Mirror tree</dt>
			<dd>Builds a second library tree alongside the first, and prunes what no longer belongs in it. On Linux the copy asks for administrator rights.</dd>
		</div>
		<div>
			<dt>Video census and normalise</dt>
			<dd>Classifies the older videos in a library and converts them to H.264/AAC mp4 that starts playing at once.</dd>
		</div>
		<div>
			<dt>Released filter <Kinds list={[31237]} /></dt>
			<dd>
				Narrows the library to the tracks whose release ndisc has already published.
				<details>
					<summary>how</summary>
					<p>It reads the list ndisc exports at <code>~/.local/share/ndisc-suite/published.json</code>. That file is ndisc’s; ntree only reads it.</p>
				</details>
			</dd>
		</div>
		<div>
			<dt>Clip-coverage bars</dt>
			<dd>Each track row shows how much of the track its clip covers, with totals per album and artist.</dd>
		</div>
		<div>
			<dt>Keys</dt>
			<dd>
				<kbd>Ctrl</kbd> <kbd>R</kbd> scans again, <kbd>Ctrl</kbd> <kbd>F</kbd> goes to search, <kbd>Esc</kbd> clears the filter and
				the search. Double-click a track to open its folder.
			</dd>
		</div>
		<div>
			<dt>What it remembers</dt>
			<dd>
				The last scan, your theme and panel layout, the scan folder, where clips go and your relays.
				<details>
					<summary>where</summary>
					<p>
						Scan reports are cached as JSON in the app’s data directory —
						<code>~/.local/share/uk.fizx.audioflacqualitycheck/last_scan.json</code> on Linux — not beside the
						program. The directory keeps the app’s first name on purpose, so earlier scans survive the
						renames.
					</p>
					<p>
						Theme, the set of published clips and the panel flags are browser storage keys
						(<code>afqc-tauri.theme</code>, <code>afqc-tauri.published</code>,
						<code>afqc-tauri.leftCollapsed</code>, <code>afqc-tauri.rightCollapsed</code>). The scan folder,
						clip destination and relay list are in the app’s config store.
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
				Sign in with a key you have, or make one. It is kept in the operating system’s own store, never in
				browser storage.
				<KeyStore windows={false} />
			</dd>
		</div>
		<div>
			<dt>Publish clips <Kinds list={[1063]} /></dt>
			<dd>The clip is uploaded to a file host, then announced on a relay as a file event that any client can play.</dd>
		</div>
		<div>
			<dt>Feed <Kinds list={[1063, 7]} /></dt>
			<dd>A live list of published clips, which you can react to.</dd>
		</div>
	</dl>
	<details>
		<summary>How Nostr does it</summary>
		<p>
			A clip is uploaded over HTTP (NIP-96), with the request signed by your key (NIP-98). The address that
			comes back goes into a file event of kind 1063 (NIP-94), sent to a relay. These are Nostr standards,
			so the clips are not tied to this suite.
		</p>
		<p>
			<b>One limit today:</b> a published clip does not yet point back at the release it came from, so
			nothing on the network connects the two.
		</p>
		<NostrRefs
			kinds={[1063, 7, 31237]}
			nips={[
				{ n: '94', what: 'file metadata — the clip event' },
				{ n: '96', what: 'uploading the clip over HTTP' },
				{ n: '98', what: 'signing the upload request' },
				{ n: '25', what: 'reactions in the feed' }
			]}
		/>
	</details>

	<h2>Still to come</h2>
	<ul class="todo">
		<li>Link each clip to its release.</li>
		<li>Share ntree’s own clips as a link, as nsmpl already does.</li>
		<li>Read the feed from every relay, not only the first.</li>
	</ul>
</AppPage>

<style>
	kbd { font: inherit; font-size: 0.85em; padding: 0 0.6ch; border: 1px solid var(--line); border-radius: 4px; color: var(--fg); }
</style>
