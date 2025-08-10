import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PlaceDetails } from '@/types/place';

export interface PlaceReview {
  id: string;
  agave_rating: number;
  taste_notes: string | null;
  would_recommend: boolean;
  price_point: number | null;
  created_at: string;
  user_id: string;
  restaurant_id: string;
  photo_urls?: string[] | null;
  profile: {
    display_name: string | null;
  } | null;
}

export const usePlaceReviews = (place: PlaceDetails | null) => {
  const [reviews, setReviews] = useState<PlaceReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!place) {
      setReviews([]);
      return;
    }

    fetchPlaceReviews();
  }, [place?.id]);

  const fetchPlaceReviews = async () => {
    if (!place) return;

    try {
      setLoading(true);
      setError(null);

      // First, find the restaurant that matches this place by name and address
      console.log('Looking for place:', place.name, place.address);
      
      // Search for restaurants by name first, then by address if no match
      let restaurants = null;
      let restaurantError = null;

      // Try name search first
      const nameResult = await supabase
        .from('restaurants')
        .select('id, name, address')
        .ilike('name', `%${place.name.replace(/['"]/g, '')}%`)
        .limit(5);

      if (nameResult.error) {
        restaurantError = nameResult.error;
      } else if (nameResult.data && nameResult.data.length > 0) {
        restaurants = nameResult.data;
      } else {
        // If no name match, try address search
        const addressResult = await supabase
          .from('restaurants')
          .select('id, name, address')
          .ilike('address', `%${place.address.replace(/['"]/g, '')}%`)
          .limit(5);
        
        restaurants = addressResult.data;
        restaurantError = addressResult.error;
      }
      
      console.log('Found restaurants:', restaurants);

      if (restaurantError) {
        throw restaurantError;
      }

      if (!restaurants || restaurants.length === 0) {
        setReviews([]);
        return;
      }

      const restaurantId = restaurants[0].id;

      // Get reviews for this restaurant
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

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

      // Transform reviews
      const transformedReviews = reviewsData.map(review => ({
        id: review.id,
        agave_rating: review.agave_rating,
        taste_notes: review.taste_notes,
        would_recommend: review.would_recommend,
        price_point: review.price_point,
        created_at: review.created_at,
        user_id: review.user_id,
        restaurant_id: review.restaurant_id,
        photo_urls: review.photo_urls,
        profile: profileMap.get(review.user_id) ? {
          display_name: profileMap.get(review.user_id)?.display_name || null
        } : null
      })) as PlaceReview[];

      setReviews(transformedReviews);
    } catch (err) {
      console.error('Error fetching place reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  return {
    reviews,
    loading,
    error,
    refetch: fetchPlaceReviews
  };
};