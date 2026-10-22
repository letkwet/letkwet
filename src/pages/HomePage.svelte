<script lang="ts">
	import { Icon, Microphone, MusicalNote } from 'svelte-hero-icons';
	import { artistsAggregate, getRecent, type IRecent } from '$lib/db';

	let artistAggregate = $state(artistsAggregate());
	let recent = $state(getRecent(10));
</script>

<div>
	{#await recent then recents}
		{#if recents.length > 0}
			<h3 class="text-lg font-bold my-4 px-10">နောက်ဆုံးဖွင့်ကြည့်ခဲ့သည်များ</h3>
			<div class="flex flex-col">
				{#each recents as recentSong (recentSong.key)}
					<a
						href={`#/song/${recentSong.key}`}
						class="text-letkwet-600 border-t-2 py-4 px-8"
					>
						<Icon src={MusicalNote} class="w-6 inline mr-2 text-gray-500" />
						{recentSong.title}
						<span class="text-sm text-gray-500 block ml-8">{recentSong.artists.join(', ')}</span>
					</a>
				{/each}
			</div>
		{/if}
	{/await}

	<h3 class="text-lg font-bold my-4 px-10">အဆိုတော်များ</h3>
	{#await artistAggregate then artists}
		<div class="flex flex-col">
			{#each artists as { artist, songCount } (artist)}
				<a href={`#/artist/${artist}`} class="text-letkwet-600 border-t-2 py-4 px-8">
					<Icon src={Microphone} class="w-6 inline mr-2 text-gray-500" />
					{artist}
					<div
						class="inline-block bg-slate-300 text-black font-bold rounded-full p-2 leading-none text-sm ml-2"
					>
						{songCount}
					</div>
				</a>
			{/each}
		</div>
	{/await}
</div>
