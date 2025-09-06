import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlaceDetails } from "@/types/place";

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
        // Get restaurants with coordinates only (we'll filter by location)
        const { data: restaurants, error: restaurantsError } = await supabase
          .from('restaurants')
          .select('id, name, address, latitude, longitude, phone, website')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (restaurantsError) {
          console.error('Error fetching restaurants:', restaurantsError);
          return;
        }

        const placeRatingInfo: Record<string, PlaceRatingInfo> = {};

        // For each place, try to find matching restaurants and get their ratings
        for (const place of places) {
          // Try to match by Google Place ID first, then by location and name similarity
          let matchingRestaurant = restaurants?.find(r => r.id === place.id);
          
          if (!matchingRestaurant) {
            // Filter restaurants by proximity first (within 0.1 miles)
            const nearbyRestaurants = restaurants?.filter(r => {
              if (!r.latitude || !r.longitude) return false;
              const distance = calculateDistance(
                Number(r.latitude),
                Number(r.longitude),
                place.location.lat,
                place.location.lng
              );
              return distance < 0.1; // Only consider restaurants within 0.1 miles
            });

            // Then try to match by name within nearby restaurants only
            matchingRestaurant = nearbyRestaurants?.find(r => {
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

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return { placeRatings, loading };
};