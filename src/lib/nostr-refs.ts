// What the chips on the app pages mean and where they lead. The three kinds
// in the 3123x range are the suite's own conventions — not Nostr standards —
// and are described in ndisc's README; every other kind belongs to a NIP.
const NDISC = 'https://github.com/xjmzx/ndisc';
const nipDoc = (n: string) => `https://github.com/nostr-protocol/nips/blob/master/${n}.md`;

export const kinds: Record<number, { what: string; href: string; own?: boolean }> = {
	0: { what: 'your profile — read for your name and NIP-05', href: nipDoc('01') },
	5: { what: 'a deletion request (NIP-09)', href: nipDoc('09') },
	7: { what: 'a reaction (NIP-25)', href: nipDoc('25') },
	1063: { what: 'a file and its metadata (NIP-94)', href: nipDoc('94') },
	4550: { what: 'an approval of a feed note (NIP-72)', href: nipDoc('72') },
	30000: { what: 'a people set: who may contribute (NIP-51)', href: nipDoc('51') },
	31237: { what: 'a release — the suite’s own convention', href: `${NDISC}#nostr-schema-experimental--kind31237`, own: true },
	31238: { what: 'the label library — the suite’s own convention', href: `${NDISC}#companion-event-kinds`, own: true },
	31239: { what: 'a feed note — the suite’s own convention', href: `${NDISC}#companion-event-kinds`, own: true }
};

export const nips: Record<string, string> = {
	'01': 'the base event protocol',
	'09': 'deletion requests',
	'19': 'shareable links: naddr, nevent',
	'25': 'reactions',
	'51': 'lists and sets',
	'65': 'relay lists',
	'72': 'approvals',
	'73': 'external ids',
	'94': 'file metadata events',
	'96': 'uploading a file over HTTP',
	'98': 'signing an HTTP request'
};
export const nipHref = nipDoc;
