<script lang="ts">
  import { zoom } from "./stores";

  function handleWheel(e) {
    if (e.ctrlKey) {
      $zoom -= e.deltaY * 0.01;
      $zoom = Math.max(0.4, Math.min($zoom, 1)).toFixed(6);
    }
  }
</script>

<svelte:window on:wheel={handleWheel} />
