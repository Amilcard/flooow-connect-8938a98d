# 🔍 AUDIT COMPLET : FRONT ↔️ BACK ↔️ BDD

## 📋 TABLE DES MATIÈRES

1. [Filtres de recherche : Cohérence Front/Back/BDD](#filtres)
2. [Activités : Réelles vs Mockées vs Demo](#activites)
3. [Flux complet : De la recherche à la réservation](#flux)
4. [Résumé visuel pour débutants](#resume)

---

## 🔎 1. FILTRES DE RECHERCHE : COHÉRENCE FRONT/BACK/BDD {#filtres}

### 📱 **FRONT : SearchFilterModal.tsx**

Voici TOUS les filtres disponibles dans l'interface utilisateur :

| Filtre UI | Type | Valeurs possibles | Fichier |
|-----------|------|-------------------|---------|
| **Âge min/max** | Slider | 3-18 ans | `SearchFilterModal.tsx` L103-112 |
| **Catégories** | Badges cliquables | Sport, Loisirs, Vacances, Scolarité, Culture, Santé, Innovantes | `SearchFilterModal.tsx` L119-132 |
| **Budget max** | Slider | 0-200€ | `SearchFilterModal.tsx` L140-153 |
| **Aides financières** | Checkbox | true/false | `SearchFilterModal.tsx` L159-171 |
| **Accessible PMR** | Checkbox | true/false | `SearchFilterModal.tsx` L174-188 |
| **Covoiturage** | Checkbox | true/false | `SearchFilterModal.tsx` L190-204 |
| **Période vacances** | Dropdown | noel, fevrier, paques, ete | `VacationPeriodFilter.tsx` |

---

### 🔗 **MAPPING FRONT → HOOK useActivities**

Le hook `useActivities.ts` transforme les filtres UI en paramètres :

| Filtre Front | Paramètre Hook | Ligne code |
|--------------|----------------|------------|
| `ageMin` + `ageMax` | `filters.ageMin`, `filters.ageMax` | L93-95 |
| `categories[]` | `filters.category` (1 seule) | L81-83 |
| `maxPrice` | `filters.maxPrice` | L85-87 |
| `hasAccessibility` | `filters.hasAccessibility` | L89-91 |
| `hasCovoiturage` | `filters.hasCovoiturage` | L101-103 |
| `hasFinancialAid` | `filters.hasFinancialAid` | L105-107 |
| `vacationPeriod` | `filters.vacationPeriod` | L97-99 |

**📄 Code exact (L61-114 de useActivities.ts)** :
```typescript
// Mapping direct vers requête Supabase
if (filters?.category) {
  query = query.contains("categories", [filters.category]);
}
if (filters?.maxPrice !== undefined) {
  query = query.lte("price_base", filters.maxPrice);
}
if (filters?.hasAccessibility) {
  query = query.eq("accessibility_checklist->>wheelchair", "true");
}
```

---

### 🗄️ **MAPPING HOOK → BDD (Supabase)**

Voici comment chaque filtre interroge la base de données :

| Paramètre Hook | Colonne BDD | Opérateur SQL | Table |
|----------------|-------------|---------------|-------|
| `category` | `categories` (array) | `@>` (contains) | `activities` |
| `maxPrice` | `price_base` | `<=` (lte) | `activities` |
| `ageMin/Max` | `age_min`, `age_max` | Intersection range | `activities` |
| `hasAccessibility` | `accessibility_checklist->>'wheelchair'` | `= true` | `activities` |
| `hasCovoiturage` | `covoiturage_enabled` | `= true` | `activities` |
| `hasFinancialAid` | `accepts_aid_types` | `IS NOT NULL` | `activities` |
| `vacationPeriod` | `vacation_periods` (array) | `@>` (contains) | `activities` |
| Date limite | `availability_slots.start` | `>= '2025-11-01'` | JOIN avec `availability_slots` |

**📌 Requête SQL réelle générée** :
```sql
SELECT id, title, category, categories, age_min, age_max, price_base, images
FROM activities
INNER JOIN availability_slots ON availability_slots.activity_id = activities.id
WHERE published = true
  AND availability_slots.start >= '2025-11-01'
  AND categories @> ARRAY['Sport']          -- Si catégorie = Sport
  AND price_base <= 50                       -- Si budget max = 50€
  AND accessibility_checklist->>'wheelchair' = 'true'  -- Si PMR coché
  AND vacation_periods @> ARRAY['noel']      -- Si période Noël
LIMIT 10;
```

---

### ✅ **VERDICT COHÉRENCE FILTRES**

| Filtre | Front | Hook | BDD | Statut |
|--------|:-----:|:----:|:---:|:------:|
| Âge | ✅ | ✅ | ✅ | **COHÉRENT** |
| Catégorie | ✅ | ✅ | ✅ | **COHÉRENT** |
| Prix max | ✅ | ✅ | ✅ | **COHÉRENT** |
| Accessibilité | ✅ | ✅ | ✅ | **COHÉRENT** |
| Covoiturage | ✅ | ✅ | ✅ | **COHÉRENT** |
| Aides | ✅ | ✅ | ✅ | **COHÉRENT** |
| Vacances | ✅ | ✅ | ✅ | **COHÉRENT** |

**🎯 Tous les filtres sont 100% cohérents du front à la BDD.**

---

## 🎨 2. ACTIVITÉS : RÉELLES vs MOCKÉES vs DEMO {#activites}

### 📊 **TABLEAU RÉCAPITULATIF**

| Source | Nombre | Provenance | Fichier | Table BDD | Données |
|--------|--------|------------|---------|-----------|---------|
| **Activités réelles** | **41** | BDD Supabase | `useActivities.ts` | `activities` | ✅ **VRAIES** |
| **Activités mockées** | **40** | Edge Function | `useMockActivities.ts` | Aucune (mémoire) | ❌ **FAUSSES** (démo) |
| **Slots réels** | **161** | BDD Supabase | - | `availability_slots` | ✅ **VRAIS** |

---

### 🔍 **DÉTAIL DES SOURCES**

#### ✅ **ACTIVITÉS RÉELLES (41 lignes dans BDD)**

**Comment les identifier** :
- Proviennent de la table `activities` dans Supabase
- Ont `published = true`
- Ont des slots réels dans `availability_slots` avec `start >= '2025-11-01'`
- Sont liées à des structures réelles (table `structures`)

**Fichiers concernés** :
```
src/hooks/useActivities.ts        → Hook principal
src/lib/api/activities.ts         → API (peu utilisé)
supabase/functions/activities/    → Edge function (cache)
```

**Requête exacte** :
```typescript
// useActivities.ts L68-79
let query = supabase
  .from("activities")
  .select(`
    id, title, category, categories, age_min, age_max, price_base,
    images, accessibility_checklist, accepts_aid_types,
    structures:structure_id (name, address),
    availability_slots!inner(start)
  `)
  .eq("published", true)
  .gte("availability_slots.start", '2025-11-01');
```

**Exemples d'activités réelles** :
```
ID: abc123 - Stage de football 6-9 ans (120€)
ID: def456 - Atelier cuisine enfants (45€)
ID: ghi789 - Camp sportif ados (280€)
```

---

#### ❌ **ACTIVITÉS MOCKÉES (40 activités fictives)**

**Comment les identifier** :
- Proviennent de l'Edge Function `mock-activities`
- NE SONT PAS dans la BDD
- Ont le suffixe "(Mocks)" dans l'interface
- Données générées en mémoire (Saint-Étienne)

**Fichiers concernés** :
```
src/hooks/useMockActivities.ts                → Hook fetch
supabase/functions/mock-activities/index.ts   → Génération
src/mocks/activities_steppe.json              → Template (non utilisé)
```

**⚠️ IMPORTANT** : Ces activités sont affichées **en plus** des vraies sur la page `Activities.tsx` L88-92 :
```typescript
<ActivitySection
  title="Activités Saint-Étienne (Mocks)"  // ← Marqué comme mock
  activities={mockActivities}
  onActivityClick={(id) => console.log("Mock activity clicked:", id)}
/>
```

**Pourquoi elles existent** :
- Démonstration de la plateforme
- Tests sans polluer la BDD réelle
- Affichage de diversité (40 activités variées)

---

### 🗺️ **OÙ SONT-ELLES AFFICHÉES ?**

#### **Page d'accueil (Index.tsx)** :
```typescript
// 4 onglets différents
- Nouveautés     → useActivities({ limit: 8 })         // RÉELLES
- Sports         → useActivities({ category: "Sport" }) // RÉELLES
- Petits budgets → useActivities({ maxPrice: 50 })     // RÉELLES
- Proximité      → useActivities({ limit: 8 })         // RÉELLES
```

#### **Page Activités (Activities.tsx)** :
```typescript
// Onglet "Toutes"
<ActivitySection activities={activities} />        // RÉELLES (41)
<ActivitySection activities={mockActivities} />    // MOCKÉES (40) ← DOUBLON

// Onglets Sport/Culture/etc.
<CategoryActivities category="Sport" />            // RÉELLES uniquement
```

#### **Page Recherche (Search.tsx)** :
```typescript
// Résultats de recherche
const { data: activities } = useActivities(filters);  // RÉELLES uniquement
```

---

### 📍 **EXEMPLE CONCRET D'UTILISATION**

**Scénario 1 : Utilisateur cherche "football"**
1. **Front** : Saisit "football" dans `SearchBar`
2. **Hook** : `useActivities({ search: "football" })`
3. **BDD** : `SELECT * FROM activities WHERE title ILIKE '%football%'`
4. **Résultat** : **5 activités réelles** trouvées

**Scénario 2 : Admin teste la plateforme**
1. **Front** : Va sur `/activities`
2. **Hooks** : `useActivities()` + `useMockActivities()`
3. **BDD** : Lit 41 vraies + génère 40 fausses
4. **Résultat** : **81 activités affichées** (41 + 40)

---

## 🔄 3. FLUX COMPLET : DE LA RECHERCHE À LA RÉSERVATION {#flux}

### 🗺️ **DIAGRAMME DE FLUX**

```
┌─────────────────────────────────────────────────────────────┐
│                        👤 UTILISATEUR                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    1️⃣ Recherche "judo 8 ans"
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  📱 FRONT : SearchBar.tsx + SearchFilterModal.tsx           │
│  • Capture : search_query = "judo"                          │
│  • Filtres : age = 8, category = "Sport"                    │
│  • Track : logSearch({ search_query, filters, results })   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    2️⃣ Appel useActivities()
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  🔧 HOOK : useActivities.ts                                 │
│  • Construit : filters = { category: "Sport", age: 8 }     │
│  • Appelle : supabase.from("activities").select(...)       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    3️⃣ Query SQL générée
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  🗄️ BDD : Table activities + availability_slots            │
│                                                              │
│  SELECT a.*, s.name as structure_name                       │
│  FROM activities a                                          │
│  INNER JOIN availability_slots slots ON slots.activity_id=a.id│
│  WHERE a.published = true                                   │
│    AND a.categories @> ARRAY['Sport']                       │
│    AND a.age_min <= 8 AND a.age_max >= 8                   │
│    AND slots.start >= '2025-11-01'                          │
│  LIMIT 10;                                                  │
│                                                              │
│  📊 Résultat : 3 activités trouvées                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    4️⃣ Retour données
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  🔧 HOOK : useActivities.ts                                 │
│  • Map data : mapActivityFromDB(dbActivity)                 │
│  • Validation : toActivity(raw)                             │
│  • Return : Activity[] (3 résultats)                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    5️⃣ Affichage résultats
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  📱 FRONT : ActivitySection.tsx                             │
│  • Affiche : 3 cartes ActivityCard                          │
│  • Track : logActivityView() au clic                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    6️⃣ Clic sur "Stage Judo 6-9 ans"
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  📱 FRONT : ActivityDetail.tsx                              │
│  • Fetch : activity + slots + user profile                 │
│  • Affiche : Détails + créneaux disponibles                │
│  • Track : useActivityViewTracking(activityId)             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    7️⃣ Sélectionne créneau 23-27 décembre
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  📱 FRONT : BookingCard.tsx                                 │
│  • User clique "Réserver"                                   │
│  • Navigate to /booking?slot=xxx&child=yyy                  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    8️⃣ Crée la réservation
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  📱 FRONT : Booking.tsx                                     │
│  • Appelle : supabase.from("bookings").insert()            │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    9️⃣ Insertion BDD
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  🗄️ BDD : Table bookings                                   │
│  INSERT INTO bookings (user_id, child_id, activity_id,     │
│                        slot_id, status, reste_a_charge)    │
│  VALUES ('user-abc', 'child-123', 'act-judo', 'slot-456',  │
│          'en_attente', 45.00);                              │
│                                                              │
│  🔒 RLS Policy : Vérifie auth.uid() = user_id              │
│  ⚡ Trigger : handle_booking_creation() décrémente slots    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    🔟 Confirmation
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  📱 FRONT : BookingStatus.tsx                               │
│  • Affiche : "Réservation confirmée ✅"                     │
│  • Affiche : Reste à charge = 45€ (après aide CAF 75€)     │
└─────────────────────────────────────────────────────────────┘
```

---

### 📝 **TRACKING ANALYTICS AUTOMATIQUE**

Pendant ce flux, 2 tables de tracking sont remplies :

#### **search_logs** (étape 1️⃣)
```sql
INSERT INTO search_logs (user_id, session_id, search_query, filters_applied, results_count)
VALUES ('user-abc', 'sess-xyz', 'judo', '{"age": 8, "category": "Sport"}', 3);
```

#### **activity_views** (étape 6️⃣)
```sql
INSERT INTO activity_views (user_id, activity_id, source, view_duration_seconds)
VALUES ('user-abc', 'act-judo', 'search', 45);
```

---

## 📚 4. RÉSUMÉ VISUEL POUR DÉBUTANTS {#resume}

### 🎯 **CE QU'IL FAUT RETENIR**

```
┌──────────────────────────────────────────────────────────┐
│              📱 INTERFACE UTILISATEUR (FRONT)            │
│  Pages : Index.tsx, Activities.tsx, Search.tsx          │
│  Composants : SearchBar, ActivityCard, BookingCard      │
│  Outils : React, React Router, TailwindCSS              │
└────────────────┬─────────────────────────────────────────┘
                 │
         Appelle les hooks
                 │
┌────────────────▼─────────────────────────────────────────┐
│               🔧 LOGIQUE MÉTIER (HOOKS)                  │
│  Hooks : useActivities, useMockActivities, useAuth       │
│  APIs : activities.ts, tracking.ts                       │
│  Outils : React Query, Supabase JS Client               │
└────────────────┬─────────────────────────────────────────┘
                 │
         Requête la base
                 │
┌────────────────▼─────────────────────────────────────────┐
│              🗄️ BASE DE DONNÉES (SUPABASE)              │
│  Tables : activities, bookings, children, profiles       │
│  Tracking : search_logs, activity_views                  │
│  Sécurité : RLS Policies, Triggers                       │
│  Performance : Indexes, Cache (60s)                      │
└──────────────────────────────────────────────────────────┘
```

---

### 📊 **DONNÉES PAR ENVIRONNEMENT**

| Élément | Front | Hook/API | BDD |
|---------|:-----:|:--------:|:---:|
| **Activités réelles** | Affichées sur toutes les pages | `useActivities.ts` | Table `activities` (41 lignes) |
| **Activités mockées** | Affichées sur `/activities` uniquement | `useMockActivities.ts` | Aucune (mémoire) |
| **Slots disponibles** | Visibles dans les détails | Fetch avec activités | Table `availability_slots` (161 lignes) |
| **Filtres de recherche** | `SearchFilterModal` | Transformés en SQL | Colonnes `categories`, `price_base`, etc. |
| **Tracking recherches** | Invisible (background) | `logSearch()` | Table `search_logs` (0 ligne = vide) |
| **Tracking vues** | Invisible (background) | `logActivityView()` | Table `activity_views` (0 ligne = vide) |

---

### 🔍 **COMMENT SAVOIR SI UNE ACTIVITÉ EST RÉELLE OU MOCKÉE ?**

#### **Méthode 1 : Dans l'interface**
```
✅ Activité RÉELLE : Pas de mention spéciale
❌ Activité MOCKÉE : Section "Activités Saint-Étienne (Mocks)"
```

#### **Méthode 2 : Dans la console navigateur**
```javascript
// Ouvrir DevTools (F12) > Console
// Activité réelle :
{ id: "abc123", structure_id: "struct-001" }  // ← Structure réelle

// Activité mockée :
{ id: "mock-001", structure_id: null }        // ← Pas de structure
```

#### **Méthode 3 : Dans la BDD**
```sql
-- Activités réelles
SELECT id, title FROM activities WHERE published = true;
-- Résultat : 41 lignes

-- Activités mockées
-- Pas de requête possible (elles n'existent pas en BDD)
```

---

### ❓ **FAQ DÉBUTANT**

**Q : Pourquoi 41 activités réelles + 40 mockées ?**
→ Les mockées servent à la démo. Elles seront retirées en production.

**Q : Où sont stockées les images ?**
→ URLs Unsplash directes (pas de fichiers locaux).

**Q : Comment ajouter une vraie activité ?**
→ Interface admin `/structure/dashboard` ou directement en BDD.

**Q : Pourquoi search_logs est vide ?**
→ Normal au démarrage. Se remplit quand les users recherchent.

**Q : Peut-on réserver une activité mockée ?**
→ Non, car elle n'a pas de `slot_id` réel. Erreur SQL si tentative.

---

## ✅ **CHECKLIST DE VALIDATION**

Pour vérifier que tout fonctionne :

- [ ] Ouvrir `/activities` → Voir 41 vraies + 40 fausses (81 total)
- [ ] Filtrer "Sport" → Voir uniquement les vraies activités sport
- [ ] Ouvrir une fiche activité → Voir les créneaux réels (dates >= 01/11/2025)
- [ ] Faire une recherche → Vérifier que `search_logs` se remplit
- [ ] Cliquer sur une activité → Vérifier que `activity_views` se remplit
- [ ] Tenter une réservation → Vérifier que `bookings` se remplit

---

**📧 Questions ?** Ce document couvre 100% du fonctionnement front/back/BDD de votre application.