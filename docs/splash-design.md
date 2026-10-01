# Splash: design notes

> Status: prototype on the `splash-3d` branch, at `/splash`. The front page
> (`/`) is untouched. Written 2026-10-01. This is the first piece of the
> "design first" work in [`site-plan.md`](site-plan.md).

## The idea

A splash page, in the old sense: one strong image before the words. The theme
is **primitive shapes** — rounded blocks first, perhaps discs later — taken
straight from the avatar.

The avatar (`static/avatar.svg`) is a 4×4 grid of rounded squares. The solid
squares spell an **N**: the two outer columns and the diagonal. The squares
drawn at half opacity are the gaps. The splash turns that 2D drawing into 3D
and keeps its one statement: **the N breaks out of the grid.**

## Decisions

- **2D → 3D, same proportions.** Rounded squares become rounded cubes, with the
  pitch and corner radius measured off the SVG (`src/lib/avatar-grid.ts`).
  Half opacity becomes depth: the gap cubes sit behind the N.
- **The N holds still; the rest moves.** The N cubes stand forward, solid and
  steady. The six gap cubes carry all the motion.
- **Achromatic first.** Shaded greys are the base look. It works on its own
  and is the still fallback.
- **Colour is occasional, not constant.** The avatar's blue, cyan and violet
  appear as a wash that travels along the N in the order a pen would draw it,
  every nine seconds — and as stray hints (below). The N is emphasised by
  geometry all the time and by colour some of the time.
- **A spectral feel, because the suite is about music.** The gap cubes move
  like the bars of a spectrum analyser. Their look follows their level:
  wireframe when low, solid as they rise, brighter at the peak. Wireframe →
  solid is the "signal arriving".
- **Slightly erratic.** Now and then one cube glitches for a fraction of a
  second: it flips between wireframe and solid, or flashes its avatar colour.
  Usually single, sometimes a stutter of two or three. This came from watching
  the looks being switched during prototyping — the flicker read as an effect
  worth keeping.
- **The signal is synthetic.** A decaying beat over two slow sines per cube.
  No audio, no permission prompt. Real audio (the browser's analyser) is a
  later option, and only if something is actually playing on the page.
- **Angle.** Slightly offset, tilted back, turning a little toward the
  pointer, with a slow sway.
- **Drag to turn.** The slab can be dragged a full 360° sideways (and tipped
  up or down within limits, so it never ends up upside down). Let go and it
  coasts, holds for a couple of seconds, then eases back to the resting pose.
  From behind the N reads mirrored and the gap cubes are in front — a
  different picture of the same thing, which is fine.

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
- three.js is the only dependency, imported by name (`src/lib/three-kit.ts`)
  and loaded only on the splash route — about 131 KB compressed.
- 30 frames a second; device pixel ratio capped at 2.
- Nothing is drawn while the canvas is off screen or the tab is hidden.
- **Fallbacks:** `static/splash-still.webp` — the achromatic shaded still — is
  shown first and stays if WebGL is missing or the context is lost. Visitors
  who ask for reduced motion get one still frame of the same pose.
  `/splash?still` shows that frame on demand.

To re-capture the still after changing the pose: in `npm run dev`, open
`/splash` and call `__blocksStill(900)` in the console; it returns a WebP data
URL.

## Open

- Tested in one Chromium-based browser only. Firefox, Safari, a real phone and
  a low-end machine are still to do, as are the no-WebGL and reduced-motion
  paths in practice.
- Discs, as a second primitive.
- Whether the splash replaces `/` or stays a separate entry page.
- The words: "Own your catalogue." is a placeholder.
- Tuning: tempo, how often it glitches, how far the gaps travel, wash speed.
- The rest of the site should use the same shapes and palette flat (SVG/CSS),
  so the 3D is a front-page feature and not a requirement for reading the site.
