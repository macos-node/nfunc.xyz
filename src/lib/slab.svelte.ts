// The slab lives in the layout, so it is made once and stays while pages
// change. On the front page it is large and the page drives it: the page says
// which cube is current and hears about the pointer through these.
export const slab = $state({
	active: 0,
	onhover: undefined as ((n: number) => void) | undefined,
	onselect: undefined as ((n: number) => void) | undefined
});
