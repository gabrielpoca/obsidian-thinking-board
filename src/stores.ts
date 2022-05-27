import { writable, derived } from "svelte/store";

export const zoom = writable(1);
export const lastPosition = writable({ x: 0, y: 0 });

export const cards = writable([]);
export const connections = writable([]);

export const backup = derived([cards, connections], ([cards, connections]) => {
  return { cards, connections };
});

export const currentConnectionID = writable();
export const connectingCardID = writable();

export const windowHeight = writable(1000);
export const windowWidth = writable(1000);

export const windowSizes = derived(
  [zoom, cards, windowWidth, windowHeight],
  ([zoom, cards, windowWidth, windowHeight]) => {
    let width = cards.reduce((memo, card) => {
      if (card.pos.x + 800 > memo) {
        return card.pos.x + 800;
      }

      return memo;
    }, 1000);

    let height = cards.reduce((memo, card) => {
      if (card.pos.y + 800 > memo) {
        return card.pos.y + 800;
      }

      return memo;
    }, 1000);

    width = Math.max(width, windowWidth / zoom).toFixed(2);
    height = Math.max(height, windowHeight / zoom).toFixed(2);

    return { width, height };
  }
);
