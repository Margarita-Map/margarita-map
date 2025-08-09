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
  onMapReady?: () => void;
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

const MapLocator = ({ searchLocation, onLocationSelect, onPlacesFound, onMapReady }: MapLocatorProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userLocationRef = useRef<google.maps.LatLng | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const pendingSearchRef = useRef<string | null>(null);

  // Use the shared Google Maps state from useGoogleMaps hook
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps is already loaded by the useGoogleMaps hook
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Wait for the shared Google Maps instance to load
    const checkLoaded = setInterval(() => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        clearInterval(checkLoaded);
      }
    }, 100);

    return () => clearInterval(checkLoaded);
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google || isMapInitialized) return;

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
    setIsMapInitialized(true);
    
    // Process any pending search that was queued before map was ready
    if (pendingSearchRef.current) {
      const searchTerm = pendingSearchRef.current;
      pendingSearchRef.current = null;
      // Use setTimeout to ensure map is fully ready
      setTimeout(() => {
        performSearch(searchTerm);
      }, 100);
    }
    
    // Notify parent that map is ready for searches
    if (onMapReady) {
      onMapReady();
    }

    // Get user's location for reference but don't automatically search
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          const userLatLng = new window.google.maps.LatLng(userLocation.lat, userLocation.lng);
          userLocationRef.current = userLatLng;
          
          // Only center on user location if no pending search exists
          if (!pendingSearchRef.current) {
            map.setCenter(userLocation);
            map.setZoom(14);
            
            // Clear any saved search location since we're using current location
            localStorage.removeItem('lastSearchLocation');
            
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

            // Only search near user's location if no specific search is pending
            const service = new window.google.maps.places.PlacesService(map);
            searchNearbyBars(service, map, userLatLng);
          }
        },
        (error) => {
          console.log("Error getting user location:", error);
          // Map is still initialized even without user location
        }
      );
    }

  }, [isLoaded, isMapInitialized]);

  const performSearch = (searchTerm: string) => {
    if (!mapInstanceRef.current || !window.google || !isMapInitialized) {
      console.log("Search blocked - map not ready:", { map: !!mapInstanceRef.current, google: !!window.google, initialized: isMapInitialized });
      return;
    }

    console.log("Performing search for:", searchTerm);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchTerm }, (results, status) => {
      console.log("Geocoding result:", { status, results: results?.length });
      if (status === "OK" && results && results[0] && mapInstanceRef.current) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        console.log("Setting map center to:", { lat, lng, address: results[0].formatted_address });
        
        // Update map center and zoom with animation
        mapInstanceRef.current.panTo(location);
        mapInstanceRef.current.setZoom(12);

        // Search for bars near the new location, but also check if the search is for a specific place
        const service = new window.google.maps.places.PlacesService(mapInstanceRef.current);
        searchNearbyBars(service, mapInstanceRef.current, location, searchTerm);
      } else {
        console.error("Geocoding failed:", status);
      }
    });
  };

  useEffect(() => {
    if (!searchLocation) return;

    // If map is ready, perform search immediately
    if (mapInstanceRef.current && window.google && isMapInitialized) {
      performSearch(searchLocation);
    } else {
      // Queue the search to be performed when map becomes ready
      pendingSearchRef.current = searchLocation;
    }
  }, [searchLocation, isMapInitialized]);

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
    location?: google.maps.LatLng,
    originalSearchQuery?: string
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
    let totalSearches = 4; // Base number of searches
    let isSpecificPlaceSearch = false;
    let isZipCode = false;

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
              // Calculate distance from search location (prioritize search over user's current location for out-of-town searches)
              const referenceLocation = searchLocation;
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
              if (processedCount === Math.min(sortedResults.length, 50)) {
                const allPlaces = [...placeDetails, ...processedPlaces];
                
                // Debug logging
                console.log(`Total places before filtering: ${allPlaces.length}`);
                console.log('Places with distances:', allPlaces.map(p => ({ name: p.name, distance: p.distance })));
                
                // Much more generous filtering for out-of-town searches - include places within search area OR with undefined distance
                let sortedPlaces = allPlaces
                  .filter(place => !place.distance || place.distance <= 50); // Include undefined distances and places within reasonable driving distance
                  
                // Normal sorting by distance
                sortedPlaces.sort((a, b) => {
                  // Sort by distance, putting undefined distances at the end
                  if (!a.distance && !b.distance) return 0;
                  if (!a.distance) return 1;
                  if (!b.distance) return -1;
                  return a.distance - b.distance;
                });
                  
                console.log(`Final sorted results: ${sortedPlaces.length} places`);
                console.log('Top 3 places:', sortedPlaces.slice(0, 3).map(p => ({ name: p.name, distance: p.distance })));
                
                if (onPlacesFound) {
                  onPlacesFound(sortedPlaces);
                }
              }
            }
          });
        }
      };

      // Process up to 50 places to get more variety
      sortedResults.slice(0, 50).forEach(processPlace);
      
      // If no results from Google, still show Supabase restaurants
      if (sortedResults.length === 0 && supabaseRestaurants.length > 0 && onPlacesFound) {
        const sortedPlaces = supabaseRestaurants
          .filter(place => place.distance !== undefined && place.distance <= 10)
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));
        onPlacesFound(sortedPlaces);
      }
    };

    // Check if this looks like a specific restaurant search (contains restaurant name)
    if (originalSearchQuery) {
      const queryLower = originalSearchQuery.toLowerCase();
      // More inclusive detection - look for restaurant names, food types, or specific locations
      const hasRestaurantIndicators = /\b(restaurant|bar|grill|cafe|pizza|mexican|italian|chinese|thai|sushi|bbq|steakhouse|diner|bistro|pub|tavern|cantina|tortilla|taco|burrito|kitchen|house|place|food|dining|eatery|brewery|lounge|club)\b/.test(queryLower);
      const hasLocationIndicators = /\b(tx|texas|ca|california|ny|new york|fl|florida|street|st|avenue|ave|road|rd|drive|dr|blvd|boulevard|austin|dallas|houston|san antonio|los angeles|chicago|miami|atlanta|denver|seattle|portland|vegas|phoenix|city|downtown|north|south|east|west)\b/.test(queryLower);
      const hasSpecificPlaceName = queryLower.split(' ').length >= 2; // If multiple words, likely a specific place
      isZipCode = /^\d{5}(-\d{4})?$/.test(originalSearchQuery.trim()); // Detect zip codes
      
      console.log('Search query analysis:', {
        query: originalSearchQuery,
        hasRestaurantIndicators,
        hasLocationIndicators,
        hasSpecificPlaceName,
        isZipCode,
        queryLower
      });
      
      if (hasRestaurantIndicators || hasLocationIndicators || hasSpecificPlaceName) {
        isSpecificPlaceSearch = true;
        totalSearches = 3; // Do text search + two broader searches for context
        console.log('Treating as specific place search');
      } else if (isZipCode) {
        // For zip codes, skip text search and just do general nearby searches
        console.log('Detected zip code - doing general area search');
        totalSearches = 4; // Do all the general searches
        isSpecificPlaceSearch = false;
      } else {
        console.log('Treating as general location search');
      }
    }

    // Always do text search if there's a search query (unless it's just a zip code)
    if (originalSearchQuery && !isZipCode) {
      console.log('Executing text search for:', originalSearchQuery);
      service.textSearch({
        query: originalSearchQuery,
        location: searchLocation,
        radius: 50000 // 50km radius for worldwide coverage
      }, (results, status) => {
        console.log('Text search results:', { status, resultsCount: results?.length, query: originalSearchQuery });
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          console.log('Text search found places:', results.map(r => ({ name: r.name, place_id: r.place_id })));
          // Add ALL matching results, not just the first one
          results.forEach(result => {
            if (result && result.place_id && !allResults.some(existing => existing.place_id === result.place_id)) {
              allResults.push(result);
            }
          });
        } else {
          console.log('Text search failed or returned no results:', status);
        }
        searchesCompleted++;
        console.log('Search completed:', searchesCompleted, '/', totalSearches);
        if (searchesCompleted === totalSearches) {
          processAllResults();
        }
      });
    } else {
      // If no text search, increment the counter
      searchesCompleted++;
      console.log('Skipping text search, search completed:', searchesCompleted, '/', totalSearches);
      if (searchesCompleted === totalSearches) {
        processAllResults();
      }
    }

    // For specific searches, also do broader searches for context
    if (isSpecificPlaceSearch) {
      // First context search - broader restaurant search
      const contextRequest1 = {
        location: searchLocation,
        radius: 10000, // 6+ mile radius for context
        type: "restaurant"
      };
      
      // Second context search - general food and drink establishments
      const contextRequest2 = {
        location: searchLocation,  
        radius: 8000, // 5 mile radius
        type: "bar"
      };
      
      service.nearbySearch(contextRequest1, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          results.forEach(result => {
            if (result.place_id && !allResults.some(existing => existing.place_id === result.place_id)) {
              allResults.push(result);
            }
          });
        }
        searchesCompleted++;
        if (searchesCompleted === totalSearches) {
          processAllResults();
        }
      });
      
      service.nearbySearch(contextRequest2, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          results.forEach(result => {
            if (result.place_id && !allResults.some(existing => existing.place_id === result.place_id)) {
              allResults.push(result);
            }
          });
        }
        searchesCompleted++;
        if (searchesCompleted === totalSearches) {
          processAllResults();
        }
      });
      
      return; // Don't continue with other generic searches
    }

    // First search for mexican restaurants and tequila bars (expanded radius)
    const mexicanRestaurantRequest = {
      location: searchLocation,
      radius: 8000, // ~5 miles radius for more results
      type: "restaurant",
      keyword: "mexican food margaritas tequila cantina mexican restaurant tex mex tequileria"
    };

    // Second search specifically for cocktail bars and lounges
    const cocktailBarRequest = {
      location: searchLocation,
      radius: 8000, // ~5 miles radius
      type: "bar",
      keyword: "cocktail bar tequila bar margaritas mezcal agave cocktail lounge"
    };

    // Third search for more Mexican restaurant variations
    const mexicanVariationsRequest = {
      location: searchLocation,
      radius: 7000, // Expanded for more results
      type: "restaurant", 
      keyword: "authentic mexican tacos burritos quesadillas mexican grill mexican cuisine"
    };

    // Fourth search for casual dining and chains that serve margaritas
    const casualDiningRequest = {
      location: searchLocation,
      radius: 10000, // Larger to catch chain restaurants
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