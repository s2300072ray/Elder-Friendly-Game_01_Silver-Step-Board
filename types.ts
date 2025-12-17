export enum GameState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED'
}

export enum ItemType {
  BOOK = 'BOOK',
  CUP = 'CUP',
  GLASSES = 'GLASSES',
  SHIRT = 'SHIRT',
  APPLE = 'APPLE',
  FLOWER = 'FLOWER',
  SOCK = 'SOCK',
  HAT = 'HAT'
}

export interface GridCell {
  id: number;
  isActive: boolean;
  item: ItemType | null;
}

export interface EncouragementResponse {
  message: string;
}
