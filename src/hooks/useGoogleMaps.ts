/// <reference types="google.maps" />
import { useEffect, useState } from 'react';

export interface PlaceDetails {
  id: string;
  name: string;
  address: string;
  rating?: number;
  priceLevel?: number;
  phoneNumber?: string;
  website?: string;
  photos?: string[];
  location: {
    lat: number;
    lng: number;
  };
}

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setError('Google Maps API key not found');
      return;
    }

    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      setError('Failed to load Google Maps API');
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const geocodeAddress = async (address: string): Promise<google.maps.LatLng | null> => {
    if (!isLoaded || !window.google) return null;

    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].geometry.location);
        } else {
          resolve(null);
        }
      });
    });
  };

  const searchNearbyPlaces = async (
    location: google.maps.LatLng,
    radius: number = 5000,
    type: string = 'bar'
  ): Promise<PlaceDetails[]> => {
    if (!isLoaded || !window.google) return [];

    return new Promise((resolve) => {
      const map = new window.google.maps.Map(document.createElement('div'));
      const service = new window.google.maps.places.PlacesService(map);

      const request = {
        location,
        radius,
        type: type,
        keyword: 'cocktail bar restaurant drinks'
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const places: PlaceDetails[] = results.map(place => ({
            id: place.place_id || '',
            name: place.name || '',
            address: place.vicinity || '',
            rating: place.rating,
            priceLevel: place.price_level,
            location: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            }
          }));
          resolve(places);
        } else {
          resolve([]);
        }
      });
    });
  };

  const getPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
    if (!isLoaded || !window.google) return null;

    return new Promise((resolve) => {
      const map = new window.google.maps.Map(document.createElement('div'));
      const service = new window.google.maps.places.PlacesService(map);

      const request = {
        placeId,
        fields: ['name', 'formatted_address', 'rating', 'price_level', 'formatted_phone_number', 'website', 'photos', 'geometry']
      };

      service.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const placeDetails: PlaceDetails = {
            id: placeId,
            name: place.name || '',
            address: place.formatted_address || '',
            rating: place.rating,
            priceLevel: place.price_level,
            phoneNumber: place.formatted_phone_number,
            website: place.website,
            photos: place.photos?.map(photo => photo.getUrl({ maxWidth: 400 })) || [],
            location: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            }
          };
          resolve(placeDetails);
        } else {
          resolve(null);
        }
      });
    });
  };

  return {
    isLoaded,
    error,
    geocodeAddress,
    searchNearbyPlaces,
    getPlaceDetails
  };
};