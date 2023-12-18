<script lang="ts">
  import { Icon, MusicalNote } from "svelte-hero-icons";
    import db from "$lib/db";

    export let params: { artist: string | null} = { artist: null };

    $: songQuery = params.artist !== null 
      ? db.songs.where('artists').equalsIgnoreCase(params.artist).toArray()
      : null;
    
</script>

<div>
  {#if songQuery}
  {#await songQuery then songs}
    {#if songs}
    <h3 class="text-lg font-bold my-4 px-10">
       {params.artist} သီချင်းများ
    </h3>
    <div class="flex flex-col">
      {#each songs as song}
        <a href={`#/song/${song.key}`} class="text-letkwet-600 border-t-2 py-4 px-8">
                  <Icon
                    src={MusicalNote}
                    class="w-6 inline mr-2 text-gray-500"
                  />
                  {song.title}
        </a>
      {/each}
    </div>
    {/if}
  {/await}
  {/if}
</div>
