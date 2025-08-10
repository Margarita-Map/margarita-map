import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface PlaceMapProps {
  latitude: number;
  longitude: number;
  placeName: string;
  className?: string;
}

const PlaceMap = ({ latitude, longitude, placeName, className }: PlaceMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // For now, using a placeholder token - user needs to add their Mapbox token
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    
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
  }, [latitude, longitude, placeName]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
        <p className="text-sm font-medium text-gray-800">{placeName}</p>
        <p className="text-xs text-gray-600">📍 View location</p>
      </div>
    </div>
  );
};

export default PlaceMap;