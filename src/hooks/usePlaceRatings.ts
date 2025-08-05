import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlaceDetails } from "@/hooks/useGoogleMaps";

interface PlaceRatingInfo {
  placeId: string;
  hasRatings: boolean;
  averageRating: number;
  totalReviews: number;
}

export const usePlaceRatings = (places: PlaceDetails[]) => {
  const [placeRatings, setPlaceRatings] = useState<Record<string, PlaceRatingInfo>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlaceRatings = async () => {
      if (places.length === 0) return;
      
      setLoading(true);
      try {
        // Get all restaurants that match our places (by name and address for Google Places)
        const { data: restaurants, error: restaurantsError } = await supabase
          .from('restaurants')
          .select('id, name, address');

        if (restaurantsError) {
          console.error('Error fetching restaurants:', restaurantsError);
          return;
        }

        const placeRatingInfo: Record<string, PlaceRatingInfo> = {};

        // For each place, try to find matching restaurants and get their ratings
        for (const place of places) {
          // Try to match by Google Place ID first, then by name similarity
          let matchingRestaurant = restaurants?.find(r => r.id === place.id);
          
          if (!matchingRestaurant) {
            // Try to match by name (improved fuzzy matching)
            matchingRestaurant = restaurants?.find(r => {
              const placeName = place.name.toLowerCase().replace(/[^\w\s]/g, '').trim();
              const restaurantName = r.name.toLowerCase().replace(/[^\w\s]/g, '').trim();
              
              // Check for exact match first
              if (placeName === restaurantName) return true;
              
              // Check if one name contains the other (but with more than 3 characters)
              if (placeName.length > 3 && restaurantName.length > 3) {
                return placeName.includes(restaurantName) || restaurantName.includes(placeName);
              }
              
              return false;
            });
          }

          if (matchingRestaurant) {
            // Get reviews for this restaurant
            const { data: reviews, error: reviewsError } = await supabase
              .from('reviews')
              .select('agave_rating')
              .eq('restaurant_id', matchingRestaurant.id);

            if (!reviewsError && reviews && reviews.length > 0) {
              const totalReviews = reviews.length;
              const averageRating = reviews.reduce((sum, review) => sum + review.agave_rating, 0) / totalReviews;
              
              placeRatingInfo[place.id] = {
                placeId: place.id,
                hasRatings: true,
                averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
                totalReviews
              };
            } else {
              placeRatingInfo[place.id] = {
                placeId: place.id,
                hasRatings: false,
                averageRating: 0,
                totalReviews: 0
              };
            }
          } else {
            placeRatingInfo[place.id] = {
              placeId: place.id,
              hasRatings: false,
              averageRating: 0,
              totalReviews: 0
            };
          }
        }

        setPlaceRatings(placeRatingInfo);
      } catch (error) {
        console.error('Error fetching place ratings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceRatings();
  }, [places]);

  return { placeRatings, loading };
};