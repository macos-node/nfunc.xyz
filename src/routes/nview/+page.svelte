<script lang="ts">
	import AppPage from '$lib/AppPage.svelte';
	import Downloads from '$lib/Downloads.svelte';
	import Kinds from '$lib/Kinds.svelte';
	import NostrRefs from '$lib/NostrRefs.svelte';

	const version = '0.1.0-beta.8';
	const repo = 'https://github.com/xjmzx/nview';
</script>

<AppPage
	name="nview"
	{version}
	lead="A discography on your phone: browse what ndisc has published, and react to it — without the phone ever holding your key."
	description="nview: a mobile viewer for a discography published on Nostr, for Android and iOS. Reactions are signed by a remote signer."
>
	<h2>What it is</h2>
	<p>
		A mobile app for Android and iOS. It reads the release events an ndisc library has published, from
		Nostr relays, and shows them as a collection you can browse. It is a sibling of the glmps web viewers,
		reading the same release format.
	</p>
	<p>
		To react to a release, you log in with a remote signer — a <code>bunker://</code> string from a signer
		such as nsign. The signer keeps the key and signs each reaction; nview only ever asks.
	</p>
	<details>
		<summary>The stack</summary>
		<p>React 19, Vite, TypeScript and Tailwind, with <code>nostr-tools</code> for the relays.</p>
		<p>Capacitor wraps the same web build for iOS and Android, so the two apps show the same thing.</p>
		<p>
			Which discography it shows, and its default relays, are set in <code>src/config.ts</code>: the
			owner’s npub, the relay set and the release kind.
		</p>
	</details>

	<h2>Get it</h2>
	<Downloads
		{repo}
		{version}
		files={[
			{ os: 'Android', arch: 'debug APK, to sideload', file: `nview-v${version}-debug.apk` },
			{ os: 'Web build', arch: 'zip', file: `nview-v${version}-web.zip` }
		]}
	/>
	<p class="dim small">There is no public iOS build yet; it is built from the source with Xcode.</p>

	<h2>Features</h2>
	<dl class="features">
		<div>
			<dt>The collection <Kinds list={[31237, 5]} /></dt>
			<dd>Every published release, with its cover, and a release withdrawn from the network disappears here too.</dd>
		</div>
		<div>
			<dt>Labels <Kinds list={[31238]} /></dt>
			<dd>Record labels show the artwork published from ndisc’s label library.</dd>
		</div>
		<div>
			<dt>Current <Kinds list={[31239, 30000, 4550]} /></dt>
			<dd>The suite’s short notes — now playing, just added — as a feed.</dd>
		</div>
		<div>
			<dt>Reactions <Kinds list={[7, 5]} /></dt>
			<dd>Vote a release up or down, or take the vote back. Each one is signed by your signer, which may ask you first.</dd>
		</div>
		<div>
			<dt>Your relays</dt>
			<dd>Choose which relays it reads from when you first open it, and change them later.</dd>
		</div>
	</dl>

	<details>
		<summary>How Nostr does it</summary>
		<p>
			nview reads the suite’s release events — <b>its own convention, not a Nostr standard</b>; the ndisc
			page has the detail. Signing goes over NIP-46: the app holds a throwaway key for the conversation with
			the signer, and the signer decides what to sign.
		</p>
		<NostrRefs
			kinds={[31237, 31238, 31239, 5, 7, 30000, 4550, 0]}
			nips={[
				'01',
				{ n: '46', what: 'the remote signer that signs reactions' },
				{ n: '25', what: 'reactions on releases' },
				{ n: '09', what: 'deletions: releases withdrawn, votes taken back' },
				{ n: '51', what: 'the people set of feed contributors' },
				{ n: '72', what: 'approvals of feed notes' }
			]}
		/>
	</details>

	<h2>Still to come</h2>
	<ul class="todo">
		<li>Adding and editing releases from the phone is out of scope for now — a possible later phase.</li>
		<li>A public iOS build.</li>
	</ul>
</AppPage>
