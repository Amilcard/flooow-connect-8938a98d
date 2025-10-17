# Transport Sync - Documentation complète

## Vue d'ensemble

Système de synchronisation des offres de transport alternatif (covoiturage, train, bus) + arrêts STAS + stations Vélivert pour INKLUSIF.

## Architecture

```
src/transport-sync/
├── config.ts              # Configuration centralisée (mode mock/auto)
├── index.ts               # Point d'entrée sync complète
├── lib/
│   ├── types.ts           # Types TypeScript
│   ├── normalize.ts       # Normalisation offres (Haversine, carbon)
│   ├── supabase.ts        # Client Supabase + upsert batch
│   ├── reconcile.ts       # Marquage offres expirées
│   ├── stops.ts           # Gestion arrêts bus/tram (STAS, GTFS)
│   ├── stations.ts        # Gestion stations vélos (Vélivert)
│   ├── carbon.ts          # Calculs économie carbone
│   └── api-adapters.ts    # Adaptateurs APIs externes (TODO)
├── mocks/
│   ├── offers_example.json    # Offres transport mock
│   ├── stops_example.json     # Arrêts STAS mock
│   └── stations_example.json  # Stations Vélivert mock
└── README.md              # Ce fichier
```

## Base de données

### Tables créées

**`transport_offers`** (étendue)
- Colonnes ajoutées : `external_id`, `source`, `start_lat/lon`, `end_lat/lon`, `price_cents`, `currency`, `departure_time`, `arrival_time`, `raw`, `expired`, `nearest_stop_id`, `nearest_stop_source`, `nearest_station_id`, `nearest_station_source`

**`transport_stops`** (nouvelle)
- Arrêts bus/tram : `stop_id`, `source`, `name`, `lat`, `lon`, `lines[]`, `raw`, `updated_at`
- Index géospatial sur `(lat, lon)` pour recherche proximité
- RLS : lecture publique, écriture admins

**`bike_stations`** (nouvelle)
- Stations vélos : `station_id`, `source`, `name`, `lat`, `lon`, `available_bikes`, `available_slots`, `raw`, `updated_at`
- Index géospatial sur `(lat, lon)`
- RLS : lecture publique, écriture admins

### Migrations

- `migrations/20251017_add_transport_offers_columns.sql` (12 colonnes + 2 index)
- `migrations/20251017_add_stops_stations.sql` (2 tables + 4 index + RLS)

## Configuration

### Variables d'environnement (`.env.transport-sync.example`)

```bash
# Mode d'exécution
TS_MODE=mock  # ou 'auto' pour production

# Supabase (requis en mode auto)
TS_SUPABASE_URL=https://votre-projet.supabase.co
TS_SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Paramètres sync
TS_CHUNK_SIZE=200          # Taille batch upsert
TS_RECONCILE_DAYS=1        # Jours avant marquage expired
TS_DEFAULT_SPEED_KMH=40    # Vitesse moyenne fallback

# APIs externes (mode auto)
TS_STAS_API_URL=https://api.stas.fr/v1
TS_STAS_API_KEY=your_key
TS_MOOVIZY_API_URL=https://api.moovizy.com
TS_MOOVIZY_API_KEY=your_key
TS_GTFS_SOURCE_URL=https://data.toulouse-metropole.fr/gtfs.zip
TS_VELIVERT_API_URL=https://api.velivert.fr/v1/stations
TS_VELIVERT_API_KEY=your_key

# Domicile par défaut (fallback)
TS_DEFAULT_HOME_COORDS_LAT=43.6047
TS_DEFAULT_HOME_COORDS_LON=1.4442

# Facteur carbone économisé (kg CO2/km)
TS_CARBON_FACTOR_KG_PER_KM=0.12
```

## Utilisation

### Mode Mock (safe, ne touche pas la DB)

```bash
TS_MODE=mock node src/transport-sync
```

Lit les fichiers `mocks/*.json` et affiche les résultats sans écrire en base.

### Mode Auto (production, nécessite variables Supabase)

```bash
TS_MODE=auto \
TS_SUPABASE_URL=https://xxx.supabase.co \
TS_SUPABASE_SERVICE_ROLE_KEY=eyJ... \
node src/transport-sync
```

1. Récupère offres depuis APIs externes (TODO: BlaBlaCar, SNCF, FlixBus)
2. Normalise (calcul distance, temps, carbone)
3. Upsert en base par batch (chunk 200)
4. Marque offres absentes depuis >1 jour comme `expired=true`

## Fonctionnalités

### 1. Recherche arrêts/stations les plus proches

