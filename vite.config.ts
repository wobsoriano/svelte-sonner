import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';

const vitestBrowserConditionPlugin: Plugin = {
	name: 'vite-plugin-vitest-browser-condition',
	//@ts-expect-error - shh
	config({ resolve }: { resolve: { conditions: string[] } }) {
		if (process.env.VITEST) {
			resolve.conditions.unshift('browser');
		}
	}
};

export default defineConfig({
	plugins: [vitestBrowserConditionPlugin, sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		// jest like globals
		globals: true,
		environment: 'jsdom',
		// in-source testing
		includeSource: ['src/**/*.{js,ts,svelte}'],
		// Add @testing-library/jest-dom's matchers & mocks of SvelteKit modules
		setupFiles: ['./scripts/setupTest.ts'],
		coverage: {
			exclude: ['setupTest.ts']
		}
	}
});
