<script lang="ts">
    import db from "$lib/db";
    import Song from "../components/Song.svelte";

    export let params: { song: string | null} = { song: null };

    console.log(params);

    let songQuery = params.song !== null 
      ? db.songs.get(params.song) : null;
    
</script>

<div>
  {#if songQuery}
  {#await songQuery then song}
    {#if song}
    <Song song={song.lyrics} />
    {/if}
  {/await}
  {/if}
</div>
