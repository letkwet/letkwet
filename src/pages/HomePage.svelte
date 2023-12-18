<script lang="ts">
  import { Icon, Microphone } from "svelte-hero-icons";
  import db from "$lib/db";

  let artistAggregate = db.songs
    .orderBy("artists")
    .keys()
    .then((artists) => {
      // let artistsMap: { [artist: string]: number } = {};
      let artistList: { artist: string; songCount: number }[] = [];
      let currentArtist: string | undefined;
      let currentCount = 0;
      for (const artist of artists) {
        if (artist !== currentArtist) {
          if (currentArtist != undefined) {
            artistList.push({
              artist: currentArtist,
              songCount: currentCount,
            });
          }
          currentArtist = artist as string;
          currentCount = 1;
        } else {
          currentCount += 1;
        }
      }
      artistList.sort(({ songCount: a }, { songCount: b }) => b - a);
      return artistList;
    });
  console.log(artistAggregate);
</script>

<div>
  <h3 class="text-lg font-bold my-4 px-10">အဆိုတော်များ</h3>
  {#await artistAggregate then artists}
    <div class="flex flex-col">
      {#each artists as { artist, songCount }}
        <a
          href={`#/artist/${artist}`}
          class="text-letkwet-600 border-t-2 py-4 px-8"
        >
          <Icon src={Microphone} class="w-6 inline mr-2 text-gray-500" />
          {artist}
          <div
            class="inline-block bg-slate-300 text-black font-bold rounded-full p-2 leading-none text-sm ml-2"
          >
            {songCount}
          </div>
        </a>
      {/each}
    </div>
  {/await}
</div>
