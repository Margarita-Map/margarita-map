import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, RefreshCw, Star } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const triviaQuestions: Question[] = [
  {
    id: 1,
    question: "What plant is tequila made from?",
    options: ["Blue Agave", "Cactus", "Corn", "Sugar Cane"],
    correctAnswer: 0,
    explanation: "Tequila is made exclusively from the Blue Agave plant (Agave tequilana)!"
  },
  {
    id: 2,
    question: "How long does blue agave take to mature?",
    options: ["2-3 years", "5-7 years", "8-12 years", "15-20 years"],
    correctAnswer: 2,
    explanation: "Blue agave takes 8-12 years to fully mature before harvesting!"
  },
  {
    id: 3,
    question: "What's the traditional way to drink tequila?",
    options: ["With lime and salt", "Neat at room temperature", "On the rocks", "Mixed in cocktails"],
    correctAnswer: 1,
    explanation: "Traditional Mexican way is neat at room temperature to appreciate the flavors!"
  },
  {
    id: 4,
    question: "Which region of Mexico can legally produce tequila?",
    options: ["Anywhere in Mexico", "Only Jalisco", "5 designated states", "Northern Mexico only"],
    correctAnswer: 2,
    explanation: "Only 5 Mexican states can legally produce tequila: Jalisco, Nayarit, Guanajuato, Michoacán, and Tamaulipas!"
  },
  {
    id: 5,
    question: "What does 'Blanco' tequila mean?",
    options: ["White color", "Unaged/clear", "Premium quality", "100% agave"],
    correctAnswer: 1,
    explanation: "Blanco means unaged - it's bottled immediately after distillation!"
  },
  {
    id: 6,
    question: "What's the minimum agave content for tequila?",
    options: ["51%", "75%", "90%", "100%"],
    correctAnswer: 0,
    explanation: "Tequila must contain at least 51% blue agave, though 100% agave is premium!"
  },
  {
    id: 7,
    question: "What makes a margarita 'top shelf'?",
    options: ["Expensive glass", "Premium tequila", "Fresh lime juice", "All of the above"],
    correctAnswer: 3,
    explanation: "Premium tequila, fresh ingredients, and quality presentation all matter!"
  },
  {
    id: 8,
    question: "When was the margarita invented?",
    options: ["1920s", "1930s-1940s", "1950s", "1960s"],
    correctAnswer: 1,
    explanation: "The margarita was likely invented in the 1930s-1940s, though the exact origin is debated!"
  }
];

const TequilaTrivia = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const startNewGame = () => {
    // Shuffle questions for variety
    const shuffled = [...triviaQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuestions(shuffled);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setGameComplete(false);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setGameComplete(true);
    }
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return "🏆 Tequila Master! Perfect score!";
    if (percentage >= 80) return "🌟 Agave Expert! Impressive knowledge!";
    if (percentage >= 60) return "🍹 Margarita Enthusiast! Well done!";
    if (percentage >= 40) return "🌵 Getting there! Keep learning!";
    return "🍋 Time to hit the books... or the bar!";
  };

  if (questions.length === 0) {
    return <div className="animate-pulse">Loading trivia...</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-950 dark:to-green-950 border-lime-200 dark:border-lime-800">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl text-lime-700 dark:text-lime-300">
          <Star className="w-6 h-6" />
          Tequila Trivia Time!
          <Star className="w-6 h-6" />
        </CardTitle>
        {!gameComplete && (
          <div className="flex justify-between items-center">
            <Badge variant="secondary" className="bg-lime-100 text-lime-800 dark:bg-lime-800 dark:text-lime-100">
              Question {currentQuestion + 1} of {questions.length}
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
              Score: {score}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {!gameComplete ? (
          <>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                {questions[currentQuestion].question}
              </h3>
            </div>

            <div className="grid gap-3">
              {questions[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  variant={
                    selectedAnswer === null 
                      ? "outline" 
                      : index === questions[currentQuestion].correctAnswer
                        ? "default"
                        : selectedAnswer === index
                          ? "destructive"
                          : "outline"
                  }
                  className={`p-4 text-left h-auto whitespace-normal ${
                    selectedAnswer === null 
                      ? "hover:bg-lime-50 dark:hover:bg-lime-950" 
                      : ""
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                >
                  {option}
                </Button>
              ))}
            </div>

            {showExplanation && (
              <div className="animate-fade-in bg-lime-100 dark:bg-lime-900 p-4 rounded-lg border border-lime-200 dark:border-lime-700">
                <p className="text-sm text-lime-800 dark:text-lime-200">
                  {questions[currentQuestion].explanation}
                </p>
                <Button 
                  onClick={handleNextQuestion} 
                  className="mt-3 w-full"
                  variant="default"
                >
                  {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">
              {score === questions.length ? "🏆" : score >= questions.length * 0.8 ? "🌟" : "🍹"}
            </div>
            <h3 className="text-xl font-bold">{getScoreMessage()}</h3>
            <p className="text-lg">
              You scored <span className="font-bold text-lime-600">{score}</span> out of{" "}
              <span className="font-bold">{questions.length}</span>
            </p>
            <Button 
              onClick={startNewGame} 
              className="w-full mt-4"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TequilaTrivia;