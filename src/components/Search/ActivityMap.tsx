import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, DivIcon, LatLngBounds } from 'leaflet';
import { Activity } from '@/types/activity';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_MAP_CENTER, ST_ETIENNE_COORDS } from '@/constants/locations';

// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Component to update map center/zoom when activities change
const MapUpdater = ({ activities }: { activities: Activity[] }) => {
  const map = useMap();

  useEffect(() => {
    if (activities.length > 0) {
      // Calculate bounds
      const bounds = activities.reduce((acc, activity) => {
        // Type assertion for location as it comes from JSON in Supabase
        const location = activity.structures?.location as { lat: number; lon: number } | null;
        const lat = location?.lat || ST_ETIENNE_COORDS.lat; 
        const lon = location?.lon || ST_ETIENNE_COORDS.lon;
        
        // Only include valid coordinates in bounds
        if (lat && lon) {
            acc.extend([lat, lon]);
        }
        return acc;
      }, new LatLngBounds([]));

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [activities, map]);

  return null;
};

interface ActivityMapProps {
  activities: Activity[];
}

export const ActivityMap = ({ activities }: ActivityMapProps) => {
  const navigate = useNavigate();

  // Default center (Saint-Étienne)
  const defaultCenter = DEFAULT_MAP_CENTER;

  const getCategoryConfig = (category: string) => {
    const normalized = category?.toLowerCase();
    switch (normalized) {
      case 'sport': return { color: '#F97316' };
      case 'culture': return { color: '#A855F7' };
      case 'loisirs': return { color: '#EC4899' };
      case 'scolarité': return { color: '#3B82F6' };
      case 'vacances': return { color: '#10B981' };
      case 'activités innovantes': return { color: '#06B6D4' };
      default: return { color: '#64748B' };
    }
  };

  const createCustomIcon = (category: string) => {
    const { color } = getCategoryConfig(category);
    
    // Retour à une version simple sans renderToStaticMarkup pour éviter le crash
    return new DivIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  return (
    <div className="h-[calc(100vh-200px)] w-full rounded-lg overflow-hidden border border-gray-200 relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {activities.map((activity) => {
            // Fallback coordinates logic
            const location = activity.structures?.location as { lat: number; lon: number } | null;
            // For demo purposes, if no location, we randomize slightly around Saint-Étienne
            // In production, we should filter out activities without location or show them differently
            const lat = location?.lat || ST_ETIENNE_COORDS.lat + (Math.random() - 0.5) * 0.1; 
            const lon = location?.lon || ST_ETIENNE_COORDS.lon + (Math.random() - 0.5) * 0.1;

            return (
                <Marker 
                    key={activity.id} 
                    position={[lat, lon]}
                    icon={createCustomIcon(activity.category)}
                >
                <Popup>
                    <div className="p-2 min-w-[200px]">
                    <div className="font-bold text-sm mb-1">{activity.title}</div>
                    <div className="text-xs text-gray-500 mb-2 capitalize">{activity.category}</div>
                    <div className="text-xs font-semibold mb-2">
                        {activity.price_is_free ? 'Gratuit' : `${activity.price_base || 0}€`}
                    </div>
                    <Button 
                        size="sm" 
                        className="w-full h-8 text-xs"
                        onClick={() => navigate(`/activity/${activity.id}`)}
                    >
                        Voir la fiche
                    </Button>
                    </div>
                </Popup>
                </Marker>
            );
        })}
        
        <MapUpdater activities={activities} />
      </MapContainer>
    </div>
  );
};