```typescript
import { findNearestStops } from './lib/stops';
import { findNearestStations } from './lib/stations';
import { supabase } from '@/integrations/supabase/client';

// Trouver les 5 arrêts bus/tram dans un rayon de 2km
const stops = await findNearestStops(
  supabase,
  43.6047, // lat domicile
  1.4442,  // lon domicile
  2000,    // rayon en mètres
  5        // limite résultats
);

// Trouver les 3 stations Vélivert dans un rayon de 1km
const stations = await findNearestStations(
  supabase,
  43.6047,
  1.4442,
  1000,
  3
);
```

### 2. Calcul économie carbone

```typescript
import { calculateCarbonSaved, calculateWalkingTime } from './lib/carbon';

// Trajet domicile → arrêt (500m à pied) + bus 10km
const walkKm = 0.5;
const busKm = 10;

const carbonSaved = calculateCarbonSaved(
  walkKm + busKm,
  0.12 // kg CO2/km économisé vs voiture
);
// Résultat: 1.26 kg CO2

const walkTime = calculateWalkingTime(500); // 500m
// Résultat: 7 minutes (vitesse 4.5 km/h)
```

### 3. Cumul économies utilisateur

```typescript
import { aggregateCarbonSavings } from './lib/carbon';

const userTrips = [
  { mode: 'bus', carbon_saved_kg: 1.2 },
  { mode: 'covoiturage', carbon_saved_kg: 4.5 },
  { mode: 'bike', carbon_saved_kg: 0.8 },
];

const summary = aggregateCarbonSavings(userTrips);
// {
//   total_kg: 6.5,
//   by_mode: { bus: 1.2, covoiturage: 4.5, bike: 0.8, train: 0 },
//   trips_count: 3
// }
```

## Affichage côté client (specs)

### Fiche activité - Bloc "Accès"

```tsx
// Composant exemple (à créer)
<ActivityAccessInfo activityId="xxx" />

// Affiche:
// - Itinéraire résumé (A → B, durée, départ/arrivée)
// - Bloc "Transports en commun" :
//   → Arrêt République (L1, L3) - 450m (6min à pied)
//   → Arrêt Jean Jaurès (L2, L5) - 780m (10min à pied)
//   → Prochains départs: L1 dans 5min, L3 dans 12min (retard +2min)
// - Bloc "Vélo partagé (Vélivert)" :
//   → Station Capitole - 350m (5min) - 8 vélos / 12 places
//   → Station Esquirol - 620m (8min) - 12 vélos / 8 places
//   [Bouton: Réserver un vélo]
// - Bouton "Itinéraire depuis mon domicile"
// - Badge "🌱 Économie carbone: 1.2 kg CO2 vs voiture"
```

### Espace utilisateur - Cumuls carbone

```tsx
// Composant exemple
<UserCarbonDashboard userId="xxx" />

// Affiche:
// - Total économisé: 45.8 kg CO2 (🌳 équivalent X arbres plantés)
// - Par mode:
//   → Covoiturage: 28.5 kg
//   → Bus/Tram: 12.3 kg
//   → Vélo: 5.0 kg
// - Graphique évolution mensuelle
```

## Développement futur

### APIs à implémenter (`lib/api-adapters.ts`)

1. **STAS/Moovizy** : `fetchSTASStops()`, `fetchNextDepartures()`
2. **GTFS** : `fetchGTFSStops()` (télécharger zip, parser `stops.txt`)
3. **Vélivert** : `fetchVelivertStations()` (temps réel disponibilités)
4. **BlaBlaCar, SNCF, FlixBus** : récupération offres pour `transport_offers`

### Optimisations

- **PostGIS** : index `gist` sur `geography(POINT)` pour recherches géospatiales natives
- **Cache Redis** : horaires temps réel (TTL 30s)
- **Cron job** : sync automatique toutes les 15min (via Supabase Edge Function + `pg_cron`)

### Monitoring

- Logs structurés (JSON) pour parsing (ex: Datadog)
- Métriques : nb offres synced, taux erreur API, latence DB
- Alertes : API down, nb offres < seuil, stale data >24h

## Tests

```bash
# Mode mock (safe)
TS_MODE=mock node src/transport-sync

# Vérifier DB après sync auto
psql $DATABASE_URL -c "SELECT COUNT(*) FROM transport_stops;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM bike_stations;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM transport_offers WHERE expired=false;"
```

## Sécurité

- ✅ RLS activée sur toutes les tables
- ✅ Lecture publique (offres, arrêts, stations)
- ✅ Écriture admin uniquement (`superadmin`, `territory_admin`)
- ✅ Service role key jamais exposée côté client
- ✅ Mode mock par défaut (non-destructif)

## Support

Questions : [Discord INKLUSIF] ou ouvrir une issue GitHub.
