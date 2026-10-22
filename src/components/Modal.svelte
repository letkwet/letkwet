<script lang="ts">
	interface Props {
		open?: boolean;
		width?: string;
		onclose?: () => void;
		children?: import('svelte').Snippet;
	}

	let { open = false, width = 'auto', onclose, children }: Props = $props();

	function close() {
		onclose?.();
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') close();
	}}
/>

<div
	class="backdrop"
	role="button"
	tabindex="-1"
	aria-label="Close"
	onclick={close}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') close();
	}}
	style={open ? 'display: flex;' : ''}
>
	<div
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
		class="container"
		style={`width: ${width};`}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<button
			onclick={close}
			class="bg-letkwet-500 rounded-full text-white absolute -top-2 -right-2
        w-10 h-10 text-xl font-bold"
			type="button"
			aria-label="Close"
		>
			&times;
		</button>
		{@render children?.()}
	</div>
</div>

<style>
	.backdrop {
		display: none;
		position: fixed;
		margin: auto;
		z-index: 1;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.2);
		justify-content: center;
		align-items: center;
	}

	.container {
		text-align: center;
		box-shadow: 3px 3px 10px #555;
		position: relative;
		z-index: 5;
		background-color: #fff;
		border-radius: 1em;
		padding: 10px;
	}

</style>
