/**
 * Fix pour les icônes Leaflet cassées avec Vite/Webpack
 *
 * Problème: Les markers Leaflet utilisent des chemins relatifs qui ne fonctionnent pas
 * avec les bundlers modernes (Vite, Webpack).
 *
 * Solution: Redéfinir les icônes par défaut avec des URLs CDN.
 *
 * À importer UNE SEULE FOIS dans App.tsx ou main.tsx AVANT le premier render.
 *
 * @see https://github.com/Leaflet/Leaflet/issues/4968
 */

import L from "leaflet";

// Icônes depuis CDN Leaflet officiel
const iconRetinaUrl =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const shadowUrl =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

// Créer l'icône par défaut avec URLs correctes
const DefaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41], // Taille standard Leaflet
  iconAnchor: [12, 41], // Point d'ancrage (base du marker)
  popupAnchor: [1, -34], // Position du popup relatif au marker
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

// Appliquer globalement à tous les markers
L.Marker.prototype.options.icon = DefaultIcon;

export default DefaultIcon;
