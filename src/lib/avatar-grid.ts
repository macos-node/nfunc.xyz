// The avatar (static/avatar.svg) as data: a 4×4 grid of rounded squares.
// `solid: false` marks the squares the avatar draws at 50% opacity.
export type Cell = { colour: string; solid: boolean };

const B = '#345ED3'; // blue
const C = '#34C8D3'; // cyan
const V = '#A78BFA'; // violet
const b = '#8BA7FA'; // pale blue, half
const c = '#8BD9FA'; // pale cyan, half

const rows = [
	[B, b, c, C],
	[C, V, c, C],
	[C, c, V, C],
	[C, c, b, B]
];

export const GRID: Cell[][] = rows.map((row) =>
	row.map((colour) => ({ colour, solid: colour !== b && colour !== c }))
);

// Proportions measured off the SVG: squares 138 wide on a 164 pitch, corner
// radius 22.
export const PITCH = 164 / 138;
export const RADIUS = 22 / 138;

// The solid squares spell an N: left stem, diagonal, right stem. This is the
// order a pen would draw it in, as [row, column] — what the colour wash follows.
export const N_STROKE: [number, number][] = [
	[3, 0], [2, 0], [1, 0], [0, 0],
	[1, 1], [2, 2],
	[3, 3], [2, 3], [1, 3], [0, 3]
];
