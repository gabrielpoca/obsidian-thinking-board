import { cards, backup, assets, connections } from "./stores";
import type { Card, Connection, Assets } from "./types";
import { resetHistory } from "./cardsActions";

export function onSave(
  callback: (
    newBoard: { cards: Card[]; connections: Connection[] },
    assets: Assets
  ) => void
) {
  return backup.subscribe(({ cards, connections, assets }) => {
    if (cards.length > 0) callback({ cards, connections }, assets);
  });
}

export async function load(
  board: { cards: any; connections: any },
  newAssets: any
) {
  try {
    assets.set(newAssets);

    const { cards: cardsData, connections: connectionsData } = board;

    if (cardsData) cards.set(cardsData.filter((c: any) => c));
    else cards.set([]);

    if (connectionsData) connections.set(connectionsData);
    else connections.set([]);
  } catch (e) {
    cards.set([]);
    connections.set([]);
    console.log(e);
  }

  resetHistory();
}
