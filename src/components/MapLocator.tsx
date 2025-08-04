/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";

interface MapLocatorProps {
  searchLocation?: string;
  onLocationSelect?: (place: google.maps.places.PlaceResult) => void;
}

const MapLocator = ({ searchLocation, onLocationSelect }: MapLocatorProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return;
      }

      // Check if API key is available
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AlzaSyCwDTKVyOFsjfKl-KW6gFzGO4fXfVunjcw';
      if (!apiKey) {
        console.error("Google Maps API key not found. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables.");
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;

      window.initMap = () => {
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

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
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
          map.setCenter(userLocation);
          
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
        },
        (error) => {
          console.log("Error getting user location:", error);
        }
      );
    }

    // Search for bars and restaurants near the location
    const service = new window.google.maps.places.PlacesService(map);
    searchNearbyBars(service, map);

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

  const searchNearbyBars = (
    service: google.maps.places.PlacesService, 
    map: google.maps.Map, 
    location?: google.maps.LatLng
  ) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const searchLocation = location || map.getCenter();
    if (!searchLocation) return;

    const request = {
      location: searchLocation,
      radius: 5000, // 5km radius
      type: "bar",
      keyword: "cocktail bar restaurant drinks"
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        results.slice(0, 20).forEach((place) => {
          if (place.geometry?.location) {
            const marker = new window.google.maps.Marker({
              position: place.geometry.location,
              map: map,
              title: place.name,
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
              
              // Show info window
              const infoWindow = new window.google.maps.InfoWindow({
                content: `
                  <div class="p-2">
                    <h3 class="font-bold text-lg">${place.name}</h3>
                    <p class="text-sm text-gray-600">${place.vicinity || ''}</p>
                    <div class="flex items-center mt-1">
                      <span class="text-yellow-500">★</span>
                      <span class="ml-1 text-sm">${place.rating || 'No rating'}</span>
                    </div>
                  </div>
                `
              });
              infoWindow.open(map, marker);
            });

            markersRef.current.push(marker);
          }
        });
      }
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

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
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
        <p className="text-xs text-muted-foreground mt-2">
          Click on markers to see bar details and ratings
        </p>
      </CardContent>
    </Card>
  );
};

export default MapLocator;