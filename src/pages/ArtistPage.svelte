<script lang="ts">
	import { Icon, MusicalNote } from 'svelte-hero-icons';
	import { getSongsByArtist } from '$lib/db';

	interface Props {
		params: { artist: string | null };
	}

	let { params }: Props = $props();

	let songQuery = $derived(
		params.artist !== null ? getSongsByArtist(params.artist) : Promise.resolve(null)
	);
</script>

<div>
	{#await songQuery then songs}
		{#if songs}
			<h3 class="text-lg font-bold my-4 px-10">{params.artist} သီချင်းများ</h3>
			<div class="flex flex-col">
				{#each songs as song (song.key)}
					<a href={`#/song/${song.key}`} class="text-letkwet-600 font-bold border-t-2 py-4 px-8">
						<Icon src={MusicalNote} class="w-6 inline mr-2 text-gray-500" />
						{song.title}
					</a>
				{/each}
			</div>
		{/if}
	{/await}
</div>
