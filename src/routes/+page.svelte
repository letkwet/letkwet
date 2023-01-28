<script lang="ts">
  import { base } from '$app/paths';
  import "../app.postcss";

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

<main class="container mx-auto">
  <nav>
    <div class="flex gap-10 p-2 items-center">
      <div>
        <img src="{base}/letkwet.svg" class="w-8" alt="Letkwet" />
      </div>
      <div>
        <input
          class="w-20"
          type="file"
          bind:files
          accept=".cho,.chopro,.chord"
        />
      </div>
    </div>
  </nav>
  <div>
    {#if song}
      <Song {song} />
    {:else}
      <div class="h-40 px-4 py-10 text-gray-400">
        Please select a chordpro file (.cho, .chopro., .cpro) by clicking browse.
      </div>
    {/if}
  </div>
</main>
