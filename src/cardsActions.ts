import { v4 as uuidv4 } from "uuid";
import { cards, connectingCardID, connections } from "./stores";

export const addCard = ({ content, pos }) => {
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

  cards.update((cards) => cards.filter((card) => card.id !== id));
};

export const updateCard = (id: string, newCard: any) => {
  cards.update((cards) =>
    cards.map((card) => {
      if (card.id !== id) return card;

      return { ...card, ...newCard };
    })
  );
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
