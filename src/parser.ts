import { findIndex, compact, get } from "lodash";
import { fromMarkdown } from "mdast-util-from-markdown";
import type { Content, Code, List } from "mdast";

export const parseFile = (data: string) => {
  const { children } = fromMarkdown(data.split("---")[2]);

  return {
    assets: parseAssets(children),
    board: JSON.parse(parseBoard(children)),
  };
};

const parseBoard = (contents: Content[]) => {
  const boardIndex = findIndex(
    contents,
    //@ts-ignore
    ({ type, depth, children }) =>
      //@ts-ignore
      type === "heading" && depth === 2 && children[0].value === "Board"
  );

  if (contents[boardIndex + 1].type !== "code") throw new Error("Invalid file");

  return (contents[boardIndex + 1] as Code).value;
};

const parseAssets = (contents: Content[]) => {
  const headingIndex = findIndex(
    contents,
    //@ts-ignore
    ({ type, depth, children }) =>
      //@ts-ignore
      type === "heading" && depth === 2 && children[0].value === "Assets"
  );

  if (
    contents[headingIndex + 1].type === "heading" &&
    //@ts-ignore
    contents[headingIndex + 1].children[0].value === "Board"
  )
    return "[]";

  if (contents[headingIndex + 1].type !== "list")
    throw new Error("Invalid file");

  const list = contents[headingIndex + 1] as List;

  const items = compact(
    list.children.map(({ children }) =>
      get(children, "0.children.0.value", null)
    )
  );

  return items.reduce((memo, item) => {
    const [id, value, _] = item.split(": ");

    memo[id] = value.replace(/^!\[\[/, "").replace(/\]\]$/, "");

    return memo;
  }, {});
};
