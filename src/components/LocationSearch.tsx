import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Star, Map, Navigation, Loader2, Search, PenTool, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import PlaceMapDialog from './PlaceMapDialog';
import AllPlacesMap from './AllPlacesMap';
import AgaveRating from './AgaveRating';
import { usePlaceRatings } from '@/hooks/usePlaceRatings';

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

export const LocationSearch = ({ className }: LocationSearchProps) => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [showAllPlacesMap, setShowAllPlacesMap] = useState(false);
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Convert places to PlaceDetails format for rating lookup
  const placeDetails = places.map(place => ({
    id: place.id,
    name: place.name,
    address: place.address,
    location: place.location,
    rating: place.rating,
    priceLevel: place.priceLevel,
    photos: place.photos || []
  }));
  
  const { placeRatings, loading: ratingsLoading } = usePlaceRatings(placeDetails);

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

  const searchNearbyPlaces = async (location: { lat: number; lng: number }, restaurantName?: string, isZipCodeSearch = false) => {
    setLoading(true);
    
    try {
      // Use larger radius for zip code searches and restaurant searches
      let searchRadius = 16000; // Default 10 miles
      
      if (isZipCodeSearch) {
        searchRadius = 40000; // 25 miles for zip code searches
      } else if (restaurantName) {
        searchRadius = 32000; // 20 miles for restaurant search
      }
      
      // Call the Supabase edge function to get real places
      const { data, error } = await supabase.functions.invoke('find-nearby-places', {
        body: { 
          latitude: location.lat, 
          longitude: location.lng,
          radius: searchRadius,
          restaurantName: restaurantName || undefined
        }
      });

      if (error) {
        console.error('Error from edge function:', error);
        // Provide more specific error handling
        if (error.message?.includes('Failed to fetch')) {
          toast.error('Network error. Please check your internet connection and try again.');
        } else {
          toast.error('Error searching for places. Please try again.');
        }
        return;
      }

      if (data?.places && data.places.length > 0) {
        console.log('Places data received:', data.places); // Debug logging
        // Ensure each place has proper website data
        const placesWithWebsites = data.places.map((place: any) => ({
          ...place,
          website: place.website || place.website_url || null,
          phoneNumber: place.phoneNumber || place.phone_number || place.phone || null
        }));
        
        setPlaces(placesWithWebsites);
        if (restaurantName) {
          toast.success(`Found ${placesWithWebsites.length} ${restaurantName} locations nearby!`);
        } else {
          toast.success(`Found ${placesWithWebsites.length} Mexican restaurants and tequila bars!`);
        }
      } else {
        if (restaurantName) {
          toast.info(`No ${restaurantName} locations found in your area.`);
        } else {
          toast.info('No Mexican restaurants or tequila bars found in your area.');
        }
        setPlaces([]);
      }
      
    } catch (error) {
      console.error('Error searching for places:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const searchByLocation = async (locationQuery: string) => {
    if (!locationQuery.trim()) {
      toast.error('Please enter a location to search');
      return;
    }

    setSearchLoading(true);
    
    try {
      // Enhanced location parsing - handle zip codes, cities, states, and addresses
      let searchAddress = locationQuery.trim();
      
      // Check if it's a zip code (5 digits or 5+4 format)
      const zipCodePattern = /^\d{5}(-\d{4})?$/;
      if (zipCodePattern.test(searchAddress)) {
        searchAddress = `${searchAddress}, USA`; // Add country for better geocoding
      }

      // Use Google's Geocoding API to convert location name to coordinates
      const { data: geoData, error: geoError } = await supabase.functions.invoke('get-secret', {
        body: { name: 'GOOGLE_MAPS_API_KEY' }
      });

      if (geoError || !geoData?.value) {
        toast.error('Unable to search locations. Please try again.');
        return;
      }

      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchAddress)}&key=${geoData.value}`;
      
      const response = await fetch(geocodeUrl);
      const geocodeResult = await response.json();

      if (geocodeResult.status !== 'OK' || !geocodeResult.results.length) {
        toast.error('Location not found. Please try a different search term or zip code.');
        return;
      }

      const location = geocodeResult.results[0].geometry.location;
      const coordinates = { lat: location.lat, lng: location.lng };
      
      // Store search location for map centering
      setSearchLocation(coordinates);
      
      // Use a larger search radius for zip code searches to capture more places
      const isZipCode = zipCodePattern.test(locationQuery.trim());
      await searchNearbyPlaces(coordinates, undefined, isZipCode);
      
      const locationName = geocodeResult.results[0].formatted_address;
      toast.success(`Found places in ${locationName}`);
      
    } catch (error) {
      console.error('Error searching location:', error);
      toast.error('Error searching location. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchByLocation(searchQuery);
  };

  const searchForRestaurant = async () => {
    if (!restaurantName.trim()) {
      toast.error('Please enter a restaurant name to search');
      return;
    }

    if (!userLocation && !searchQuery.trim()) {
      toast.error('Please enter a location or get your current location first');
      return;
    }

    if (searchQuery.trim()) {
      // Search in specified location
      await searchRestaurantInLocation(searchQuery, restaurantName);
    } else {
      // Search near current location
      await searchNearbyPlaces(userLocation!, restaurantName.trim());
    }
  };

  const searchRestaurantInLocation = async (locationQuery: string, restaurantName: string) => {
    if (!locationQuery.trim() || !restaurantName.trim()) {
      toast.error('Please enter both location and restaurant name');
      return;
    }

    setSearchLoading(true);
    
    try {
      // Use Google's Geocoding API to convert location name to coordinates
      const { data: geoData, error: geoError } = await supabase.functions.invoke('get-secret', {
        body: { name: 'GOOGLE_MAPS_API_KEY' }
      });

      if (geoError || !geoData?.value) {
        toast.error('Unable to search locations. Please try again.');
        return;
      }

      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationQuery)}&key=${geoData.value}`;
      
      const response = await fetch(geocodeUrl);
      const geocodeResult = await response.json();

      if (geocodeResult.status !== 'OK' || !geocodeResult.results.length) {
        toast.error('Location not found. Please try a different search term.');
        return;
      }

      const location = geocodeResult.results[0].geometry.location;
      const coordinates = { lat: location.lat, lng: location.lng };
      
      // Search for specific restaurant at this location
      await searchNearbyPlaces(coordinates, restaurantName);
      
    } catch (error) {
      console.error('Error searching location:', error);
      toast.error('Error searching location. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRestaurantSearch = () => {
    if (searchQuery.trim()) {
      // Search for restaurant in specified location
      searchRestaurantInLocation(searchQuery, restaurantName);
    } else {
      // Search for restaurant near current location
      searchForRestaurant();
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

  const openReviewForm = (place: PlaceResult) => {
    navigate('/rate-drink', {
      state: {
        selectedPlace: {
          name: place.name,
          address: place.address,
          id: place.id
        }
      }
    });
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
          Find Mexican Restaurants & Tequila Bars Anywhere 🌮
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
          Discover authentic Mexican restaurants, tequila bars, and margarita spots anywhere in the world.
        </p>
        
        {/* Location Search Bar */}
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold z-10">
              1
            </div>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter city, address, zip code, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                disabled={searchLoading || loading}
              />
              <Button 
                type="submit"
                disabled={searchLoading || loading || !searchQuery.trim()}
                variant="default"
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
              >
                {searchLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Restaurant Name Search */}
        <div className="max-w-md mx-auto mb-6">
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-bold z-10">
                2
              </div>
              <Input
                type="text"
                placeholder="Search for specific restaurant (e.g., Lupe Tortilla)"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full"
                disabled={searchLoading || loading}
              />
            </div>
            <Button 
              onClick={handleRestaurantSearch}
              disabled={searchLoading || loading || !restaurantName.trim()}
              variant="default"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              {searchLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Find All Locations
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {searchQuery.trim() 
                ? `Will search for "${restaurantName}" in ${searchQuery}` 
                : userLocation
                  ? `Will search for "${restaurantName}" near your current location`
                  : 'Enter a location above or get your current location first'
              }
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-sm text-muted-foreground">OR BROWSE ALL</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>
        
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
              Find All Mexican Places Near Me
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
        <>
          {/* Map Controls */}
          <div className="flex justify-center gap-4 mb-6">
            <Button 
              onClick={() => setShowAllPlacesMap(true)}
              variant="default" 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <Map className="w-4 h-4 mr-2" />
              View All {places.length} Places on Map
            </Button>
          </div>

          {/* All Places Map */}
          {showAllPlacesMap && (searchLocation || userLocation) && (
            <div className="mb-8">
              <Card className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">All Nearby Mexican Restaurants & Tequila Bars</CardTitle>
                    <Button 
                      onClick={() => setShowAllPlacesMap(false)}
                      variant="outline"
                      size="sm"
                    >
                      Hide Map
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <AllPlacesMap
                    places={places}
                    userLocation={searchLocation || userLocation!}
                    className="h-96"
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {places.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <Card key={place.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center relative overflow-hidden">
                {place.photos && place.photos.length > 0 ? (
                  <img 
                    src={place.photos[0]} 
                    alt={place.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`text-6xl ${place.photos && place.photos.length > 0 ? 'hidden' : ''}`}>🌮</div>
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
                <div className="flex items-center gap-2">
                  {placeRatings[place.id]?.hasRatings ? (
                    <div className="flex items-center gap-2">
                      <AgaveRating rating={Math.round(placeRatings[place.id].averageRating)} size="sm" />
                      <span className="text-sm font-medium text-green-600">
                        {placeRatings[place.id].averageRating.toFixed(1)}/5 Agaves
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({placeRatings[place.id].totalReviews} review{placeRatings[place.id].totalReviews !== 1 ? 's' : ''})
                      </span>
                    </div>
                  ) : place.rating ? (
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1">
                        {renderStars(place.rating)}
                      </div>
                      <span className="text-sm font-medium ml-1">{place.rating.toFixed(1)} Google</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No rating yet</span>
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

                  <div className="flex flex-col gap-2">
                    {place.website && (
                      <Button 
                        onClick={() => window.open(place.website, '_blank')}
                        variant="neon" 
                        size="sm"
                        className="w-full"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Visit Website
                      </Button>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => openPlaceMap(place)}
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                      >
                        <Map className="w-4 h-4 mr-2" />
                        View on Map
                      </Button>
                      <Button 
                        onClick={() => openReviewForm(place)}
                        variant="default" 
                        size="sm"
                        className="flex-1 bg-gradient-sunset hover:bg-gradient-sunset/90 text-white border-0"
                      >
                        <PenTool className="w-4 h-4 mr-2" />
                        Rate & Review
                      </Button>
                    </div>
                  </div>
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