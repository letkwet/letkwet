<script lang="ts">

  /* import Router from "svelte-spa-router"; */

  /* import Songs from "../Songs.svelte";
  import Artists from "../Artists.svelte"; */
  import Song from "../components/Song.svelte";

  /* const routes = {
    "/": Songs,
    "/Artists": Artists,
  };
 */

  let files: FileList;

  let song: string;

  $: {
    if (files && files.length > 0) {
      const [file] = files;
      if (file.size < 512000) {
        file.text().then((s) => (song = s));
      }
    }
  }
</script>

{#if song}
  <Song {song} />
{:else}
  <div class="h-40 px-4 py-10 text-gray-400">
    Please search by song title or artist.
  </div>
{/if}
