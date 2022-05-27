import { cards, backup, connections } from "./stores";

export function onSave(callback: (data: string) => void) {
  return backup.subscribe((data) => {
    if (data.cards.length > 0) callback(JSON.stringify(data));
  });
}

export async function load(data: string) {
  try {
    const { cards: cardsData, connections: connectionsData } = JSON.parse(data);

    if (cardsData) cards.set(cardsData);
    if (connectionsData) connections.set(connectionsData);
  } catch (e) {
    console.log(e);
  }
}