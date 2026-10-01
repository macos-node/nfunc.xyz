// The avatar (static/avatar.svg) as data: a 4×4 grid of rounded squares.
//
// The solid squares spell an N and are monochrome, like the suite's apps on
// launch. nfunc sits between the two site families, so it carries one colour
// from each and no more: emerald (fizx) and coral (upleb), on the diagonal —
// the stroke that joins the two stems.
//
//   solid  part of the N; false marks a gap
//   rest   wears its colour all the time (the diagonal); the rest are grey
//   colour what the cube turns when the wash passes or it glitches
export type Cell = { colour: string; solid: boolean; rest: boolean };

export const EMERALD = '#34d399'; // fizx primary
export const CORAL = '#FF7849'; // upleb primary
export const N_GREY = '#d0d0d4';
export const GAP_GREY = '#26262b';

const N = [
	[1, 0, 0, 1],
	[1, 1, 0, 1],
	[1, 0, 1, 1],
	[1, 0, 0, 1]
];

// The left half leans emerald, the right half coral: the left stem and the
// upper diagonal square are fizx's side, the lower diagonal square and the
// right stem upleb's.
export const GRID: Cell[][] = N.map((row, r) =>
	row.map((on, c) => ({
		colour: c < 2 ? EMERALD : CORAL,
		solid: on === 1,
		rest: on === 1 && r === c && r > 0 && r < 3
	}))
);

// Proportions measured off the SVG: squares 138 wide on a 164 pitch, corner
// radius 22.
export const PITCH = 164 / 138;
export const RADIUS = 22 / 138;

// The order a pen would draw the N in, as [row, column] — what the colour
// wash follows: up the left stem, down the diagonal, up the right stem.
export const N_STROKE: [number, number][] = [
	[3, 0], [2, 0], [1, 0], [0, 0],
	[1, 1], [2, 2],
	[3, 3], [2, 3], [1, 3], [0, 3]
];
