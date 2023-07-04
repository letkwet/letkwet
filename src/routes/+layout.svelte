<script lang="ts">
  import db from '../lib/db';
  import IDBImport from 'indexeddb-export-import';
  import { base } from '$app/paths';
  import "../app.postcss";


  let bootstrapDb = db._meta.limit(1).first().then(
    async (meta) => {
      if (!meta) {
        // Assume first time loading of song database
        const resp = await fetch(`${base}/songs.json`);
        const lastModifiedStr = resp.headers.get('Last-Modified');
        const last_modified = Date.parse(lastModifiedStr);

        const { songs } = await resp.json();
        return db.updateSongs(songs, last_modified);
      } else {

        const headResp = await fetch(`${base}/songs.json`, { method: 'HEAD' });
        const lastModifiedStr = headResp.headers.get('Last-Modified');
        const last_modified = Date.parse(lastModifiedStr);
        console.log(last_modified);
        console.log(meta);
        if (meta.last_modified < last_modified) {
          const resp = await fetch(`${base}/songs.json`);
          const { songs } = await resp.json();
          return db.updateSongs(songs, last_modified);
        }
      }
    }
  );
  
  let queryStr = "";

</script>

<main class="max-w-lg mx-auto">
  <nav>
    <div class="flex gap-10 p-2 items-center">
      <div>
        <img src="{base}/letkwet.svg" class="w-8" alt="Letkwet" />
      </div>
      <div class="grow">
        <input
          placeholder="Search songs or artists"
          value={queryStr}
          class="w-20 border rounded p-2 w-full"
          accept=".cho,.chopro,.chord"
        />
      </div>
    </div>
  </nav>
  <div>
    {#await bootstrapDb}
      Loading song database please wait.
    {:then _}
    <slot />
    {:catch err}
      Error while loading song db: {err.message}
    {/await}
  </div>
</main>
