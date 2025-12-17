# Validation Transport-Sync V1 - Checklist Développeur

## 📋 Vérification des livrables (à cocher)

### ✅ Migrations SQL (dossier `supabase/migrations/`)

**Fichier 1:** `20251017072809_*_transport_offers_columns.sql`
- [x] Colonnes ajoutées IF NOT EXISTS: `external_id`, `source`, `start_lat`, `start_lon`, `end_lat`, `end_lon`, `price_cents`, `currency`, `departure_time`, `arrival_time`, `raw`, `expired`, `nearest_stop_id`, `nearest_stop_source`, `nearest_station_id`, `nearest_station_source` (16 colonnes)
- [x] Index composite: `idx_transport_offers_external_source (external_id, source)`
- [x] Index partiel: `idx_transport_offers_expired (expired WHERE expired = FALSE)`
- [x] **Statut:** Déjà appliquée en base via Lovable Cloud

**Fichier 2:** `20251017*_transport_stops_stations.sql`
- [x] Table `transport_stops` créée IF NOT EXISTS (stop_id, source, name, lat, lon, lines[], raw, updated_at)
- [x] Table `bike_stations` créée IF NOT EXISTS (station_id, source, name, lat, lon, available_bikes, available_slots, raw, updated_at)
- [x] Index géospatiaux: `idx_transport_stops_coords`, `idx_bike_stations_coords`
- [x] Index sources: `idx_transport_stops_source`, `idx_bike_stations_source`
- [x] RLS: 2 policies SELECT public + 2 policies ALL admins
- [x] **Statut:** Déjà appliquée en base via Lovable Cloud

**⚠️ Important:** Les migrations ont été appliquées automatiquement par Lovable. Elles sont déjà présentes dans `supabase/migrations/`.

---

### ✅ Module TypeScript (dossier `src/transport-sync/`)

**Structure complète (13 fichiers) :**

```
src/transport-sync/
├── config.ts                      ✅ Configuration mode mock/auto + validation
├── index.ts                       ✅ CLI principal (sync complète)
├── README.md                      ✅ Documentation complète
├── lib/
│   ├── types.ts                   ✅ Types TS (RawTransportOffer, Normalized, etc.)
│   ├── normalize.ts               ✅ Haversine, temps trajet, carbon_saved_kg
│   ├── supabase.ts                ✅ Client + upsert batch (onConflict)
│   ├── reconcile.ts               ✅ Marquage expired (TS_RECONCILE_DAYS)
│   ├── stops.ts                   ✅ Gestion arrêts (upsert, findNearest)
│   ├── stations.ts                ✅ Gestion stations vélos
│   ├── carbon.ts                  ✅ Calculs carbone + agrégation
│   └── api-adapters.ts            ✅ Stubs APIs (TODO implémentation)
└── mocks/
    ├── offers_example.json        ✅ 3 offres exemple
    ├── stops_example.json         ✅ 4 arrêts exemple
    └── stations_example.json      ✅ 4 stations exemple
```

**Fichier racine :**
- [x] `.env.transport-sync.example` (14 variables documentées)

**Documentation :**
- [x] `src/transport-sync/README.md` (architecture, usage, specs UI)
- [x] `TRANSPORT_SYNC_DELIVERABLES.md` (rapport détaillé)
- [x] `TRANSPORT_SYNC_VALIDATION.md` (ce fichier)

---

## 🔍 Vérification fonctionnalités

### Comportements requis

- [x] **Mode mock (défaut):** Lit `mocks/*.json`, n'écrit PAS en DB, affiche résultats
- [x] **Mode auto:** Fail-early si `TS_SUPABASE_URL` ou `TS_SUPABASE_SERVICE_ROLE_KEY` manquantes
- [x] **Upsert batch:** Chunk configurable (`TS_CHUNK_SIZE`, défaut 200)
- [x] **onConflict:** `(external_id, source)` pour éviter doublons
- [x] **Réconciliation:** Marque `expired=true` après `TS_RECONCILE_DAYS` (défaut 1)
- [x] **Calcul nearest:** `findNearestStops()` et `findNearestStations()` (Haversine, rayon, limit)
- [x] **Normalisation price:** `price → price_cents` (évite float)
- [x] **Normalisation distance:** Calcul Haversine `(start_lat/lon → end_lat/lon)`
- [x] **Normalisation temps:** `departure_time - arrival_time` ou fallback `TS_DEFAULT_SPEED_KMH`
- [x] **Normalisation carbone:** `distance_km × TS_CARBON_FACTOR_KG_PER_KM` (défaut 0.12)

