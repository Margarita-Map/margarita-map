import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface GameState {
  margaritaPosition: number;
  selectedShell: number | null;
  gamePhase: "waiting" | "shuffling" | "guessing" | "revealed";
  score: number;
  round: number;
  shellPositions: number[];
}

const ShellGameBoard = () => {
  const [gameState, setGameState] = useState<GameState>({
    margaritaPosition: 1,
    selectedShell: null,
    gamePhase: "waiting",
    score: 0,
    round: 1,
    shellPositions: [0, 1, 2]
  });

  const [isAnimating, setIsAnimating] = useState(false);

  const startGame = () => {
    const newMargaritaPosition = Math.floor(Math.random() * 3);
    setGameState(prev => ({
      ...prev,
      margaritaPosition: newMargaritaPosition,
      selectedShell: null,
      gamePhase: "waiting",
      shellPositions: [0, 1, 2]
    }));
    
    // Show margarita briefly
    setTimeout(() => {
      setGameState(prev => ({ ...prev, gamePhase: "shuffling" }));
      shuffleShells();
    }, 2000);
  };

  const shuffleShells = () => {
    setIsAnimating(true);
    let shuffleCount = 0;
    const maxShuffles = 8 + Math.floor(Math.random() * 5); // 8-12 shuffles
    
    const performShuffle = () => {
      if (shuffleCount < maxShuffles) {
        // Randomly swap two adjacent shells
        const swapIndex = Math.floor(Math.random() * 2);
        
        setGameState(prev => {
          const newPositions = [...prev.shellPositions];
          const newMargaritaPos = prev.margaritaPosition;
          
          // Swap positions
          [newPositions[swapIndex], newPositions[swapIndex + 1]] = 
          [newPositions[swapIndex + 1], newPositions[swapIndex]];
          
          // Update margarita position if it was in one of the swapped shells
          let updatedMargaritaPos = newMargaritaPos;
          if (newMargaritaPos === swapIndex) {
            updatedMargaritaPos = swapIndex + 1;
          } else if (newMargaritaPos === swapIndex + 1) {
            updatedMargaritaPos = swapIndex;
          }
          
          return {
            ...prev,
            shellPositions: newPositions,
            margaritaPosition: updatedMargaritaPos
          };
        });
        
        shuffleCount++;
        setTimeout(performShuffle, 400);
      } else {
        setIsAnimating(false);
        setGameState(prev => ({ ...prev, gamePhase: "guessing" }));
        toast.info("Make your guess! Which shell has the margarita?");
      }
    };
    
    setTimeout(performShuffle, 500);
  };

  const handleShellClick = (shellIndex: number) => {
    if (gameState.gamePhase !== "guessing" || isAnimating) return;
    
    setGameState(prev => ({
      ...prev,
      selectedShell: shellIndex,
      gamePhase: "revealed"
    }));
    
    // Check if correct
    if (shellIndex === gameState.margaritaPosition) {
      setGameState(prev => ({
        ...prev,
        score: prev.score + 1
      }));
      toast.success("🎉 You found it! Well done!");
    } else {
      toast.error("😔 Wrong shell! The margarita was under a different one.");
    }
  };

  const nextRound = () => {
    setGameState(prev => ({
      ...prev,
      round: prev.round + 1
    }));
    startGame();
  };

  const resetGame = () => {
    setGameState({
      margaritaPosition: 1,
      selectedShell: null,
      gamePhase: "waiting",
      score: 0,
      round: 1,
      shellPositions: [0, 1, 2]
    });
  };

  const getShellTransform = (originalPosition: number) => {
    const currentPosition = gameState.shellPositions.indexOf(originalPosition);
    const translateX = (currentPosition - originalPosition) * 120; // 120px spacing
    return `translateX(${translateX}px)`;
  };

  const shareScore = async () => {
    const message = `🐚 Shell Game Score: ${gameState.score}/${gameState.round - 1} correct! Can you beat me? 🍹`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Shell Game Score",
          text: message,
          url: window.location.href
        });
      } catch (err) {
        console.log("Share failed");
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(message);
      toast.success("Score copied to clipboard!");
    }
  };

  useEffect(() => {
    startGame();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">Round {gameState.round}</div>
            <div className="text-sm text-muted-foreground">
              Score: {gameState.score}/{gameState.round - 1}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={shareScore} variant="outline" size="sm">
              Share Score
            </Button>
            <Button onClick={resetGame} variant="outline" size="sm">
              Reset Game
            </Button>
          </div>
        </div>
        
        {/* Game Status */}
        <div className="text-center mb-8">
          {gameState.gamePhase === "waiting" && (
            <p className="text-lg text-primary font-semibold">
              Remember which shell has the margarita! 🍹
            </p>
          )}
          {gameState.gamePhase === "shuffling" && (
            <p className="text-lg text-primary font-semibold animate-pulse">
              Keep your eyes on the shells! 👀
            </p>
          )}
          {gameState.gamePhase === "guessing" && (
            <p className="text-lg text-primary font-semibold">
              Which shell has the margarita? Click to reveal! 🤔
            </p>
          )}
          {gameState.gamePhase === "revealed" && (
            <div className="space-y-2">
              <p className="text-lg font-semibold">
                {gameState.selectedShell === gameState.margaritaPosition 
                  ? "🎉 Correct! You found the margarita!" 
                  : "😔 Wrong! Better luck next time!"}
              </p>
              <Button onClick={nextRound} className="mt-4">
                Next Round
              </Button>
            </div>
          )}
        </div>
        
        {/* Game Board */}
        <div className="flex justify-center items-end gap-4 mb-8 relative h-40">
          {[0, 1, 2].map((shellIndex) => (
            <div
              key={shellIndex}
              className="relative flex flex-col items-center"
              style={{
                transform: getShellTransform(shellIndex),
                transition: isAnimating ? "transform 0.4s ease-in-out" : "none"
              }}
            >
              {/* Show margarita when appropriate */}
              {(gameState.gamePhase === "waiting" || gameState.gamePhase === "revealed") && 
               shellIndex === gameState.margaritaPosition && (
                <div className="absolute bottom-16 text-4xl animate-bounce">
                  🍹
                </div>
              )}
              
              {/* Shell */}
              <div
                className={`
                  w-20 h-16 bg-gradient-to-b from-amber-200 to-amber-600 
                  rounded-t-full border-4 border-amber-800 cursor-pointer
                  transition-all duration-200 relative
                  ${gameState.gamePhase === "guessing" ? "hover:scale-110 hover:shadow-lg" : ""}
                  ${gameState.selectedShell === shellIndex ? "ring-4 ring-primary ring-opacity-50" : ""}
                  ${gameState.gamePhase === "revealed" && shellIndex === gameState.margaritaPosition 
                    ? "ring-4 ring-green-500 ring-opacity-75" : ""}
                `}
                onClick={() => handleShellClick(shellIndex)}
              >
                {/* Shell ridges for texture */}
                <div className="absolute inset-x-2 top-2 h-1 bg-amber-800 rounded-full opacity-30"></div>
                <div className="absolute inset-x-3 top-4 h-1 bg-amber-800 rounded-full opacity-20"></div>
                <div className="absolute inset-x-4 top-6 h-1 bg-amber-800 rounded-full opacity-10"></div>
              </div>
              
              {/* Shell number */}
              <div className="mt-2 text-sm font-semibold text-muted-foreground">
                Shell {shellIndex + 1}
              </div>
            </div>
          ))}
        </div>
        
        {/* Instructions */}
        <div className="text-center text-sm text-muted-foreground">
          {gameState.gamePhase === "waiting" && "Watch carefully where the margarita starts..."}
          {gameState.gamePhase === "shuffling" && "Following the shells as they move around..."}
          {gameState.gamePhase === "guessing" && "Click on a shell to make your guess!"}
          {gameState.gamePhase === "revealed" && "Ready for the next round?"}
        </div>
      </Card>
    </div>
  );
};

export default ShellGameBoard;