<script lang="ts">
  import { cards, zoom } from "./stores";

  export let id: string;

  let card = $cards.find((card) => card.id === id);

  $: startX = card ? card.pos.x + card.width - 20 : 0;
  $: startY = card ? card.pos.y + 15 : 0;

  let movingX: number;
  let movingY: number;

  let x = 0;
  let y = 0;

  function move(_node: SVGPathElement) {
    const handler = (e: MouseEvent) => {
      if (movingX) {
        x += (e.screenX - movingX) / $zoom;
        y += (e.screenY - movingY) / $zoom;
      }

      movingX = e.screenX;
      movingY = e.screenY;
    };

    document.addEventListener("mousemove", handler);

    return {
      destroy() {
        document.removeEventListener("mousemove", handler);
      },
    };
  }
</script>

<path
  use:move
  stroke="var(--color-accent)"
  stroke-width="10"
  stroke-linecap="round"
  d="m {startX} {startY} l {x} {y}"
/>
