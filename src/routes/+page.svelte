<script lang="ts">
	import { Icon, XMark, Folder } from 'svelte-hero-icons';
	import { base } from '$app/paths';
	import '../app.postcss';
	import Router from 'svelte-spa-router';
	import Search from '../components/Search.svelte';

	import SongPage from '../pages/SongPage.svelte';
	import ArtistPage from '../pages/ArtistPage.svelte';
	import HomePage from '../pages/HomePage.svelte';
	import FilePage from '../pages/FilePage.svelte';
	import { getMeta, updateSongs } from '$lib/db';

	const routes = {
		'/artist/:artist': ArtistPage,
		'/song/:song': SongPage,
		'/file': FilePage,
		'*': HomePage
	};

	function debounce(timeout = 400) {
		let timer: ReturnType<typeof setTimeout>;
		return (callback: () => void) => {
			clearTimeout(timer);
			timer = setTimeout(() => callback(), timeout);
		};
	}

	let queryInput = $state('');
	let query = $state('');

	const debouncedSearch = debounce();
	$effect(() => {
		const value = queryInput;
		debouncedSearch(() => (query = value));
	});

	function clearSearch() {
		queryInput = '';
		query = '';
	}

	const bootstrapDb = (async () => {
		const meta = await getMeta();
		if (!meta) {
			const resp = await fetch(`${base}/songs.json`);
			if (resp.ok) {
				const lastModifiedStr = resp.headers.get('Last-Modified');
				const last_modified = lastModifiedStr ? Date.parse(lastModifiedStr) : 0;
				const { songs } = await resp.json();
				await updateSongs(songs, last_modified);
			}
		} else {
			try {
				const headResp = await fetch(`${base}/songs.json`, { method: 'HEAD' });
				if (headResp.ok) {
					const lastModifiedStr = headResp.headers.get('Last-Modified');
					const last_modified = lastModifiedStr ? Date.parse(lastModifiedStr) : 0;
					if (meta.last_modified < last_modified) {
						const resp = await fetch(`${base}/songs.json`);
						if (resp.ok) {
							const { songs } = await resp.json();
							await updateSongs(songs, last_modified);
						}
					}
				}
			} catch {
				// Offline: keep existing DB.
			}
		}
	})();
</script>

<main class="max-w-lg md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
	<nav>
		<div class="flex gap-4 py-2 px-4 items-center max-w-lg">
			<a href="#/" aria-label="Home">
				<img src="{base}/letkwet.svg" class="w-8" alt="Letkwet" />
			</a>
			<div class="grow relative">
				<input
					placeholder="သီချင်းအမည်၊ အဆိုတော်အမည် ရှာပါ"
					bind:value={queryInput}
					class="border rounded p-2 w-full"
				/>
				<button
					onclick={clearSearch}
					class="absolute right-0 top-0 text-gray-400 w-10 p-2"
					aria-label="Clear search"
				>
					<Icon src={XMark} />
				</button>
			</div>
			<a
				href="#/file"
				title="Load local chord pro file"
				class="p-2 block text-letkwet-500 w-10"
				aria-label="Load local chord pro file"
			>
				<Icon src={Folder} solid />
			</a>
		</div>
	</nav>
	<Search {query} onselected={clearSearch} />
	<div>
		{#await bootstrapDb}
			<div class="text-letkwet-500 font-bold mt-40 mx-auto w-3/4 text-center">
				သီချင်းများ ရယူနေပါသည်
			</div>
		{:then}
			<Router {routes} />
		{:catch}
			<Router {routes} />
		{/await}
	</div>
</main>
