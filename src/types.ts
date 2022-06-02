export interface Card {
  id: string;
  content: string;
  width?: number;
  pos: {
    x: number;
    y: number;
  };
}

export interface Connection {
  id: string;
  start: string;
  end: string;
}
