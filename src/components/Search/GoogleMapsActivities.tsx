import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Activity } from "@/types/domain";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateCoordinates } from "@/utils/sanitize";

interface GoogleMapsActivitiesProps {
  activities: Activity[];
  centerCoordinates?: [number, number];
  zoom?: number;
  height?: string;
}

export const GoogleMapsActivities = ({
  activities,
  centerCoordinates = [45.4397, 4.3872],
  zoom = 12,
  height = "500px"
}: GoogleMapsActivitiesProps) => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  const activitiesWithLocation = useMemo(() => {
    return activities.filter(activity => {
      const lat = activity.location?.lat || activity.latitude;
      const lng = activity.location?.lng || activity.longitude;
      return validateCoordinates(lat, lng);
    });
  }, [activities]);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      const w = window as any;
      if (w.google && w.google.maps) {
        setGoogleMapsLoaded(true);
        return;
      }
      try {
        const { data, error } = await supabase.functions.invoke("google-maps-token");
        if (error) throw error;
        if (data?.token) {
          const script = document.createElement("script");
          script.src = "https://maps.googleapis.com/maps/api/js?key=" + data.token + "&libraries=places";
          script.async = true;
          script.defer = true;
          script.onload = () => setGoogleMapsLoaded(true);
          script.onerror = () => toast.error("Erreur chargement Google Maps");
          document.head.appendChild(script);
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        toast.error("Erreur configuration carte");
      }
    };
    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (googleMapsLoaded === false || mapContainer.current === null || mapRef.current !== null) return;
    const google = (window as any).google;
    mapRef.current = new google.maps.Map(mapContainer.current, {
      center: { lat: centerCoordinates[0], lng: centerCoordinates[1] },
      zoom: zoom,
      styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
    });
    infoWindowRef.current = new google.maps.InfoWindow();
  }, [googleMapsLoaded, centerCoordinates, zoom]);

  useEffect(() => {
    if (googleMapsLoaded === false || mapRef.current === null) return;
    const google = (window as any).google;
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    activitiesWithLocation.forEach(activity => {
      const lat = activity.location?.lat || activity.latitude;
      const lng = activity.location?.lng || activity.longitude;
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapRef.current,
        title: activity.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#F97316",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2
        }
      });
      marker.addListener("click", () => {
        const content = "<div style='padding:8px;max-width:200px;'><h3 style='font-weight:600;margin-bottom:4px;'>" + activity.title + "</h3><p style='font-size:12px;color:#666;margin-bottom:8px;'>" + (activity.location?.adresse || activity.address || "") + "</p><button onclick=\"window.location.href='/activity/" + activity.id + "'\" style='background:#F97316;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px;'>Voir détails</button></div>";
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapRef.current, marker);
      });
      markersRef.current.push(marker);
    });
    if (activitiesWithLocation.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      activitiesWithLocation.forEach(activity => {
        const lat = activity.location?.lat || activity.latitude;
        const lng = activity.location?.lng || activity.longitude;
        bounds.extend({ lat, lng });
      });
      mapRef.current.fitBounds(bounds);
    }
  }, [googleMapsLoaded, activitiesWithLocation, navigate]);

  return (
    <div className="relative w-full" style={{ height }}>
      <div className="absolute top-2 left-2 z-10 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
        <span className="text-sm font-medium">{activitiesWithLocation.length} / {activities.length} localisées</span>
      </div>
      {googleMapsLoaded === false ? (
        <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        </div>
      ) : (
        <div ref={mapContainer} className="w-full h-full rounded-lg" />
      )}
    </div>
  );
};
