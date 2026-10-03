// What the chips on the app pages mean and where they lead. Kinds marked
// `own` are the suite's own conventions — not Nostr standards — described in
// ndisc's README or SUITE.md; every other kind belongs to a NIP.
const NDISC = 'https://github.com/xjmzx/ndisc';
const nipDoc = (n: string) => `https://github.com/nostr-protocol/nips/blob/master/${n}.md`;

export const kinds: Record<number, { what: string; href: string; own?: boolean }> = {
	0: { what: 'your profile — read for your name and NIP-05', href: nipDoc('01') },
	5: { what: 'a deletion request (NIP-09)', href: nipDoc('09') },
	4: { what: 'a direct message, the old way (NIP-04) — read, never written', href: nipDoc('04') },
	7: { what: 'a reaction (NIP-25)', href: nipDoc('25') },
	13: { what: 'a seal: the message, encrypted and signed by the sender (NIP-59)', href: nipDoc('59') },
	14: { what: 'a private message, never published on its own (NIP-17)', href: nipDoc('17') },
	1059: { what: 'a gift wrap: the seal, sealed again by a throwaway key (NIP-59)', href: nipDoc('59') },
	4133: { what: 'an approval request or answer — the suite’s own convention', href: `${NDISC}/blob/main/SUITE.md#the-approval-channel--approval-v1-frozen`, own: true },
	24133: { what: 'a remote-signing request or reply (NIP-46)', href: nipDoc('46') },
	1063: { what: 'a file and its metadata (NIP-94)', href: nipDoc('94') },
	4550: { what: 'an approval of a feed note (NIP-72)', href: nipDoc('72') },
	30000: { what: 'a people set: who may contribute (NIP-51)', href: nipDoc('51') },
	31237: { what: 'a release — the suite’s own convention', href: `${NDISC}#nostr-schema-experimental--kind31237`, own: true },
	31238: { what: 'the label library — the suite’s own convention', href: `${NDISC}#companion-event-kinds`, own: true },
	31239: { what: 'a feed note — the suite’s own convention', href: `${NDISC}#companion-event-kinds`, own: true }
};

export const nips: Record<string, string> = {
	'01': 'the base event protocol',
	'04': 'direct messages, the old way',
	'09': 'deletion requests',
	'11': 'a relay’s information document',
	'17': 'private direct messages',
	'19': 'shareable links: naddr, nevent',
	'25': 'reactions',
	'44': 'encryption between two keys',
	'46': 'remote signing',
	'49': 'a key encrypted with a passphrase',
	'51': 'lists and sets',
	'59': 'gift wrap',
	'65': 'relay lists',
	'72': 'approvals',
	'73': 'external ids',
	'94': 'file metadata events',
	'96': 'uploading a file over HTTP',
	'98': 'signing an HTTP request'
};
export const nipHref = nipDoc;
