<script lang="ts">
  import type { TFile, TextFileView } from "obsidian";
  import { createEventDispatcher } from "svelte";

  import { connectingCardID } from "../stores";
  import MarkdownRender from "../MarkdownRender.svelte";
  import AssetRenderer from "../AssetRender.svelte";
  import { updateCard } from "../cardsActions";

  const dispatch = createEventDispatcher();

  export let hover: Boolean;
  export let view: TextFileView;
  export let file: TFile;
  export let type: string;
  export let content: string;
  export let id: string;
  export let todoState: string = "todo";

  let checked = todoState === "done";

  $: {
    if (checked) {
      updateCard({ id, todoState: "done" });
    } else {
      updateCard({ id, todoState: "todo" });
    }
  }

  function updated() {
    dispatch("updated");
  }
</script>

<div class="card">
  <div class="content">
    {#if type === "markdown"}
      <MarkdownRender on:udpated={() => updated()} {content} {view} {file} />
    {:else if type === "todo"}
      <div class="todo">
        <input type="checkbox" bind:checked />
        <MarkdownRender on:udpated={() => updated()} {content} {view} {file} />
      </div>
    {:else}
      <AssetRenderer on:udpated={() => updated()} {content} {view} {file} />
    {/if}
  </div>

  <button
    class:hover={hover || $connectingCardID === id}
    class="button"
    aria-label="Connect"
    class:connecting={$connectingCardID === id || ($connectingCardID && hover)}
    on:mousedown|self={() => ($connectingCardID = id)}
  />
</div>

<style>
  .todo {
    display: flex;
  }

  .todo input {
    pointer-events: auto;
    margin-right: 20px;
  }

  .card {
    min-width: 200px;
    max-width: var(--card-max-width);
    pointer-events: none;
  }

  .card :global(ol),
  .card :global(ul) {
    list-style-position: inside;
  }

  .content {
    user-select: none;
    -webkit-user-select: none;
    line-height: 1.1;
  }

  .content :global(h1:not(:last-child)),
  .content :global(h2:not(:last-child)),
  .content :global(h3:not(:last-child)) {
    margin-bottom: 0.8em;
  }

  .content :global(video) {
    pointer-events: auto;
  }

  .content :global(video),
  .content :global(img) {
    max-width: 100%;
    max-height: 100%;
  }

  .button:not(.hover) {
    opacity: 0;
  }

  .button {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 25px;
    height: 25px;
    border: 0;
    pointer-events: auto;
    background-color: var(--color-black);
    border-radius: 50%;
    transition: opacity 0.1s linear, all 0.2s ease-in;
    cursor: pointer;
  }

  .connecting,
  .button:hover {
    background-color: var(--color-accent);
    transform: scale(1.1);
  }
</style>
