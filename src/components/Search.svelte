<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { PromiseExtended } from 'dexie';
  import db, { type ISong } from '../lib/db';

  export let query: string;

  const dispatch = createEventDispatcher();

  function selected() {
    dispatch("selected");
  }

  let songQuery: PromiseExtended<ISong[]> | null = null;
  let artistQuery: PromiseExtended<string[]> | null = null;

  $: {
    if (query.length >= 3) {
      songQuery = db.songs.where('title')
        .startsWithIgnoreCase(query)
        .limit(10).toArray();
      artistQuery = db.songs.where('artists')
        .startsWithIgnoreCase(query).toArray()
        .then((songs) => Object.keys(songs.reduce((prev, current) => {
          current.artists.forEach(a => prev[a] = a);
          return prev;
        }, {} as any)));
    } else {
      songQuery = null;
      artistQuery = null;
    } 
  }

</script>

{#if songQuery != null && artistQuery != null}
<div class="shadow-lg rounded absolute top-20 p-6 bg-white max-w-lg">
    {#await songQuery then songs}
    <div>
        <h3 class="text-md font-bold my-4">
          Songs
        </h3>
        {#if songs && songs.length > 0}
          <div class="flex flex-col">
            {#each songs as song}
            <a href={`#/song/${song.key}`} on:click={selected} class="border-t-2 py-4">
            {song.title} 
            <br />
            (<span class="text-letkwet-600">{song.artists.join(", ")}</span>)
            </a>
            {/each}
          </div>
        {:else}
          <span class="text-gray-400">
          No song title starting with "{query}"
          </span>
        {/if}
    </div>
    {/await}
    {#await artistQuery then artists}
    <div>
        <h3 class="text-md font-bold my-4">
          Artists
        </h3>
        {#if artists && artists.length > 0}
          <div class="flex flex-col">
            {#each artists as artist}
            <a href={`#/artist/${artist}`} on:click={selected} class="border-t-2 py-4">
            {artist} 
            </a>
            {/each}
          </div>
        {:else}
          <span class="text-gray-400">
          No artist name starting with "{query}"
          </span>
        {/if}
    </div>
    {/await}

</div>
{/if}
