import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Vehicle = Tables<"vehicles">;

const LiveMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2Ftc2tyaWxseiIsImEiOiJjbTVibGs3dTIyc3VmMm1wcTlxd3V3NTlsIn0.9SWxiKqZlRGhCBwZrFRhnw';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 0],
      zoom: 2
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Fetch initial vehicle locations
    fetchVehicles();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('vehicle-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicles'
        },
        (payload) => {
          console.log('Vehicle update received:', payload);
          if (payload.eventType === 'UPDATE') {
            updateVehicleMarker(payload.new as Vehicle);
          }
        }
      )
      .subscribe();

    return () => {
      if (map.current) {
        map.current.remove();
      }
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchVehicles = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .filter('last_location', 'not.is', null);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      setVehicles(data);
      data.forEach(vehicle => updateVehicleMarker(vehicle));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching vehicles';
      console.error('Error fetching vehicles:', error);
      setError(errorMessage);
    }
  };

  const updateVehicleMarker = (vehicle: Vehicle) => {
    if (!map.current || !vehicle.last_location) return;

    // Remove existing marker if it exists
    if (markersRef.current[vehicle.id]) {
      markersRef.current[vehicle.id].remove();
    }

    // Create marker element
    const el = document.createElement('div');
    el.className = 'vehicle-marker';
    el.style.backgroundColor = vehicle.status === 'available' ? '#4CAF50' : '#FFA000';
    el.style.width = '15px';
    el.style.height = '15px';
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';

    // Create popup
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div>
        <strong>${vehicle.make} ${vehicle.model}</strong>
        <p>Status: ${vehicle.status}</p>
        <p>License: ${vehicle.license_plate}</p>
      </div>
    `);

    // Create and store marker
    const coords = (vehicle.last_location as any).coordinates;
    const marker = new mapboxgl.Marker(el)
      .setLngLat([coords[0], coords[1]])
      .setPopup(popup)
      .addTo(map.current);

    markersRef.current[vehicle.id] = marker;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Live Fleet Tracking</h2>
      </div>
      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div ref={mapContainer} className="w-full h-[500px]" />
    </div>
  );
};

export default LiveMap;