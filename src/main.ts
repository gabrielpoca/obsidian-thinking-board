import { debounce } from "lodash";
import { TextFileView, WorkspaceLeaf, Plugin, TFile } from "obsidian";

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
    return "board";
  }

  getDisplayText() {
    return "Board view";
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
      "board",
      (leaf: WorkspaceLeaf) => new BoardView(leaf, this)
    );

    this.registerExtensions(["lol"], "board");
  }

  onunload() {
    console.log("Unloading board plugin...");
  }
}
