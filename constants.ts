import { ItemType } from './types';

export const GRID_SIZE = 3; // 3x3 grid is friendlier than 4x4 for starting
export const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
export const GAME_DURATION = 60; // seconds
export const TICK_INTERVAL_MS = 5000; // 5 seconds per item (Slower pace as requested)

export const ITEMS_MAP: Record<ItemType, string> = {
  [ItemType.BOOK]: "📚",
  [ItemType.CUP]: "☕",
  [ItemType.GLASSES]: "👓",
  [ItemType.SHIRT]: "👕",
  [ItemType.APPLE]: "🍎",
  [ItemType.FLOWER]: "🌸",
  [ItemType.SOCK]: "🧦",
  [ItemType.HAT]: "👒"
};

export const ITEMS_ARRAY = Object.values(ItemType);