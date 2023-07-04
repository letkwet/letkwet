<script lang="ts">
    import db from "$lib/db";

    export let params: { artist: string | null} = { artist: null };

    console.log(params);

    let songQuery = params.artist !== null 
      ? db.songs.where('artists').equalsIgnoreCase(params.artist).toArray()
      : null;
    
</script>

<div>
  {#if songQuery}
  {#await songQuery then songs}
    {#if songs}
    <div class="flex flex-col">
      {#each songs as song}
        <a href={`#/song/${song.key}`} class="border-t-2 py-4">
        {song.title} 
        </a>
      {/each}
    </div>
    {/if}
  {/await}
  {/if}
</div>