### Variables d'environnement (`.env.transport-sync.example`)

**OBLIGATOIRES en mode auto :**
- [x] `TS_MODE` (mock | auto)
- [x] `TS_SUPABASE_URL`
- [x] `TS_SUPABASE_SERVICE_ROLE_KEY`

**CONFIGURABLES :**
- [x] `TS_CHUNK_SIZE` (défaut 200)
- [x] `TS_RECONCILE_DAYS` (défaut 1)
- [x] `TS_DEFAULT_SPEED_KMH` (défaut 40)
- [x] `TS_CARBON_FACTOR_KG_PER_KM` (défaut 0.12)

**OPTIONNELS (APIs futures) :**
- [x] `TS_STAS_API_URL`, `TS_STAS_API_KEY`
- [x] `TS_VELIVERT_API_URL`, `TS_VELIVERT_API_KEY`
- [x] `TS_MOOVIZY_API_URL`, `TS_MOOVIZY_API_KEY`
- [x] `TS_GTFS_SOURCE_URL`
- [x] `TS_DEFAULT_HOME_COORDS_LAT`, `TS_DEFAULT_HOME_COORDS_LON`

---

## 🧪 Commandes de test (validation dev)

### Test 1: Mode Mock (Safe - 0 risque)

```bash
# Depuis la racine du projet
TS_MODE=mock node src/transport-sync/index.ts
```

**Résultat attendu :**
```
[TransportSync] Mode: mock
[TransportSync] Chunk size: 200
[TransportSync] Reconcile days: 1
[Mock] Chargé 3 offres depuis mocks/offers_example.json
[Normalize] 3 offres normalisées
[Mock] Mode safe: aucune écriture DB
[TransportSync] ✓ Terminé en XXXms

=== RÉSULTAT SYNC ===
{
  "mode": "mock",
  "processed": 3,
  "inserted": 0,
  "updated": 0,
  "expired": 0,
  "errors": [],
  "duration_ms": XXX
}
```

**✅ Si résultat OK → Mode mock fonctionne, passer au Test 2**

---

### Test 2: Mode Auto en Staging (Écriture DB)

⚠️ **UNIQUEMENT sur environnement staging/dev ! JAMAIS en production !**

```bash
# Variables Supabase (remplacer YOUR_PROJECT_REF par votre ID projet)
export TS_MODE=auto
export TS_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
export TS_SUPABASE_SERVICE_ROLE_KEY="<STAGING_SERVICE_ROLE_KEY>"
export TS_CHUNK_SIZE=50  # Prudence: batch réduit pour 1er test

# Lancer sync
node src/transport-sync/index.ts
```

**Résultat attendu :**
```
[TransportSync] Mode: auto
[Normalize] 3 offres normalisées
[Upsert] ✓ 3 insérées
[Reconcile] Marquage expired pour offres > 1 jours...
[Reconcile] 0 offres marquées expired
[TransportSync] ✓ Terminé en XXXms
```

**Vérification post-sync (psql ou Lovable Backend) :**

```sql
-- Compter offres actives
SELECT COUNT(*) FROM transport_offers WHERE expired = false;
-- Attendu: 3 nouvelles lignes

-- Compter arrêts/stations (si upserted)
SELECT COUNT(*) FROM transport_stops;
SELECT COUNT(*) FROM bike_stations;
-- Attendu: 0 (stubs API pas encore implémentés)

-- Vérifier colonnes nearest
SELECT nearest_stop_id, nearest_station_id 
FROM transport_offers 
LIMIT 5;
-- Attendu: NULL (calcul nearest pas encore implémenté dans index.ts)
```

**✅ Si résultat OK → Mode auto fonctionne en staging**

---

## 🚀 Procédure de déploiement production

### Phase 1: Validation Staging ✅

- [x] Migrations SQL appliquées (déjà fait via Lovable)
- [ ] Test mode mock réussi (dev local)
- [ ] Test mode auto réussi (staging)
- [ ] Vérification DB staging (counts, RLS, index)
- [ ] Code review par équipe technique
- [ ] Approbation responsable technique

