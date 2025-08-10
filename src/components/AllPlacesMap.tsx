import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

interface Place {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  distance?: number;
}

interface AllPlacesMapProps {
  places: Place[];
  userLocation: {
    lat: number;
    lng: number;
  };
  className?: string;
}

const AllPlacesMap = ({ places, userLocation, className }: AllPlacesMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  useEffect(() => {
    // Fetch Mapbox token from Supabase secrets
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-secret', {
          body: { name: 'MAPBOX_PUBLIC_TOKEN' }
        });
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          return;
        }
        
        setMapboxToken(data?.value);
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
      }
    };

    fetchMapboxToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || places.length === 0) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [userLocation.lng, userLocation.lat],
      zoom: 12
    });

    // Add user location marker (blue)
    new mapboxgl.Marker({
      color: '#3b82f6'
    })
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="p-2">
            <h3 class="font-semibold">Your Location</h3>
            <p class="text-sm text-gray-600">📍 Starting point</p>
          </div>`
        )
      )
      .addTo(map.current);

    // Add markers for all places
    places.forEach((place, index) => {
      // Use different colors for closest places
      const isClosest = index < 3;
      const markerColor = isClosest ? '#ef4444' : '#f97316';
      
      new mapboxgl.Marker({
        color: markerColor
      })
        .setLngLat([place.location.lng, place.location.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-3">
              <h3 class="font-semibold text-gray-900">${place.name}</h3>
              <p class="text-sm text-gray-600 mb-1">${place.address}</p>
              ${place.rating ? `<p class="text-sm text-yellow-600">⭐ ${place.rating}/5</p>` : ''}
              ${place.distance ? `<p class="text-sm text-blue-600">📍 ${place.distance.toFixed(1)} miles away</p>` : ''}
              ${isClosest ? '<p class="text-xs text-red-600 font-medium">🎯 Closest to you</p>' : ''}
            </div>`
          )
        )
        .addTo(map.current);
    });

    // Fit map to show all markers
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([userLocation.lng, userLocation.lat]);
    places.forEach(place => {
      bounds.extend([place.location.lng, place.location.lat]);
    });
    
    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [places, userLocation, mapboxToken]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      {!mapboxToken && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-gray-600 mb-2">Map loading...</p>
            <p className="text-sm text-gray-500">Please add your Mapbox token in settings</p>
          </div>
        </div>
      )}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
        <p className="text-sm font-medium text-gray-800">
          {places.length} Mexican Restaurants & Tequila Bars
        </p>
        <p className="text-xs text-gray-600">
          🔴 Closest • 🟠 Other locations • 🔵 Your location
        </p>
      </div>
    </div>
  );
};

export default AllPlacesMap;