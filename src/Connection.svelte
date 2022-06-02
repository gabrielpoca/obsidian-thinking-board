<script lang="ts">
  import type { Connection } from "./types";

  import { cards, currentConnectionID, lastPosition } from "./stores";

  export let connection: Connection;

  $: startCard = $cards.find((card) => card.id === connection.start);
  $: endCard = $cards.find((card) => card.id === connection.end);

  $: selected =
    !!$currentConnectionID && $currentConnectionID === connection.id;

  $: startX = startCard.pos.x + startCard.width - 25;
  $: endX = endCard.pos.x + endCard.width - 15 - startX;

  $: startY = startCard.pos.y + 15;
  $: endY = endCard.pos.y - startCard.pos.y + 10;

  function onClick(e: MouseEvent) {
    $lastPosition = { x: e.offsetX + 5, y: e.offsetY };
    $currentConnectionID = connection.id;
  }
</script>

{#if startCard.width && endCard.width}
  <path
    on:click={onClick}
    stroke={selected ? "var(--color-accent)" : "var(--color-black)"}
    style="pointer-events:auto;cursor:pointer"
    stroke-width="10"
    fill="transparent"
    d="m{startX},{startY} q90,40 {endX},{endY}"
  />
{/if}