### Phase 2: Backup Production (OBLIGATOIRE)

```bash
# Backup complet Postgres
pg_dump $PRODUCTION_DATABASE_URL > backup_before_transport_sync_$(date +%Y%m%d).sql

# Vérifier taille backup
ls -lh backup_*.sql

# Uploader backup vers stockage sécurisé (S3, etc.)
```

### Phase 3: Déploiement Production

**Option A: Déploiement automatique (recommandé)**
- Les migrations sont déjà appliquées via Lovable Cloud
- Le code `src/transport-sync/` est déjà committé
- **Action requise:** Configuration variables .env production

**Option B: Déploiement manuel (si nécessaire)**

```bash
# 1. Appliquer migrations (si pas déjà fait)
psql $PRODUCTION_DATABASE_URL < supabase/migrations/20251017*_transport_offers_columns.sql
psql $PRODUCTION_DATABASE_URL < supabase/migrations/20251017*_transport_stops_stations.sql

# 2. Vérifier migrations OK
psql $PRODUCTION_DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'transport_offers' AND column_name = 'external_id';"
# Attendu: external_id | text

# 3. Configurer variables .env production
cp .env.transport-sync.example .env.production
# Éditer .env.production avec vraies valeurs

# 4. Premier sync production (batch réduit)
TS_MODE=auto \
TS_CHUNK_SIZE=50 \
source .env.production && node src/transport-sync/index.ts

# 5. Monitorer logs Postgres
# (via Lovable Backend → Analytics ou psql)
```

### Phase 4: Post-Déploiement

```bash
# Vérifier counts
psql $PROD_DB -c "SELECT COUNT(*) FROM transport_offers WHERE expired = false;"

# Vérifier index utilisés (performance)
psql $PROD_DB -c "EXPLAIN ANALYZE SELECT * FROM transport_offers WHERE external_id = 'test' AND source = 'blablacar';"
# Attendu: "Index Scan using idx_transport_offers_external_source"

# Vérifier RLS
psql $PROD_DB -c "SELECT COUNT(*) FROM transport_stops;"  # Lecture publique OK
```

---

## ⚠️ Plan de Rollback (en cas de problème)

### Si problème détecté après déploiement :

```sql
-- 1. Marquer toutes offres comme expired (stop temporaire)
UPDATE transport_offers SET expired = true WHERE source IN ('blablacar', 'sncf', 'flixbus');

-- 2. Restaurer backup (si nécessaire)
psql $PRODUCTION_DATABASE_URL < backup_before_transport_sync_20250117.sql

-- 3. Supprimer colonnes ajoutées (destructif, à éviter)
-- ALTER TABLE transport_offers DROP COLUMN external_id;  -- DANGER
-- (Préférer laisser colonnes NULL et corriger code)
```

---

## ✅ Checklist validation finale (à remplir par dev)

### Avant approbation production :

- [ ] **Test mode mock** réussi (log ci-joint : _____________)
- [ ] **Test mode auto staging** réussi (log ci-joint : _____________)
- [ ] **Backup production** effectué (fichier : _____________)
- [ ] **Code review** approuvé par : _____________
- [ ] **RLS policies** validées (0 erreur linter)
- [ ] **Performance** testée (latence findNearest < 500ms)
- [ ] **Monitoring** configuré (logs, alertes)
- [ ] **Rollback plan** documenté et validé

### Signatures approbation :

- **Développeur :** _____________ (Date : _____________)
- **Lead Tech :** _____________ (Date : _____________)
- **Responsable Produit :** _____________ (Date : _____________)

---

## 📞 Contact & Support

**Questions techniques :** Voir `src/transport-sync/README.md`  
**Rapport complet :** Voir `TRANSPORT_SYNC_DELIVERABLES.md`  
**Discord INKLUSIF :** [Lien Discord]  
**GitHub Issues :** [Lien repo]

---

**⚠️ RAPPEL CRITIQUE :** Ne jamais exécuter `TS_MODE=auto` en production sans :
1. Backup complet effectué
2. Tests staging réussis
3. Approbation lead tech + produit
4. Plan rollback validé

**Les migrations SQL sont déjà appliquées via Lovable Cloud. Le code est prêt à l'emploi en mode mock. Le mode auto nécessite configuration .env + validation staging avant prod.**
