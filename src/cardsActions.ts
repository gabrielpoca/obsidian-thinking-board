import { partition } from "lodash";
import { v4 as uuidv4 } from "uuid";

import type { Card, Connection } from "./types";

import { cards, connections } from "./stores";

type AddCard = Omit<Card, "id" | "updatedAt">;
type AddConnection = Omit<Connection, "id" | "updatedAt" | "type">;

interface HistoryCard extends Card {
  action: "updatedCard" | "newCard" | "deletedCard";
}

interface HistoryConnection extends Connection {
  action: "updatedConnection" | "newConnection" | "deletedConnection";
}

interface EditCard extends Partial<Card> {
  id: string;
}

interface Opts {
  resetRedo: Boolean;
  history: Boolean;
}

const defaultOpts: Opts = {
  history: true,
  resetRedo: true,
};

let history: (HistoryCard | HistoryConnection)[] = [];

let redoHistory: (HistoryCard | HistoryConnection)[] = [];

export function resetHistory() {
  history = [];
  redoHistory = [];
}

function dateDiff(date: Date | string | undefined) {
  if (!date) return 0;

  if (typeof date === "string") {
    date = new Date(date);
  }

  const now = new Date().getTime();

  return now - date.getTime();
}

function saveCardToHistory(card: Card, opts = defaultOpts) {
  if (history.length > 20) history.shift();

  const lastCard = history[history.length - 1];

  if (!lastCard)
    return historyPush(
      { ...card, updatedAt: new Date(), action: "updatedCard" },
      opts
    );

  if (lastCard.id !== card.id)
    return historyPush({ ...card, action: "updatedCard" }, opts);

  if (dateDiff(lastCard.updatedAt) > 1500) {
    return historyPush({ ...card, action: "updatedCard" }, opts);
  }
}

const undoOpts = {
  history: false,
  resetRedo: true,
};

export const undo = () => {
  if (history.length === 0) return;

  const lastItem = history.pop();

  if (lastItem.action === "updatedCard") {
    const prev = updateCard(lastItem, undoOpts);
    redoHistory.push({ ...prev, action: "updatedCard" });
  }

  if (lastItem.action === "newCard") {
    const prev = removeCard(lastItem.id, undoOpts);
    redoHistory.push({ ...prev, action: "newCard" });
  }

  if (lastItem.action === "deletedCard") {
    const prev = addCard(lastItem, undoOpts);
    redoHistory.push({ ...prev, action: "deletedCard" });
  }

  // if (lastItem.action === "updatedConnection") {
  //   const prev = addConnection(lastItem, false);
  //   redoHistory.push({ ...prev, action: "updatedConnection" });
  // }

  if (lastItem.action === "newConnection") {
    const prev = removeConnection(lastItem.id, undoOpts);
    redoHistory.push({ ...prev, action: "newConnection" });
  }

  if (lastItem.action === "deletedConnection") {
    const prev = addConnection(lastItem, undoOpts);
    redoHistory.push({ ...prev, action: "deletedConnection" });
  }
};

const redoOpts = {
  history: true,
  resetRedo: false,
};

export const redo = () => {
  if (redoHistory.length === 0) return;

  const lastItem = redoHistory.pop();

  if (lastItem.action === "updatedCard") {
    updateCard(lastItem, redoOpts);
  }

  if (lastItem.action === "newCard") {
    addCard(lastItem, redoOpts);
  }

  if (lastItem.action === "deletedConnection") {
    removeConnection(lastItem.id, redoOpts);
  }

  if (lastItem.action === "newConnection") {
    addConnection(lastItem, redoOpts);
  }
};

function historyPush(
  item: HistoryCard | HistoryConnection,
  opts = defaultOpts
) {
  history.push(item);

  if (opts.resetRedo) redoHistory = [];
}

export const addCard = (
  { content, pos, type }: AddCard,
  opts = defaultOpts
): Card => {
  const card = {
    content,
    id: uuidv4(),
    pos,
    type,
    updatedAt: new Date(),
  };

  cards.update((cards) => [...cards, card]);

  if (opts.history) historyPush({ ...card, action: "newCard" }, opts);

  return card;
};

export const removeCard = (id: string, opts = defaultOpts): Card => {
  let found: Card;

  connections.update((connections) =>
    connections.filter(({ start, end }) => start !== id && end !== id)
  );

  cards.update((cards) =>
    cards.filter((card) => {
      if (card.id === id) {
        found = card;
        if (opts.history) historyPush({ ...card, action: "deletedCard" }, opts);

        if (history.length > 20) history.shift();
      }

      return card.id !== id;
    })
  );

  return found;
};

export const updateCard = (newCard: EditCard, opts = defaultOpts): Card => {
  let found: Card;

  cards.update((cards) =>
    cards.map((card) => {
      if (card.id !== newCard.id) return card;

      found = card;

      return { ...card, ...newCard, updatedAt: new Date() };
    })
  );

  if (opts.history) saveCardToHistory(found, opts);

  return found;
};

export const addConnection = (
  newConnection: AddConnection,
  opts = defaultOpts
): Connection => {
  const connection = {
    ...newConnection,
    id: uuidv4(),
    type: "connection",
    updatedAt: new Date(),
  };

  connections.update((connections) => [connection, ...connections]);

  if (opts.history)
    historyPush({ ...connection, action: "newConnection" }, opts);

  return connection;
};

export const removeConnection = (
  connectionId: string,
  opts = defaultOpts
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

  if (opts.history)
    historyPush({ ...connection, action: "deletedConnection" }, opts);

  return connection;
};
