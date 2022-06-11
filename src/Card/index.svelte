<script lang="ts">
  import type { TFile, TextFileView } from "obsidian";
  import { createEventDispatcher, onMount } from "svelte";

  import type { Card } from "../types";

  import Render from "./Render.svelte";
  import Box from "../Box.svelte";
  import EditCard from "../EditCard.svelte";
  import { updateCard } from "../cardsActions";

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

  onMount(() => updateWidth());
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
  padding={card.type === "markdown" || editing}
>
  {#if editing}
    <EditCard {card} on:submit={onEdit} />
  {:else}
    <Render
      on:updated={() => updateWidth()}
      id={card.id}
      content={card.content}
      type={card.type}
      {file}
      {hover}
      {view}
    />
  {/if}
</Box>
