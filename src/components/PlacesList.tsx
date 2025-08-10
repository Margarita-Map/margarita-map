import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Phone, Globe, Navigation, StarIcon, Users } from "lucide-react";
import { PlaceDetails } from "@/hooks/useGoogleMaps";
import { usePlaceRatings } from "@/hooks/usePlaceRatings";
import PlaceReviewsDialog from "./PlaceReviewsDialog";

interface PlacesListProps {
  places: PlaceDetails[];
  onPlaceSelect?: (place: PlaceDetails) => void;
}

const PlacesList = ({ places, onPlaceSelect }: PlacesListProps) => {
  console.log("=== PLACESLIST COMPONENT RENDER ===");
  console.log("PlacesList rendered with places:", places?.length || 0, places);
  console.log("PlacesList props object:", { places, onPlaceSelect });
  console.log("places array is:", Array.isArray(places) ? "array" : typeof places);
  console.log("=== END PLACESLIST RENDER ===");
  
  const navigate = useNavigate();
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const [reviewsDialogOpen, setReviewsDialogOpen] = useState(false);
  const [selectedPlaceForReviews, setSelectedPlaceForReviews] = useState<PlaceDetails | null>(null);
  const { placeRatings, loading: ratingsLoading } = usePlaceRatings(places);

  const visiblePlaces = useMemo(() => {
    return places.slice(0, visibleCount);
  }, [places, visibleCount]);

  const hasMorePlaces = places.length > visibleCount;

  const loadMorePlaces = () => {
    setVisibleCount(prev => Math.min(prev + 12, places.length));
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`;
    }
    return `${distance.toFixed(1)} miles`;
  };

  const getPriceLevelText = (priceLevel?: number) => {
    if (!priceLevel) return "Price not available";
    const levels = ["$", "$$", "$$$", "$$$$"];
    return levels[priceLevel - 1] || "Price not available";
  };

  const handlePlaceClick = (place: PlaceDetails) => {
    console.log("Place clicked:", place.name);
    setSelectedPlaceId(place.id);
    
    // Navigate to rate drink page with the selected place information
    navigate('/rate-drink', {
      state: {
        selectedPlace: place,
        placeName: place.name,
        placeId: place.id
      }
    });
    
    // Also call the onPlaceSelect prop if provided
    if (onPlaceSelect) {
      onPlaceSelect(place);
    }
  };

  const handleViewReviews = (place: PlaceDetails) => {
    setSelectedPlaceForReviews(place);
    setReviewsDialogOpen(true);
  };

  const handleRatePlaceFromDialog = () => {
    if (selectedPlaceForReviews) {
      setReviewsDialogOpen(false);
      handlePlaceClick(selectedPlaceForReviews);
    }
  };

  const handleDirections = (place: PlaceDetails) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`;
    window.open(url, '_blank');
  };

  if (places.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Nearby Places
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No places found. Try searching for a different location.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Closest Places
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            Showing {visiblePlaces.length} of {places.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {visiblePlaces.map((place) => (
          <div
            key={place.id}
            className={`p-4 rounded-lg border transition-all ${
              selectedPlaceId === place.id 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg truncate">{place.name}</h3>
                  {placeRatings[place.id]?.hasRatings && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs flex items-center gap-1 cursor-pointer hover:bg-secondary/80 transition-colors"
                      onClick={() => handleViewReviews(place)}
                    >
                      <Users className="w-3 h-3" />
                      {placeRatings[place.id].totalReviews} review{placeRatings[place.id].totalReviews !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  {placeRatings[place.id]?.hasRatings && (
                    <Badge variant="default" className="text-xs flex items-center gap-1 bg-amber-500 hover:bg-amber-600">
                      <Star className="w-3 h-3 fill-white" />
                      {placeRatings[place.id].averageRating}/5
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate mb-2">
                  {place.address}
                </p>
                
                <div className="flex items-center gap-4 flex-wrap">
                  {place.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{place.rating}</span>
                    </div>
                  )}
                  
                  {place.priceLevel && (
                    <Badge variant="outline" className="text-xs">
                      {getPriceLevelText(place.priceLevel)}
                    </Badge>
                  )}
                  
                  {place.distance && (
                    <div className="flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDistance(place.distance)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handlePlaceClick(place)}
                  className="text-xs bg-primary hover:bg-primary/90"
                >
                  <StarIcon className="w-3 h-3 mr-1" />
                  Rate This Place
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDirections(place)}
                  className="text-xs"
                >
                  <Navigation className="w-3 h-3 mr-1" />
                  Directions
                </Button>
                
                {place.phoneNumber && (
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="text-xs"
                  >
                    <a href={`tel:${place.phoneNumber}`}>
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </a>
                  </Button>
                )}
                
                {place.website && (
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="text-xs"
                  >
                    <a href={place.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-3 h-3 mr-1" />
                      Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
            
            {place.photos && place.photos.length > 0 && (
              <div className="mt-3">
                <img
                  src={place.photos[0]}
                  alt={place.name}
                  className="w-full h-32 object-cover rounded-md"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        ))}
        
        {hasMorePlaces && (
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={loadMorePlaces}
              className="w-full"
            >
              Load More Places ({places.length - visibleCount} remaining)
            </Button>
          </div>
        )}
      </CardContent>

      <PlaceReviewsDialog
        place={selectedPlaceForReviews}
        open={reviewsDialogOpen}
        onOpenChange={setReviewsDialogOpen}
        onRatePlace={handleRatePlaceFromDialog}
      />
    </Card>
  );
};

export default PlacesList;