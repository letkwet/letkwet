<script lang="ts">
  import chordsheetjs from "chordsheetjs";
  import ChordModal from "./ChordModal.svelte";

  import type { ChordInfo, Instrument } from "../components/constants";

  import { StandardGuitar } from "$lib/chord_generator";

  const { ChordProParser, HtmlDivFormatter } = chordsheetjs;

  export let song: string;

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
    <article class="grow" on:click={loadChord}>
      <div>
        {@html lyricsView}
      </div>
    </article>
    <div class="pr-2">
      <div class="sticky top-2 gap-2 flex flex-col">
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
            class="w-10 h-10 rounded bg-green-500 text-white p-4"
            title="Speed Up"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#fff"
              viewBox="0 0 384 512"
              ><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
                d="M169.4 278.6C175.6 284.9 183.8 288 192 288s16.38-3.125 22.62-9.375l160-160c12.5-12.5 12.5-32.75 0-45.25s-32.75-12.5-45.25 0L192 210.8L54.63 73.38c-12.5-12.5-32.75-12.5-45.25 0s-12.5 32.75 0 45.25L169.4 278.6zM329.4 265.4L192 402.8L54.63 265.4c-12.5-12.5-32.75-12.5-45.25 0s-12.5 32.75 0 45.25l160 160C175.6 476.9 183.8 480 192 480s16.38-3.125 22.62-9.375l160-160c12.5-12.5 12.5-32.75 0-45.25S341.9 252.9 329.4 265.4z"
              /></svg
            >
          </button>
          <b class="text-center">x{scrollSpeed}</b>
          <button
            on:click={() => (scrollSpeed = 0)}
            class="w-10 h-10 rounded bg-green-500 text-white p-3"
            title="Speed Up"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#fff"
              viewBox="0 0 512 512"
              ><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
                d="M256 0C114.6 0 0 114.6 0 256c0 141.4 114.6 256 256 256s256-114.6 256-256C512 114.6 397.4 0 256 0zM352 328c0 13.2-10.8 24-24 24h-144C170.8 352 160 341.2 160 328v-144C160 170.8 170.8 160 184 160h144C341.2 160 352 170.8 352 184V328z"
              /></svg
            >
          </button>
        {:else}
          <button
            on:click={() => scrollSpeed++}
            class="w-10 h-10 rounded bg-green-500 text-white p-3"
            title="Auto-scroll"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#fff"
              viewBox="0 0 576 512"
              ><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
                d="M320 224H416c17.67 0 32-14.33 32-32s-14.33-32-32-32h-95.1c-17.67 0-32 14.33-32 32S302.3 224 320 224zM320 352H480c17.67 0 32-14.33 32-32s-14.33-32-32-32h-159.1c-17.67 0-32 14.33-32 32S302.3 352 320 352zM320 96h32c17.67 0 31.1-14.33 31.1-32s-14.33-32-31.1-32h-32c-17.67 0-32 14.33-32 32S302.3 96 320 96zM544 416h-223.1c-17.67 0-32 14.33-32 32s14.33 32 32 32H544c17.67 0 32-14.33 32-32S561.7 416 544 416zM192.4 330.7L160 366.1V64.03C160 46.33 145.7 32 128 32S96 46.33 96 64.03v302L63.6 330.7c-6.312-6.883-14.94-10.38-23.61-10.38c-7.719 0-15.47 2.781-21.61 8.414c-13.03 11.95-13.9 32.22-1.969 45.27l87.1 96.09c12.12 13.26 35.06 13.26 47.19 0l87.1-96.09c11.94-13.05 11.06-33.31-1.969-45.27C224.6 316.8 204.4 317.7 192.4 330.7z"
              /></svg
            >
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
