import adapterAuto from '@sveltejs/adapter-auto';
import adapterVercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],
	kit: {
		// adapter-vercel 6 can't infer a function runtime when Vercel builds on Node 26
		adapter: process.env.VERCEL ? adapterVercel({ runtime: 'nodejs24.x' }) : adapterAuto()
	}
};

export default config;
