import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Star, Utensils, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import ReviewCard from "@/components/ReviewCard";
import MapLocator from "@/components/MapLocator";
import AddEstablishmentForm from "@/components/AddEstablishmentForm";
import DrinkSpecialsList from "@/components/DrinkSpecialsList";
import ManageEstablishment from "@/components/ManageEstablishment";
import PlacesList from "@/components/PlacesList";
import { PlaceDetails } from "@/hooks/useGoogleMaps";
import { useNearbyReviews } from "@/hooks/useNearbyReviews";
import heroImage from "@/assets/hero-margarita.jpg";
// Remove the sample reviews since we're using real data now
const Index = () => {
  const [searchLocation, setSearchLocation] = useState<string>("");
  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceDetails[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showManageForm, setShowManageForm] = useState(false);
  const { reviews, loading: reviewsLoading, error: reviewsError } = useNearbyReviews(nearbyPlaces);
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

  const handlePlacesFound = (places: PlaceDetails[]) => {
    setNearbyPlaces(places);
  };

  const handlePlaceSelect = (place: PlaceDetails) => {
    console.log("Selected place from list:", place);
    // Could highlight the corresponding marker on the map
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
            Find the Best Margaritas Near You! 🗺️
          </h2>
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
            <MapLocator 
              searchLocation={searchLocation} 
              onLocationSelect={handleLocationSelect}
              onPlacesFound={handlePlacesFound}
            />
            <PlacesList 
              places={nearbyPlaces}
              onPlaceSelect={handlePlaceSelect}
            />
          </div>
        </div>
      </section>

      {/* Drink Specials Section */}
      <section className="py-12 md:py-20 bg-background/90 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Today's Drink Specials 🍸
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Check out the best drink deals happening right now at establishments near you.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <DrinkSpecialsList 
              restaurantIds={nearbyPlaces.map(place => place.id)} 
              maxItems={8}
            />
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Recent Reviews in Your Area 📝
            </h2>
            <Button variant="festive" size="lg" className="w-full sm:w-auto">
              <Star className="w-5 h-5" />
              Write a Review
            </Button>
          </div>
          
          {reviewsLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading reviews...</p>
            </div>
          )}
          
          {reviewsError && (
            <div className="text-center py-8">
              <p className="text-destructive">Error loading reviews: {reviewsError}</p>
            </div>
          )}
          
          {!reviewsLoading && !reviewsError && reviews.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No reviews found for places in this area. Be the first to leave a review!</p>
            </div>
          )}
          
          {!reviewsLoading && !reviewsError && reviews.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-2 xl:gap-8">
              {reviews.slice(0, 6).map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
          
          {!reviewsLoading && !reviewsError && reviews.length > 6 && (
            <div className="text-center mt-8 md:mt-12">
              <Button variant="tropical" size="lg" className="w-full sm:w-auto">
                View All Reviews ({reviews.length})
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Add Establishment Section */}
      <section className="py-12 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              For Bar & Restaurant Owners 🏪
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Add your establishment to our directory and manage your daily drink specials to attract more customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                variant="tropical" 
                size="lg" 
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? "Hide Form" : "Add Your Establishment"}
              </Button>
              <Button 
                variant="festive" 
                size="lg" 
                onClick={() => setShowManageForm(!showManageForm)}
              >
                {showManageForm ? "Hide Management" : "Manage Specials"}
              </Button>
            </div>
          </div>
          
          {showAddForm && (
            <div className="animate-in slide-in-from-top duration-300 mb-8">
              <AddEstablishmentForm onSuccess={() => setShowAddForm(false)} />
            </div>
          )}

          {showManageForm && (
            <div className="animate-in slide-in-from-top duration-300">
              <ManageEstablishment />
            </div>
          )}
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