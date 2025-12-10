import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import type { Activity } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Import icon fix CRITICAL for Vite/Webpack
import "@/utils/leafletIconFix";
import { validateCoordinates } from "@/utils/sanitize";

/**
 * Interface étendue pour activités avec coordonnées géographiques
 *
 * TypeScript helper pour filtrer les activités ayant lat/lng
 * Sans modifier le type Activity principal
 */
interface ActivityWithLocation extends Activity {
  location: {
    nom?: string;
    adresse: string;
    codePostal?: string;
    ville?: string;
    lat: number;
    lng: number;
  };
}

interface InteractiveMapActivitiesProps {
  /**
   * Liste des activités à afficher sur la carte
   * Seules celles avec location.lat/lng seront affichées
   */
  activities: Activity[];

  /**
   * Coordonnées centrales par défaut (si aucune activité)
   * @default [45.4397, 4.3872] // Saint-Étienne
   */
  centerCoordinates?: [number, number];

  /**
   * Niveau de zoom initial
   * @default 13
   */
  zoom?: number;

  /**
   * Hauteur de la carte
   * @default "400px"
   */
  height?: string;
}

/**
 * Carte interactive Leaflet affichant les activités
 *
 * Features:
 * - Markers cliquables sur chaque activité avec coordonnées
 * - Popups avec infos activité (titre, âge, prix, catégories)
 * - Auto-centrage sur les activités affichées
 * - Fallback graceful si aucune coordonnée
 * - Touch-friendly (pinch zoom, pan)
 *
 * @example
 * ```tsx
 * <InteractiveMapActivities
 *   activities={searchResults}
 *   height="500px"
 * />
 * ```
 */
export function InteractiveMapActivities({
  activities,
  centerCoordinates = [45.4397, 4.3872], // Saint-Étienne par défaut
  zoom = 13,
  height = "400px",
}: InteractiveMapActivitiesProps) {
  const navigate = useNavigate();

  // Filter activités avec coordonnées valides
  const activitiesWithCoords = useMemo(() => {
    return activities.filter((activity): activity is ActivityWithLocation => {
      const a = activity as ActivityWithLocation;
      if (
        a.location?.lat === undefined ||
        a.location?.lng === undefined
      ) {
        return false;
      }

      // Security: Validate coordinates are within valid ranges
      const validation = validateCoordinates(a.location.lat, a.location.lng);
      return validation.isValid;
    });
  }, [activities]);

  // Calculate center basé sur activités disponibles
  const mapCenter = useMemo((): [number, number] => {
    if (activitiesWithCoords.length === 0) {
      return centerCoordinates;
    }

    const avgLat =
      activitiesWithCoords.reduce((sum, a) => sum + (a.location?.lat || 0), 0) /
      activitiesWithCoords.length;

    const avgLng =
      activitiesWithCoords.reduce((sum, a) => sum + (a.location?.lng || 0), 0) /
      activitiesWithCoords.length;

    return [avgLat, avgLng];
  }, [activitiesWithCoords, centerCoordinates]);

  // Fallback si aucune activité avec coordonnées
  if (activitiesWithCoords.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-muted/20 rounded-xl border-2 border-dashed border-muted"
        style={{ height }}
      >
        <MapPin className="w-16 h-16 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Aucune localisation disponible
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Les activités trouvées n'ont pas d'informations géographiques.
          <br />
          Consultez la vue liste pour voir tous les résultats.
        </p>
      </div>
    );
  }

  return (
    <div
      className="map-container rounded-xl overflow-hidden shadow-md border border-border"
      style={{ height, width: "100%" }}
    >
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false} // Disable scroll zoom (UX: évite zoom accidentel)
        className="z-0" // Ensure map doesn't overlay other UI
      >
        {/* OpenStreetMap tiles - gratuit, pas d'API key requis */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Markers pour chaque activité */}
        {activitiesWithCoords.map((activity) => (
          <Marker
            key={activity.id}
            position={[activity.location!.lat, activity.location!.lng]}
          >
            <Popup maxWidth={300} className="activity-popup">
              <div className="p-2 min-w-[250px]">
                {/* Titre */}
                <h3 className="font-bold text-base text-foreground mb-2 leading-tight">
                  {activity.title}
                </h3>

                {/* Image si disponible */}
                {activity.image && (
                  <img
                    src={activity.image}
                    alt={activity.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}

                {/* Infos rapides */}
                <div className="space-y-2 mb-3">
                  {/* Âge */}
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="text-xs">
                      {activity.ageRange}
                    </Badge>

                    {/* Prix */}
                    <span className="font-semibold text-primary">
                      {activity.price}€
                      {activity.priceUnit && (
                        <span className="text-xs text-muted-foreground ml-1">
                          {activity.priceUnit}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Catégories */}
                  {activity.categories && activity.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {activity.categories.slice(0, 3).map((cat) => (
                        <Badge
                          key={cat}
                          variant="outline"
                          className="text-xs py-0"
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Adresse */}
                  {activity.location?.adresse && (
                    <p className="text-xs text-muted-foreground flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{activity.location.adresse}</span>
                    </p>
                  )}
                </div>

                {/* CTA */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/activity/${activity.id}`)}
                  >
                    Voir détails
                  </Button>

                  {activity.location && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Security: Validate coordinates before constructing URL
                        const { isValid, lat, lng } = validateCoordinates(
                          activity.location!.lat,
                          activity.location!.lng
                        );

                        if (!isValid) {
                          console.warn("Invalid coordinates for navigation");
                          return;
                        }

                        // Ouvrir itinéraire dans Google Maps avec coordonnées validées
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                        window.open(url, "_blank", "noopener,noreferrer");
                      }}
                      title="Itinéraire"
                    >
                      <Navigation className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Info overlay - nombre d'activités */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-border">
        <p className="text-sm font-medium text-foreground">
          <span className="font-bold text-primary">
            {activitiesWithCoords.length}
          </span>{" "}
          activité{activitiesWithCoords.length > 1 ? "s" : ""} sur la carte
        </p>
      </div>
    </div>
  );
}
