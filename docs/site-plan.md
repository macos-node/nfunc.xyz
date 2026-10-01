# The suite's site (plan)

> **Status: STARTED (2026-10-01).** The domain is `nfunc.xyz`, hosted on its
> own server, built with SvelteKit as a static site; a scaffold page is live.
> No design yet — that is the next piece of work. Expected to be long, built
> up in pieces.
>
> Written 2026-09-30 as a bare outline in ndisc's `schema/` directory, and
> moved here when this repo was created.

## What it's for

A home for the n-suite on a domain of its own. "nfunc" reads as both
"function" and "funk"; worth trying on non-developers, since "func" can read
as programmer shorthand.

Marketing-led and design-led: professional enough to attract artists, while
still being honest about how it works.

## Three tiers, one per audience

| Tier | For | What it covers |
|---|---|---|
| **1. Front** (marketing-led) | artists, listeners | what the suite does for you: publish a discography, own your catalogue, share without a platform in the middle. Design first, few words. |
| **2. How Nostr fits** | the average user | keys, relays and a signer, explained through the apps: why nview never sees your key, what a release skeleton is, what an open release is. No jargon without a reason. |
| **3. For contributors** | people who'd build on it | the wire contract, schemas, signing paths, the design language, the repos, and design notes like the player idea. Precise and technical. |

Each tier links down to the next, so a curious artist can keep going and a
contributor can skip straight to tier 3.

## What already exists to build from

- **The app wordmarks.** Figma has one per app, and nothing uses them yet
  (ICONS.md). An apps page is their natural first use, with the icon masters
  beside them.
- **SUITE.md** (in [ndisc](https://github.com/xjmzx/ndisc)): the Nostr
  contract table and "signing paths" are most of tier 3 already. The site
  presents them; SUITE.md and ndisc's `schema/` directory stay the source.
- **The design language** (three themes, header, status dot, footer), so the
  site looks like the apps rather than a generic landing page.
- **Design notes** in ndisc's `schema/`, such as
  `player-design-2026-09-30.md`, as tier 3 reading.

## Decided (2026-10-01)

- **Domain and name:** `nfunc.xyz`.
- **Hosting and stack:** its own server; SvelteKit prerendered to static
  files, served by nginx. The same stack as fizx.uk.
- **No backend.** Nostr features run in the browser: reading notes and
  releases from relays, signing in with a bunker or an extension, and
  contacting the author by private message (NIP-17).
- **No email service on the server.**
- **A relay of its own**, `wss://relay.nfunc.xyz`: read-open, write by
  whitelist. Not a public relay, though the whitelist may grow.
- **Order of work:** the site's design first. App features, screenshots and
  documentation continue alongside and feed in as they are ready.

## Open questions

- Whether SUITE.md eventually moves to this repo, with ndisc keeping only
  the schemas it owns, or the site just renders SUITE.md from there.
- How much of tier 3 is generated from the schemas rather than written by
  hand, so it can't drift from the contract.
- Later services on their own subdomains: media storage (Blossom), and a
  relay for remote-signer traffic.
