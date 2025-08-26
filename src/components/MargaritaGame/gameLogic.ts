
import { TileType } from "./types";

export const checkMatches = (board: TileType[][]): { row: number; col: number }[] => {
  const matches: { row: number; col: number }[] = [];
  const BOARD_SIZE = board.length;

  // Check horizontal matches
  for (let row = 0; row < BOARD_SIZE; row++) {
    let count = 1;
    for (let col = 0; col < BOARD_SIZE - 1; col++) {
      if (board[row][col].isEmpty || board[row][col + 1].isEmpty) {
        count = 1;
        continue;
      }
      
      if (board[row][col].type === board[row][col + 1].type) {
        count++;
      } else {
        if (count >= 3) {
          // Add previous tiles to matches
          for (let i = col - count + 1; i <= col; i++) {
            matches.push({ row, col: i });
          }
        }
        count = 1;
      }
    }
    // Check end of row
    if (count >= 3) {
      for (let i = BOARD_SIZE - count; i < BOARD_SIZE; i++) {
        matches.push({ row, col: i });
      }
    }
  }

  // Check vertical matches
  for (let col = 0; col < BOARD_SIZE; col++) {
    let count = 1;
    for (let row = 0; row < BOARD_SIZE - 1; row++) {
      if (board[row][col].isEmpty || board[row + 1][col].isEmpty) {
        count = 1;
        continue;
      }
      
      if (board[row][col].type === board[row + 1][col].type) {
        count++;
      } else {
        if (count >= 3) {
          // Add previous tiles to matches
          for (let i = row - count + 1; i <= row; i++) {
            matches.push({ row: i, col });
          }
        }
        count = 1;
      }
    }
    // Check end of column
    if (count >= 3) {
      for (let i = BOARD_SIZE - count; i < BOARD_SIZE; i++) {
        matches.push({ row: i, col });
      }
    }
  }

  // Remove duplicates
  const uniqueMatches = matches.filter((match, index, self) =>
    index === self.findIndex(m => m.row === match.row && m.col === match.col)
  );

  return uniqueMatches;
};

export const removeMatches = (board: TileType[][], matches: { row: number; col: number }[]): TileType[][] => {
  const newBoard = board.map(row => [...row]);
  
  matches.forEach(({ row, col }) => {
    newBoard[row][col] = {
      ...newBoard[row][col],
      isEmpty: true,
      isMatched: true
    };
  });
  
  return newBoard;
};

export const dropTiles = (board: TileType[][]): TileType[][] => {
  const newBoard = board.map(row => [...row]);
  const BOARD_SIZE = newBoard.length;
  
  for (let col = 0; col < BOARD_SIZE; col++) {
    // Get all non-empty tiles in this column
    const nonEmptyTiles: TileType[] = [];
    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      if (!newBoard[row][col].isEmpty) {
        nonEmptyTiles.push(newBoard[row][col]);
      }
    }
    
    // Fill column from bottom up
    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      if (nonEmptyTiles.length > 0) {
        const tile = nonEmptyTiles.shift()!;
        newBoard[row][col] = {
          ...tile,
          row,
          col,
          id: `${row}-${col}`
        };
      } else {
        newBoard[row][col] = {
          id: `${row}-${col}`,
          type: 0,
          row,
          col,
          isMatched: false,
          isEmpty: true
        };
      }
    }
  }
  
  return newBoard;
};

export const fillEmptyTiles = (board: TileType[][]): TileType[][] => {
  const newBoard = board.map(row => [...row]);
  
  for (let row = 0; row < newBoard.length; row++) {
    for (let col = 0; col < newBoard[row].length; col++) {
      if (newBoard[row][col].isEmpty) {
        newBoard[row][col] = {
          id: `${row}-${col}`,
          type: Math.floor(Math.random() * 6),
          row,
          col,
          isMatched: false,
          isEmpty: false
        };
      }
    }
  }
  
  return newBoard;
};
