import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, User, Calendar, MapPin } from "lucide-react";
import AgaveRating from "./AgaveRating";
import { PhotoGallery } from "./PhotoGallery";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Review {
  id: string;
  agave_rating: number;
  price_point: number | null;
  taste_notes: string | null;
  would_recommend: boolean;
  created_at: string;
  photo_urls: string[] | null;
  restaurants: {
    name: string;
    address: string;
  } | null;
  profiles: {
    display_name: string | null;
  } | null;
}

const RecentReviews = ({ maxItems = 6 }: { maxItems?: number }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentReviews();
  }, []);

  const fetchRecentReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          agave_rating,
          price_point,
          taste_notes,
          would_recommend,
          created_at,
          photo_urls,
          restaurants!inner (
            name,
            address
          ),
          profiles (
            display_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(maxItems);

      if (error) {
        console.error('Error fetching reviews:', error);
        return;
      }

      setReviews((data as unknown as Review[]) || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getPriceDisplay = (pricePoint: number | null) => {
    if (!pricePoint) return null;
    return "$".repeat(Math.min(pricePoint, 4));
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No reviews yet!</p>
        <Button onClick={() => navigate('/rate-drink')}>
          Be the first to leave a review
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {reviews.map((review) => (
        <Card key={review.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-bold line-clamp-1">
                  {review.restaurants?.name || 'Unknown Restaurant'}
                </CardTitle>
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">{review.restaurants?.address}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-3">
              <AgaveRating rating={review.agave_rating} size="sm" />
              <span className="text-sm font-medium">
                {review.agave_rating}/5 Agaves
              </span>
              <div className="flex items-center gap-1">
                {review.would_recommend ? (
                  <ThumbsUp className="w-3 h-3 text-green-500" />
                ) : (
                  <ThumbsDown className="w-3 h-3 text-red-500" />
                )}
                <span className="text-xs text-muted-foreground">
                  {review.would_recommend ? 'Recommends' : 'Not recommended'}
                </span>
              </div>
              {review.price_point && (
                <Badge variant="outline" className="text-xs">
                  {getPriceDisplay(review.price_point)}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {review.taste_notes && (
              <p className="text-sm text-foreground/80 mb-3 line-clamp-3">
                "{review.taste_notes}"
              </p>
            )}
            
            {review.photo_urls && review.photo_urls.length > 0 && (
              <div className="mb-3">
                <PhotoGallery photos={review.photo_urls.slice(0, 3)} />
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{review.profiles?.display_name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(review.created_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecentReviews;