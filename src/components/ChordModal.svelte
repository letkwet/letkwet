<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Modal from "./Modal.svelte";

  import Chord from "./Chord.svelte";
  import type { ChordInfo, Instrument } from "./constants";

  const dispatch = createEventDispatcher();

  export let chordsInfo: ChordInfo[],
    chordDisplay = "",
    instrument: Instrument,
    open = false;

  $: chords = chordsInfo.length;
  let currentChord = 1;
</script>

<Modal {open} on:close={() => { currentChord = 1; dispatch("close");}}>
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
        on:click={() => currentChord--}
      >
        &lt;
      </button>
      <strong class="eng">
        {currentChord} / {chords}
      </strong>
      <button
        class="button-outline eng"
        disabled={currentChord === chords}
        on:click={() => currentChord++}
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
