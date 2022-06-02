import { v4 as uuidv4 } from "uuid";

import type { Card, Connection } from "./types";

import { cards, connectingCardID, connections } from "./stores";

type AddCard = Omit<Card, "id">;

interface EditCard extends Partial<Card> {
  id: string;
}

let history = [];

export const undo = () => {
  if (history.length === 0) return;

  const lastCard = history.shift();

  updateCard(lastCard);
};

export const redo = () => {
  console.log(history);
};

export const addCard = ({ content, pos }: AddCard) => {
  cards.update((cards) => [
    ...cards,
    {
      id: uuidv4(),
      content,
      pos,
    },
  ]);
};

export const removeCard = (id: string) => {
  connections.update((connections) =>
    connections.filter(({ start, end }) => start !== id && end !== id)
  );

  cards.update((cards) =>
    cards.filter((card) => {
      if (card.id === id) {
        history.push(card);
        if (history.length > 20) history.pop();
      }

      return card.id !== id;
    })
  );
};

export const updateCard = (newCard: EditCard) => {
  let found = false;

  cards.update((cards) =>
    cards.map((card) => {
      if (card.id !== newCard.id) return card;

      history.push(card);
      if (history.length > 20) history.pop();

      found = true;
      return { ...card, ...newCard };
    })
  );

  return found;
};

export const addConnection = (start, end) => {
  connections.update((connections) => [
    { id: uuidv4(), start, end },
    ...connections,
  ]);
};

export const removeConnection = (connectionId: string) => {
  connections.update((connections) =>
    connections.filter(({ id }) => id !== connectionId)
  );
};
