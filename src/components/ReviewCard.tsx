import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, DollarSign, ThumbsUp, ThumbsDown, Car } from "lucide-react";
import AgaveRating from "./AgaveRating";
import { PhotoGallery } from "./PhotoGallery";
import { Review } from "@/hooks/useNearbyReviews";

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
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

  const handleUberClick = () => {
    const destination = encodeURIComponent(review.restaurant.address);
    window.open(`https://m.uber.com/looking?drop%5B0%5D=${destination}`, '_blank');
  };

  const handleLyftClick = () => {
    const destination = encodeURIComponent(review.restaurant.address);
    window.open(`https://lyft.com/ride?destination=${destination}`, '_blank');
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer border-border/50 hover:border-primary/30">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-foreground leading-tight">
                {review.restaurant.name}
              </h3>
              <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{review.restaurant.address}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {review.price_point && (
                <Badge variant="outline" className="text-xs">
                  {getPriceDisplay(review.price_point)}
                </Badge>
              )}
              <div className="flex items-center gap-1">
                {review.would_recommend ? (
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                ) : (
                  <ThumbsDown className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          </div>

          {/* Agave Rating */}
          <div className="flex items-center gap-3">
            <AgaveRating rating={review.agave_rating} size="sm" />
            <span className="text-sm font-medium text-muted-foreground">
              {review.agave_rating}/5 Agaves
            </span>
          </div>

          {/* Review Text */}
          {review.taste_notes && (
            <p className="text-foreground leading-relaxed text-sm">
              "{review.taste_notes}"
            </p>
          )}

          {/* Photos */}
          {review.photo_urls && review.photo_urls.length > 0 && (
            <div className="mt-3">
              <PhotoGallery photos={review.photo_urls} />
            </div>
          )}

          {/* Rideshare Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleUberClick}
              className="flex-1 bg-black text-white hover:bg-black/80 font-medium"
            >
              <Car className="w-4 h-4 mr-2" />
              Uber
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLyftClick}
              className="flex-1 bg-[#FF00BF] text-white hover:bg-[#FF00BF]/80 font-medium"
            >
              <Car className="w-4 h-4 mr-2" />
              Lyft
            </Button>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-2 border-t border-border/50">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">
                {review.profile?.display_name || 'Anonymous User'}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(review.created_at)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;