import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PubLocation } from '../data/debrecenPubs';
import { PubRatingComponent } from './PubRating';
import { ratingService } from '../services/ratingService';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PubMapProps {
  pubs: PubLocation[];
  selectedPubs: PubLocation[];
  optimizedRoute?: PubLocation[];
  onPubSelect: (pub: PubLocation) => void;
  onPubDeselect: (pub: PubLocation) => void;
}

export const PubMap: React.FC<PubMapProps> = ({ 
  pubs, 
  selectedPubs, 
  optimizedRoute, 
  onPubSelect, 
  onPubDeselect 
}: PubMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const routeLineRef = useRef<L.Polyline | null>(null);
  const [selectedPubForRating, setSelectedPubForRating] = useState<PubLocation | null>(null);
  const [pubRatings, setPubRatings] = useState<{ [pubId: string]: number }>({});

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map centered on Debrecen
    const map = L.map(mapRef.current).setView([47.5316, 21.6273], 14);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Load ratings for all pubs
  const loadRatings = async () => {
    const ratings: { [pubId: string]: number } = {};
    for (const pub of pubs) {
      try {
        console.log(`Loading rating for pub: ${pub.id} (${pub.name})`);
        const avgRating = await ratingService.getAverageRating(pub.id);
        console.log(`Rating for ${pub.id}: ${avgRating}`);
        ratings[pub.id] = avgRating;
      } catch (error) {
        console.warn(`Failed to load rating for pub ${pub.id}:`, error);
      }
    }
    setPubRatings(ratings);
    console.log('Final pubRatings:', ratings);
  };

  useEffect(() => {
    loadRatings();
  }, [pubs]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = {};

    // Add markers for all pubs
    pubs.forEach((pub: PubLocation) => {
      const isSelected = selectedPubs.some((selected: PubLocation) => selected.id === pub.id);
      
      // Create custom icon based on selection and type
      const iconColor = isSelected ? '#059669' : getTypeColor(pub.type);
      const iconHtml = `
        <div style="
          background-color: ${iconColor};
          width: 25px;
          height: 25px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">
          ${getTypeIcon(pub.type)}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-pub-marker',
        iconSize: [25, 25],
        iconAnchor: [12, 12]
      });

      const avgRating = pubRatings[pub.id] || 0;
      const ratingStars = avgRating > 0 ? '⭐'.repeat(Math.round(avgRating)) : 'Még nincs értékelés';
      
      const marker = L.marker([pub.lat, pub.lng], { icon: customIcon })
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937;">${pub.name}</h3>
            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${pub.address}</p>
            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">${pub.description}</p>
            <div style="margin: 0 0 8px 0; color: #f59e0b; font-size: 12px;">
              ${avgRating > 0 ? `${avgRating}/5 ${ratingStars}` : ratingStars}
            </div>
            <div style="display: flex; gap: 4px; margin-bottom: 8px;">
              <button 
                onclick="window.togglePub('${pub.id}')"
                style="
                  background-color: ${isSelected ? '#dc2626' : '#059669'};
                  color: white;
                  border: none;
                  padding: 6px 12px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 12px;
                  flex: 1;
                "
              >
                ${isSelected ? 'Remove' : 'Add'}
              </button>
              <button 
                onclick="window.showRating('${pub.id}')"
                style="
                  background-color: #f59e0b;
                  color: white;
                  border: none;
                  padding: 6px 12px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 12px;
                  flex: 1;
                "
              >
                ⭐ Értékelés
              </button>
            </div>
          </div>
        `)
        .addTo(mapInstanceRef.current!);

      markersRef.current[pub.id] = marker;
    });

    // Add global function for popup buttons
    (window as any).togglePub = (pubId: string) => {
      const pub = pubs.find((p: PubLocation) => p.id === pubId);
      if (!pub) return;

      const isSelected = selectedPubs.some((selected: PubLocation) => selected.id === pub.id);
      if (isSelected) {
        onPubDeselect(pub);
      } else {
        onPubSelect(pub);
      }
    };

    (window as any).showRating = (pubId: string) => {
      const pub = pubs.find((p: PubLocation) => p.id === pubId);
      if (pub) {
        setSelectedPubForRating(pub);
      }
    };

  }, [pubs, selectedPubs, onPubSelect, onPubDeselect]);

  useEffect(() => {
      if (!mapInstanceRef.current) {
        return;
      }

    if (!optimizedRoute || optimizedRoute.length < 2) {
      // Remove existing route line
      if (routeLineRef.current) {
        mapInstanceRef.current.removeLayer(routeLineRef.current);
        routeLineRef.current = null;
      }
      return;
    }

    // Remove existing route line
    if (routeLineRef.current) {
      mapInstanceRef.current.removeLayer(routeLineRef.current);
    }

    // Create walking route using OpenRouteService-style routing
    createWalkingRoute(optimizedRoute);

    // Add route numbers
    optimizedRoute.forEach((pub: PubLocation, index: number) => {
      const numberIcon = L.divIcon({
        html: `
          <div style="
            background-color: #059669;
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${index + 1}
          </div>
        `,
        className: 'route-number',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([pub.lat, pub.lng], { icon: numberIcon })
        .addTo(mapInstanceRef.current!);
    });

  }, [optimizedRoute]);

  const createWalkingRoute = async (route: PubLocation[]) => {
    if (!mapInstanceRef.current || route.length < 2) return;

    try {
      // For MVP, we'll create a more realistic walking path by adding waypoints
      // In a production app, you'd use a routing service like OpenRouteService or MapBox
      const enhancedRoute: [number, number][] = [];
      
      for (let i = 0; i < route.length - 1; i++) {
        const start = route[i];
        const end = route[i + 1];
        
        enhancedRoute.push([start.lat, start.lng]);
        
        // Add intermediate waypoints to simulate street-following
        const waypoints = generateWaypoints(start, end);
        enhancedRoute.push(...waypoints);
      }
      
      // Add the final destination
      enhancedRoute.push([route[route.length - 1].lat, route[route.length - 1].lng]);

      const routeLine = L.polyline(enhancedRoute, {
        color: '#059669',
        weight: 5,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstanceRef.current);

      routeLineRef.current = routeLine;
      
    } catch (error) {
      console.warn('Could not create enhanced route, falling back to direct lines');
      // Fallback to simple direct lines
      const routeCoordinates: [number, number][] = route.map(pub => [pub.lat, pub.lng]);
      
      const routeLine = L.polyline(routeCoordinates, {
        color: '#059669',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 5'
      }).addTo(mapInstanceRef.current!);

      routeLineRef.current = routeLine;
    }
  };

  const generateWaypoints = (start: PubLocation, end: PubLocation): [number, number][] => {
    const waypoints: [number, number][] = [];
    
    // Simple algorithm to create more realistic walking paths
    // This simulates following streets rather than straight lines
    const latDiff = end.lat - start.lat;
    const lngDiff = end.lng - start.lng;
    
    // Add 2-3 waypoints to create a more street-like path
    const numWaypoints = Math.min(3, Math.max(1, Math.floor(Math.abs(latDiff + lngDiff) * 1000)));
    
    for (let i = 1; i <= numWaypoints; i++) {
      const progress = i / (numWaypoints + 1);
      
      // Add some randomness to simulate street patterns
      const streetOffset = (Math.random() - 0.5) * 0.0005; // Small random offset
      
      // Prefer cardinal directions (simulate city grid)
      let wayLat, wayLng;
      if (Math.abs(latDiff) > Math.abs(lngDiff)) {
        // Primarily north-south movement
        wayLat = start.lat + latDiff * progress;
        wayLng = start.lng + lngDiff * (progress * 0.3) + streetOffset;
      } else {
        // Primarily east-west movement
        wayLat = start.lat + latDiff * (progress * 0.3) + streetOffset;
        wayLng = start.lng + lngDiff * progress;
      }
      
      waypoints.push([wayLat, wayLng]);
    }
    
    return waypoints;
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'pub': return '#8b5cf6';
      case 'bar': return '#f59e0b';
      case 'brewery': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'pub': return 'P';
      case 'bar': return 'B';
      case 'brewery': return 'Br';
      default: return '?';
    }
  };

  return (
    <div className="relative z-0">
      <div ref={mapRef} className="w-full h-96 rounded-lg shadow-lg relative z-0" />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-10">
        <h4 className="font-semibold text-sm mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
            <span>Pub</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
            <span>Bar</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span>Brewery</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-emerald-600 mr-2"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {selectedPubForRating && (
        <PubRatingComponent
          pubId={selectedPubForRating.id}
          pubName={selectedPubForRating.name}
          onClose={() => {
            setSelectedPubForRating(null);
            // Refresh ratings when modal closes
            loadRatings();
          }}
        />
      )}
    </div>
  );
};