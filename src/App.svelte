<script lang="ts">
  import { onDestroy } from "svelte";
  import { v4 as uuidv4 } from "uuid";
  import type { TFile, App, TextFileView } from "obsidian";

  import {
    cards,
    assets,
    connectingCardID,
    zoom,
    currentConnectionID,
    lastPosition,
    windowHeight,
    windowWidth,
    windowSizes,
  } from "./stores";

  import Card from "./Card/index.svelte";
  import NewCard from "./NewCard.svelte";
  import Zoom from "./Zoom.svelte";
  import Connections from "./Connections.svelte";

  import { saveFile } from "./files";
  import { doubleClick } from "./doubleClick";
  import { dragScroll } from "./dragScroll";
  import { addCard, addConnection, undo, redo } from "./cardsActions";

  export let shadowRoot: ShadowRoot;
  export let app: App;
  export let file: TFile;
  export let view: TextFileView;

  let showNewCardForm = false;
  let cursorPos = { x: 0, y: 0 };
  let grabbing = false;

  function onDoubleClick() {
    showNewCardForm = true;
  }

  function onClick({ detail: e }) {
    $currentConnectionID = null;

    if (showNewCardForm) showNewCardForm = false;

    $lastPosition = {
      x: Math.max(0, e.offsetX - 15),
      y: Math.max(0, e.offsetY - 15),
    };
  }

  function newCard({ detail: { content, x, y } }) {
    showNewCardForm = false;

    addCard({
      content,
      pos: { y, x },
      type: "markdown",
    });
  }

  function cardUp({ detail: id }) {
    if ($connectingCardID && $connectingCardID !== id) {
      addConnection({ start: $connectingCardID, end: id });
    }
  }

  function onMouseMove(e: MouseEvent) {
    cursorPos = {
      x: e.offsetX,
      y: e.offsetY,
    };
  }

  async function onPaste(e: ClipboardEvent) {
    const items = e.clipboardData.items;

    for (const index in items) {
      const item = items[index];

      if (item.kind === "file") {
        const file = item.getAsFile();

        const newFile = await saveFile(
          app,
          file.name,
          //@ts-ignore
          await file.arrayBuffer()
        );

        const content = app.fileManager.generateMarkdownLink(
          newFile,
          newFile.path,
          "",
          ""
        );

        $assets = { ...$assets, [newFile.name]: newFile.name };

        addCard({
          content,
          pos: cursorPos,
          type: "asset",
        });
      }
    }
  }

  async function onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();

    const fs = window.require("fs/promises");

    for (const f of e.dataTransfer.files) {
      //@ts-ignore
      const ext = f.path.split(".").pop();

      //@ts-ignore
      const path = await app.vault.getAvailablePathForAttachments(
        uuidv4(),
        ext
      );

      //@ts-ignore
      const buffer = await fs.readFile(f.path);

      const newFile = await saveFile(app, path, buffer);

      const content = app.fileManager.generateMarkdownLink(
        newFile,
        newFile.path,
        "",
        ""
      );

      $assets = { ...$assets, [newFile.name]: newFile.name };

      addCard({
        content,
        pos: cursorPos,
        type: "asset",
      });
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.metaKey && e.key === "z") {
      e.preventDefault();
      (e.shiftKey ? redo : undo)();
    }
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    return false;
  }

  document.addEventListener("paste", onPaste);

  onDestroy(() => {
    document.removeEventListener("paste", onPaste);
  });
</script>

<svelte:window
  on:keydown={onKeydown}
  bind:innerHeight={$windowHeight}
  bind:innerWidth={$windowWidth}
/>

<Zoom />

{#if file}
  <div style="width:{$windowWidth}px;height:{$windowHeight}px">
    <main
      id="canvas"
      use:dragScroll={shadowRoot.host}
      on:dragStart={() => (grabbing = true)}
      on:dragEnd={() => (grabbing = false)}
      on:drop={onDrop}
      on:dragover={onDragOver}
      use:doubleClick
      on:doubleClick={onDoubleClick}
      on:singleClick={onClick}
      on:mouseup={() => ($connectingCardID = null)}
      on:mousemove|self={onMouseMove}
      class:grabbing
      style="transform:scale({$zoom});height:{$windowSizes.height}px;width:{$windowSizes.width}px"
    >
      <div class="backgroundColor" />
      <div
        class="background"
        style="background-size: calc(25px * {2 - $zoom});"
      />

      <Connections />

      {#if showNewCardForm}
        <NewCard x={$lastPosition.x} y={$lastPosition.y} on:submit={newCard} />
      {/if}

      {#each $cards as card (card.id)}
        <Card bind:card on:mouseup={cardUp} {view} {file} />
      {/each}
    </main>
  </div>
{/if}

<style>
  main {
    --color-black: #20004b;
    --color-accent: rgba(169, 106, 255, 1);
    --card-max-width: 500px;
  }

  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(.internal-embed) {
    display: flex;
  }

  main {
    min-width: 100%;
    min-height: 100%;
    width: 1000px;
    height: 1000px;
    position: relative;
    transform-origin: top left;
    color: #333;
  }

  .backgroundColor {
    background: linear-gradient(45deg, #caa3ff 0%, #ffccdd 55%);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -2;
    pointer-events: none;
  }

  .background {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADKSURBVHgB7dWxDYMwEIXhc1iAFgl2YAQySbIJZJIkmzACO1DQZgEgZ4UyCS7uJIr/kywh+Zon7GcRAAAAAABwREGcjOPYZFnW6metK9fVL8vyLMvyIQ5cgkzT1K7r2n3bCyF0RVHcxJh5EA1x1RD3fzPzPJ+rqurF0EmMaYjL3sx25EyZB1FNwkwtxjyCvBJmcjHmEWRImOnFmHkQvci7jRRrWIyZB4ltpBf+Z5i45/GWuD2IWw3HBmvkc2+G+LesaxcAAAAAABzbG4IsQA+BmH+JAAAAAElFTkSuQmCC);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: 25px;
    z-index: -1;
    pointer-events: none;
    transform-origin: top left;
  }

  .grabbing {
    cursor: grabbing;
  }
</style>
