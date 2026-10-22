import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		appDir: 'internal',
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: null,
			strict: true
		})
	},
	preprocess: [vitePreprocess()],
	vitePlugin: {
		inspector: {
			holdMode: true
		}
	}
};

export default config;
