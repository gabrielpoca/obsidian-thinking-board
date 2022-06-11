import { debounce, map } from "lodash";
import {
  TextFileView,
  WorkspaceLeaf,
  Plugin,
  TFile,
  TFolder,
  MarkdownView,
  ViewState,
} from "obsidian";
import { around } from "monkey-around";

import type { Assets } from "./types";
import { parseFile } from "./parser";
import App from "./App.svelte";
import { load, onSave } from "./session";

const VIEW_TYPE = "tk";
const EXT = "tk";
const FRONTMATTER_KEY = "thinking-board-plugin";

class BoardView extends TextFileView {
  component: App;
  plugin: BoardPlugin;
  unbuscribeSave: Function;
  appData: string;
  shadowRoot: ShadowRoot;
  file: TFile;

  constructor(leaf: WorkspaceLeaf, plugin: BoardPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return VIEW_TYPE;
  }

  async onLoadFile(file: TFile) {
    this.file = file;

    //@ts-ignore
    this.component.$$set({
      shadowRoot: this.shadowRoot,
      app: this.app,
      file: this.file,
      view: this,
    });

    this.unbuscribeSave = onSave(
      debounce(
        (newBoard: any, assets: Assets) => {
          this.appData = [
            "---",
            `${FRONTMATTER_KEY}: true`,
            "---",
            "",
            "## Assets",
            "",
            map(assets, (value, key) => `- ${key}: ![[${value}]]`).join("\n"),
            "",
            "## Board",
            "",
            "```",
            JSON.stringify(newBoard),
            "```",
          ].join("\n");

          this.requestSave();
        },
        150,
        { trailing: true }
      )
    );

    return super.onLoadFile(file);
  }

  async onUnloadFile(file: TFile) {
    await this.unbuscribeSave();
    this.clear();
    return super.onUnloadFile(file);
  }

  async onOpen() {
    this.shadowRoot = this.contentEl.attachShadow({ mode: "open" });

    this.component = new App({
      target: this.shadowRoot,
      props: {
        shadowRoot: this.shadowRoot,
        app: this.app,
        file: this.file,
        view: this,
      },
    });

    return super.onOpen();
  }

  async onClose() {
    this.component.$destroy();

    if (this.contentEl.shadowRoot) this.contentEl.shadowRoot.innerHTML = "";

    return super.onClose();
  }

  setViewData(data: string, _clear: boolean) {
    this.appData = data;

    const { board, assets } = parseFile(data);

    load(board, assets);
  }

  getViewData() {
    return this.appData;
  }

  clear() {
    return load({ cards: [], connections: [] }, {});
  }
}

export default class BoardPlugin extends Plugin {
  public fileModes: { [file: string]: string } = {};

  async onload() {
    super.onload();

    this.registerView(
      VIEW_TYPE,
      (leaf: WorkspaceLeaf) => new BoardView(leaf, this)
    );

    this.registerCommands();
    this.registerEvents();
    this.registerMonkeyPatches();

    this.switchAfterLoad();
  }

  onunload() {}

  registerEvents() {
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file: TFile) => {
        if (file instanceof TFolder) {
          menu.addItem((item) => {
            item
              .setTitle("New Thinking Board")
              .onClick(() => this.newBoard(file));
          });
        }
      })
    );
  }

  registerCommands() {
    this.addCommand({
      id: "create-new-thinking-board",
      name: "New Thinking Board",
      callback: () => this.newBoard(),
    });
  }

  registerMonkeyPatches() {
    const self = this;

    // Monkey patch WorkspaceLeaf to open boards with BoardView by default
    this.register(
      around(WorkspaceLeaf.prototype, {
        detach(next) {
          return function () {
            const state = this.view?.getState();

            if (state?.file && self.fileModes[this.id || state.file]) {
              delete self.fileModes[this.id || state.file];
            }

            return next.apply(this);
          };
        },

        setViewState(next) {
          return function (state: ViewState, ...rest: any[]) {
            if (
              state.type === "markdown" &&
              state.state?.file &&
              self.fileModes[this.id || state.state.file] !== "markdown"
            ) {
              const cache = self.app.metadataCache.getCache(state.state.file);

              if (cache?.frontmatter && cache.frontmatter[FRONTMATTER_KEY]) {
                const newState = {
                  ...state,
                  type: VIEW_TYPE,
                };

                self.fileModes[state.state.file] = VIEW_TYPE;

                return next.apply(this, [newState, ...rest]);
              }
            }

            return next.apply(this, [state, ...rest]);
          };
        },
      })
    );
  }

  async newBoard(folder?: TFolder) {
    const targetFolder = folder
      ? folder
      : this.app.fileManager.getNewFileParent(
          this.app.workspace.getActiveFile()?.path || ""
        );

    try {
      const board: TFile = await (
        this.app.fileManager as any
      ).createNewMarkdownFile(targetFolder, "Untitled Board.tk");

      await this.app.vault.modify(
        board,
        [
          "---",
          `${FRONTMATTER_KEY}: true`,
          "---",
          "",
          "## Assets",
          "",
          "## Board",
          "",
          "```",
          "{}",
          "```",
        ].join("\n")
      );

      this.fileModes[board.path] = VIEW_TYPE;

      await this.app.workspace.activeLeaf.setViewState({
        type: VIEW_TYPE,
        state: { file: board.path },
      });
    } catch (e) {
      console.error("Error creating board board:", e);
    }
  }

  private switchAfterLoad() {
    const self = this;

    this.app.workspace.onLayoutReady(() => {
      let leaf: WorkspaceLeaf;

      for (leaf of self.app.workspace.getLeavesOfType("markdown")) {
        if (
          leaf.view instanceof MarkdownView &&
          self.isBoardFile(leaf.view.file)
        ) {
          self.fileModes[(leaf as any).id || leaf.view.file.path] = VIEW_TYPE;

          leaf.setViewState({
            type: VIEW_TYPE,
            state: leaf.view.getState(),
            popstate: true,
          } as ViewState);
        }
      }
    });
  }

  public isBoardFile(f: TFile) {
    if (f.extension === EXT) return true;

    const fileCache = f ? this.app.metadataCache.getFileCache(f) : null;

    return !!fileCache?.frontmatter && !!fileCache.frontmatter[FRONTMATTER_KEY];
  }
}
