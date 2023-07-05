import adapter from '@sveltejs/adapter-static';
import preprocess from "svelte-preprocess";

// const dev = process.argv.includes('dev');
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
    appDir: 'internal',
		adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: null,
      precompess: false,
      strict: true
    })
	},
	preprocess: [
		preprocess({
			postcss: true,
		}),
	],
	vitePlugin: {
    inspector: {
      holdMode: true,
    }
	}		

};

export default config;
