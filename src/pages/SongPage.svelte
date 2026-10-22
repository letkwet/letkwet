<script lang="ts">
	import { getSong, recordRecent, type ISong } from '$lib/db';
	import Song from '../components/Song.svelte';

	interface Props {
		params: { song: string | null };
	}

	let { params }: Props = $props();

	let song = $state<ISong | null>(null);
	let notFound = $state(false);

	$effect(() => {
		const key = params.song;
		if (!key) {
			song = null;
			notFound = true;
			return;
		}

		let cancelled = false;
		notFound = false;
		getSong(key).then((s) => {
			if (cancelled) return;
			song = s ?? null;
			notFound = !s;
		});

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (song) {
			recordRecent({ key: song.key, title: song.title, artists: song.artists }).catch(() => {});
		}
	});
</script>

<div>
	{#if song}
		<Song song={song.lyrics} />
	{:else if notFound}
		<div class="text-gray-400 text-center mt-20">သီချင်းမတွေ့ပါ</div>
	{/if}
</div>
