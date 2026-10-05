// The suite, in the order the apps were built. The list, the footer, the
// cycle through the pages and the cubes of the N all follow it.
// `page` marks an app that has a page of its own on this site, at /<name>.
export const apps: { name: string; role: string; page?: boolean }[] = [
	{ name: 'ndisc', role: 'Discography catalogue and publisher — the hub', page: true },
	{ name: 'ntree', role: 'FLAC quality scanner, sampler and library mirror', page: true },
	{ name: 'nsmpl', role: 'Two-track sample tool and publisher', page: true },
	{ name: 'nview', role: 'Mobile viewer: read and react', page: true },
	{ name: 'nping', role: 'Nostr relay connectivity tester', page: true },
	{ name: 'nplay', role: 'Music and video player', page: true },
	{ name: 'nchat', role: 'Private direct messages', page: true },
	{ name: 'nbridge', role: 'Relay viewer and the signer’s monitor', page: true },
	{ name: 'nsign', role: 'Remote signer: holds the key, answers NIP-46', page: true },
	{ name: 'ntune', role: 'Internet radio and podcast player', page: true }
];

// The sites that run in a browser, each at <name>.nfunc.xyz. They are not
// apps of the suite — no cube, no page here — so they are listed apart.
export const sites: { name: string; role: string }[] = [
	{ name: 'glmps', role: 'A published discography, to browse and react to' },
	{ name: 'npub', role: 'Profile lookup: a key’s profile and latest notes' },
	{ name: 'pls', role: 'The relay’s pulse: what it holds and what arrives' }
];

// The name is n + a suffix, like every app in the suite. Home is the first
// turn, then each app in order. The N has ten cubes and there are ten apps, so
// each cube is an app: cube c is apps[c], which is turns[c + 1]. Home has no
// cube — it is the name itself, and the nfunc link in every page's header.
// A turn whose app has a page carries its address.
export const turns: { suffix: string; line: string; href?: string }[] = [
	{ suffix: 'func', line: 'Own your catalogue.' },
	...apps.map((app) => ({
		suffix: app.name.slice(1),
		line: app.role,
		href: app.page ? `/${app.name}` : undefined
	}))
];
