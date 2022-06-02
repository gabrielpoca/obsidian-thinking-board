<script lang="ts">
  import type { TFile, TextFileView } from "obsidian";
  import { createEventDispatcher, onMount } from "svelte";

  import type { Card } from "./types";

  import { connectingCardID } from "./stores";
  import Box from "./Box.svelte";
  import EditCard from "./EditCard.svelte";
  import MarkdownRender from "./MarkdownRender.svelte";
  import { updateCard } from "./cardsActions";

  const dispatch = createEventDispatcher();

  export let card: Card;
  export let view: TextFileView;
  export let file: TFile;

  let node: HTMLElement;
  let editing = false;
  let hover = false;

  function updateWidth() {
    card = { ...card, width: node.getBoundingClientRect().width };
  }

  const onPositionUpdated = ({ detail: { x, y } }) => {
    updateCard({ id: card.id, pos: { x, y } });
  };

  function width(currentNode: HTMLElement) {
    node = currentNode;
    updateWidth();
  }

  function onEdit({ detail: newCard }) {
    editing = false;
    updateCard({ id: card.id, ...newCard });
  }

  onMount(() => {
    updateWidth();
  });
</script>

<Box
  useClickOutside={editing}
  on:clickOutside={() => (editing = false)}
  on:dbclick={() => (editing = true)}
  on:drop={() => dispatch("mouseup", card.id)}
  on:mouseout={() => (hover = false)}
  on:mouseover={() => (hover = true)}
  on:positionUpdated={onPositionUpdated}
  action={width}
  x={card.pos.x}
  y={card.pos.y}
  zIndex={editing ? 50 : "auto"}
>
  {#if editing}
    <EditCard {card} on:submit={onEdit} />
  {:else}
    <div class="card">
      <div class="content">
        <MarkdownRender
          on:udpated={() => updateWidth()}
          content={card.content}
          {view}
          {file}
        />
      </div>

      <button
        class:hover={hover || $connectingCardID === card.id}
        class="button"
        aria-label="Connect"
        class:connecting={$connectingCardID === card.id ||
          ($connectingCardID && hover)}
        on:mousedown|self={() => ($connectingCardID = card.id)}
      />
    </div>
  {/if}
</Box>

<style>
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
