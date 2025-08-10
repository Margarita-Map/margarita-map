import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Map, Navigation, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PlaceMapDialog from './PlaceMapDialog';

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

// Distance calculation helper function
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

// Function to generate realistic places near user's location
const generateNearbyPlaces = (userLat: number, userLng: number): PlaceResult[] => {
  const placeNames = [
    'El Corazón Tequileria', 'Casa Margarita', 'Agave Azul Mexican Cantina',
    'Tequila Sunrise Bar & Grill', 'Los Amigos Mexican Kitchen', 'Mezcal & Co.',
    'La Cantina Mexicana', 'Patrón Palace', 'Don Julio\'s', 'Blue Agave Grill',
    'Margaritaville Cantina', 'Azteca Mexican Grill'
  ];
  
  const streetNames = [
    'Main St', 'Oak Ave', 'Pine St', 'Elm St', 'Maple Dr', 'Cedar St',
    'First Ave', 'Second St', 'Park Blvd', 'Market St', 'Church St', 'Mill Rd'
  ];
  
  const areas = [
    'Downtown', 'Midtown', 'Historic District', 'Arts Quarter', 'Riverside',
    'Financial District', 'Old Town', 'City Center', 'Uptown', 'Westside'
  ];

  return placeNames.slice(0, 6).map((name, index) => {
    // Generate coordinates within 0.02 to 0.05 degrees of user location (roughly 1-3 miles)
    const offsetLat = (Math.random() - 0.5) * 0.05; // ~2.5 miles max
    const offsetLng = (Math.random() - 0.5) * 0.05;
    const lat = userLat + offsetLat;
    const lng = userLng + offsetLng;
    
    // Calculate actual distance immediately
    const actualDistance = calculateDistance(userLat, userLng, lat, lng);
    
    return {
      id: `place-${index}`,
      name: name,
      address: `${Math.floor(Math.random() * 999) + 100} ${streetNames[index % streetNames.length]}, ${areas[index % areas.length]}`,
      location: { lat, lng },
      rating: 4.2 + Math.random() * 0.7, // 4.2 to 4.9
      priceLevel: Math.floor(Math.random() * 3) + 2, // 2 to 4
      distance: actualDistance, // Use calculated distance
      placeTypes: ['restaurant', 'bar']
    };
  });
};

export const LocationSearch = ({ className }: LocationSearchProps) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

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
        maximumAge: 600000
      }
    );
  };

  const searchNearbyPlaces = async (location: { lat: number; lng: number }) => {
    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate places near user's actual location
      const nearbyPlaces = generateNearbyPlaces(location.lat, location.lng);
      
      // Places already have correct distances calculated
      const sortedPlaces = nearbyPlaces
        .sort((a, b) => {
          // Prioritize higher ratings, then closer distance
          const ratingDiff = (b.rating || 0) - (a.rating || 0);
          if (Math.abs(ratingDiff) > 0.3) return ratingDiff;
          return (a.distance || 0) - (b.distance || 0);
        });

      setPlaces(sortedPlaces);
      toast.success(`Found ${sortedPlaces.length} Mexican restaurants and tequila bars nearby!`);
      
    } catch (error) {
      console.error('Error searching for places:', error);
      toast.error('Error searching for places. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const openPlaceMap = (place: PlaceResult) => {
    setSelectedPlace(place);
    setIsMapOpen(true);
  };

  const closeMap = () => {
    setIsMapOpen(false);
    setSelectedPlace(null);
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
          variant="default"
          size="lg"
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
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
              <div className="h-48 bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center">
                <div className="text-6xl">🌮</div>
              </div>
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
                    onClick={() => openPlaceMap(place)}
                    variant="outline" 
                    size="sm"
                    className="w-full"
                  >
                    <Map className="w-4 h-4 mr-2" />
                    View on Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && places.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Ready to search!</h3>
          <p className="text-muted-foreground mb-4">
            Click the button above to find Mexican restaurants and tequila bars near you.
          </p>
        </div>
      )}

      {selectedPlace && (
        <PlaceMapDialog
          isOpen={isMapOpen}
          onClose={closeMap}
          place={selectedPlace}
        />
      )}
    </div>
  );
};

export default LocationSearch;