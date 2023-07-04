<script lang="ts">
  import db from '../lib/db';
  import { base } from '$app/paths';
  import "../app.postcss";
  import Router from 'svelte-spa-router';
  import Search from '../components/Search.svelte';

  import SongPage from '../pages/SongPage.svelte';
  import ArtistPage from '../pages/ArtistPage.svelte';
  import HomePage from '../pages/HomePage.svelte';

  const routes = {
    '/': HomePage,
    '/artist/:artist': ArtistPage,
    '/song/:song': SongPage
  };


  let bootstrapDb = db._meta.limit(1).first().then(
    async (meta) => {
      if (!meta) {
        // Assume first time loading of song database
        const resp = await fetch(`${base}/songs.json`);
        if (resp.status === 200) {
          const lastModifiedStr = resp.headers.get('Last-Modified');
          const last_modified = lastModifiedStr ? Date.parse(lastModifiedStr) : 0;

          const { songs } = await resp.json();
          return db.updateSongs(songs, last_modified);
        }

      } else {

        const headResp = await fetch(`${base}/songs.json`, { method: 'HEAD' });
        if (headResp.status === 200) {

          const lastModifiedStr = headResp.headers.get('Last-Modified');
          const last_modified = lastModifiedStr ? Date.parse(lastModifiedStr) : 0;
          if (meta.last_modified < last_modified) {
            const resp = await fetch(`${base}/songs.json`);
            const { songs } = await resp.json();
            return db.updateSongs(songs, last_modified);
          }

        }
      }
    }
  );
  
  let query = "";

  $:console.log(query);

</script>

<main class="max-w-lg mx-auto">
  <nav>
    <div class="flex gap-10 p-2 items-center">
      <a href="/">
        <img src="{base}/letkwet.svg" class="w-8" alt="Letkwet" />
      </a>
      <div class="grow">
        <input
          placeholder="Search songs or artists"
          bind:value={query}
          class="w-20 border rounded p-2 w-full"
          accept=".cho,.chopro,.chord"
        />
      </div>
    </div>
  </nav>
  <Search {query} on:selected={() => query = ""} />
  <div>
    {#await bootstrapDb}
      Loading song database please wait.
    {:then _}
      <Router {routes} />
    {:catch err}
      Error while loading song db: {err.message}
    {/await}
  </div>
</main>
