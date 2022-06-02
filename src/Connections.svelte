<script lang="ts">
  import {
    connectingCardID,
    currentConnectionID,
    connections,
    cards,
    lastPosition,
  } from "./stores";

  import Connection from "./Connection.svelte";
  import ConnectingLine from "./ConnectingLine.svelte";
  import EditConnection from "./EditConnection.svelte";

  $: selectable = !$connectingCardID;
</script>

{#if $currentConnectionID}
  <EditConnection x={$lastPosition.x} y={$lastPosition.y} />
{/if}

{#if $cards.length}
  <svg class:selectable class="svg" style="pointer-events:none">
    {#each $connections as connection (connection.id)}
      <Connection {connection} />
    {/each}
    {#if $connectingCardID}
      <ConnectingLine id={$connectingCardID} />
    {/if}
  </svg>
{/if}

<style>
  .svg {
    width: 100%;
    height: 100%;
  }

  .svg :global(path) {
    pointer-events: auto;
  }

  .selectable :global(path:hover) {
    stroke-width: 15;
    cursor: pointer;
  }
</style>
