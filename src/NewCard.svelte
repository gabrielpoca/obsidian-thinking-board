<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import Box from "./Box.svelte";
  import Button from "./Button.svelte";
  import TextArea from "./TextArea.svelte";

  const dispatch = createEventDispatcher();

  export let x = 0;
  export let y = 0;

  let value;
</script>

<Box bind:x bind:y zIndex={50}>
  <form
    on:submit|preventDefault={() =>
      dispatch("submit", { content: value, y, x })}
  >
    <div class="form">
      <TextArea bind:value name="content" minRows={3} />
      <Button type="submit">Add</Button>
    </div>
  </form>
</Box>

<style>
  .form {
    display: flex;
    flex-direction: column;
    padding: 20px 20px;
    width: 500px;
  }

  .form :global(button[type="submit"]) {
    margin-top: 20px;
    align-self: flex-end;
  }
</style>
