<script lang="ts">
  import { currentConnectionID } from "./stores";

  import { removeConnection } from "./cardsActions";

  import Box from "./Box.svelte";
  import Button from "./Button.svelte";

  export let x = 0;
  export let y = 0;
</script>

<Box {x} {y} zIndex={50}>
  <Button
    on:click={() => {
      removeConnection($currentConnectionID);
      $currentConnectionID = null;
    }}>Delete</Button
  >
</Box>
