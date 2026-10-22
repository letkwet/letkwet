<script lang="ts">
	import { instrument_offsets } from "./constants";

	interface Props {
		frets: number[];
		barre: number;
		capo?: boolean;
		lite?: boolean;
		finger: number | null;
	}

	let { frets, barre, capo = false, lite = false, finger }: Props = $props();

	const fretXPosition: { [key: number]: number[] } = {
		4: [10, 20, 30, 40, 50],
		6: [0, 10, 20, 30, 40, 50]
	};

	const fretYPosition = [2.35, 13.9, 26, 38];

	const positions = {
		string: [50, 40, 30, 20, 10, 0],
		fret: [-4, 6.5, 18, 30, 42, 54],
		finger: [-3, 8, 19.5, 31.5, 43.5]
	};

	const getStringPosition = (string: number, strings: number) =>
		positions.string[string + instrument_offsets[strings]];

	const strings = $derived(frets.length);

	const barreFrets = $derived(
		frets.map((f, index) => ({ position: index, value: f })).filter((f) => f.value === barre)
	);

	const string1 = $derived(barreFrets.length > 0 ? barreFrets[0].position : 0);
	const string2 = $derived(
		barreFrets.length > 0 ? barreFrets[barreFrets.length - 1].position : 0
	);
	const width = $derived((string2 - string1) * 10);
	const y = $derived(fretYPosition[barre - 1]);
</script>

<g>
	{#if capo && barreFrets.length > 0}
		<g>
			<g
				transform={`translate(${getStringPosition(strings, strings)}, ${
					positions.fret[barreFrets[0].value]
				})`}
			>
				<path
					d="M 0, 0 m -4, 0 a 4,4 0 1,1 8,0"
					fill="#555"
					fill-opacity={0.2}
					transform="rotate(-90)"
				/>
			</g>
			<rect
				fill="#555"
				x={fretXPosition[strings][0]}
				y={fretYPosition[barre - 1]}
				width={(strings - 1) * 10}
				fill-opacity={0.2}
				height="8.5"
			/>
			<g
				transform={`translate(${getStringPosition(1, strings)}, ${
					positions.fret[barreFrets[0].value]
				})`}
			>
				<path
					d="M 0, 0 m -4, 0 a 4,4 0 1,1 8,0"
					fill="#555"
					fill-opacity={0.2}
					transform="rotate(90)"
				/>
			</g>
		</g>
	{/if}
	{#each barreFrets as fret}
		<circle
			stroke-width="0.25"
			stroke="#444"
			fill="#444"
			cx={getStringPosition(strings - fret.position, strings)}
			cy={positions.fret[fret.value]}
			r="4"
		/>
	{/each}
	<rect fill="#444" x={fretXPosition[strings][string1]} {y} {width} height={8.25} />
	{#if !lite && finger}
		{#each barreFrets as fret}
			<text
				text-anchor="middle"
				fill="white"
				x={getStringPosition(strings - fret.position, strings)}
				y={positions.finger[fret.value] - 0.5}
			>
				{finger}
			</text>
		{/each}
	{/if}
</g>
