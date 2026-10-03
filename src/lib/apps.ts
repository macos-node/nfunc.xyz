// The suite, as ndisc's SUITE.md lists it ("The apps at a glance").
// `page` marks an app that has a page of its own on this site, at /<name>.
export const apps: { name: string; role: string; page?: boolean }[] = [
	{ name: 'ndisc', role: 'Discography catalogue and publisher — the hub', page: true },
	{ name: 'nplay', role: 'Music and video player', page: true },
	{ name: 'ntree', role: 'FLAC quality scanner, sampler and library mirror', page: true },
	{ name: 'nsmpl', role: 'Two-track sample tool and publisher', page: true },
	{ name: 'nview', role: 'Mobile viewer: read and react', page: true },
	{ name: 'nping', role: 'Nostr relay connectivity tester', page: true },
	{ name: 'nchat', role: 'Private direct messages', page: true },
	{ name: 'nsign', role: 'Remote signer: holds the key, answers NIP-46', page: true },
	{ name: 'nbridge', role: 'Relay viewer and the signer’s monitor', page: true }
];

// The name is n + a suffix, like every app in the suite. Home is the first
// turn, then each app in order — ten turns for the ten cubes of the N, which
// are numbered the same way. A turn whose app has a page carries its address.
export const turns: { suffix: string; line: string; href?: string }[] = [
	{ suffix: 'func', line: 'Own your catalogue.' },
	...apps.map((app) => ({
		suffix: app.name.slice(1),
		line: app.role,
		href: app.page ? `/${app.name}` : undefined
	}))
];
