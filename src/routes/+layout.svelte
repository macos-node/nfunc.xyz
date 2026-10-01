<script lang="ts">
	import '../app.css';
	import { onNavigate } from '$app/navigation';
	let { children } = $props();

	// Moving between pages cross-fades where the browser can do it (the View
	// Transitions API); elsewhere the page simply changes, as before.
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

{@render children()}
