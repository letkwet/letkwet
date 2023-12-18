<script lang="ts">
  import * as chordsheetjs from "chordsheetjs";
  import {
    Icon,
    MusicalNote,
    QueueList,
    ChevronDoubleDown,
    BarsArrowDown,
    Stop,
  } from "svelte-hero-icons";
  import ChordModal from "./ChordModal.svelte";

  import type { ChordInfo, Instrument } from "../components/constants";

  import { StandardGuitar } from "$lib/chord_generator";

  const { ChordProParser, HtmlDivFormatter } = chordsheetjs;

  export let song: string;

  let hidelyrics = false,
    hidechords = false;

  let chordsInfo: ChordInfo[] = [],
    chordDisplay: string,
    open = false,
    transpose = 0,
    /* article: HTMLElement, */
    cont: HTMLElement,
    scrollY: number,
    scrollSpeed = 0,
    scrollInterval: number;

  $: {
    if (song) {
      transpose = 0;
    }
  }

  const chordParser = new ChordProParser();
  const formatter = new HtmlDivFormatter();

  $: cpro = chordParser.parse(song);
  let title: string, artists: string[] | undefined;
  $: {
    if (cpro) {
      title = cpro.title;
      if (cpro.artist === undefined || Array.isArray(cpro.artist)) {
        artists = cpro.artist;
      } else {
        artists = [cpro.artist];
      }
    }
  }

  const instrument: Instrument = StandardGuitar.instrument;

  $: lyricsView = formatter.format(cpro).replace(/<h1>.+<\/h1>/, "");

  $: {
    if (scrollSpeed > 0) {
      if (scrollInterval) clearInterval(scrollInterval);
      const scrollIncrement = cont.scrollHeight / (420 - scrollSpeed * 60) / 5;
      scrollInterval = setInterval(() => {
        scrollY += scrollIncrement;
        if (scrollY >= cont.scrollHeight) {
          clearInterval(scrollInterval);
        }
      }, 100);
    } else {
      clearInterval(scrollInterval);
    }
  }

  const chordRegex = /(([A-G][\#b]?)([A-Za-z\d\#\/\(\)]{0,9}))/m;

  const chordCache: {
    [key: string]: any[];
  } = {};

  function parseChord(chord: string) {
    const parsed = chordRegex.exec(chord);
    if (parsed) {
      const [_match, _p1, p2, p3] = parsed;
      let key = p2;
      const suffix = p3 || "";
      return [key, suffix];
    }
    return [chord, ""];
  }

  function loadChord(e: MouseEvent) {
    const elem = e.target;
    if (elem instanceof HTMLElement) {
      if (elem?.className.split(" ").indexOf("chord") < 0) return;
      const value = elem.innerText;
      if (!chordCache[value]) {
        const [key, suffix] = parseChord(value);
        const result = StandardGuitar.getChords(key, suffix);

        if (result.length > 0) {
          chordsInfo = result;
          chordCache[value] = result;
          open = true;
        }
      } else {
        chordsInfo = chordCache[value];
        open = true;
      }
    }
  }
</script>

<svelte:window bind:scrollY />
<div class="flex flex-col mt-4" bind:this={cont}>
  <div class="p-2">
    <span class="text-bold">{title}</span>
    {#if artists}
      -
      {#each artists as artist}
        <a href={`#/artist/${artist}`} class="text-letkwet-500">{artist}</a>
        &nbsp;&nbsp;
      {/each}
    {/if}
  </div>
  <div class="flex" style="align-items:stretch;">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <article class="grow" class:hidelyrics class:hidechords>
      <div on:click={loadChord}>
        {@html lyricsView}
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
          on:click={() => (hidechords = !hidechords)}
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
          on:click={() => (hidelyrics = !hidelyrics)}
        >
          <Icon src={QueueList} solid={!hidelyrics} />
        </button>
        <button
          class="w-10 h-10 rounded bg-letkwet-500 text-white font-bold text-xl"
          on:click={() => {
            cpro = cpro.transposeDown();
            transpose--;
          }}
        >
          &#9837;
        </button>
        <button
          class="w-10 h-10 rounded bg-gray-500 text-white font-bold text-xl"
          disabled={transpose == 0}
          on:click={() => {
            cpro = cpro.transpose(transpose * -1);
            transpose = 0;
          }}
        >
          {transpose}
        </button>
        <button
          class="w-10 h-10 rounded bg-letkwet-500 text-white font-bold text-xl"
          on:click={() => {
            cpro = cpro.transposeUp();
            transpose++;
          }}
        >
          &#9839;
        </button>
        {#if scrollSpeed > 0}
          <button
            on:click={() => scrollSpeed++}
            disabled={scrollSpeed >= 4}
            class="w-10 h-10 rounded bg-green-500 text-white p-2"
            title="Speed Up"
          >
            <Icon src={ChevronDoubleDown} solid />
          </button>
          <b class="text-center">x{scrollSpeed}</b>
          <button
            on:click={() => (scrollSpeed = 0)}
            class="w-10 h-10 rounded bg-green-500 text-white p-2"
            title="Speed Up"
          >
            <Icon src={Stop} solid />
          </button>
        {:else}
          <button
            on:click={() => scrollSpeed++}
            class="w-10 h-10 rounded bg-green-500 text-white p-2"
            title="Auto-scroll"
          >
            <Icon src={BarsArrowDown} solid />
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>

<ChordModal
  bind:chordsInfo
  bind:chordDisplay
  {instrument}
  {open}
  on:close={() => (open = false)}
/>

<style>
  :global(.hidelyrics .lyrics) {
    display: none;
  }
  :global(.hidechords .chord) {
    display: none;
  }
</style>
