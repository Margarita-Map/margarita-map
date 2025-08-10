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

// Sample data for demonstration when Google Maps API is unavailable
const samplePlaces: PlaceResult[] = [
  {
    id: '1',
    name: 'El Corazón Tequileria',
    address: '123 Main St, Downtown',
    location: { lat: 40.7128, lng: -74.0060 },
    rating: 4.8,
    priceLevel: 3,
    distance: 0.5,
    placeTypes: ['restaurant', 'bar']
  },
  {
    id: '2', 
    name: 'Casa Margarita',
    address: '456 Oak Ave, Midtown',
    location: { lat: 40.7589, lng: -73.9851 },
    rating: 4.6,
    priceLevel: 2,
    distance: 1.2,
    placeTypes: ['restaurant', 'bar']
  },
  {
    id: '3',
    name: 'Agave Azul Mexican Cantina',
    address: '789 Pine St, Historic District',
    location: { lat: 40.7505, lng: -73.9934 },
    rating: 4.7,
    priceLevel: 2,
    distance: 0.8,
    placeTypes: ['restaurant']
  },
  {
    id: '4',
    name: 'Tequila Sunrise Bar & Grill',
    address: '321 Elm St, Arts Quarter',
    location: { lat: 40.7282, lng: -73.9942 },
    rating: 4.5,
    priceLevel: 3,
    distance: 1.5,
    placeTypes: ['bar', 'restaurant']
  },
  {
    id: '5',
    name: 'Los Amigos Mexican Kitchen',
    address: '654 Maple Dr, Riverside',
    location: { lat: 40.7361, lng: -73.9904 },
    rating: 4.4,
    priceLevel: 2,
    distance: 2.1,
    placeTypes: ['restaurant']
  },
  {
    id: '6',
    name: 'Mezcal & Co.',
    address: '987 Cedar St, Financial District',
    location: { lat: 40.7074, lng: -74.0113 },
    rating: 4.9,
    priceLevel: 4,
    distance: 0.7,
    placeTypes: ['bar']
  }
];

export const LocationSearch = ({ className }: LocationSearchProps) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

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
        // Show demo results even without location
        searchNearbyPlaces({ lat: 40.7128, lng: -74.0060 }); // Default to NYC
        toast.info('Using demo location. Enable location services for personalized results.');
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
      
      // Calculate distances and sort by rating and proximity
      const placesWithDistance = samplePlaces.map(place => ({
        ...place,
        distance: calculateDistance(
          location.lat,
          location.lng,
          place.location.lat,
          place.location.lng
        )
      }));

      const sortedPlaces = placesWithDistance
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

      {!loading && places.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Ready to search!</h3>
          <p className="text-muted-foreground mb-4">
            Click the button above to find Mexican restaurants and tequila bars near you.
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;