<script>
	/* eslint-disable svelte/no-at-html-tags */
	import { loadApisInfo } from '$lib/index.js';
</script>

<main>
	{@html loadApisInfo()}
</main>
