<script lang="ts">
  const offsets: {
    [key: number]: { x: number; y: number; length: number };
  } = {
    4: {
      x: 10,
      y: 10,
      length: 40,
    },
    6: {
      x: 0,
      y: 0,
      length: 50,
    },
  };

  export let tuning: string[],
    strings: number,
    baseFret = 1,
    fretsOnChord: number,
    lite = false;

  /* function getNeckHorizonalLine(pos, strings) {
    return;
  }
 */

  /* function getNeckVerticalLine(pos, strings) {
    return;
  }
 */

  let neckPath =
    Array((fretsOnChord || 0) + 1)
      .fill(null)
      .map(
        (_, pos) =>
          `M ${offsets[strings].x} ${12 * pos} H ${offsets[strings].length}`
      )
      .join(" ") +
    " " +
    Array(strings)
      .fill(null)
      .map((_, pos) => `M ${offsets[strings].y + pos * 10} 0 V 48`)
      .join(" ");
</script>

<g>
  <path
    stroke="#444"
    stroke-width="0.25"
    stroke-linecap="square"
    stroke-linejoin="miter"
    d={neckPath}
  />
  {#if baseFret === 0}
    <path
      stroke="#444"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      d={`M ${offsets[strings].x} 0 H ${offsets[strings].length}`}
    />
  {:else}
    <text class="eng" fill="#444" x="-12" y="8">{baseFret}fr</text>
  {/if}
  {#if !lite}
    <g>
      {#each tuning as note, index}
        <text
          class="eng"
          text-anchor="middle"
          fill="#444"
          x={offsets[strings].x + index * 10}
          y="53"
        >
          {note}
        </text>
      {/each}
    </g>
  {/if}
</g>
