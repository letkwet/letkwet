<script lang="ts">
  import { instrument_offsets } from "./constants";


  export let string: number,
    fret = 0,
    finger: number | null,
    strings: number,
    lite = false;

  const positions = {
    string: [50, 40, 30, 20, 10, 0],
    fret: [-4, 6.5, 18, 30, 42, 54],
    finger: [-3, 8, 19.5, 31.5, 43.5]
  };

  const radius = {
    open: 2,
    fret: 4
  };

  $: stringPosition = positions.string[string + instrument_offsets[strings]];
</script>

<style>

</style>

{#if fret === -1}
  <text class="eng" text-anchor="middle" fill="#444" x={stringPosition} y="-2">
    &times;
  </text>
{:else}
  <g>
    <circle
      stroke-width="0.25"
      stroke="#444"
      fill={fret === 0 ? 'transparent' : '#444'}
      cx={stringPosition}
      cy={positions.fret[fret]}
      r={fret === 0 ? radius['open'] : radius['fret']} />
    {#if !lite && fret > 0 && finger && finger > 0}
      <text
        fill="white"
        text-anchor="middle"
        style="font-weight: bold;"
        x={stringPosition}
        y={positions.finger[fret] - 0.5}>
        {finger}
      </text>
      }
    {/if}
  </g>
{/if}
