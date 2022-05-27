<script>
  import { createEventDispatcher } from "svelte";

  import { clickOutside } from "./clickOutside";
  import { zoom } from "./stores";

  export let useClickOutside = false;
  export let action = (fn) => fn;
  export let zIndex = "auto";
  export let x = 0;
  export let y = 0;

  const dispatch = createEventDispatcher();

  let hover = false;
  let moving = false;
  let movingX = x;
  let movingY = y;

  function move(node, moving) {
    const handler = (e) => {
      if (e.button !== 1) {
        x += (e.screenX - movingX) / $zoom;
        y += (e.screenY - movingY) / $zoom;

        movingX = e.screenX;
        movingY = e.screenY;
      }
    };

    return {
      update(moving) {
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
  let timer;

  function onClick(e) {
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

  function mousedown(e) {
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
  on:mousedown|self|preventDefault={mousedown}
  on:mouseup={() => dispatch("drop")}
  on:mouseover={mouseover}
  on:mouseout={mouseout}
  on:click={onClick}
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
