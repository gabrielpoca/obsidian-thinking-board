<script lang="ts">
  import { MarkdownRenderer, TFile, TextFileView } from "obsidian";
  import { createEventDispatcher } from "svelte";

  import { assets } from "./stores";

  export let file: TFile;
  export let view: TextFileView;
  export let content = "";

  const dispatch = createEventDispatcher();

  const noBreakSpace = /\u00A0/g;
  const imageExt = ["bmp", "png", "jpg", "jpeg", "gif", "svg"];
  const audioExt = ["mp3", "wav", "m4a", "3gp", "flac", "ogg", "oga"];
  // const videoExt = ["mp4", "webm", "ogv"];

  function getNormalizedPath(path: string) {
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

  function markdownContent(container: HTMLElement, content: string) {
    function updateContent(content: string) {
      container.empty();

      let el = document.createElement("div");

      MarkdownRenderer.renderMarkdown(content, el, file.path, view);

      //@ts-ignore
      el = el.find(".internal-embed");

      const src = $assets[el.getAttribute("src")];

      if (!src)
        return console.error("Failed to render embed", el.getAttribute("src"));

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

      container.appendChild(el);
      dispatch("updated");

      // if (node) card = { ...card, width: node.getBoundingClientRect().width };
    }

    updateContent(content);

    return {
      update(newContent: string) {
        updateContent(newContent);
      },
    };
  }
</script>

<div use:markdownContent={content} />
