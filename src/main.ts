import { debounce } from "lodash";
import { TextFileView, WorkspaceLeaf, Plugin, TFile, TFolder } from "obsidian";

import App from "./App.svelte";
import { load, onSave } from "./session";

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
    return "thinking-board";
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
        (newData) => {
          this.appData = newData;
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

  setViewData(data: string, clear?: boolean) {
    this.appData = data;
    load(data);
  }

  getViewData() {
    return this.appData;
  }

  clear() {
    return load("{}");
  }
}

export default class BoardPlugin extends Plugin {
  async onload() {
    super.onload();

    this.registerView(
      "thinking-board",
      (leaf: WorkspaceLeaf) => new BoardView(leaf, this)
    );

    this.registerExtensions(["tk"], "thinking-board");
    this.registerCommands();
    this.registerEvents();
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

  async newBoard(folder?: TFolder) {
    const targetFolder = folder
      ? folder
      : this.app.fileManager.getNewFileParent(
          this.app.workspace.getActiveFile()?.path || ""
        );

    try {
      const path = window.require("path");

      const targetFile = path.join(
        targetFolder.path,
        "Untitled Thinking Board.tk"
      );

      //@ts-ignore
      await this.app.vault.createBinary(targetFile, "{}");

      await this.app.workspace.activeLeaf.setViewState({
        type: "thinking-board",
        state: { file: targetFile },
      });
    } catch (e) {
      console.error("Error creating board board:", e);
    }
  }
}
