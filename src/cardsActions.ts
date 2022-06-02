import { partition } from "lodash";
import { v4 as uuidv4 } from "uuid";

import type { Card, Connection } from "./types";

import { cards, connections } from "./stores";

type AddCard = Omit<Card, "id" | "updatedAt" | "type">;
type AddConnection = Omit<Connection, "id" | "updatedAt" | "type">;

interface HistoryCard extends Card {
  type: "card";
}

interface NewHistoryCard extends Card {
  type: "newCard";
}

interface HistoryConnection extends Connection {
  type: "connection";
}

interface NewHistoryConnection extends Connection {
  type: "newConnection";
}

interface EditCard extends Partial<Card> {
  id: string;
}

let history: (
  | HistoryCard
  | HistoryConnection
  | NewHistoryCard
  | NewHistoryConnection
)[] = [];

function dateDiff(date: Date | string | undefined) {
  if (!date) return 0;

  if (typeof date === "string") {
    date = new Date(date);
  }

  const now = new Date().getTime();

  return now - date.getTime();
}

function saveCardToHistory(card: Card) {
  if (history.length > 20) history.shift();

  const lastCard = history[history.length - 1];

  if (!lastCard) return history.push({ ...card, type: "card" });

  if (lastCard.id !== card.id) return history.push({ ...card, type: "card" });

  if (dateDiff(lastCard.updatedAt) > 700)
    return history.push({ ...card, type: "card" });
}

export const undo = () => {
  if (history.length === 0) return;

  const lastItem = history.pop();

  if (lastItem.type === "card") updateCard(lastItem, false);
  if (lastItem.type === "newCard") removeCard(lastItem.id, false);
  if (lastItem.type === "connection") addConnection(lastItem, false);
  if (lastItem.type === "newConnection") removeConnection(lastItem.id, false);
};

export const redo = () => {
  console.log(history);
};

export const addCard = ({ content, pos }: AddCard, pushToHistory = true) => {
  const card = {
    id: uuidv4(),
    content,
    pos,
    updatedAt: new Date(),
    type: "card",
  };

  cards.update((cards) => [...cards, , card]);

  if (pushToHistory) history.push({ ...card, type: "newCard" });
};

export const removeCard = (id: string, pushToHistory = true) => {
  connections.update((connections) =>
    connections.filter(({ start, end }) => start !== id && end !== id)
  );

  cards.update((cards) =>
    cards.filter((card) => {
      if (card.id === id) {
        if (pushToHistory) history.push({ ...card, type: "card" });

        if (history.length > 20) history.shift();
      }

      return card.id !== id;
    })
  );
};

export const updateCard = (newCard: EditCard, pushToHistory = true) => {
  let found = false;

  cards.update((cards) =>
    cards.map((card) => {
      if (card.id !== newCard.id) return card;

      if (pushToHistory) saveCardToHistory(card);

      found = true;

      return { ...card, ...newCard, updatedAt: new Date() };
    })
  );

  return found;
};

export const addConnection = (
  newConnection: AddConnection,
  pushToHistory = true
) => {
  const connection = {
    ...newConnection,
    id: uuidv4(),
    type: "connection",
    updatedAt: new Date(),
  };

  connections.update((connections) => [connection, ...connections]);

  if (pushToHistory) {
    history.push({ ...connection, type: "newConnection" });
  }
};

export const removeConnection = (
  connectionId: string,
  pushToHistory = true
) => {
  connections.update((connections) => {
    const [[found], newConnections] = partition(
      connections,
      ({ id }) => id === connectionId
    );

    if (pushToHistory) history.push({ ...found, type: "connection" });

    return newConnections;
  });
};
