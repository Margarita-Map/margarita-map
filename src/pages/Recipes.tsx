import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat } from "lucide-react";
import Navbar from "@/components/Navbar";
import AgaveRating from "@/components/AgaveRating";
import { useSEO } from "@/hooks/useSEO";

const recipes = [
  {
    id: 1,
    name: "Classic Lime Margarita",
    difficulty: "Easy",
    time: "5 min",
    serves: "1",
    rating: 5,
    ingredients: [
      "2 oz Blanco Tequila",
      "1 oz Fresh lime juice",
      "1 oz Triple sec",
      "Salt for rim",
      "Lime wedge for garnish"
    ],
    instructions: [
      "Rim glass with salt",
      "Add ice to shaker",
      "Combine tequila, lime juice, and triple sec",
      "Shake vigorously for 10 seconds",
      "Strain into salt-rimmed glass with ice",
      "Garnish with lime wedge"
    ],
    image: "🍹"
  },
  {
    id: 2,
    name: "Spicy Jalapeño Margarita",
    difficulty: "Medium",
    time: "8 min",
    serves: "1",
    rating: 4,
    ingredients: [
      "2 oz Blanco Tequila",
      "1 oz Fresh lime juice",
      "0.75 oz Agave nectar",
      "2-3 Jalapeño slices",
      "Chili salt for rim",
      "Jalapeño for garnish"
    ],
    instructions: [
      "Muddle jalapeño in shaker",
      "Add ice and remaining ingredients",
      "Shake vigorously",
      "Double strain into chili salt-rimmed glass",
      "Garnish with jalapeño slice"
    ],
    image: "🌶️"
  },
  {
    id: 3,
    name: "Frozen Strawberry Margarita",
    difficulty: "Easy",
    time: "10 min",
    serves: "2",
    rating: 5,
    ingredients: [
      "3 oz Blanco Tequila",
      "1.5 oz Fresh lime juice",
      "1 oz Triple sec",
      "1 cup Fresh strawberries",
      "2 cups Ice",
      "Sugar for rim"
    ],
    instructions: [
      "Rim glasses with sugar",
      "Combine all ingredients in blender",
      "Blend until smooth",
      "Pour into sugar-rimmed glasses",
      "Garnish with fresh strawberry"
    ],
    image: "🍓"
  },
  {
    id: 4,
    name: "Smoky Mezcal Margarita",
    difficulty: "Hard",
    time: "12 min",
    serves: "1",
    rating: 4,
    ingredients: [
      "2 oz Mezcal",
      "0.75 oz Fresh lime juice",
      "0.5 oz Yellow Chartreuse",
      "0.25 oz Agave nectar",
      "Smoked salt for rim",
      "Grilled lime wheel"
    ],
    instructions: [
      "Rim glass with smoked salt",
      "Combine ingredients in shaker with ice",
      "Shake well",
      "Strain into glass with large ice cube",
      "Garnish with grilled lime wheel"
    ],
    image: "💨"
  }
];

const Recipes = () => {
  useSEO({
    title: "Top Margarita Recipes | How to Make Perfect Margaritas at Home",
    description: "Master the art of margarita making with our curated collection of top-rated recipes. From classic lime to spicy jalapeño and frozen strawberry margaritas - step-by-step instructions included.",
    keywords: "margarita recipes, how to make margaritas, cocktail recipes, tequila drinks, lime margarita, frozen margarita, jalapeño margarita, mezcal margarita"
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-primary text-primary-foreground";
      case "Medium": return "bg-secondary text-secondary-foreground";
      case "Hard": return "bg-accent text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-tropical">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-sunset bg-clip-text text-transparent leading-tight">
            Top Margarita Recipes 🍹
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Master the art of the perfect margarita with these curated recipes
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:gap-8 max-w-6xl mx-auto">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-sunset transition-all duration-300 hover:scale-105 bg-card/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                      <span className="text-4xl">{recipe.image}</span>
                      {recipe.name}
                    </CardTitle>
                    <AgaveRating rating={recipe.rating} size="sm" />
                  </div>
                  <Badge className={getDifficultyColor(recipe.difficulty)}>
                    {recipe.difficulty}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {recipe.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Serves {recipe.serves}
                  </div>
                  <div className="flex items-center gap-1">
                    <ChefHat className="w-4 h-4" />
                    {recipe.difficulty}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-primary mb-3">Ingredients:</h4>
                  <ul className="space-y-1">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-primary mb-3">Instructions:</h4>
                  <ol className="space-y-2">
                    {recipe.instructions.map((step, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Recipes;