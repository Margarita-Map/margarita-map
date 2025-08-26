import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";
import QuartersGameBoard from "@/components/QuartersGame/GameBoard";

const QuartersGame = () => {
  useSEO({
    title: "Quarters Game - Margarita Map",
    description: "Play the classic quarters drinking game! Bounce a quarter into a margarita glass and challenge your friends.",
    keywords: "quarters game, drinking game, margarita, party game, bounce quarter"
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
              🪙 Quarters Game 🍹
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The classic drinking game! Bounce a quarter off the table and into the margarita glass. 
              Miss and pass the quarter - make it and your opponent drinks!
            </p>
          </div>

          <QuartersGameBoard />

          <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border p-6">
            <h2 className="text-2xl font-bold mb-4 text-center">How to Play</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold mb-2">Aim & Power</h3>
                <p className="text-sm text-muted-foreground">
                  Click and drag to set angle and power. The quarter needs to bounce on the table first!
                </p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl mb-2">🪙</div>
                <h3 className="font-semibold mb-2">Bounce to Win</h3>
                <p className="text-sm text-muted-foreground">
                  Release to shoot! The quarter must bounce off the table before landing in the glass.
                </p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl mb-2">🍹</div>
                <h3 className="font-semibold mb-2">Score & Drink</h3>
                <p className="text-sm text-muted-foreground">
                  Make it in the glass and your opponent drinks! Miss and it's their turn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuartersGame;