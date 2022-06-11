<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import type { Card } from "./types";

  import { removeCard, updateCard } from "./cardsActions";

  import TextArea from "./TextArea.svelte";
  import Button from "./Button.svelte";

  export let card: Card;

  const dispatch = createEventDispatcher();

  let value = card.content;
  let type = card.type;

  const types = ["markdown", "asset"];

  function onSubmit() {
    dispatch("submit", { content: value, type });
  }
</script>

<div style="min-width:var(--card-max-width)">
  <form on:submit|preventDefault={onSubmit}>
    <TextArea bind:value name="content" minRows={3} />
    <div class="actions">
      <Button type="submit">Save</Button>
    </div>
  </form>

  <div class="type">
    {#each types as t}
      <label>
        <input type="radio" name="type" bind:group={type} value={t} />
        {t}
      </label>
    {/each}
  </div>

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

  .type {
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
