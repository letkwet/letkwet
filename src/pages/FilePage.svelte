<script lang="ts">
  import Song from "../components/Song.svelte";


  let files: FileList;
  let picker: HTMLElement;
  let song: string;

  $: {
    if (files && files.length > 0) {
      const [file] = files;
      if (file.size < 512000) {
        file.text().then((s) => song = s);
      }
    }
  }
</script>

<div class="flex flex-col gap-4 py-4">
  <div>
    <label for="chofile" class="text-md text-gray-600 font-bold">
      Chord pro (.cho, .chopro, .chord) ဖိုင် ရွေးချယ်ပေးပါ
    </label>
      <br />
      <br />
    <input
      name="chofile"
      class="text-center cursor-pointer text-gray-400 
        file:rounded file:bg-letkwet-200 file:text-letkwet-600
        file:px-4 file:py-2 file:border-0 "
      bind:this={picker}
      type="file"
      bind:files
      accept=".cho,.chopro,.chord"
    />
  </div>
  {#if song}
    <Song {song} />
  {/if}
</div>
