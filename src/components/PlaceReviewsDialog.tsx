import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, ThumbsUp, ThumbsDown, User, Calendar } from "lucide-react";
import AgaveRating from "./AgaveRating";
import { PlaceDetails } from "@/hooks/useGoogleMaps";
import { usePlaceReviews } from "@/hooks/usePlaceReviews";

interface PlaceReviewsDialogProps {
  place: PlaceDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRatePlace?: () => void;
}

const PlaceReviewsDialog = ({ place, open, onOpenChange, onRatePlace }: PlaceReviewsDialogProps) => {
  const { reviews, loading, error } = usePlaceReviews(place);

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

  if (!place) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{place.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{place.address}</p>
            </div>
            <Button onClick={onRatePlace} size="sm">
              <Star className="w-4 h-4 mr-1" />
              Rate This Place
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-destructive">Error loading reviews: {error}</p>
            </div>
          )}

          {!loading && !error && reviews.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No reviews yet for this place.</p>
              <p className="text-sm text-muted-foreground mt-2">Be the first to leave a review!</p>
            </div>
          )}

          {!loading && !error && reviews.length > 0 && (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 border rounded-lg space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {review.profile?.display_name || 'Anonymous User'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-3">
                    <AgaveRating rating={review.agave_rating} size="sm" />
                    <span className="text-sm font-medium">
                      {review.agave_rating}/5 Agaves
                    </span>
                    <div className="flex items-center gap-1">
                      {review.would_recommend ? (
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <ThumbsDown className="w-4 h-4 text-red-500" />
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

                  {/* Review Text */}
                  {review.taste_notes && (
                    <p className="text-sm text-foreground leading-relaxed">
                      "{review.taste_notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceReviewsDialog;