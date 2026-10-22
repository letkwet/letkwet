<script lang="ts">
	import Modal from "./Modal.svelte";
	import Chord from "./Chord.svelte";
	import type { ChordInfo, Instrument } from "./constants";

	interface Props {
		chordsInfo?: ChordInfo[];
		chordDisplay?: string;
		instrument: Instrument;
		open?: boolean;
		onclose?: () => void;
	}

	let {
		chordsInfo = [],
		chordDisplay = "",
		instrument,
		open = false,
		onclose
	}: Props = $props();

	let currentChord = $state(1);

	const chords = $derived(chordsInfo.length);

	$effect(() => {
		if (chordsInfo) {
			currentChord = 1;
		}
	});
</script>

<Modal {open} onclose={() => { currentChord = 1; onclose?.(); }}>
	{#if chords > 0}
		<span class="eng chord-name">
			{chordDisplay}
		</span>
		<div class="slider">
			<div class="slide" style="margin-left:{(currentChord - 1) * -250}px">
				{#each chordsInfo as chord}
					<div>
						<Chord {instrument} {chord} />
					</div>
				{/each}
			</div>
		</div>
		<div class="slider-nav">
			<button
				class="button-outline eng"
				disabled={currentChord <= 1}
				onclick={() => currentChord--}
				type="button"
			>
				&lt;
			</button>
			<strong class="eng">
				{currentChord} / {chords}
			</strong>
			<button
				class="button-outline eng"
				disabled={currentChord === chords}
				onclick={() => currentChord++}
				type="button"
			>
				&gt;
			</button>
		</div>
	{/if}
</Modal>

<style>
	.slider {
		display: flex;
		overflow-x: hidden;
		width: 250px;
	}

	.slide {
		display: flex;
		transition: margin ease 0.7s;
	}

	.slide div {
		width: 250px;
	}
	.slider-nav {
		display: flex;
		justify-content: space-around;
	}
	.slider-nav button {
		padding: 0.4em;
		height: auto;
		font-weight: bold;
		line-height: 0.9em;
		width: 2em;
	}
	.chord-name {
		font-weight: bold;
		font-size: 1em;
	}
</style>
