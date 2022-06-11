export interface Card {
  id: string;
  content: string;
  width?: number;
  pos: {
    x: number;
    y: number;
  };
  updatedAt: Date;
  type: "markdown" | "asset";
}

export interface Connection {
  id: string;
  start: string;
  end: string;
  updatedAt: Date;
}

export type Assets = Record<string, string>;
