<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import Box from "./Box.svelte";
  import TextArea from "./TextArea.svelte";
  import Button from "./Button.svelte";
  import { currentConnectionID, cards, connections } from "./stores";
  import { removeCard } from "./cardsActions";

  export let card;

  const dispatch = createEventDispatcher();
  let value = card.content;

  function onSubmit() {
    card.content = value;
    dispatch("done");
  }
</script>

<div style="min-width:var(--card-max-width)">
  <form on:submit|preventDefault={onSubmit}>
    <TextArea bind:value name="content" minRows={3} />
    <div class="actions">
      <Button type="submit">Save</Button>
    </div>
  </form>

  <div class="actions">
    <Button
      on:mouseup={(e) => e.stopPropagation()}
      on:click={() => removeCard(card.id)}>Delete</Button
    >
  </div>
</div>

<style>
  form {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .actions {
    margin-top: 20px;
    align-self: flex-end;
    display: flex;
    justify-content: flex-end;
  }
</style>
