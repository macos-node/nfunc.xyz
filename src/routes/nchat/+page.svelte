<script lang="ts">
	import AppPage from '$lib/AppPage.svelte';
	import Downloads from '$lib/Downloads.svelte';
	import KeyStore from '$lib/KeyStore.svelte';
	import NostrRefs from '$lib/NostrRefs.svelte';

	const version = '0.2.0';
	const repo = 'https://github.com/xjmzx/nchat';
</script>

<AppPage
	name="nchat"
	{version}
	lead="A small, private Nostr messenger, for a short list of keys you name yourself."
	description="nchat: a private Nostr messenger — several identities, whitelist-only, built on NIP-17 gift wrap."
>
	<h2>What it is</h2>
	<p>
		A desktop app for Apple, Linux and Windows. It sends and receives private messages between keys you have
		listed, from one or more identities of your own. It is deliberately not a social client: no feed, no
		timeline, no followers. Keeping to a short list of names is what keeps both the trust and the code small.
	</p>
	<details>
		<summary>The stack</summary>
		<p>
			Tauri 2, React, Vite and Tailwind — the suite’s stack — with <code>nostr-sdk</code> for the protocol and
			<code>keyring</code> for the operating system’s key store. Encryption on the wire is rustls throughout,
			so there is no dependency on the system’s OpenSSL.
		</p>
	</details>

	<h2>Get it</h2>
	<Downloads
		{repo}
		{version}
		files={[
			{ os: 'Apple', arch: 'aarch64', file: `nchat_${version}_aarch64.dmg` },
			{ os: 'Linux', arch: 'amd64 .deb', file: `nchat_${version}_amd64.deb` },
			{ os: 'Linux', arch: 'AppImage', file: `nchat_${version}_amd64.AppImage` },
			{ os: 'Windows', arch: 'x64', file: `nchat_${version}_x64-setup.exe` }
		]}
	/>

	<h2>Why gift wrap</h2>
	<p>
		An older Nostr direct message hides what is said and nothing else. Who sent it, who it is for and when are
		all public — and because the text is not padded, even its length tells something. A daily alert from a
		server can be read as “one problem” or “two problems” without ever being decrypted.
	</p>
	<p>
		Gift wrap fixes that. The message is sealed and signed by you, then sealed again by a key used once and
		thrown away, with the time moved by up to two days. Someone watching sees an unknown key send something to
		your contact, at a time that is not the real one.
	</p>
	<details>
		<summary>The three layers</summary>
		<div class="scroll">
			<table>
				<thead><tr><th>Layer</th><th>Kind</th><th>What it does</th></tr></thead>
				<tbody>
					<tr><td>rumor</td><td><code>14</code></td><td>the message itself; never signed, never published on its own</td></tr>
					<tr><td>seal</td><td><code>13</code></td><td>the rumor, encrypted to the receiver (NIP-44) and signed by the real sender</td></tr>
					<tr><td>wrap</td><td><code>1059</code></td><td>the seal, encrypted again and signed by a throwaway key, its time moved by up to two days</td></tr>
				</tbody>
			</table>
		</div>
		<p>Two things follow:</p>
		<ul class="todo">
			<li>A conversation is put in order by the time inside the message, not the wrap’s, which is scrambled on purpose.</li>
			<li>Wraps cannot be filtered by sender. nchat fetches every wrap addressed to you and tries to open each one.</li>
		</ul>
		<p>
			Old-style messages are still read — never written — so correspondents who have not moved over, including
			the suite’s certificate and domain-expiry bots, keep working.
		</p>
	</details>

	<h2>Keys</h2>
	<p>
		nchat is built on a web view, and a web view in a program that holds private keys is a real point of
		attack. The answer here is a hard boundary rather than a promise: your secret keys never reach the web view
		at all.
	</p>
	<details>
		<summary>How the boundary holds</summary>
		<ul class="todo">
			<li>Secret keys go into the operating system’s key store and are read only inside Rust, for the moment it takes to sign or open a message.</li>
			<li>No command the web view can call returns a secret key. It only ever sees public keys and the text of messages.</li>
			<li>Messages are shown as text, never as markup, under a strict content policy.</li>
			<li>Each identity is its own keypair, sharing one relay set and one contact list. A message is signed by, and opened for, exactly the identity you have chosen.</li>
		</ul>
		<KeyStore />
		<p class="dim small">On Linux the key store needs a Secret Service running (GNOME Keyring or similar); nchat says so when it cannot reach one.</p>
	</details>

	<h2>The whitelist</h2>
	<p>
		nchat shows messages from keys on your contact list and no others. Anything else is counted and dropped
		unread — the footer shows how many. Sending is bound to the list too, so a mistyped key cannot quietly
		become a message to a stranger.
	</p>

	<h2>Relay diagnostics</h2>
	<p>
		nping’s connect, subscribe and info checks are built in, and every message you send reports which relays
		took it. A relay that accepts the connection, advertises no restriction and then silently throws the
		message away is a real failure, and it has been seen. nchat shows it, instead of a cheerful “sent”.
	</p>

	<details>
		<summary>How Nostr does it</summary>
		<NostrRefs
			kinds={[14, 13, 1059, 4]}
			nips={[
				{ n: '17', what: 'private direct messages' },
				{ n: '59', what: 'gift wrap: the seal and the wrap' },
				{ n: '44', what: 'the encryption inside each layer' },
				{ n: '04', what: 'old-style messages — read only' },
				{ n: '11', what: 'the relay information check' }
			]}
		/>
	</details>

	<h2>Still to come</h2>
	<ul class="todo">
		<li>Background sync — for now messages arrive when you press Sync, not as they are sent.</li>
		<li>Signing with a remote signer.</li>
		<li>Publishing the names you give your contacts, and searching messages.</li>
	</ul>
</AppPage>
