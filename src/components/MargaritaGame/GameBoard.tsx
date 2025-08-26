
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, RotateCcw, Users, Star } from "lucide-react";
import GameTile from "./GameTile";
import { GameState, TileType } from "./types";
import { checkMatches, removeMatches, dropTiles, fillEmptyTiles } from "./gameLogic";
import { toast } from "sonner";

const BOARD_SIZE = 8;
const MOVE_GOAL = 30;
const SCORE_GOAL = 5000;

const MargaritaGameBoard = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    score: 0,
    moves: MOVE_GOAL,
    selectedTile: null,
    isAnimating: false,
    gameOver: false,
    won: false
  });

  const initializeBoard = useCallback(() => {
    const newBoard: TileType[][] = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      newBoard[row] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        // Create random margarita types (6 different types)
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
    return newBoard;
  }, []);

  const resetGame = () => {
    setGameState({
      board: initializeBoard(),
      score: 0,
      moves: MOVE_GOAL,
      selectedTile: null,
      isAnimating: false,
      gameOver: false,
      won: false
    });
  };

  useEffect(() => {
    resetGame();
  }, [initializeBoard]);

  const handleTileClick = (row: number, col: number) => {
    if (gameState.isAnimating || gameState.gameOver) return;

    const clickedTile = gameState.board[row][col];
    if (clickedTile.isEmpty) return;

    if (!gameState.selectedTile) {
      // First tile selection
      setGameState(prev => ({
        ...prev,
        selectedTile: { row, col }
      }));
    } else {
      // Second tile selection - check if it's adjacent
      const { row: selectedRow, col: selectedCol } = gameState.selectedTile;
      const isAdjacent = 
        (Math.abs(row - selectedRow) === 1 && col === selectedCol) ||
        (Math.abs(col - selectedCol) === 1 && row === selectedRow);

      if (isAdjacent && (row !== selectedRow || col !== selectedCol)) {
        // Swap tiles and check for matches
        swapTiles(selectedRow, selectedCol, row, col);
      }

      // Deselect tile
      setGameState(prev => ({
        ...prev,
        selectedTile: null
      }));
    }
  };

  const swapTiles = (row1: number, col1: number, row2: number, col2: number) => {
    const newBoard = [...gameState.board];
    
    // Swap the tile types
    const temp = newBoard[row1][col1].type;
    newBoard[row1][col1] = { ...newBoard[row1][col1], type: newBoard[row2][col2].type };
    newBoard[row2][col2] = { ...newBoard[row2][col2], type: temp };

    // Check for matches
    const matches = checkMatches(newBoard);
    
    if (matches.length > 0) {
      // Valid move - process matches
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        moves: prev.moves - 1,
        isAnimating: true
      }));
      
      processMatches(newBoard, matches);
    } else {
      // Invalid move - swap back
      const tempType = newBoard[row1][col1].type;
      newBoard[row1][col1] = { ...newBoard[row1][col1], type: newBoard[row2][col2].type };
      newBoard[row2][col2] = { ...newBoard[row2][col2], type: tempType };
      
      toast("No matches found! Try a different move.");
    }
  };

  const processMatches = (board: TileType[][], matches: { row: number, col: number }[]) => {
    setTimeout(() => {
      let newBoard = removeMatches(board, matches);
      let newScore = gameState.score + (matches.length * 100);
      
      // Add bonus for larger matches
      if (matches.length >= 5) {
        newScore += 500;
        toast("🎉 Amazing combo! +500 bonus!");
      } else if (matches.length >= 4) {
        newScore += 200;
        toast("🌟 Great match! +200 bonus!");
      }

      newBoard = dropTiles(newBoard);
      
      setTimeout(() => {
        newBoard = fillEmptyTiles(newBoard);
        
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          score: newScore,
          isAnimating: false
        }));

        // Check for additional matches after dropping
        const additionalMatches = checkMatches(newBoard);
        if (additionalMatches.length > 0) {
          toast("🔥 Chain reaction!");
          processMatches(newBoard, additionalMatches);
        }
      }, 300);
    }, 500);
  };

  // Check win/lose conditions
  useEffect(() => {
    if (gameState.moves <= 0) {
      if (gameState.score >= SCORE_GOAL) {
        setGameState(prev => ({ ...prev, won: true, gameOver: true }));
        toast("🏆 Congratulations! You collected enough margaritas!");
      } else {
        setGameState(prev => ({ ...prev, gameOver: true }));
        toast("😔 Game Over! Try again to collect more margaritas!");
      }
    }
  }, [gameState.moves, gameState.score]);

  const shareScore = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Margarita Crush Challenge!',
        text: `I just scored ${gameState.score} points in Margarita Crush! Can you beat my score? 🍹`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(
        `I just scored ${gameState.score} points in Margarita Crush! Can you beat my score? 🍹 ${window.location.href}`
      );
      toast("Score shared to clipboard!");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-950 dark:to-green-950 border-lime-200 dark:border-lime-800">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl text-lime-700 dark:text-lime-300">
          🍹 Margarita Crush 🍹
        </CardTitle>
        
        <div className="flex justify-between items-center mt-4">
          <Badge variant="secondary" className="bg-lime-100 text-lime-800 dark:bg-lime-800 dark:text-lime-100">
            <Star className="w-4 h-4 mr-1" />
            Score: {gameState.score}
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
            Moves: {gameState.moves}
          </Badge>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
            Goal: {SCORE_GOAL}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-8 gap-1 bg-white dark:bg-gray-900 p-2 rounded-lg border-2 border-lime-200 dark:border-lime-800">
          {gameState.board.map((row, rowIndex) =>
            row.map((tile, colIndex) => (
              <GameTile
                key={`${rowIndex}-${colIndex}`}
                tile={tile}
                isSelected={
                  gameState.selectedTile?.row === rowIndex && 
                  gameState.selectedTile?.col === colIndex
                }
                onClick={() => handleTileClick(rowIndex, colIndex)}
              />
            ))
          )}
        </div>

        {gameState.gameOver && (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="text-4xl mb-2">
              {gameState.won ? "🏆" : "😔"}
            </div>
            <h3 className="text-xl font-bold">
              {gameState.won ? "Congratulations!" : "Game Over!"}
            </h3>
            <p className="text-lg">
              Final Score: <span className="font-bold text-lime-600">{gameState.score}</span>
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={resetGame} variant="default">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button onClick={shareScore} variant="tropical">
                <Users className="w-4 h-4 mr-2" />
                Challenge Friends
              </Button>
            </div>
          </div>
        )}

        {!gameState.gameOver && (
          <div className="flex gap-2 justify-center">
            <Button onClick={resetGame} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MargaritaGameBoard;
