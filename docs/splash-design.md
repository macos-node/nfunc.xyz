# Splash: design notes

> Status: prototype on the `splash-3d` branch, at `/splash`. The front page
> (`/`) is untouched. Written 2026-10-01. This is the first piece of the
> "design first" work in [`site-plan.md`](site-plan.md).

## The idea

A splash page, in the old sense: one strong image before the words. The theme
is **primitive shapes** — rounded blocks first, perhaps discs later — taken
straight from the avatar.

The avatar (`static/avatar.svg`) is a 4×4 grid of rounded squares. The solid
squares spell an **N**: the two outer columns and the diagonal. The dark
squares are the gaps. The splash turns that 2D drawing into 3D
and keeps its one statement: **the N breaks out of the grid.**

## Decisions

- **2D → 3D, same proportions.** Rounded squares become rounded cubes, with the
  pitch and corner radius measured off the SVG (`src/lib/avatar-grid.ts`).
  Half opacity becomes depth: the gap cubes sit behind the N.
- **The N holds still; the rest moves.** The N cubes stand forward, solid and
  steady. The six gap cubes carry all the motion.
- **Monochrome, with one colour from each family.** The suite's apps open in
  mono and keep colour for things that mean something. nfunc sits between the
  two site families, so the N is grey and its diagonal — the stroke that joins
  the two stems — carries one colour from each: emerald (fizx) on the upper
  square, coral (upleb) on the lower. Those two are coloured all the time; they
  are how the splash and the avatar are recognisably the same thing.
- **The rest of the colour is occasional.** Every nine seconds a wash travels
  along the N in the order a pen would draw it: emerald up the left stem,
  coral up the right. Stray single-cube flashes use the same two colours.
- **The N never drops out.** A glitch may flash an N cube in colour but never
  turns it to wireframe; only the gaps flip.
- **The still shows the gaps as outlines.** With solid grey gaps the still read
  as a block of cubes, not a letter. Outlines behind a solid N read at once.
- **Wireframe first.** Every cube is always outlined. How solid a cube looks
  is one number, its level, and it changes smoothly — a cube fades between
  outline and solid, it never switches. This replaced the first look, where
  cubes flipped between wireframe and solid at a threshold and pumped in and
  out on a shared beat; that read as jerky and as an obvious loop.
- **The N reveals itself, then holds — the middle ground.** Two ideas were on
  the table: an N that is hidden and gradually revealed, and an N that is fixed
  and solid so it is unmistakable. What is built sits between them. When the
  page opens every cube is an outline; the N fills in along the stroke over a
  few seconds. After that each N cube drifts between half-faded and solid on
  its own slow clock, so the letter keeps re-forming but is never missing.
- **It leads in; it never starts mid-performance.** A splash that opens on a
  bright, finished picture has nowhere to go. The order, over about ten
  seconds: black; sixteen faint outlines fade up; the words arrive; the
  outlines firm; the N fills in, grey, along its stroke; the two colours
  arrive on the diagonal; the meters start; only then the first wash and the
  first flicker. Everything fades — nothing appears with a cut.
- **The poster is a fallback, not a first frame.** It used to show at once and
  be swapped for the 3D, which meant bright picture → dark outlines → bright
  again. Now it appears only if the 3D cannot run, if its context is lost, if
  the visitor has no JavaScript, or if the 3D is still not there after four
  seconds — and then it fades in too.
- **Leaving is a cross-fade.** Page changes use the browser's View Transitions
  where it has them (`src/routes/+layout.svelte`), 0.6 s. Where it does not,
  the page simply changes. Reduced motion turns it off.
- **A spectral feel, because the suite is about music.** The two inner columns
  are two level meters: their gap cubes fill from the bottom up as the column's
  level rises, like bars on a spectrum analyser, and only ever faintly, so the
  N stays the loudest thing on the page.
- **No beat, no fixed clock.** The signal is three slow sine waves per column
  at unrelated rates: smooth, and it does not visibly repeat. The colour wash
  sets off at irregular intervals. There is no idle sway; the slab turns only
  when the pointer moves or it is dragged.
- **Slightly erratic, in colour only.** Now and then one cube flashes its
  colour for a fraction of a second; a gap cube may instead flick solid and
  back. Usually single, sometimes a stutter of two or three. Unchanged from the
  first look, by request.
