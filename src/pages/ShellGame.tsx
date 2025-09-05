import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";
import ShellGameBoard from "@/components/ShellGame/GameBoard";

const ShellGame = () => {
  useSEO({
    title: "Shell Game - Margarita Map",
    description: "Play the classic shell game! Find the margarita hidden under one of three shells after they're shuffled.",
    keywords: "shell game, margarita, carnival game, guessing game, party game"
  });

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-yellow-100 dark:from-orange-950 dark:via-orange-900 dark:to-yellow-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              🐚 Shell Game 🍹
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The classic carnival game! Watch the shells shuffle and find the margarita. 
              Keep your eyes on the prize and test your focus!
            </p>
          </div>

          <ShellGameBoard />

          <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border p-6">
            <h2 className="text-2xl font-bold mb-4 text-center">How to Play</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl mb-2">👀</div>
                <h3 className="font-semibold mb-2">Watch Carefully</h3>
                <p className="text-sm text-muted-foreground">
                  See which shell the margarita starts under and keep your eyes on it!
                </p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl mb-2">🌪️</div>
                <h3 className="font-semibold mb-2">Follow the Shuffle</h3>
                <p className="text-sm text-muted-foreground">
                  The shells will shuffle around - try to track where your margarita went!
                </p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold mb-2">Make Your Guess</h3>
                <p className="text-sm text-muted-foreground">
                  Click on the shell you think has the margarita underneath!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShellGame;