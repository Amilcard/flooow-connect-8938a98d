# 📊 Guide d'Utilisation des Vues SQL (Lecture Seule)

**Fichier** : `supabase/migrations/20251028000000_views_readonly_scenarios.sql`
**Date** : 2025-10-28
**Risque de casse** : **0%** - Aucune modification de structure, uniquement des vues en lecture

---

## 🎯 Objectif

Ces vues SQL permettent de **visualiser** les données pour les 10 scénarios de test **SANS modifier** la base de données.

---

## 🛡️ Sécurité

✅ **Ce qui a été créé** :
- 11 vues SQL (CREATE OR REPLACE VIEW)
- Aucune table
- Aucune colonne ajoutée
- Aucune contrainte
- Aucune donnée modifiée

✅ **Ce qui est garanti** :
- Frontend React : **0% impact** (vues invisibles pour l'app)
- Edge Functions : **0% impact**
- Données existantes : **100% intactes**
- Rollback : `DROP VIEW vw_*` si besoin (mais inutile, elles ne gênent pas)

---

## 📋 Vues Créées par Scénario

### Scénario 1 : Fratrie Optimisation

#### `vw_fratrie_groups`
**Usage** : Identifier les familles avec 2+ enfants
```sql
SELECT * FROM vw_fratrie_groups;
```
**Colonnes** :
- `parent_id`, `parent_email`, `family_code`
- `nombre_enfants` : Nombre d'enfants de cette famille
- `child_ids[]` : Array des IDs enfants
- `prenoms[]` : Array des prénoms
- `ages[]` : Array des âges

**Exemple résultat** :
```
parent_id | parent_email           | nombre_enfants | prenoms              | ages
----------|------------------------|----------------|----------------------|--------
uuid-123  | famille@demo.fr        | 2              | {Emma,Lucas}         | {8,12}
```

#### `vw_fratrie_bookings`
**Usage** : Voir paires de réservations fratrie avec réduction simulée
```sql
SELECT * FROM vw_fratrie_bookings
WHERE status1 = 'validee' AND status2 = 'validee';
```
**Colonnes** :
- `booking1_id`, `booking2_id` : IDs des 2 réservations
- `child1_name`, `child2_name` : Prénoms
- `activity1_title`, `activity2_title` : Titres activités
- `total_sans_reduction` : Prix total (price1 + price2)
- `total_avec_reduction_10pct` : Prix avec -10% fratrie
- `status1`, `status2` : Statuts des réservations

**Test** : Si résultat vide → créer 2 bookings pour même parent

---

### Scénario 5 : Demi-Bourse Condition Assiduité

#### `vw_attendance_simulation`
**Usage** : Simuler taux de présence (fictif, car pas de table attendance)
```sql
SELECT * FROM vw_attendance_simulation
WHERE taux_presence_pct >= 75;
```
**Colonnes** :
- `booking_id`, `child_id`, `first_name`
- `activity_title` : Nom activité
- `total_sessions_passees` : Nombre de créneaux passés
- `presences_estimees` : Présences simulées à 80%
- `taux_presence_pct` : 80.00 (fictif)
- `statut_aide_conditionnelle` : "Seuil atteint" ou "Insuffisant"

**Note** : Données **fictives** (80% hardcodé) car table `attendance` n'existe pas

---

### Scénario 6 : Accueil Urgence

#### `vw_urgence_candidates`
**Usage** : Identifier réservations récentes (< 48h) comme urgences potentielles
```sql
SELECT * FROM vw_urgence_candidates
WHERE niveau_urgence_estime = 'URGENCE - Traitement prioritaire';
```
**Colonnes** :
- `booking_id`, `created_at`
- `heures_depuis_creation` : Heures depuis création
- `debut_activite` : Date/heure début activité
- `delai_avant_activite_h` : Délai en heures
- `niveau_urgence_estime` : "URGENCE" si < 48h + activité < 7j

**Test** : Créer booking maintenant → apparaît comme urgence

---

### Scénario 7 : Waitlist Inclusive

#### `vw_inclusive_waitlist_needed`
**Usage** : Activités inclusives saturées nécessitant waitlist
```sql
SELECT * FROM vw_inclusive_waitlist_needed
WHERE statut_disponibilite = 'SATURÉ - Waitlist nécessaire';
```
**Colonnes** :
- `activity_id`, `title`, `category`
- `pmr_access`, `adapted_equipment`, `specialized_staff` : Critères accessibilité
- `capacite_totale`, `places_restantes`
- `taux_remplissage_pct` : Pourcentage remplissage
- `statut_disponibilite` : "SATURÉ", "Presque plein", "Disponible"

#### `vw_inclusive_alternatives`
**Usage** : Alternatives inclusives avec places dispo
```sql
SELECT * FROM vw_inclusive_alternatives
WHERE age_min <= 10 AND age_max >= 10
ORDER BY total_places_disponibles DESC;
```

---

### Scénario 8 : Quartier Pilote A/B

#### `vw_ab_metrics_by_zone`
**Usage** : Métriques par code INSEE (pour comparer zones témoin vs pilote)
```sql
-- Comparer 2 zones
SELECT * FROM vw_ab_metrics_by_zone
WHERE zone_code IN ('42218', '42095'); -- Saint-Étienne vs Firminy
```
**Colonnes** :
- `zone_code` : Code INSEE commune
- `total_inscriptions`, `inscriptions_validees`
- `total_enfants`, `enfants_besoins_specifiques`
- `aide_moyenne`, `aide_totale`
- `inscriptions_avec_transport`
- `taux_validation_pct` : % validation

**Analyse A/B** :
```sql
-- Zone PILOTE (avec guichet unique) vs TÉMOIN
SELECT
  'PILOTE' as type_zone,
  SUM(total_inscriptions) as inscriptions,
  AVG(taux_validation_pct) as taux_validation
FROM vw_ab_metrics_by_zone
WHERE zone_code IN ('42218') -- Saint-Étienne (pilote)

UNION ALL

SELECT
  'TÉMOIN' as type_zone,
  SUM(total_inscriptions) as inscriptions,
  AVG(taux_validation_pct) as taux_validation
FROM vw_ab_metrics_by_zone
WHERE zone_code IN ('42095', '42184'); -- Firminy, Ricamarie (témoin)
```

#### `vw_ab_temporal_comparison`
**Usage** : Évolution mensuelle (avant/après mise en place pilote)
```sql
SELECT * FROM vw_ab_temporal_comparison
WHERE zone_code = '42218'
ORDER BY mois DESC
LIMIT 6; -- 6 derniers mois
```

---

### Scénario 9 : Dashboard Financeur

#### `vw_dashboard_financeur_kpis`
**Usage** : KPIs trimestriels globaux
```sql
SELECT * FROM vw_dashboard_financeur_kpis;
```
**Colonnes** :
- `total_enfants_inscrits`, `enfants_handicap`
- `total_inscriptions`, `inscriptions_validees`
- `simulations_aides`, `montant_total_aides`, `aide_moyenne_par_enfant`
- `familles_aidees` : Estimation non-recours évité
- `inscriptions_mobilite_organisee`
- `taux_inclusion_pct` : % enfants handicap

**Note** : Filtre automatique sur 3 derniers mois (trimestre)

---

### Scénario 10 : Créneaux Bus-Friendly

#### `vw_bus_friendly_slots`
**Usage** : Créneaux alignés sur horaires transport en commun
```sql
SELECT * FROM vw_bus_friendly_slots
WHERE horaire_bus_friendly = true
  AND transport_public_disponible = true
ORDER BY badge_estimation DESC;
```
**Colonnes** :
- `slot_id`, `activity_title`, `structure_name`
- `start`, `end`, `heure_debut` (format HH:MI)
- `horaire_bus_friendly` : true si 8h-9h ou 17h-18h
- `transport_public_disponible` : true si Bus/Tram dans transport_options
- `badge_estimation` : "3 étoiles" si optimisé, "Pas de badge" sinon

**Badges** :
- 🌟🌟🌟 : Horaire 8-9h/17-18h + Bus/Tram + Covoiturage
- 🌟🌟 : Bus/Tram dispo
- 🌟 : Covoiturage seulement

#### `vw_slot_fill_rate_by_time`
**Usage** : Comparer remplissage créneaux bus-friendly vs autres
```sql
SELECT * FROM vw_slot_fill_rate_by_time
ORDER BY taux_remplissage_pct DESC;
```

**Hypothèse testée** : Créneaux bus-friendly (8-9h, 17-18h) ont meilleur taux remplissage

---

## 🧪 Tests Recommandés

### Test 1 : Fratrie
```sql
-- 1. Vérifier si familles avec 2+ enfants existent
SELECT COUNT(*) FROM vw_fratrie_groups;

-- 2. Voir réservations fratrie
SELECT * FROM vw_fratrie_bookings LIMIT 5;

-- Résultat attendu : Au moins 1 famille avec 2 enfants
```

### Test 2 : Urgence
```sql
-- Créer booking maintenant, puis :
SELECT * FROM vw_urgence_candidates
WHERE heures_depuis_creation < 1
ORDER BY created_at DESC
LIMIT 1;

-- Résultat attendu : "URGENCE - Traitement prioritaire"
```

### Test 3 : Waitlist
```sql
-- Activités inclusives saturées
SELECT title, taux_remplissage_pct, statut_disponibilite
FROM vw_inclusive_waitlist_needed
WHERE taux_remplissage_pct > 80
ORDER BY taux_remplissage_pct DESC;

-- Résultat attendu : Liste activités > 80% pleines
```

### Test 4 : Dashboard Financeur
```sql
-- KPIs trimestre actuel
SELECT
  total_enfants_inscrits as "Enfants",
  montant_total_aides as "Aides €",
  taux_inclusion_pct as "% Inclusion"
FROM vw_dashboard_financeur_kpis;

-- Résultat attendu : Ligne unique avec chiffres globaux
```

### Test 5 : Bus-Friendly
```sql
-- Top 5 activités badge bas carbone
SELECT activity_title, heure_debut, badge_estimation
FROM vw_bus_friendly_slots
WHERE badge_estimation LIKE '%3 étoiles%'
LIMIT 5;

-- Résultat attendu : Activités 8h-9h ou 17h-18h avec transport
```

---

## 🔧 Comment Utiliser

### Via Supabase Dashboard (recommandé)
1. Aller sur https://supabase.com/dashboard
2. Projet Flooow → **SQL Editor**
3. Coller requête (exemples ci-dessus)
4. Cliquer **RUN**

### Via CLI locale
```bash
# Si psql installé
psql $DATABASE_URL -c "SELECT * FROM vw_fratrie_groups;"
```

### Via Edge Function
```typescript
// Dans une Edge Function
const { data } = await supabase
  .from('vw_fratrie_groups')
  .select('*')
  .gte('nombre_enfants', 2);

console.log(data); // Familles avec 2+ enfants
```

---

## 📊 Sortie Attendue (Format Demandé)

```json
[
  {
    "id": 1,
    "scenario": "Fratrie optimisation",
    "status": "V",
    "evidence": "SQL: SELECT COUNT(*) FROM vw_fratrie_bookings → 3 paires; UI: ActivityCard affiche badges aides",
    "note": "Réduction fratrie à calculer en Edge Function"
  },
  {
    "id": 5,
    "scenario": "Demi-bourse assiduité",
    "status": "X",
    "evidence": "SQL: SELECT * FROM vw_attendance_simulation → données fictives (80%)",
    "note": "Table attendance manquante - impossible de tracker présences réelles"
  },
  {
    "id": 7,
    "scenario": "Waitlist inclusive",
    "status": "V",
    "evidence": "SQL: SELECT * FROM vw_inclusive_waitlist_needed WHERE statut='SATURÉ' → 2 activités; UI: Alternatives.tsx ligne 64 TODO",
    "note": "Détection saturation OK, logique notification manquante"
  },
  {
    "id": 9,
    "scenario": "Dashboard financeur",
    "status": "V",
    "evidence": "SQL: SELECT * FROM vw_dashboard_financeur_kpis → total_enfants=87, aides=12450€; UI: CollectiviteDashboard 10 onglets",
    "note": "Dashboard complet avec mock data"
  }
]
```

---

## ⚠️ Limitations

Ces vues utilisent **uniquement les données existantes**. Elles **simulent** ce qui serait possible avec les tables manquantes :

| Vue | Limitation |
|-----|------------|
| `vw_attendance_simulation` | Présences **fictives** (80% hardcodé) car pas de table attendance |
| `vw_fratrie_bookings` | Réduction **simulée** (10% hardcodé) car pas de colonne sibling_discount |
| `vw_urgence_candidates` | Détection urgence sur délais uniquement, pas de flag priority |
| `vw_bus_friendly_slots` | Badge **estimé**, pas de champ low_carbon_badge dans BDD |

---

## 🚀 Prochaines Étapes

**Après la démo** :
1. Créer vraies tables (attendance, waitlist, ab_experiments)
2. Remplacer vues par vraies données
3. Intégrer vues dans dashboard UI

**Pour l'instant** :
✅ Vues permettent de **tester requêtes SQL**
✅ **0 risque** de casse
✅ Prêt pour la démo

---

## 🆘 Rollback (si besoin)

Si les vues posent problème (mais elles ne devraient pas) :

```sql
-- Supprimer TOUTES les vues
DROP VIEW IF EXISTS vw_fratrie_groups CASCADE;
DROP VIEW IF EXISTS vw_fratrie_bookings CASCADE;
DROP VIEW IF EXISTS vw_attendance_simulation CASCADE;
DROP VIEW IF EXISTS vw_urgence_candidates CASCADE;
DROP VIEW IF EXISTS vw_inclusive_waitlist_needed CASCADE;
DROP VIEW IF EXISTS vw_inclusive_alternatives CASCADE;
DROP VIEW IF EXISTS vw_ab_metrics_by_zone CASCADE;
DROP VIEW IF EXISTS vw_ab_temporal_comparison CASCADE;
DROP VIEW IF EXISTS vw_dashboard_financeur_kpis CASCADE;
DROP VIEW IF EXISTS vw_bus_friendly_slots CASCADE;
DROP VIEW IF EXISTS vw_slot_fill_rate_by_time CASCADE;
```

**Mais rappel** : Elles ne modifient RIEN, donc pas besoin de les supprimer.

---

**Questions ? Besoin d'aide pour tester une vue spécifique ?**
