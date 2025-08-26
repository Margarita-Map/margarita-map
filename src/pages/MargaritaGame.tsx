
import { useSEO } from "@/hooks/useSEO";
import Navbar from "@/components/Navbar";
import MargaritaGameBoard from "@/components/MargaritaGame/GameBoard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MargaritaGame = () => {
  const navigate = useNavigate();
  
  useSEO({
    title: "Margarita Crush Game | Margarita Map",
    description: "Play Margarita Crush - an addictive match-3 game where you collect margarita glasses! Challenge your friends and see who can get the highest score.",
    keywords: "margarita game, match 3 game, margarita crush, puzzle game, casual gaming"
  });

  return (
    <div className="min-h-screen bg-gradient-tropical">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-sunset bg-clip-text text-transparent">
              🍹 Margarita Crush 🍹
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Match 3 or more margarita glasses to score points! Collect as many as you can before running out of moves. Challenge your friends to beat your high score!
            </p>
          </div>

          <MargaritaGameBoard />

          <div className="text-center mt-8 space-y-4">
            <h2 className="text-2xl font-bold">How to Play</h2>
            <div className="grid md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-bold mb-2">Match 3 or More</h3>
                <p className="text-sm text-muted-foreground">
                  Swap adjacent margarita glasses to create matches of 3 or more of the same type
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <div className="text-2xl mb-2">⏱️</div>
                <h3 className="font-bold mb-2">Limited Moves</h3>
                <p className="text-sm text-muted-foreground">
                  You have 30 moves to reach the target score of 5,000 points
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <div className="text-2xl mb-2">🏆</div>
                <h3 className="font-bold mb-2">Challenge Friends</h3>
                <p className="text-sm text-muted-foreground">
                  Share your high scores and see who's the ultimate margarita collector!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MargaritaGame;
