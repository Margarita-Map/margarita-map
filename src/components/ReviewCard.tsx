import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Car, Clock } from "lucide-react";
import AgaveRating from "./AgaveRating";

interface Review {
  id: string;
  barName: string;
  location: string;
  drinkName: string;
  rating: number;
  price: string;
  review: string;
  author: string;
  date: string;
  distance: string;
}

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const handleUberClick = () => {
    const destination = encodeURIComponent(review.location);
    window.open(`https://m.uber.com/looking?drop%5B0%5D=${destination}`, '_blank');
  };

  const handleLyftClick = () => {
    const destination = encodeURIComponent(review.location);
    window.open(`https://lyft.com/ride?destination=${destination}`, '_blank');
  };

  return (
    <Card className="hover:shadow-lime transition-all duration-300 hover:scale-105 bg-card/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-primary">
              {review.barName}
            </CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="w-3 h-3" />
              {review.location} • {review.distance}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-secondary">{review.price}</div>
            <div className="text-xs text-muted-foreground">per drink</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-accent">{review.drinkName}</h4>
          <AgaveRating rating={review.rating} showCount />
        </div>

        <p className="text-sm text-muted-foreground italic">
          "{review.review}"
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>by {review.author}</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {review.date}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUberClick}
            className="flex-1 bg-black text-white hover:bg-black/80"
          >
            <Car className="w-3 h-3" />
            Uber
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLyftClick}
            className="flex-1 bg-[#FF00BF] text-white hover:bg-[#FF00BF]/80"
          >
            <Car className="w-3 h-3" />
            Lyft
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;