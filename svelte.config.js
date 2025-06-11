import adapter from '@sveltejs/adapter-auto';
import { sveltePreprocess } from 'svelte-preprocess';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess(), sveltePreprocess({ globalStyle: true })],
	kit: {
		adapter: adapter()
	}
};

export default config;
