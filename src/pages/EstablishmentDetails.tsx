import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Globe, Star, ArrowLeft, PenTool } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import Navbar from "@/components/Navbar";
import ReviewCard from "@/components/ReviewCard";

interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
}

interface Review {
  id: string;
  agave_rating: number;
  taste_notes?: string;
  would_recommend: boolean;
  price_point?: number;
  created_at: string;
  photo_urls?: string[];
}

const EstablishmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: restaurant ? `${restaurant.name} | Margarita Map` : "Establishment Details | Margarita Map",
    description: restaurant ? `Discover margarita reviews and ratings for ${restaurant.name}. Read honest reviews and find the best margaritas at this location.` : "View establishment details and margarita reviews on Margarita Map.",
    keywords: "margarita reviews, establishment details, bar reviews, tequila bar, margarita ratings"
  });

  useEffect(() => {
    if (!id) return;

    const fetchEstablishmentData = async () => {
      try {
        setLoading(true);

        // Fetch restaurant details
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', id)
          .single();

        if (restaurantError) throw restaurantError;
        setRestaurant(restaurantData);

        // Fetch reviews for this restaurant
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('restaurant_id', id)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);

      } catch (error) {
        console.error('Error fetching establishment data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstablishmentData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-neon">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-pulse text-2xl font-bold">Loading establishment details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-neon">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Establishment Not Found</h1>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.agave_rating, 0) / reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-neon">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        {/* Back Button */}
        <Button 
          onClick={() => navigate('/')} 
          variant="outline" 
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Restaurant Header */}
        <Card className="card-brutal bg-white border-4 border-black mb-8">
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-black text-center">
              {restaurant.name}
            </CardTitle>
            
            <div className="flex flex-col items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-muted-foreground text-lg">
                <MapPin className="w-5 h-5" />
                <span>{restaurant.address}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {restaurant.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}
                
                {restaurant.website && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(restaurant.website, '_blank')}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                  </Button>
                )}
              </div>

              {reviews.length > 0 && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                    <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">/ 5 Agave Rating</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Action Buttons */}
        <div className="text-center mb-8">
          <Button 
            variant="neon" 
            size="lg"
            onClick={() => navigate(`/rate-drink?restaurant=${restaurant.id}`)}
            className="w-full sm:w-auto"
          >
            <PenTool className="w-5 h-5 mr-2" />
            WRITE A REVIEW
          </Button>
        </div>

        {/* Reviews Section */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
            Margarita Reviews ({reviews.length})
          </h2>

          {reviews.length > 0 ? (
            <div className="grid gap-6 max-w-4xl mx-auto">
              {reviews.map((review) => (
                <ReviewCard 
                  key={review.id}
                  review={{
                    id: review.id,
                    user_id: '',
                    restaurant_id: review.id,
                    restaurant: {
                      name: restaurant.name,
                      address: restaurant.address,
                      latitude: 0,
                      longitude: 0
                    },
                    agave_rating: review.agave_rating,
                    taste_notes: review.taste_notes || '',
                    would_recommend: review.would_recommend,
                    price_point: review.price_point,
                    created_at: review.created_at,
                    photo_urls: review.photo_urls || [],
                    profile: null
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="card-brutal bg-white border-4 border-black max-w-2xl mx-auto">
              <CardContent className="text-center p-8">
                <Star className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">No Reviews Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to review the margaritas at {restaurant.name}!
                </p>
                <Button 
                  variant="electric" 
                  onClick={() => navigate(`/rate-drink?restaurant=${restaurant.id}`)}
                >
                  <PenTool className="w-4 h-4 mr-2" />
                  Write the First Review
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstablishmentDetails;