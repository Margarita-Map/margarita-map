import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

interface PlaceMapProps {
  latitude: number;
  longitude: number;
  placeName: string;
  className?: string;
}

const PlaceMap = ({ latitude, longitude, placeName, className }: PlaceMapProps) => {
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
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude, latitude],
      zoom: 15
    });

    // Add a marker for the place
    new mapboxgl.Marker({
      color: '#ef4444'
    })
      .setLngLat([longitude, latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="p-2">
            <h3 class="font-semibold">${placeName}</h3>
            <p class="text-sm text-gray-600">📍 Mexican Restaurant/Tequila Bar</p>
          </div>`
        )
      )
      .addTo(map.current);

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [latitude, longitude, placeName, mapboxToken]);

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
        <p className="text-sm font-medium text-gray-800">{placeName}</p>
        <p className="text-xs text-gray-600">📍 View location</p>
      </div>
    </div>
  );
};

export default PlaceMap;