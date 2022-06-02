<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { clickOutside } from "./clickOutside";
  import { zoom } from "./stores";

  export let useClickOutside = false;
  export let action: (node: HTMLElement) => any = (fn) => fn;
  export let zIndex: string | number = "auto";
  export let x = 0;
  export let y = 0;

  const dispatch = createEventDispatcher();

  let hover = false;
  let moving = false;
  let movingX = x;
  let movingY = y;

  function move(_node: HTMLElement, _moving: Boolean) {
    const handler = (e: MouseEvent) => {
      if (e.button !== 1) {
        x += (e.screenX - movingX) / $zoom;
        y += (e.screenY - movingY) / $zoom;

        dispatch("positionUpdated", { x, y });

        movingX = e.screenX;
        movingY = e.screenY;
      }
    };

    return {
      update(moving: Boolean) {
        if (moving) {
          document.addEventListener("mousemove", handler);
        } else {
          document.removeEventListener("mousemove", handler);
        }
      },
      destroy() {
        document.removeEventListener("mousemove", handler);
      },
    };
  }

  let clicks = 0;
  let timer: ReturnType<typeof setTimeout>;

  function onClick(e: MouseEvent) {
    e.stopPropagation();

    clicks += 1;
    clearTimeout(timer);
    timer = setTimeout(() => (clicks = 0), 200);

    if (clicks === 2) {
      dispatch("dbclick");
      clearTimeout(timer);
      clicks = 0;
    }
  }

  function mousedown(e: MouseEvent) {
    if (e.button === 1) return;
    movingX = e.screenX;
    movingY = e.screenY;

    clearTimeout(timer);
    timer = setTimeout(() => (moving = true), 100);
  }

  function mouseover() {
    hover = true;
    dispatch("mouseover");
  }

  function mouseout() {
    hover = false;
    dispatch("mouseout");
  }
</script>

<svelte:window on:mouseup={() => (moving = false)} />

<div
  use:action
  use:clickOutside={useClickOutside}
  on:clickOutside={() => dispatch("clickOutside")}
  on:blur={() => dispatch("drop")}
  on:click={onClick}
  on:focus={mouseover}
  on:mousedown|self|preventDefault={mousedown}
  on:mouseout={mouseout}
  on:mouseover={mouseover}
  on:mouseup={() => dispatch("drop")}
  use:move={moving}
  class:hover
  class:moving
  class="root"
  style="z-index:{zIndex};top:{y}px;left:{x}px"
>
  <slot />
</div>

<style>
  .root {
    cursor: pointer;
    position: absolute;
    border: 4px solid #20004b;
    background: white;
    overflow: hidden;
    padding: 20px;
    transition: box-shadow 0.1s ease-out, transform 0.1s ease-out;
  }

  .hover {
    box-shadow: 3px 3px 1px 1px rgba(169, 106, 255, 0.4);
    transform: translate(-2px, -2px);
  }

  .moving {
    box-shadow: 6px 6px 2px 1px rgba(169, 106, 255, 0.6);
    z-index: 99;
  }
</style>
