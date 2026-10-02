import { redirect } from '@sveltejs/kit';

// The splash is the front page now; the old address still leads there.
export function load() {
	redirect(308, '/');
}
