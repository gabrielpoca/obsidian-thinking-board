import { partition } from "lodash";
import { v4 as uuidv4 } from "uuid";

import type { Card, Connection } from "./types";

import { cards, connections } from "./stores";

type AddCard = Omit<Card, "id" | "updatedAt" | "type">;
type AddConnection = Omit<Connection, "id" | "updatedAt" | "type">;

interface HistoryCard extends Card {
  type: "updatedCard" | "newCard" | "deletedCard";
}

interface HistoryConnection extends Connection {
  type: "updatedConnection" | "newConnection" | "deletedConnection";
}

interface EditCard extends Partial<Card> {
  id: string;
}

let history: (HistoryCard | HistoryConnection)[] = [];

let redoHistory: (HistoryCard | HistoryConnection)[] = [];

function dateDiff(date: Date | string | undefined) {
  if (!date) return 0;

  if (typeof date === "string") {
    date = new Date(date);
  }

  const now = new Date().getTime();

  return now - date.getTime();
}

function saveCardToHistory(card: Card, resetRedoHistory = true) {
  if (history.length > 20) history.shift();

  const lastCard = history[history.length - 1];

  if (!lastCard)
    return historyPush({ ...card, type: "updatedCard" }, resetRedoHistory);

  if (lastCard.id !== card.id)
    return historyPush({ ...card, type: "updatedCard" }, resetRedoHistory);

  if (dateDiff(lastCard.updatedAt) > 700)
    return historyPush({ ...card, type: "updatedCard" }, resetRedoHistory);
}

export const undo = () => {
  if (history.length === 0) return;

  const lastItem = history.pop();

  if (lastItem.type === "updatedCard") {
    const prev = updateCard(lastItem, false);
    redoHistory.push({ ...prev, type: "updatedCard" });
  }

  if (lastItem.type === "newCard") {
    const prev = removeCard(lastItem.id, false);
    redoHistory.push({ ...prev, type: "newCard" });
  }

  if (lastItem.type === "deletedCard") {
    const prev = addCard(lastItem, false);
    redoHistory.push({ ...prev, type: "deletedCard" });
  }

  // if (lastItem.type === "updatedConnection") {
  //   const prev = addConnection(lastItem, false);
  //   redoHistory.push({ ...prev, type: "updatedConnection" });
  // }

  if (lastItem.type === "newConnection") {
    const prev = removeConnection(lastItem.id, false);
    redoHistory.push({ ...prev, type: "newConnection" });
  }

  if (lastItem.type === "deletedConnection") {
    const prev = addConnection(lastItem, false);
    redoHistory.push({ ...prev, type: "deletedConnection" });
  }
};

export const redo = () => {
  if (redoHistory.length === 0) return;

  const lastItem = redoHistory.pop();

  if (lastItem.type === "updatedCard") {
    updateCard(lastItem, true, false);
  }

  if (lastItem.type === "newCard") {
    addCard(lastItem, true, false);
  }

  if (lastItem.type === "deletedConnection") {
    removeConnection(lastItem.id, true, false);
  }

  if (lastItem.type === "newConnection") {
    addConnection(lastItem, true, false);
  }
};

function historyPush(
  item: HistoryCard | HistoryConnection,
  resetRedoHistory: Boolean
) {
  history.push(item);
  if (resetRedoHistory) redoHistory = [];
}

export const addCard = (
  { content, pos }: AddCard,
  pushToHistory = true,
  resetRedoHistory = true
): Card => {
  const card = {
    id: uuidv4(),
    content,
    pos,
    updatedAt: new Date(),
    type: "card",
  };

  cards.update((cards) => [...cards, , card]);

  if (pushToHistory)
    historyPush({ ...card, type: "newCard" }, resetRedoHistory);

  return card;
};

export const removeCard = (id: string, pushToHistory = true): Card => {
  let found: Card;

  connections.update((connections) =>
    connections.filter(({ start, end }) => start !== id && end !== id)
  );

  cards.update((cards) =>
    cards.filter((card) => {
      if (card.id === id) {
        found = card;
        if (pushToHistory)
          historyPush({ ...card, type: "deletedCard" }, resetRedoHistory);

        if (history.length > 20) history.shift();
      }

      return card.id !== id;
    })
  );

  return found;
};

export const updateCard = (
  newCard: EditCard,
  pushToHistory = true,
  resetRedoHistory = true
): Card => {
  let found: Card;

  cards.update((cards) =>
    cards.map((card) => {
      if (card.id !== newCard.id) return card;

      found = card;

      return { ...card, ...newCard, updatedAt: new Date() };
    })
  );

  if (pushToHistory) saveCardToHistory(found, resetRedoHistory);

  return found;
};

export const addConnection = (
  newConnection: AddConnection,
  pushToHistory = true,
  resetRedoHistory = true
): Connection => {
  const connection = {
    ...newConnection,
    id: uuidv4(),
    type: "connection",
    updatedAt: new Date(),
  };

  connections.update((connections) => [connection, ...connections]);

  if (pushToHistory)
    historyPush({ ...connection, type: "newConnection" }, resetRedoHistory);

  return connection;
};

export const removeConnection = (
  connectionId: string,
  pushToHistory = true,
  resetRedoHistory = true
): Connection => {
  let connection: Connection;

  connections.update((connections) => {
    const [[found], newConnections] = partition(
      connections,
      ({ id }) => id === connectionId
    );

    connection = found;

    return newConnections;
  });

  if (pushToHistory)
    historyPush({ ...connection, type: "deletedConnection" }, resetRedoHistory);

  return connection;
};
