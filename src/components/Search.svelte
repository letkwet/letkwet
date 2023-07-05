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
    if (query.length > 1) {
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
<div class="relative z-10">
  <div class="shadow border rounded absolute top-0 left-4 right-4 bg-white max-w-lg">
      {#await songQuery then songs}
      <div>
          <h3 class="text-md font-bold my-4 mx-8">
            သီချင်းများ
          </h3>
          {#if songs && songs.length > 0}
            <div class="flex flex-col">
              {#each songs as song}
              <a href={`#/song/${song.key}`} on:click={selected}
                  class="border-t py-4 px-6">
              &#x266b; {song.title} 
              <br />
              (<span class="text-letkwet-600">{song.artists.join(", ")}</span>)
              </a>
              {/each}
            </div>
          {:else}
            <div class="text-gray-400 px-6 py-4">
            "{query}" အမည်ပါ သီချင်းမတွေ့ပါ
            </div>
          {/if}
      </div>
      {/await}
      {#await artistQuery then artists}
      <div>
          <h3 class="text-md font-bold my-4 mx-8">
            အဆိုတော်များ
          </h3>
          {#if artists && artists.length > 0}
            <div class="flex flex-col">
              {#each artists as artist}
              <a href={`#/artist/${artist}`} on:click={selected}
                  class="border-t py-4 px-6 text-letkwet-400 font-bold">
               &#x1F399; {artist} 
              </a>
              {/each}
            </div>
          {:else}
            <div class="text-gray-400 px-6 py-4">
            "{query}" အမည်ပါအဆိုတော် မတွေ့ပါ
            </div>
          {/if}
      </div>
      {/await}

  </div>
</div>
{/if}
