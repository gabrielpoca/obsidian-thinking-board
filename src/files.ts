//@ts-ignore
import { App } from "obsidian";
import { v4 as uuidv4 } from "uuid";

export const saveFile = async (app: App, fileName: string, content: Buffer) => {
  const ext = fileName.split(".").pop();

  //@ts-ignore
  const path = await app.vault.getAvailablePathForAttachments(uuidv4(), ext);

  const newFile = await app.vault.createBinary(path, content);

  return app.fileManager.generateMarkdownLink(newFile, newFile.path, "", "");
};
