<script lang="ts">
  import { createEventDispatcher } from "svelte";
  export let open = false,
    width = "auto";

  const dispatch = createEventDispatcher();
</script>

<svelte:window
  on:keydown={(e) => {
    if (e.key === "Escape") dispatch("close");
  }}
/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="backdrop"
  on:click={() => dispatch("close")}
  style={open ? "display: flex;" : ""}
>
  <div on:click|stopPropagation class="container" style={`width: ${width};`}>
    <button on:click={() => dispatch("close")}
      class="bg-letkwet-500 rounded-full text-white absolute -top-2 -right-2
        w-10 h-10 text-xl font-bold"
      >&times;</button
    >
    <slot />
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

  .close-button {
    padding: 0.6em;
    position: absolute;
    top: -0.6em;
    right: -0.6em;
    line-height: 12px;
    border-radius: 50%;
    font-weight: bold;
    font-size: 1.2em;
  }
</style>
