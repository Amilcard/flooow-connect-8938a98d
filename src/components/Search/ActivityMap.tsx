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
      // Calculate bounds - use activity.location (set by toActivity adapter)
      const bounds = activities.reduce((acc, activity) => {
        const activityLocation = (activity as any).location as { lat: number; lng: number } | null;

        // Only include activities with valid coordinates in bounds
        if (activityLocation?.lat && activityLocation?.lng) {
            acc.extend([activityLocation.lat, activityLocation.lng]);
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
    <div className="h-[calc(100vh-200px)] w-full rounded-lg overflow-hidden border border-border relative z-0">
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
            // Fix: Use activity.location (set by toActivity adapter) with lat/lng properties
            const activityLocation = (activity as any).location as { lat: number; lng: number } | null;

            // Skip activities without valid coordinates
            if (!activityLocation?.lat || !activityLocation?.lng) {
              return null;
            }

            const lat = activityLocation.lat;
            const lon = activityLocation.lng;

            return (
                <Marker 
                    key={activity.id} 
                    position={[lat, lon]}
                    icon={createCustomIcon(activity.category)}
                >
                <Popup>
                    <div className="p-2 min-w-[200px]">
                    <div className="font-bold text-sm mb-1">{activity.title}</div>
                    <div className="text-xs text-muted-foreground mb-2 capitalize">{activity.category}</div>
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
