import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PlaceDetails } from '@/types/place';

export interface Review {
  id: string;
  agave_rating: number;
  taste_notes: string | null;
  would_recommend: boolean;
  price_point: number | null;
  created_at: string;
  user_id: string;
  restaurant_id: string;
  photo_urls?: string[] | null;
  restaurant: {
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
  };
  profile: {
    display_name: string | null;
  } | null;
}

export const useNearbyReviews = (nearbyPlaces: PlaceDetails[], userLocation?: { lat: number; lng: number }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (nearbyPlaces.length === 0) {
      setReviews([]);
      return;
    }

    fetchNearbyReviews();
  }, [nearbyPlaces]);

  const fetchNearbyReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all reviews with restaurant information
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          restaurant:restaurants(*)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (reviewsError) {
        throw reviewsError;
      }

      if (!reviewsData) {
        setReviews([]);
        return;
      }

      // Get profiles for all users who made reviews, filtering out null user_ids
      const validUserIds = [...new Set(reviewsData.map(review => review.user_id))].filter((id): id is string => id !== null);
      
      let profilesData: any[] = [];
      if (validUserIds.length > 0) {
        const { data } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', validUserIds);
        profilesData = data || [];
      }

      // Create a map of user_id to profile for quick lookup
      const profileMap = new Map(
        profilesData?.map(profile => [profile.user_id, profile]) || []
      );


      // Filter and transform reviews to only include those for restaurants near the current search area
      const filteredReviews = reviewsData
        .filter(review => {
          if (!review.restaurant?.latitude || !review.restaurant?.longitude) {
            return false;
          }

          // Check if this restaurant matches any of our nearby places (within reasonable distance)
          return nearbyPlaces.some(place => {
            const distance = calculateDistance(
              review.restaurant.latitude!,
              review.restaurant.longitude!,
              place.location.lat,
              place.location.lng
            );
            // Consider it a match if within 0.1 miles (roughly same location)
            return distance < 0.1;
          });
        })
        .map(review => ({
          id: review.id,
          agave_rating: review.agave_rating,
          taste_notes: review.taste_notes,
          would_recommend: review.would_recommend,
          price_point: review.price_point,
          created_at: review.created_at,
          user_id: review.user_id,
          restaurant_id: review.restaurant_id,
          photo_urls: review.photo_urls,
          restaurant: {
            name: review.restaurant?.name || '',
            address: review.restaurant?.address || '',
            latitude: review.restaurant?.latitude || null,
            longitude: review.restaurant?.longitude || null,
          },
          profile: profileMap.get(review.user_id) ? {
            display_name: profileMap.get(review.user_id)?.display_name || null
          } : null
        })) as Review[];

      setReviews(filteredReviews);
    } catch (err) {
      console.error('Error fetching nearby reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

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

  return {
    reviews,
    loading,
    error,
    refetch: fetchNearbyReviews
  };
};