- **The signal is synthetic.** No audio, no permission prompt. Real audio (the
  browser's analyser) is a later option, and only if something is actually
  playing on the page.
- **Cheap, simple and effective is the brief.** No trickery: the whole effect
  is sixteen cubes, their outlines, and one number per cube. Fading is the page
  colour turning into the cube's colour, so it needs no transparency. Anything
  that would need more than that should be argued for first.
- **Angle.** Slightly offset, tilted back, turning a little toward the
  pointer, with a slow sway.
- **Drag to turn.** The slab can be dragged a full 360° sideways (and tipped
  up or down within limits, so it never ends up upside down). Let go and it
  coasts, holds for a couple of seconds, then eases back to the resting pose.
  From behind the N reads mirrored and the gap cubes are in front — a
  different picture of the same thing, which is fine.

## Type

- **The name is set in Ubuntu Sans ExtraBold; everything else stays
  monospace.** One class, `.wordmark`, used on the `nfunc` heading and nowhere
  else.
- **Served from this site**, not a font host: one 16 KB file (Latin, weight
  800), bundled from `@fontsource/ubuntu-sans`. No third-party request.
- **Licence:** Ubuntu Font Licence 1.0 — free to use and embed on the web.

## The words

A splash carries three things: the name, one image, and the way in. This one
adds a fourth without adding clutter, by letting the name do it.

- **n stays; the suffix takes turns.** Every app in the suite is n + a word.
  The splash shows `nfunc`, then swaps only the suffix — `ndisc`, `nplay`,
  `ntree` … — and comes back to `nfunc`. The n never moves, so the naming rule
  is visible without being explained.
- **The line underneath follows the name.** Under `nfunc` it is the site's own
  line; under an app it is that app's one-line role. That is the only extra
  information on the page, and it answers "what is this?" better than a
  slogan.
- **One list.** Names and roles come from `src/lib/apps.ts`, the same list the
  front page prints, so the two cannot disagree.
- **Calm, like the blocks.** It starts only after the lead-in. `nfunc` holds
  for seven seconds, each app for under three. A turn fades out quickly and in
  slowly; nothing slides, and the link below never moves (the line keeps room
  for two rows). App suffixes are a step dimmer than `func`, so nfunc reads as
  home.
- **It gets out of the way.** Resting the pointer on the words holds the
  current turn. With reduced motion it stays `nfunc`. A screen reader always
  hears "nfunc", whatever is showing.

## What we are deliberately not doing

Anything that needs extra full-screen passes or extra downloads, because the
page has to hold up on slow hardware and across browsers:

- no blur, glow/bloom, depth of field or film grain (post-processing);
- no reflections (an environment texture);
- no cast shadows (a shadow pass);
- no transparency (sorting). A "wireframe" cube is the cube drawn in the page
  colour, hiding what is behind it, with its outline on top.

It looks right without them.

## How it stays cheap

- One instanced mesh for all sixteen cubes; outlines only for cubes currently
  in wireframe.
- three.js is the only runtime dependency, imported by name (`src/lib/three-kit.ts`)
  and loaded only on the splash route — about 131 KB compressed.
- 30 frames a second; device pixel ratio capped at 2.
- Nothing is drawn while the canvas is off screen or the tab is hidden.
- **Fallbacks:** `static/splash-still.webp` — the still — is shown if WebGL
  is missing, the context is lost, there is no JavaScript, or the 3D has not
  arrived after four seconds. Visitors who ask for reduced motion get one
  still frame of the same pose, with no fades. `/splash?still` shows that
  frame on demand.

To re-capture the still after changing the pose: in `npm run dev`, open
`/splash` and call `__blocksStill(900)` in the console; it returns a WebP data
URL.

## Open

- **Looks worth keeping in mind.** While this was being tuned, some of the
  in-between states were striking — especially the moments it dropped to pure
  monochrome outlines. Two ways to use them later, neither built: let the piece
  drift through a few looks on its own, or let the visitor change the look.
  The suite already has a habit for the second (tap the wordmark to cycle
  themes), so a tap that switches between colour and mono would be the cheap,
  consistent version.
- Tested in one Chromium-based browser only. Firefox, Safari, a real phone and
  a low-end machine are still to do, as are the no-WebGL and reduced-motion
  paths in practice.
- Discs, as a second primitive.
- Whether the splash replaces `/` or stays a separate entry page.
- The line under `nfunc` — "Own your catalogue." — is still a placeholder.
- Whether a showing app's name should link to that app, once apps have pages.
- Tuning: tempo, how often it glitches, how far the gaps travel, wash speed.
- The rest of the site should use the same shapes and palette flat (SVG/CSS),
  so the 3D is a front-page feature and not a requirement for reading the site.
