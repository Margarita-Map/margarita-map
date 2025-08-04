import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, DollarSign, ThumbsUp, PenTool } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";
import { useNavigate } from "react-router-dom";

const RateDrink = () => {
  const navigate = useNavigate();
  
  useSEO({
    title: "Rate a Drink - The BEST Margaritas near me",
    description: "Share your margarita experience! Rate drinks, add taste notes, and help others find the best margaritas.",
    keywords: "rate margarita, drink review, margarita rating, taste notes, agave rating"
  });

  const handleFindBar = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-sunrise">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-sunset bg-clip-text text-transparent">
            Rate a Drink 🍹
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Share your margarita experience and help fellow enthusiasts discover the best drinks in town!
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card className="border-2 border-primary/20 bg-background/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="w-5 h-5" />
                How to Rate a Drink
              </CardTitle>
              <CardDescription>
                Follow these simple steps to share your margarita experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Find the Bar</h3>
                    <p className="text-muted-foreground">Use our map or search to locate the establishment where you had your drink.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      Rate with Agave Scale
                      <img src="/src/assets/agave-rating.png" alt="Agave" className="w-5 h-5" />
                    </h3>
                    <p className="text-muted-foreground">Rate from 1-5 agaves based on taste, quality, and overall experience.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      Add Price Point
                      <DollarSign className="w-4 h-4" />
                    </h3>
                    <p className="text-muted-foreground">Rate the price level (1-4 dollar signs) to help others budget their visit.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Share Taste Notes</h3>
                    <p className="text-muted-foreground">Describe the flavors, presentation, or anything that made the drink special.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      Would You Recommend?
                      <ThumbsUp className="w-4 h-4" />
                    </h3>
                    <p className="text-muted-foreground">Let others know if you'd recommend this drink and location.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Rating Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <img src="/src/assets/agave-rating.png" alt="Agave" className="w-5 h-5" />
                    Agave Rating Scale
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">1</Badge>
                      <span>Poor - Not recommended</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">2</Badge>
                      <span>Fair - Below average</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">3</Badge>
                      <span>Good - Average quality</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">4</Badge>
                      <span>Great - Above average</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-sunset text-white border-0">5</Badge>
                      <span>Excellent - Must try!</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Price Point Guide
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-mono">$</span>
                      <span>Budget-friendly ($5-8)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">$$</span>
                      <span>Moderate ($9-12)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">$$$</span>
                      <span>Upscale ($13-16)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">$$$$</span>
                      <span>Premium ($17+)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-gradient-sunset hover:bg-gradient-sunset/90 text-white border-0 font-bold px-8"
            onClick={handleFindBar}
          >
            <MapPin className="w-5 h-5 mr-2" />
            Start Rating - Find a Bar
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Click above to find bars near you and start rating drinks!
          </p>
        </div>
      </div>
    </div>
  );
};

export default RateDrink;