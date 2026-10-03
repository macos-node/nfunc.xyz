<script lang="ts">
	import AppPage from '$lib/AppPage.svelte';
	import Kinds from '$lib/Kinds.svelte';
	import NostrRefs from '$lib/NostrRefs.svelte';
</script>

<AppPage
	name="nbridge"
	version="0.2.0"
	lead="Watches the suite’s signer, and is where you say yes or no when an app asks for something unusual. It never holds the signing key."
	description="nbridge: the n-suite's relay viewer and the monitor for its NIP-46 remote signer, native on Linux and macOS."
>
	<p class="note">In development, and not released yet: there are no downloads, and the source is not public yet.</p>

	<h2>What it is</h2>
	<p>
		The monitor for <a href="/nsign">nsign</a>, the suite’s remote signer. When an app asks the signer for
		something outside what you allowed it, the signer asks nbridge, and nbridge asks you. It has a key of its
		own, kept in your keyring — never the signer’s.
	</p>

	<h2>Two native apps</h2>
	<dl class="features">
		<div><dt>Linux</dt><dd>GTK4 and Rust, on rust-nostr.</dd></div>
		<div><dt>macOS</dt><dd>SwiftUI — a native sibling, not a port.</dd></div>
	</dl>

	<h2>What it does</h2>
	<dl class="features">
		<div>
			<dt>Notes</dt>
			<dd>A feed of notes from your relays.</dd>
		</div>
		<div>
			<dt>Signer <Kinds list={[24133]} /></dt>
			<dd>
				A live, read-only view of a signer’s traffic: paste its <code>bunker://</code> string and watch requests
				and replies pass. The contents are encrypted; you see who asked, and when.
			</dd>
		</div>
		<div>
			<dt>Approvals <Kinds list={[4133]} /></dt>
			<dd>
				Where the signer asks you to approve or deny a request — what the app is, what it wants signed — over a
				channel of its own on its own relays. No answer in time counts as no.
			</dd>
		</div>
	</dl>
	<p class="dim small">
		Tested end to end: a web page asked to sign a reaction, the signer asked nbridge, and approving it, denying
		it and letting it time out each did what they should.
	</p>

	<details>
		<summary>How Nostr does it</summary>
		<p>
			The signer’s traffic is ordinary NIP-46. The approval channel is <b>the suite’s own convention, not a Nostr
			standard</b>: an encrypted event of kind 4133 between the signer’s key and the monitor’s, described in
			ndisc’s SUITE.md.
		</p>
		<NostrRefs
			kinds={[24133, 4133]}
			nips={[
				{ n: '46', what: 'the signer’s traffic it watches' },
				{ n: '44', what: 'the encryption of approval requests and answers' }
			]}
		/>
	</details>
</AppPage>
