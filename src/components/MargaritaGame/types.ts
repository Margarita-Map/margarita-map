
export interface TileType {
  id: string;
  type: number; // 0-5 for different margarita types
  row: number;
  col: number;
  isMatched: boolean;
  isEmpty: boolean;
}

export interface GameState {
  board: TileType[][];
  score: number;
  moves: number;
  selectedTile: { row: number; col: number } | null;
  isAnimating: boolean;
  gameOver: boolean;
  won: boolean;
}
