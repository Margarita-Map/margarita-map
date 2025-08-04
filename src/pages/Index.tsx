import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Star, Utensils, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import ReviewCard from "@/components/ReviewCard";
import MapLocator from "@/components/MapLocator";
import heroImage from "@/assets/hero-margarita.jpg";
const sampleReviews = [{
  id: "1",
  barName: "Tropical Paradise Bar",
  location: "123 Beach Ave, Miami, FL",
  drinkName: "Classic Lime Margarita",
  rating: 5,
  price: "$12",
  review: "Perfect balance of lime and tequila! The salt rim was perfectly done and the drink was ice cold. Best margarita I've had in Miami!",
  author: "Sarah M.",
  date: "2 days ago",
  distance: "0.3 miles"
}, {
  id: "2",
  barName: "Casa Agave",
  location: "456 Sunset Blvd, Los Angeles, CA",
  drinkName: "Spicy Jalapeño Margarita",
  rating: 4,
  price: "$14",
  review: "Great kick from the jalapeños! Could use a bit more lime but overall a solid drink. The atmosphere here is amazing.",
  author: "Mike R.",
  date: "1 week ago",
  distance: "1.2 miles"
}, {
  id: "3",
  barName: "Lime & Salt Cantina",
  location: "789 Margarita St, Austin, TX",
  drinkName: "Frozen Strawberry Margarita",
  rating: 5,
  price: "$11",
  review: "Absolutely delicious! Fresh strawberries and perfectly blended. Great for hot Texas days. Will definitely be back!",
  author: "Jessica L.",
  date: "3 days ago",
  distance: "0.8 miles"
}, {
  id: "4",
  barName: "El Corazón Tequila Bar",
  location: "321 Tequila Way, San Diego, CA",
  drinkName: "Smoky Mezcal Margarita",
  rating: 4,
  price: "$16",
  review: "Unique smoky flavor from the mezcal. Not for everyone but I loved it! Premium ingredients and beautiful presentation.",
  author: "Carlos V.",
  date: "5 days ago",
  distance: "2.1 miles"
}];
const Index = () => {
  const [searchResults, setSearchResults] = useState(sampleReviews);
  const [searchLocation, setSearchLocation] = useState<string>("");
  useSEO({
    title: "Find the Best Margaritas Near Me | Honest Reviews & Bar Locator",
    description: "Discover top-rated margaritas with our honest agave rating system. Find bars near you, read real reviews, get rideshare links, and explore the best margarita spots in your area.",
    keywords: "margaritas near me, best margarita bars, margarita reviews, cocktail bars, agave rating, bar locator, rideshare to bars"
  });
  const handleSearch = (location: string) => {
    setSearchLocation(location);
    console.log("Searching for margaritas near:", location);
    // The map will automatically update based on the searchLocation state
  };
  const handleLocationSelect = (place: any) => {
    console.log("Selected place:", place);
    // Here you could fetch margarita reviews for this specific place
    // or add it to a favorites list
  };
  return <div className="min-h-screen bg-gradient-tropical">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20 md:py-0">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: `url(${heroImage})`
      }}>
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="animate-float mb-6 md:mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-white mb-4 md:mb-6 drop-shadow-lg leading-tight">
              Find Your Perfect
              <span className="block bg-gradient-sunset bg-clip-text text-transparent mt-2">
                Margarita 🍹
              </span>
            </h1>
          </div>
          
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto drop-shadow-lg leading-relaxed px-4">Discover the best margaritas near you with honest reviews from real people. Rate drinks with our agave scale and find your next favorite spot! Let your favorite bartender and establishment how much you appreciate them.</p>
          
          <div className="max-w-2xl mx-auto px-4">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
        
        <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="text-white/70 text-sm text-center px-4">Scroll to explore</div>
        </div>
      </section>

      {/* Features Section */}
      

      {/* Map Section */}
      <section className="py-12 md:py-20 bg-background/90 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">
            Explore Nearby Locations 🗺️
          </h2>
          <div className="max-w-4xl mx-auto">
            <MapLocator searchLocation={searchLocation} onLocationSelect={handleLocationSelect} />
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Recent Reviews 📝
            </h2>
            <Button variant="festive" size="lg" className="w-full sm:w-auto">
              <Star className="w-5 h-5" />
              Write a Review
            </Button>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-2 xl:gap-8">
            {searchResults.map(review => <ReviewCard key={review.id} review={review} />)}
          </div>
          
          <div className="text-center mt-8 md:mt-12">
            <Button variant="tropical" size="lg" className="w-full sm:w-auto">
              View All Reviews
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 md:py-20 bg-gradient-sunset">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6 leading-tight">
            Ready to Find Your Perfect Margarita? 🍹
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of margarita enthusiasts discovering amazing drinks and sharing honest reviews.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="lime" size="lg" className="font-bold w-full sm:w-auto">
              Start Exploring
            </Button>
            <Button variant="tropical" size="lg" className="w-full sm:w-auto">
              Share Your Review
            </Button>
          </div>
        </div>
      </section>
    </div>;
};
export default Index;