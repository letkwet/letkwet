<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Neck from "./Neck.svelte";
  import Dot from "./Dot.svelte";
  import Barre from "./Barre.svelte";
  import type { ChordInfo, Instrument } from "./constants";

  export let chord: ChordInfo,
    instrument: Instrument,
    lite = false;

  let svg: SVGSVGElement;

  const onlyDots = (chord: ChordInfo) =>
    chord.frets
      .map((f, index) => ({ position: index, value: f }))
      .filter((f) => !chord.barres || chord.barres.indexOf(f.value) === -1);

  const dispatch = createEventDispatcher();

  function handleClick(e: MouseEvent) {
    dispatch("clickPos", {
      x: e.offsetX / svg.clientWidth,
      y: e.offsetY / svg.clientHeight,
    });
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<svg
  bind:this={svg}
  width="100%"
  on:click|capture={handleClick}
  xmlns="http://www.w3.org/2000/svg"
  preserveAspectRatio="xMinYMin meet"
  viewBox="0 5 75 65"
>
  <g transform="translate(13, 13)">
    <Neck
      tuning={instrument.tuning}
      strings={instrument.strings}
      fretsOnChord={instrument.fretsOnChord}
      baseFret={chord.baseFret}
      {lite}
    />
    {#if chord.barres}
      {#each chord.barres as barre, index}
        <Barre
          capo={index === 0 && chord.capo}
          {barre}
          finger={chord.fingers ? chord.fingers[chord.frets.indexOf(barre)] : null}
          frets={chord.frets}
          {lite}
        />
      {/each}
    {/if}
    {#each onlyDots(chord) as fret}
      <Dot
        string={instrument.strings - fret.position}
        fret={fret.value}
        strings={instrument.strings}
        finger={chord.fingers ? chord.fingers[fret.position] : null}
        {lite}
      />
    {/each}
  </g>
</svg>

<style>
  svg {
    font-size: 0.3em;
  }
</style>
