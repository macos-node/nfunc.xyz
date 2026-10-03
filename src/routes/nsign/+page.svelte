<script lang="ts">
	import AppPage from '$lib/AppPage.svelte';
	import Kinds from '$lib/Kinds.svelte';
	import NostrRefs from '$lib/NostrRefs.svelte';
</script>

<AppPage
	name="nsign"
	version="0.1.0"
	lead="The suite’s remote signer: it keeps your key at home, encrypted, and signs for the apps you have paired with it — so they never see the key."
	description="nsign: the n-suite's remote signer — NIP-46, an encrypted key, a policy per app, and a log."
>
	<p class="note">Not released yet: there are no downloads, and the source is not public yet.</p>

	<h2>What it is</h2>
	<p>
		A small program that holds a Nostr key and answers signing requests over NIP-46. An app such as nview asks;
		nsign decides by that app’s policy, signs or refuses, and writes the decision to a log. When a request falls
		outside the policy it can ask a person, through <a href="/nbridge">nbridge</a>, instead of refusing.
	</p>
	<p>
		<b>Status:</b> pairing, policy, signing, the log and approvals through nbridge all work, tested end to end,
		and it is in daily use on a Raspberry Pi 5.
	</p>

	<h2>Made for a small machine at home</h2>
	<dl class="features">
		<div>
			<dt>Always on</dt>
			<dd>Designed to run all the time on a low-powered device of its own.</dd>
		</div>
		<div>
			<dt>Minimum</dt>
			<dd>A Raspberry Pi 4 or something like it, with a minimal headless system on its SD card.</dd>
		</div>
		<div>
			<dt>Nothing comes in</dt>
			<dd>It only connects out, to relays, and listens. Nothing connects to it, so it can sit behind a home router with no ports opened.</dd>
		</div>
	</dl>

	<details>
		<summary>How it works</summary>
		<dl class="features">
			<div><dt>Two keys</dt><dd>The <i>identity</i> is the key it signs as. The <i>service</i> key is the one it talks with: the <code>bunker://</code> string, the relay traffic and anyone watching see only the service key, never your npub. Both are stored encrypted (NIP-49) and unlocked together by one passphrase.</dd></div>
			<div><dt>Starts locked</dt><dd>It signs nothing until someone gives it the passphrase. There is no automatic unlock; after a restart, a person unlocks it.</dd></div>
			<div><dt>Pairing works once</dt><dd>A pairing prints a <code>bunker://</code> string with a one-time secret. The first app to connect with it is bound to its own key, and the string is spent.</dd></div>
			<div><dt>Default deny <Kinds list={[0]} /></dt><dd>A paired app may get its public key, check the signer is there, and have the kinds it was paired with signed — nothing else. A profile, a contact list and a relay list always need a person’s approval and cannot be allowed in advance. Encrypting and decrypting, which would read messages, are refused.</dd></div>
			<div><dt>A log, never content</dt><dd>One line per request: time, app, method, kind, decision. Never what was signed.</dd></div>
		</dl>
	</details>

	<details>
		<summary>Using it</summary>
		<pre><code>nsign init --relay wss://relay.example.com   # a new identity; or --import an nsec
nsign pair nview --kinds 7,5                 # prints a single-use bunker:// string
nsign serve                                  # asks for the passphrase, then runs
nsign apps                                   # paired apps, and their counts
nsign log                                    # recent requests
nsign revoke nview</code></pre>
		<p>
			State lives in <code>$NSIGN_DIR</code>, else <code>$XDG_DATA_HOME/nsign</code>, else
			<code>~/.local/share/nsign</code>, readable by its owner only.
		</p>
		<p class="note">Back up the two <code>.ncryptsec</code> files and the passphrase, offline — not a disk image.</p>
	</details>

	<details>
		<summary>How Nostr does it</summary>
		<p>
			Signing requests and replies are NIP-46, encrypted between each app and the service key. The approval
			channel to nbridge is <b>the suite’s own convention, not a Nostr standard</b>, described in ndisc’s SUITE.md.
		</p>
		<NostrRefs
			kinds={[24133, 4133]}
			nips={[
				{ n: '46', what: 'remote signing — the apps’ requests' },
				{ n: '49', what: 'the keys, encrypted with the passphrase' },
				{ n: '44', what: 'encryption of requests and approvals' }
			]}
		/>
	</details>
</AppPage>

<style>
	pre { overflow-x: auto; font-size: 0.82rem; line-height: 1.6; margin: 0.5rem 0; }
</style>
