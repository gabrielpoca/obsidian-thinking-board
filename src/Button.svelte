<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let type;

  const dispatch = createEventDispatcher();
</script>

<button on:click={(e) => dispatch("click", e)} {type} class="root">
  <slot />
</button>

<style>
  .root {
    padding: 5px 10px;
    border: 2px solid var(--color-black);
    text-transform: uppercase;
    min-width: 150px;
    min-height: 40px;
    background: white;
    font-weight: bold;
    color: var(--color-black);
    transition: all 0.2s ease-in;
    cursor: pointer;
    pointer-events: auto;
  }

  .root:hover {
    box-shadow: 3px 3px 1px 1px rgba(169, 106, 255, 0.4);
  }
</style>
