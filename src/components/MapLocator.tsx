/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    initMapLocator?: () => void;
  }
}

interface MapLocatorProps {
  searchLocation?: string;
  onLocationSelect?: (place: google.maps.places.PlaceResult) => void;
  onPlacesFound?: (places: PlaceDetails[]) => void;
}

interface PlaceDetails {
  id: string;
  name: string;
  address: string;
  rating?: number;
  priceLevel?: number;
  phoneNumber?: string;
  website?: string;
  photos?: string[];
  distance?: number;
  location: {
    lat: number;
    lng: number;
  };
}

const MapLocator = ({ searchLocation, onLocationSelect, onPlacesFound }: MapLocatorProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const userLocationRef = useRef<google.maps.LatLng | null>(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Wait for existing script to load
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps) {
            setIsLoaded(true);
            clearInterval(checkLoaded);
          }
        }, 100);
        return;
      }

      const apiKey = 'AIzaSyCwDTKVy0FsjfKI-KW6gFzGO4fXfVunjcw';
      if (!apiKey) {
        console.error("Google Maps API key not configured.");
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initMapLocator`;
      script.async = true;
      script.defer = true;

      window.initMapLocator = () => {
        setIsLoaded(true);
      };

      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return;

    // Initialize map - will be updated with user location
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { lat: 39.8283, lng: -98.5795 }, // Center of US as default
      styles: [
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }]
        },
        {
          featureType: "poi.business",
          stylers: [{ visibility: "on" }]
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#f5f1e6" }]
        }
      ]
    });

    mapInstanceRef.current = map;

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          const userLatLng = new window.google.maps.LatLng(userLocation.lat, userLocation.lng);
          userLocationRef.current = userLatLng;
          map.setCenter(userLocation);
          map.setZoom(14); // Zoom in closer to user location
          
          // Add user location marker
          new window.google.maps.Marker({
            position: userLocation,
            map: map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2
            },
            title: "Your Location"
          });

          // Now search for bars near user's actual location
          const service = new window.google.maps.places.PlacesService(map);
          searchNearbyBars(service, map, userLatLng);
        },
        (error) => {
          console.log("Error getting user location:", error);
        }
      );
    }

    // Only search after getting user location
    // searchNearbyBars will be called after geolocation success

  }, [isLoaded]);

  useEffect(() => {
    if (!searchLocation || !mapInstanceRef.current || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchLocation }, (results, status) => {
      if (status === "OK" && results && results[0] && mapInstanceRef.current) {
        const location = results[0].geometry.location;
        mapInstanceRef.current.setCenter(location);
        mapInstanceRef.current.setZoom(14);

        // Search for bars near the new location
        const service = new window.google.maps.places.PlacesService(mapInstanceRef.current);
        searchNearbyBars(service, mapInstanceRef.current, location);
      }
    });
  }, [searchLocation]);

  const loadSupabaseRestaurants = async (map: google.maps.Map, searchLocation: google.maps.LatLng) => {
    try {
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('Error fetching restaurants:', error);
        return [];
      }

      const restaurantDetails: PlaceDetails[] = [];
      const referenceLocation = userLocationRef.current || searchLocation;

      restaurants?.forEach(restaurant => {
        if (restaurant.latitude && restaurant.longitude) {
          const restaurantLatLng = new window.google.maps.LatLng(
            restaurant.latitude,
            restaurant.longitude
          );

          // Calculate distance
          let distance: number | undefined;
          if (referenceLocation) {
            const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(
              referenceLocation,
              restaurantLatLng
            );
            distance = distanceInMeters * 0.000621371; // Convert meters to miles
            
            // Only include restaurants within 15 miles
            if (distance > 15) return;
          }

          const restaurantDetail: PlaceDetails = {
            id: restaurant.id,
            name: restaurant.name,
            address: restaurant.address,
            phoneNumber: restaurant.phone,
            website: restaurant.website,
            photos: [],
            distance,
            location: {
              lat: restaurant.latitude,
              lng: restaurant.longitude
            }
          };

          restaurantDetails.push(restaurantDetail);

          // Create marker with different icon for Supabase restaurants
          const marker = new window.google.maps.Marker({
            position: { lat: restaurant.latitude, lng: restaurant.longitude },
            map: map,
            title: restaurant.name,
            icon: {
              url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#8B5CF6"/>
                  <circle cx="12" cy="9" r="2.5" fill="white"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(30, 30)
            }
          });

          // Add click listener to marker
          marker.addListener("click", () => {
            const websiteLink = restaurant.website 
              ? `<br><a href="${restaurant.website}" target="_blank" style="color: #8B5CF6; text-decoration: underline;">Visit Website</a>`
              : '';
            
            const phoneLink = restaurant.phone 
              ? `<br><a href="tel:${restaurant.phone}" style="color: #8B5CF6; text-decoration: underline;">${restaurant.phone}</a>`
              : '';
            
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div class="p-2">
                  <h3 class="font-bold text-lg">${restaurant.name}</h3>
                  <p class="text-sm text-gray-600">${restaurant.address}</p>
                  <div class="flex items-center mt-1">
                    <span class="text-purple-500 text-xs font-medium">★ Member Restaurant</span>
                    ${distance ? `<span class="ml-2 text-xs text-gray-500">${distance.toFixed(1)} miles</span>` : ''}
                  </div>
                  ${phoneLink}
                  ${websiteLink}
                </div>
              `
            });
            infoWindow.open(map, marker);
          });

          markersRef.current.push(marker);
        }
      });

      return restaurantDetails;
    } catch (error) {
      console.error('Error loading Supabase restaurants:', error);
      return [];
    }
  };

  const searchNearbyBars = async (
    service: google.maps.places.PlacesService, 
    map: google.maps.Map, 
    location?: google.maps.LatLng
  ) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const searchLocation = location || map.getCenter();
    if (!searchLocation) return;

    // Load Supabase restaurants first
    const supabaseRestaurants = await loadSupabaseRestaurants(map, searchLocation);

    // Variables for managing multiple searches
    let allResults: google.maps.places.PlaceResult[] = [];
    let searchesCompleted = 0;
    const totalSearches = 4; // Increased from 2 to 4 searches

    // First search for mexican restaurants and tequila bars (closer radius for better relevance)
    const mexicanRestaurantRequest = {
      location: searchLocation,
      radius: 5000, // 3 miles radius for more relevant results
      type: "restaurant",
      keyword: "mexican food margaritas tequila cantina mexican restaurant tex mex tequileria"
    };

    // Second search specifically for cocktail bars and lounges
    const cocktailBarRequest = {
      location: searchLocation,
      radius: 5000, // 3 miles radius
      type: "bar",
      keyword: "cocktail bar tequila bar margaritas mezcal agave cocktail lounge"
    };

    // Third search for more Mexican restaurant variations
    const mexicanVariationsRequest = {
      location: searchLocation,
      radius: 4000, // Slightly smaller radius for closer results
      type: "restaurant", 
      keyword: "authentic mexican tacos burritos quesadillas mexican grill mexican cuisine"
    };

    // Fourth search for casual dining and chains that serve margaritas
    const casualDiningRequest = {
      location: searchLocation,
      radius: 6000, // Slightly larger to catch chain restaurants
      type: "restaurant",
      keyword: "chilis applebees tgi fridays olive garden red lobster margaritas happy hour"
    };

    const handleSearchResults = (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus, searchType: string) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        // Add results to allResults, avoiding duplicates
        results.forEach(result => {
          if (result.place_id && !allResults.some(existing => existing.place_id === result.place_id)) {
            allResults.push(result);
          }
        });
      }
      
      searchesCompleted++;
      console.log(`${searchType} search completed. Found ${results?.length || 0} results.`);
      
      if (searchesCompleted === totalSearches) {
        processAllResults();
      }
    };

    const processAllResults = () => {
      const placeDetails: PlaceDetails[] = [...supabaseRestaurants];
      const processedPlaces: PlaceDetails[] = [];
      let processedCount = 0;
      
      console.log(`Processing ${allResults.length} unique results from all searches`);
      
      // Sort results by distance first (based on proximity to search location)
      const sortedResults = allResults.sort((a, b) => {
        if (!a.geometry?.location || !b.geometry?.location) return 0;
        
        const aDistance = window.google.maps.geometry.spherical.computeDistanceBetween(
          searchLocation,
          new window.google.maps.LatLng(a.geometry.location.lat(), a.geometry.location.lng())
        );
        const bDistance = window.google.maps.geometry.spherical.computeDistanceBetween(
          searchLocation,
          new window.google.maps.LatLng(b.geometry.location.lat(), b.geometry.location.lng())
        );
        
        return aDistance - bDistance;
      });
      
      // Process each place and get detailed information
      const processPlace = (place: google.maps.places.PlaceResult, index: number) => {
        if (place.geometry?.location && place.place_id) {
          // Get detailed place information including website
          service.getDetails({
            placeId: place.place_id,
            fields: ['name', 'formatted_address', 'rating', 'price_level', 'formatted_phone_number', 'website', 'photos', 'geometry']
          }, (detailedPlace, detailStatus) => {
            if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK && detailedPlace) {
              // Calculate distance from user location or search center
              const referenceLocation = userLocationRef.current || searchLocation;
              let distance: number | undefined;
              
              if (referenceLocation) {
                const placeLatLng = new window.google.maps.LatLng(
                  place.geometry!.location!.lat(),
                  place.geometry!.location!.lng()
                );
                const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(
                  referenceLocation,
                  placeLatLng
                );
                distance = distanceInMeters * 0.000621371; // Convert meters to miles
              }

              // Create place details object with full information
              const placeDetail: PlaceDetails = {
                id: place.place_id || '',
                name: detailedPlace.name || place.name || '',
                address: detailedPlace.formatted_address || place.vicinity || '',
                rating: detailedPlace.rating || place.rating,
                priceLevel: detailedPlace.price_level || place.price_level,
                phoneNumber: detailedPlace.formatted_phone_number,
                website: detailedPlace.website,
                photos: detailedPlace.photos?.map(photo => photo.getUrl({ maxWidth: 400 })) || [],
                distance,
                location: {
                  lat: place.geometry!.location!.lat(),
                  lng: place.geometry!.location!.lng()
                }
              };
              
              processedPlaces.push(placeDetail);
              processedCount++;

              const marker = new window.google.maps.Marker({
                position: place.geometry!.location,
                map: map,
                title: placeDetail.name,
                icon: {
                  url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#10B981"/>
                      <circle cx="12" cy="9" r="2.5" fill="white"/>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(30, 30)
                }
              });

              // Add click listener to marker
              marker.addListener("click", () => {
                if (onLocationSelect) {
                  onLocationSelect(place);
                }
                
                // Show info window with website link if available
                const websiteLink = placeDetail.website 
                  ? `<br><a href="${placeDetail.website}" target="_blank" style="color: #10B981; text-decoration: underline;">Visit Website</a>`
                  : '';
                
                const infoWindow = new window.google.maps.InfoWindow({
                  content: `
                    <div class="p-2">
                      <h3 class="font-bold text-lg">${placeDetail.name}</h3>
                      <p class="text-sm text-gray-600">${placeDetail.address}</p>
                      <div class="flex items-center mt-1">
                        <span class="text-yellow-500">★</span>
                        <span class="ml-1 text-sm">${placeDetail.rating || 'No rating'}</span>
                        ${distance ? `<span class="ml-2 text-xs text-gray-500">${distance.toFixed(1)} miles</span>` : ''}
                      </div>
                      ${websiteLink}
                    </div>
                  `
                });
                infoWindow.open(map, marker);
              });

              markersRef.current.push(marker);

              // If this is the last place, combine and sort all places by distance
              if (processedCount === Math.min(sortedResults.length, 30)) {
                const allPlaces = [...placeDetails, ...processedPlaces];
                const sortedPlaces = allPlaces
                  .filter(place => place.distance !== undefined && place.distance <= 10) // Only show places within 10 miles
                  .sort((a, b) => (a.distance || 0) - (b.distance || 0));
                  
                console.log(`Final sorted results: ${sortedPlaces.length} places`);
                
                if (onPlacesFound) {
                  onPlacesFound(sortedPlaces);
                }
              }
            }
          });
        }
      };

      // Process up to 30 places (closer results are better)
      sortedResults.slice(0, 30).forEach(processPlace);
      
      // If no results from Google, still show Supabase restaurants
      if (sortedResults.length === 0 && supabaseRestaurants.length > 0 && onPlacesFound) {
        const sortedPlaces = supabaseRestaurants
          .filter(place => place.distance !== undefined && place.distance <= 10)
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));
        onPlacesFound(sortedPlaces);
      }
    };

    // Execute all four searches
    service.nearbySearch(mexicanRestaurantRequest, (results, status) => {
      handleSearchResults(results, status, "Mexican Restaurant");
    });

    service.nearbySearch(cocktailBarRequest, (results, status) => {
      handleSearchResults(results, status, "Cocktail Bar");
    });

    service.nearbySearch(mexicanVariationsRequest, (results, status) => {
      handleSearchResults(results, status, "Mexican Variations");
    });

    service.nearbySearch(casualDiningRequest, (results, status) => {
      handleSearchResults(results, status, "Casual Dining");
    });
  };

  const handleRecenterMap = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          mapInstanceRef.current!.setCenter(userLocation);
          mapInstanceRef.current!.setZoom(14);
        }
      );
    }
  };

  // Show configuration message if needed
  if (false) { // Temporarily disabled since we have the API key
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Map Configuration Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Google Maps API key is required to show the map. Please add your API key to enable the map locator feature.
          </p>
          <Button variant="outline" asChild>
            <a 
              href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Get API Key
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Nearby Bars & Restaurants
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRecenterMap}
            className="flex items-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            My Location
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapRef} 
          className="w-full h-96 rounded-lg border border-border"
          style={{ minHeight: "400px" }}
        >
          {!isLoaded && (
            <div className="flex items-center justify-center h-full bg-muted">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-2 space-y-1">
          <p>Click on markers to see bar details and ratings</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Member Restaurants</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Google Places</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapLocator;