<script lang="ts">
	import AppPage from '$lib/AppPage.svelte';
	import Downloads from '$lib/Downloads.svelte';
	import NostrRefs from '$lib/NostrRefs.svelte';

	const version = '0.4.3';
	const repo = 'https://github.com/xjmzx/nping';
</script>

<AppPage
	name="nping"
	{version}
	lead="A small tester for Nostr relays and the machines behind them, that tells you exactly where a connection fails."
	description="nping: a Nostr relay connectivity tester, with host checks for DNS, ping, ports, TLS, HTTP and LND."
>
	<h2>What it is</h2>
	<p>
		A desktop app for Apple, Linux and Windows. Give it a list of relays and it tries each one in stages,
		timing every step and showing the error word for word when one fails. A second view checks whole
		machines: their name, ports, certificate and web server.
	</p>
	<details>
		<summary>The stack</summary>
		<p>Tauri 2, React, Vite and Tailwind — the suite’s stack.</p>
		<p>
			The checks run in Rust: <code>tungstenite</code> (with rustls) for the WebSocket and <code>ureq</code> for
			the relay’s information document, each with its own time limit and on its own thread, so relays are
			tried side by side.
		</p>
	</details>

	<h2>Get it</h2>
	<Downloads
		{repo}
		{version}
		files={[
			{ os: 'Apple', arch: 'aarch64', file: `nping_${version}_aarch64.dmg` },
			{ os: 'Linux', arch: 'amd64', file: `nping_${version}_amd64.deb` },
			{ os: 'Windows', arch: 'x64', file: `nping_${version}_x64-setup.exe` }
		]}
	/>

	<h2>Relays</h2>
	<p>Edit a list of relay addresses and ping them. Each relay is tried in three stages, each with its own light:</p>
	<dl class="features">
		<div><dt>Connect</dt><dd>Opens the WebSocket — the network connection, encryption and the upgrade — and times it.</dd></div>
		<div><dt>Subscribe</dt><dd>Asks for a little data and waits for the relay to say it has sent everything, and shows any notice or refusal it gives.</dd></div>
		<div>
			<dt>Info</dt>
			<dd>
				Fetches the relay’s own description: its software and version, what it supports, and whether it wants
				payment or a login.
				<details>
					<summary>why it works where a browser would not</summary>
					<p>The fetch is made from Rust, not the web view, so the browser restriction most relays trip does not hide the answer.</p>
				</details>
			</dd>
		</div>
	</dl>

	<h2>Hosts</h2>
	<p>The hosts view checks whole machines rather than relays. Each host can run any of these:</p>
	<dl class="features">
		<div><dt>DNS</dt><dd>Looks the name up, timed. Skipped when you give an IP address.</dd></div>
		<div>
			<dt>Ping</dt>
			<dd>
				The system’s own ping. No reply shows amber, not red: plenty of servers ignore ping.
				<details>
					<summary>more</summary>
					<p>It uses the system <code>ping</code>, which carries the permission to send raw packets; Ubuntu keeps that closed to ordinary programs.</p>
				</details>
			</dd>
		</div>
		<div><dt>Ports</dt><dd>Tries each port: open, refused or timed out, with the error. Write <code>!22</code> for a port that should be closed — it passes when refused or silent, and fails if it is ever open. A small firewall audit.</dd></div>
		<div><dt>TLS</dt><dd>Checks the certificate: that it verifies, when it expires, who issued it, the names on it and its fingerprint. An expired one is still read, so it says how long ago. Amber under 14 days. For a host given as an IP, set the name to check the certificate against.</dd></div>
		<div><dt>Web</dt><dd>Fetches a page, following redirects: status, time, where it landed, and whether it contains some text you name. Catches a web server that is down while the machine is up.</dd></div>
		<div><dt>Relay</dt><dd>The relay check above, against a relay on that host.</dd></div>
		<div><dt>LND</dt><dd>For a Lightning node: whether its peer port is reachable, and its state from the one address LND answers without credentials, with its certificate’s fingerprint. It can go through a local Tor proxy.</dd></div>
		<div><dt>Hosting notes</dt><dd>Your own records for each host — its specs, and what it costs and when it renews. The renewal counts down: amber within 30 days, red once lapsed. Notes never change a host’s status and are never sent anywhere.</dd></div>
	</dl>
	<p class="dim small">No hosts come with the app. Your lists stay on your machine, and move between machines by export and import.</p>

	<details>
		<summary>What it stores, and where</summary>
		<p>
			Everything is in the web view’s local storage — under <code>~/.local/share/uk.fizx.nping/localstorage/</code> on
			Linux — one file for the installed app and another for development builds, so the two never share lists.
			The keys are <code>nping.relays</code>, <code>nping.hosts</code>, <code>nping.hostResults</code>,
			<code>nping.view</code> and <code>nping.mode</code>.
		</p>
		<p>
			Import and export go through the system’s file dialogs, which open where you last saved or loaded. Import
			merges, skipping entries already listed; export writes the lists only, never results.
		</p>
	</details>

	<details>
		<summary>How Nostr does it</summary>
		<p>
			nping holds no key and publishes nothing. The subscribe stage is a plain Nostr request, and the info
			stage reads the document a relay publishes about itself.
		</p>
		<NostrRefs
			kinds={[]}
			nips={[
				{ n: '01', what: 'the request, and the relay’s end-of-results reply' },
				{ n: '11', what: 'the relay’s information document' }
			]}
		/>
	</details>
</AppPage>
