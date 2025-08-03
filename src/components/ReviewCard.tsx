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
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg md:text-xl font-bold text-primary leading-tight">
              {review.barName}
            </CardTitle>
            <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{review.location} • {review.distance}</span>
            </div>
          </div>
          <div className="flex sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-2 sm:gap-1 flex-shrink-0">
            <div className="text-xl md:text-2xl font-bold text-secondary">{review.price}</div>
            <div className="text-xs text-muted-foreground">per drink</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h4 className="font-semibold text-base md:text-lg text-accent">{review.drinkName}</h4>
          <AgaveRating rating={review.rating} showCount />
        </div>

        <p className="text-sm md:text-base text-muted-foreground italic leading-relaxed">
          "{review.review}"
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs md:text-sm text-muted-foreground">
          <span>by {review.author}</span>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {review.date}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleUberClick}
            className="flex-1 bg-black text-white hover:bg-black/80 h-12 font-medium"
          >
            <Car className="w-4 h-4 mr-2" />
            Uber
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleLyftClick}
            className="flex-1 bg-[#FF00BF] text-white hover:bg-[#FF00BF]/80 h-12 font-medium"
          >
            <Car className="w-4 h-4 mr-2" />
            Lyft
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;