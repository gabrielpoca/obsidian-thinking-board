<script lang="ts">
  import { throttle } from "lodash";
  import { MarkdownRenderer } from "obsidian";
  import snarkdown from "snarkdown";
  import { createEventDispatcher, onMount } from "svelte";

  import { connectingCardID } from "./stores";
  import Box from "./Box.svelte";
  import EditCard from "./EditCard.svelte";

  const dispatch = createEventDispatcher();

  const noBreakSpace = /\u00A0/g;
  const imageExt = ["bmp", "png", "jpg", "jpeg", "gif", "svg"];
  const audioExt = ["mp3", "wav", "m4a", "3gp", "flac", "ogg", "oga"];
  const videoExt = ["mp4", "webm", "ogv"];

  export let card;
  export let view;
  export let file;

  let node;
  let editing = false;
  let hover = false;

  function width(currentNode) {
    node = currentNode;
    card = { ...card, width: node.getBoundingClientRect().width };
  }

  function getNormalizedPath(path: string): NormalizedPath {
    const stripped = path.replace(noBreakSpace, " ").normalize("NFC");
    const splitOnHash = stripped.split("#");

    if (splitOnHash.length === 1) {
      const splitOnAlias = splitOnHash[0].split("|");

      return {
        root: splitOnAlias[0],
        subpath: "",
        alias: splitOnAlias[1] || "",
      };
    }

    const splitOnAlias = splitOnHash[1].split("|");

    return {
      root: splitOnHash[0],
      subpath: "#" + splitOnAlias[0],
      alias: splitOnAlias[1] || "",
    };
  }

  function markdownContent(container) {
    const el = document.createElement("div");

    MarkdownRenderer.renderMarkdown(card.content, el, file.path, view);

    el.findAll(".internal-embed").map((el) => {
      const src = el.getAttribute("src");

      const normalizedPath = getNormalizedPath(src);
      const target =
        typeof src === "string" &&
        view.app.metadataCache.getFirstLinkpathDest(
          normalizedPath.root,
          view.file.path
        );

      el.empty();

      if (imageExt.contains(target.extension)) {
        el.createEl(
          "img",
          {
            attr: { src: view.app.vault.getResourcePath(target) },
          },
          (img) => {
            if (el.hasAttribute("width")) {
              img.setAttribute("width", el.getAttribute("width"));
            }

            if (el.hasAttribute("height")) {
              img.setAttribute("height", el.getAttribute("height"));
            }

            if (el.hasAttribute("alt")) {
              img.setAttribute("alt", el.getAttribute("alt"));
            }
          }
        );

        el.addClasses(["image-embed", "is-loaded"]);
      }

      if (audioExt.contains(target.extension)) {
        el.createEl("audio", {
          attr: {
            controls: "",
            src: view.app.vault.getResourcePath(target),
            style: "pointer-events:auto",
          },
        });

        el.addClasses(["media-embed", "is-loaded"]);
      }

      /*
      if (videoExt.contains(target.extension)) {
        return handleVideo(el, target, view);
      }

      if (target.extension === "md") {
        return await handleMarkdown(el, target, normalizedPath, view, depth);
      }
      */
    });

    container.appendChild(el);

    if (node) card = { ...card, width: node.getBoundingClientRect().width };
  }

  onMount(() => {
    card = { ...card, width: node.getBoundingClientRect().width };
  });
</script>

<Box
  useClickOutside={editing}
  on:clickOutside={() => (editing = false)}
  on:mouseover={() => (hover = true)}
  on:mouseout={() => (hover = false)}
  action={width}
  bind:x={card.pos.x}
  bind:y={card.pos.y}
  on:drop={() => dispatch("mouseup", card.id)}
  on:dbclick={() => (editing = true)}
  zIndex={editing ? 50 : "auto"}
>
  {#if editing}
    <EditCard bind:card on:done={() => (editing = false)} />
  {:else}
    <div class="card">
      <div class="content">
        <div use:markdownContent />
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
