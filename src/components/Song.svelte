<script lang="ts">
	import {
		Icon,
		MusicalNote,
		QueueList,
		ChevronDoubleDown,
		BarsArrowDown,
		Stop
	} from 'svelte-hero-icons';
	import ChordModal from './ChordModal.svelte';
	import { StandardGuitar } from '$lib/chord_generator';
	import {
		parseChordPro,
		transposeSong,
		transposeDefines,
		definitionToChordInfo,
		type ParsedSong,
		type DefineMap
	} from '$lib/chordpro';
	import type { ChordInfo } from './constants';

	interface Props {
		song: string;
	}

	let { song }: Props = $props();

	let parsed = $derived(parseChordPro(song));
	let transpose = $state(0);
	let hidelyrics = $state(false);
	let hidechords = $state(false);

	let songView = $derived(transposeSong(parsed.song, transpose));
	let activeDefines = $derived(transposeDefines(parsed.defines, transpose));

	$effect(() => {
		if (song) transpose = 0;
	});

	let chordsInfo: ChordInfo[] = $state([]);
	let chordDisplay = $state('');
	let open = $state(false);

	let cont: HTMLElement;
	let scrollY: number = $state(0);
	let scrollSpeed = $state(0);

	$effect(() => {
		if (scrollSpeed > 0 && cont) {
			const scrollIncrement = cont.scrollHeight / (420 - scrollSpeed * 60) / 5;
			const interval = setInterval(() => {
				scrollY += scrollIncrement;
				if (scrollY >= cont.scrollHeight) {
					clearInterval(interval);
				}
			}, 100);
			return () => clearInterval(interval);
		}
	});

	const instrument = StandardGuitar.instrument;
	const chordCache = new Map<string, ChordInfo[]>();
	const chordRegex = /(([A-G][#b]?)([A-Za-z\d#\/\(\)]{0,9}))/;

	function parseChordName(chord: string) {
		const parsed = chordRegex.exec(chord);
		if (parsed) {
			const [, , p2, p3] = parsed;
			return [p2, p3 || ''] as [string, string];
		}
		return [chord, ''] as [string, string];
	}

	function loadChord(chord: string) {
		if (/^N\.?C\.?$/i.test(chord)) return;

		const def = activeDefines.get(chord) ?? activeDefines.get(chord.toLowerCase());
		if (def) {
			chordDisplay = chord;
			const info = definitionToChordInfo(def);
			chordsInfo = info ? [info] : [];
			open = true;
			return;
		}

		const cached = chordCache.get(chord);
		if (cached) {
			if (cached.length > 0) {
				chordsInfo = cached;
				chordDisplay = chord;
				open = true;
			}
			return;
		}

		const [key, suffix] = parseChordName(chord);
		const result = StandardGuitar.getChords(key, suffix);
		chordCache.set(chord, result);
		if (result.length > 0) {
			chordsInfo = result;
			chordDisplay = chord;
			open = true;
		}
	}
	function isChordAvailable(chord: string): boolean {
		if (/^N\.?C\.?$/i.test(chord)) return false;

		const def = activeDefines.get(chord) ?? activeDefines.get(chord.toLowerCase());
		if (def?.info) return true;
		if (def?.noDiagram) return false;

		const cached = chordCache.get(chord);
		if (cached !== undefined) return cached.length > 0;

		const [key, suffix] = parseChordName(chord);
		const result = StandardGuitar.getChords(key, suffix);
		chordCache.set(chord, result);
		return result.length > 0;
	}

</script>

<svelte:window bind:scrollY />

<div class="flex flex-col mt-4" bind:this={cont}>
	<div class="p-2">
		<span class="font-bold">{parsed.song.title}</span>
		{#if parsed.song.artists.length > 0}
			-
			{#each parsed.song.artists as artist}
				<a href={`#/artist/${artist}`} class="text-letkwet-500">{artist}</a>
				&nbsp;&nbsp;
			{/each}
		{/if}
	</div>
	<div class="flex" style="align-items:stretch;">
		<article class="grow" class:hidelyrics class:hidechords>
			<div class="chord-sheet md:columns-2 xl:columns-3 md:gap-8 lg:gap-10">
				{#each songView.sections as section}
					<div class="paragraph {section.type} {section.label ? 'labeled' : ''} mb-4">
						{#if section.label}
							<div class="paragraph-label font-bold text-letkwet-600 mb-1">{section.label}</div>
						{/if}
						{#each section.lines as line}
							<div class="row flex flex-row flex-wrap">
								{#each line as col}
									<div class="column mr-1 flex flex-col break-inside-avoid">
												{#if col.chord}
													<span
														class="chord cursor-pointer font-bold inline {isChordAvailable(col.chord ?? '') ? 'text-letkwet-500' : 'text-gray-400'}"
														onclick={() => loadChord(col.chord ?? '')}
														onkeydown={(e) => {
															if (e.key === 'Enter' || e.key === ' ') loadChord(col.chord ?? '');
														}}
														role="button"
														aria-label={`Chord ${col.chord}`}
														tabindex="0"
													>
														{col.chord}
													</span>
												{:else}
													<span class="chord" aria-hidden="true"></span>
												{/if}
													<span class="lyrics inline">{col.lyric}</span>
									</div>
								{/each}
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</article>
		<div class="pr-2">
			<div class="sticky top-2 gap-2 flex flex-col">
				<button
					class:bg-letkwet-500={!hidechords}
					class:text-white={!hidechords}
					class:border-2={hidechords}
					class:border-letkwet-500={hidechords}
					class:text-letkwet-500={hidechords}
					class="w-10 h-10 rounded p-2"
					onclick={() => (hidechords = !hidechords)}
					type="button"
					aria-label={hidechords ? 'Show chords' : 'Hide chords'}
				>
					<Icon src={MusicalNote} solid={!hidechords} />
				</button>
				<button
					class:bg-letkwet-500={!hidelyrics}
					class:text-white={!hidelyrics}
					class:border-2={hidelyrics}
					class:border-letkwet-500={hidelyrics}
					class:text-letkwet-500={hidelyrics}
					class="w-10 h-10 rounded p-2 mb-6"
					onclick={() => (hidelyrics = !hidelyrics)}
					type="button"
					aria-label={hidelyrics ? 'Show lyrics' : 'Hide lyrics'}
				>
					<Icon src={QueueList} solid={!hidelyrics} />
				</button>
				<button
					class="w-10 h-10 rounded bg-letkwet-500 text-white font-bold text-xl"
					onclick={() => {
						transpose--;
					}}
					type="button"
					aria-label="Transpose down"
				>
					&#9837;
				</button>
				<button
					class="w-10 h-10 rounded bg-gray-500 text-white font-bold text-xl"
					disabled={transpose == 0}
					onclick={() => {
						transpose = 0;
					}}
					type="button"
					aria-label="Reset transpose"
				>
					{transpose}
				</button>
				<button
					class="w-10 h-10 rounded bg-letkwet-500 text-white font-bold text-xl"
					onclick={() => {
						transpose++;
					}}
					type="button"
					aria-label="Transpose up"
				>
					&#9839;
				</button>
				{#if scrollSpeed > 0}
					<button
						onclick={() => scrollSpeed++}
						disabled={scrollSpeed >= 4}
						class="w-10 h-10 rounded bg-green-500 text-white p-2"
						title="Speed Up"
						type="button"
						aria-label="Speed up auto-scroll"
					>
						<Icon src={ChevronDoubleDown} solid />
					</button>
					<b class="text-center">x{scrollSpeed}</b>
					<button
						onclick={() => (scrollSpeed = 0)}
						class="w-10 h-10 rounded bg-green-500 text-white p-2"
						title="Stop auto-scroll"
						type="button"
						aria-label="Stop auto-scroll"
					>
						<Icon src={Stop} solid />
					</button>
				{:else}
					<button
						onclick={() => scrollSpeed++}
						class="w-10 h-10 rounded bg-green-500 text-white p-2"
						title="Auto-scroll"
						type="button"
						aria-label="Start auto-scroll"
					>
						<Icon src={BarsArrowDown} solid />
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>

<ChordModal
	{chordsInfo}
	{chordDisplay}
	{instrument}
	{open}
	onclose={() => (open = false)}
/>

<style>
	:global(.hidelyrics .lyrics) {
		display: none;
	}
	:global(.hidechords .chord) {
		display: none;
	}
</style>
