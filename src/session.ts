import { cards, backup, connections } from "./stores";

export function onSave(callback: (data: string) => void) {
  return backup.subscribe((data) => {
    if (data.cards.length > 0) callback(JSON.stringify(data));
  });
}

export async function load(data: string) {
  console.log("load", data);
  try {
    const { cards: cardsData, connections: connectionsData } = JSON.parse(data);

    if (cardsData) cards.set(cardsData);
    else cards.set([]);

    if (connectionsData) connections.set(connectionsData);
    else connections.set([]);
  } catch (e) {
    console.log("e", e);
    cards.set([]);
    connections.set([]);
    console.log(e);
  }
}
