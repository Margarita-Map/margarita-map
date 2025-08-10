import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, ExternalLink, Navigation, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PlaceResult {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  priceLevel?: number;
  phoneNumber?: string;
  website?: string;
  photos?: string[];
  distance?: number;
  placeTypes?: string[];
}

interface LocationSearchProps {
  className?: string;
}

export const LocationSearch = ({ className }: LocationSearchProps) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        setLocationLoading(false);
        searchNearbyPlaces(location);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationLoading(false);
        toast.error('Unable to get your location. Please enable location services.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    );
  };

  const searchNearbyPlaces = async (location: { lat: number; lng: number }) => {
    if (!window.google?.maps) {
      toast.error('Google Maps not loaded');
      return;
    }

    setLoading(true);
    try {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      
      // Search for Mexican restaurants, tequila bars, and margarita bars
      const searchTerms = [
        'Mexican restaurant',
        'tequila bar',
        'margarita bar',
        'Mexican cantina',
        'tequileria'
      ];

      const allResults: PlaceResult[] = [];
      
      for (const term of searchTerms) {
        await new Promise<void>((resolve) => {
          const request = {
            location: new google.maps.LatLng(location.lat, location.lng),
            radius: 25000, // 25km radius
            keyword: term,
            type: 'restaurant'
          };

          service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              const processedResults = results.slice(0, 5).map((place): PlaceResult => {
                const distance = place.geometry?.location ? 
                  calculateDistance(
                    location.lat, 
                    location.lng,
                    place.geometry.location.lat(),
                    place.geometry.location.lng()
                  ) : undefined;

                return {
                  id: place.place_id || '',
                  name: place.name || '',
                  address: place.vicinity || '',
                  location: {
                    lat: place.geometry?.location?.lat() || 0,
                    lng: place.geometry?.location?.lng() || 0
                  },
                  rating: place.rating,
                  priceLevel: place.price_level,
                  photos: place.photos?.slice(0, 1).map(photo => 
                    photo.getUrl({ maxWidth: 400, maxHeight: 300 })
                  ),
                  distance,
                  placeTypes: place.types
                };
              });
              
              allResults.push(...processedResults);
            }
            resolve();
          });
        });
      }

      // Remove duplicates and sort by rating and distance
      const uniqueResults = allResults.filter((place, index, self) => 
        index === self.findIndex(p => p.id === place.id)
      );

      // Prioritize places with good ratings (4.0+) and closer distances
      const sortedResults = uniqueResults
        .filter(place => place.rating && place.rating >= 3.5) // Filter for good ratings
        .sort((a, b) => {
          // Prioritize higher ratings, then closer distance
          const ratingDiff = (b.rating || 0) - (a.rating || 0);
          if (Math.abs(ratingDiff) > 0.3) return ratingDiff;
          return (a.distance || 0) - (b.distance || 0);
        })
        .slice(0, 12); // Show top 12 results

      setPlaces(sortedResults);
      
      if (sortedResults.length === 0) {
        toast.info('No highly rated Mexican restaurants or tequila bars found nearby. Try expanding your search area.');
      }
    } catch (error) {
      console.error('Error searching for places:', error);
      toast.error('Error searching for places. Please try again.');
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

  const openInMaps = (place: PlaceResult) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const mapsUrl = isIOS 
      ? `maps://maps.google.com/maps?daddr=${place.location.lat},${place.location.lng}&amp;ll=`
      : `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`;
    
    window.open(mapsUrl, '_blank');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : index < rating 
              ? 'fill-yellow-400/50 text-yellow-400' 
              : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className={className}>
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Find Mexican Restaurants & Tequila Bars Near You 🌮
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
          Discover authentic Mexican restaurants, tequila bars, and margarita spots based on your location.
        </p>
        <Button 
          onClick={getCurrentLocation} 
          disabled={locationLoading || loading}
          variant="tropical"
          size="lg"
        >
          {locationLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Getting Location...
            </>
          ) : (
            <>
              <Navigation className="w-5 h-5 mr-2" />
              Find Places Near Me
            </>
          )}
        </Button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 mx-auto animate-spin mb-4" />
          <p className="text-muted-foreground">Searching for the best Mexican restaurants and tequila bars...</p>
        </div>
      )}

      {places.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <Card key={place.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {place.photos && place.photos[0] && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={place.photos[0]} 
                    alt={place.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-tight">{place.name}</CardTitle>
                  {place.priceLevel && (
                    <Badge variant="outline" className="shrink-0">
                      {'$'.repeat(place.priceLevel)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {place.rating && (
                    <>
                      <div className="flex items-center gap-1">
                        {renderStars(place.rating)}
                      </div>
                      <span className="text-sm font-medium ml-1">{place.rating.toFixed(1)}</span>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground leading-tight">{place.address}</span>
                  </div>
                  
                  {place.distance && (
                    <p className="text-sm text-muted-foreground">
                      {place.distance.toFixed(1)} miles away
                    </p>
                  )}

                  <Button 
                    onClick={() => openInMaps(place)}
                    variant="outline" 
                    size="sm"
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in Maps
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && places.length === 0 && userLocation && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No results found nearby</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't find any highly-rated Mexican restaurants or tequila bars in your immediate area.
          </p>
          <Button onClick={() => userLocation && searchNearbyPlaces(userLocation)} variant="outline">
            Try searching again
          </Button>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;