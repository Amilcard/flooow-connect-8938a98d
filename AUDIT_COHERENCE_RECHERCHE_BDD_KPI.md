# AUDIT COMPLET : Moteur de Recherche ↔ BDD ↔ Indicateurs

**Date audit** : 2025-01-28  
**Objectif** : Vérifier cohérence chaîne complète recherche → affichage → tracking → KPIs

---

## 1. VÉRIFICATION MOTEUR DE RECHERCHE

### A. Affichage des Activités ✅ CONFORME

| Champ affiché | Table BDD | Logique validée | Statut |
|---------------|-----------|-----------------|--------|
| Nom activité | `activities.title` | ✅ SELECT title | ✅ **OK** |
| Localisation | `structures.address` | ✅ JOIN structure_id | ✅ **OK** |
| Collectivité organisatrice | `structures.name` | ✅ JOIN structure_id | ✅ **OK** |
| Date/horaires | `availability_slots.start/end` | ✅ INNER JOIN slots | ✅ **OK** |
| Places disponibles | `availability_slots.seats_remaining` | ✅ Calcul temps réel | ✅ **OK** |
| Tranche d'âge | `activities.age_min, age_max` | ✅ Format "{min}-{max} ans" | ✅ **OK** |
| Type/catégorie | `activities.category, categories[]` | ✅ SELECT categories | ✅ **OK** |
| Accessibilité | `activities.accessibility_checklist` | ✅ JSONB wheelchair | ✅ **OK** |
| Prix | `activities.price_base` | ✅ SELECT price_base | ✅ **OK** |
| Covoiturage | `activities.covoiturage_enabled` | ✅ Boolean flag | ✅ **OK** |
| Aides financières | `activities.accepts_aid_types` | ✅ JSONB array | ✅ **OK** |

**Fichiers concernés** :
- `src/hooks/useActivities.ts` (ligne 66-78) : Query principale
- `src/pages/Search.tsx` (ligne 35) : Appel avec filtres
- `src/components/Activity/ActivityCard.tsx` : Affichage cartes

---

### B. Filtres de Recherche ⚠️ PARTIELLEMENT CONFORME

| Filtre | Table BDD | Logique SQL | Statut | Action requise |
|--------|-----------|-------------|--------|----------------|
| **Âge enfant** | `age_min, age_max` | `WHERE age_min <= :age AND age_max >= :age` | ✅ **OK** | Ligne 91-92 useActivities.ts |
| **Catégorie** | `categories[]` | `WHERE categories @> ARRAY[:cat]` | ✅ **OK** | Ligne 79-81 useActivities.ts |
| **Prix max** | `price_base` | `WHERE price_base <= :max` | ✅ **OK** | Ligne 83-85 useActivities.ts |
| **Accessibilité PMR** | `accessibility_checklist` | `WHERE accessibility_checklist->>'wheelchair' = 'true'` | ✅ **OK** | Ligne 87-89 useActivities.ts |
| **Covoiturage** | `covoiturage_enabled` | `WHERE covoiturage_enabled = true` | ⚠️ **PARTIEL** | Pas implémenté dans useActivities |
| **Aides financières** | `accepts_aid_types` | `WHERE accepts_aid_types @> ARRAY[...]` | ⚠️ **PARTIEL** | Pas implémenté dans useActivities |
| **Période vacances** | `vacation_periods[]` | `WHERE vacation_periods @> ARRAY[:period]` | ✅ **OK** | Ligne 95-97 useActivities.ts |
| **Géolocalisation** | `structures.location` | Distance PostGIS | ❌ **MANQUANT** | Pas de calcul géographique |
| **Collectivité** | `structures.territory_id` | `JOIN territories` | ❌ **MANQUANT** | Pas de filtre territoire |

**Actions critiques MVP** :
1. ⚠️ **Ajouter filtre covoiturage** dans `useActivities.ts` ligne 99
2. ⚠️ **Ajouter filtre aides** dans `useActivities.ts` ligne 100
3. ❌ **Géolocalisation** : Nécessite PostGIS extension + calcul distance (P1 - non bloquant MVP)

---

## 2. VÉRIFICATION TRACKING UTILISATEUR ❌ CRITIQUE MANQUANT

### A. Actions à Tracker ❌ NON IMPLÉMENTÉ

| Action | Table idéale | État actuel | Impact KPIs | Priorité |
|--------|--------------|-------------|-------------|----------|
| **Recherches** | `logs_recherches` | ❌ Pas de table | Nb recherches, filtres populaires | **P0** |
| **Consultations fiche** | `consultations_activites` | ❌ Pas de table | Taux conversion, top activités | **P0** |
| **Durée consultation** | `consultations_activites.duration_seconds` | ❌ Pas de tracking | Engagement utilisateur | **P1** |
| **Réservations** | `bookings` (✅ existe) | ✅ Tracké | Conversion finale | ✅ OK |
| **Participations effectives** | `bookings.status = 'validee'` | ⚠️ Statut manque validation présence | Taux no-show | **P0** |

**CRITIQUE** : Aucun tracking pré-réservation → Impossible calculer :
- Taux conversion recherche → consultation → réservation
- Activités les plus populaires (≠ les plus réservées)
- Parcours utilisateur complet

---

### B. Solution Proposée : Créer Tables Tracking

#### Table 1 : `search_logs` (P0 - Blocker MVP)
```sql
CREATE TABLE public.search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  session_id TEXT,
  search_query TEXT,
  filters_applied JSONB DEFAULT '{}',
  results_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_logs_user ON search_logs(user_id);
CREATE INDEX idx_search_logs_created ON search_logs(created_at DESC);

ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own searches"
  ON public.search_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own searches"
  ON public.search_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all searches"
  ON public.search_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('superadmin', 'territory_admin')
    )
  );
```

#### Table 2 : `activity_views` (P0 - Blocker MVP)
```sql
CREATE TABLE public.activity_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  session_id TEXT,
  view_duration_seconds INTEGER,
  source TEXT, -- 'search', 'home', 'direct'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_views_activity ON activity_views(activity_id);
CREATE INDEX idx_activity_views_user ON activity_views(user_id);
CREATE INDEX idx_activity_views_created ON activity_views(created_at DESC);

ALTER TABLE public.activity_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity views"
  ON public.activity_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity views"
  ON public.activity_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity views"
  ON public.activity_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('superadmin', 'territory_admin')
    )
  );

CREATE POLICY "Structures can view views for their activities"
  ON public.activity_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM activities a
      JOIN structures s ON a.structure_id = s.id
      JOIN user_roles ur ON ur.user_id = auth.uid()
      WHERE a.id = activity_views.activity_id
      AND ur.role = 'structure'
    )
  );
```

#### Modification Table 3 : `bookings` (P0)
```sql
-- Ajouter colonnes pour confirmation de présence
ALTER TABLE public.bookings 
ADD COLUMN participation_confirmed BOOLEAN DEFAULT NULL,
ADD COLUMN participation_confirmed_at TIMESTAMPTZ,
ADD COLUMN participation_confirmed_by UUID REFERENCES profiles(id);

-- Créer index pour recherches rapides
CREATE INDEX idx_bookings_participation ON bookings(participation_confirmed) 
WHERE participation_confirmed IS NOT NULL;
```

**Implémentation frontend** :
- `src/pages/Search.tsx` : Log chaque recherche avec filtres
- `src/pages/ActivityDetail.tsx` : Log ouverture fiche + durée (tracking `useEffect` + cleanup)
- `src/pages/AdminSessions.tsx` : Bouton "Confirmer présence" pour structures

---

## 3. VÉRIFICATION GÉNÉRATION INDICATEURS ⚠️ PARTIELLEMENT CONFORME

### A. Dashboard Existant (supabase/functions/dashboard-kpis/index.ts)

| KPI | Source BDD | Calcul validé | Statut | Note |
|-----|-----------|----------------|--------|------|
| **Nb inscriptions** | `bookings.status = 'validee'` | ✅ COUNT(*) | ✅ **OK** | Ligne 23-26 |
| **% handicap** | `children.accessibility_flags` | ✅ COUNT avec flags actifs / total | ✅ **OK** | Ligne 36-50 |
| **% QPV** | Vue `v_qpv_stats` | ✅ Basé postal_code → qpv_reference | ✅ **OK** | Ligne 52-64 |
| **Répartition mobilité** | `bookings.transport_mode` | ✅ GROUP BY mode | ✅ **OK** | Ligne 67-85 |
| **Santé (min/semaine)** | `availability_slots.start/end` | ✅ AVG durée × bookings | ✅ **OK** | Ligne 87-114 |

---

### B. Indicateurs Manquants ❌ BLOQUANTS DÉMO

| Indicateur | Calcul nécessaire | Tables requises | Priorité | Impact démo |
|------------|-------------------|-----------------|----------|-------------|
| **Nb recherches** | `COUNT(search_logs)` par période | ❌ `search_logs` manquante | **P0** | Trafic plateforme |
| **Top activités vues** | `COUNT(activity_views) GROUP BY activity_id` | ❌ `activity_views` manquante | **P0** | ROI activités |
| **Taux conversion** | `(bookings / activity_views) * 100` | ❌ Deux tables manquantes | **P0** | Efficacité plateforme |
| **Taux participation** | `(participation_confirmed / reservations) * 100` | ⚠️ Colonne manquante | **P0** | No-show rate |
| **Profils touchés** | `JOIN profiles.marital_status, quotient_familial` | ✅ Données présentes, calcul manquant | **P1** | Impact social |
| **Couverture territoriale** | `COUNT DISTINCT(structures.territory_id)` WHERE bookings > 0 | ✅ Données présentes, calcul manquant | **P1** | Maillage géographique |
| **Impact collectivité** | `COUNT(bookings) GROUP BY territory_id` | ✅ Données présentes, calcul manquant | **P1** | Performance locale |

---

### C. Solution Proposée : Enrichir dashboard-kpis

**Ajouter dans edge function** (après création tables tracking) :

```typescript
// 6. Nb recherches (nécessite search_logs)
const { count: totalSearches } = await supabaseClient
  .from('search_logs')
  .select('*', { count: 'exact', head: true })
  .gte('created_at', startDate)
  .lte('created_at', endDate);

// 7. Top 5 activités consultées (nécessite activity_views)
const { data: topActivities } = await supabaseClient
  .from('activity_views')
  .select(`
    activity_id,
    activities (title, category),
    count
  `)
  .gte('created_at', startDate)
  .order('count', { descending: true })
  .limit(5);

// 8. Taux conversion (nécessite activity_views + bookings)
const { count: totalViews } = await supabaseClient
  .from('activity_views')
  .select('*', { count: 'exact', head: true })
  .gte('created_at', startDate);

const conversionRate = totalBookings > 0 && totalViews > 0 
  ? ((totalBookings / totalViews) * 100).toFixed(1)
  : '0';

// 9. Taux participation réelle
const { count: confirmedParticipations } = await supabaseClient
  .from('bookings')
  .select('*', { count: 'exact', head: true })
  .eq('participation_confirmed', true)
  .gte('created_at', startDate);

const participationRate = totalBookings > 0
  ? ((confirmedParticipations / totalBookings) * 100).toFixed(1)
  : '0';

// 10. Impact par territoire
const { data: territoryImpact } = await supabaseClient
  .rpc('get_territory_impact', { 
    start_date: startDate,
    end_date: endDate 
  });
```

**Fonction SQL pour territoire** :
```sql
CREATE OR REPLACE FUNCTION get_territory_impact(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
RETURNS TABLE (
  territory_id UUID,
  territory_name TEXT,
  bookings_count BIGINT,
  unique_users BIGINT
) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    COUNT(DISTINCT b.id)::BIGINT,
    COUNT(DISTINCT b.user_id)::BIGINT
  FROM territories t
  JOIN structures s ON s.territory_id = t.id
  JOIN activities a ON a.structure_id = s.id
  JOIN bookings b ON b.activity_id = a.id
  WHERE b.status = 'validee'
    AND b.created_at >= start_date
    AND b.created_at <= end_date
  GROUP BY t.id, t.name
  ORDER BY COUNT(b.id) DESC;
END;
$$;
```

---

## 4. SYNTHÈSE PRIORITÉS MVP

### 🔴 **P0 - BLOQUANTS DEMO** (implémenter avant démo)

#### 1. ✅ **Filtres manquants** (30min dev)
**Fichier** : `src/hooks/useActivities.ts`

Ajouter après ligne 96 :
```typescript
if (filters?.hasCovoiturage) {
  query = query.eq("covoiturage_enabled", true);
}

if (filters?.hasFinancialAid) {
  query = query.not("accepts_aid_types", "is", null)
    .neq("accepts_aid_types", "[]");
}
```

#### 2. ❌ **Tables tracking** (4h dev + 1h tests)
- **Migration SQL** : Créer `search_logs`, `activity_views`
- **Modifier** : `bookings` (participation_confirmed)
- **Frontend** : Implémenter logs
  - `src/pages/Search.tsx` : useEffect log recherche
  - `src/pages/ActivityDetail.tsx` : useEffect log vue + durée
  - Créer `src/lib/tracking.ts` pour fonctions réutilisables

#### 3. ❌ **KPIs additionnels** (3h dev)
- **Modifier** : `supabase/functions/dashboard-kpis/index.ts`
- Ajouter 5 nouveaux KPIs :
  - Nb recherches
  - Top activités vues
  - Taux conversion
  - Taux participation
  - Impact territoire

**Temps total P0** : ~9h

---

### 🟠 **P1 - POST-DEMO** (amélioration continue)

#### 4. 🟡 **Géolocalisation** (8h dev)
- Activer PostGIS extension
- Calcul distance user ↔ activité
- Filtre rayon km
- Tri par distance

#### 5. 🟡 **Profils touchés détaillés** (2h dev)
- Ajout calcul par QF
- Ajout calcul par situation familiale
- Vue agrégée `v_profiles_reached`

#### 6. 🟡 **Durée consultation** (1h dev)
- Améliorer tracking temps passé
- Heatmap engagement
- Détection abandon (< 5s)

---

## 5. FICHIERS À MODIFIER

### Frontend (4 fichiers)
- ✅ `src/hooks/useActivities.ts` (ligne 99-110) : Ajouter filtres
- ❌ `src/pages/Search.tsx` : Logger recherches → `search_logs`
- ❌ `src/pages/ActivityDetail.tsx` : Logger vues → `activity_views`
- ❌ `src/lib/tracking.ts` : Créer helper functions tracking
- ❌ `src/pages/AdminSessions.tsx` : Bouton confirmer présence

### Backend (2 fichiers + migration)
- ❌ Migration SQL : 3 nouvelles tables/modifications
- ❌ `supabase/functions/dashboard-kpis/index.ts` : 5 nouveaux KPIs
- ❌ Fonction SQL `get_territory_impact()`

---

## 6. IMPACT DÉMO

### Avec P0 implémenté ✅
- **Trafic** : "250 recherches cette semaine"
- **Engagement** : "Top 3 activités : Judo (145 vues), Natation (98 vues)..."
- **Efficacité** : "Taux conversion 18% (recherche → réservation)"
- **Participation** : "Taux présence effective 92%"
- **Territoire** : "Saint-Étienne : 45 inscriptions, 28 familles"

### Sans P0 ❌
- **Trafic** : ❓ Inconnu
- **Engagement** : ❓ Uniquement nb réservations (pas de vues)
- **Efficacité** : ❓ Impossible calculer taux conversion
- **Participation** : ❓ Pas de distinction réservation vs présence réelle
- **Territoire** : ⚠️ Calculable mais pas automatisé

---

## 7. CONCLUSION

| Domaine | État actuel | État cible MVP | Gap critique |
|---------|-------------|----------------|--------------|
| **Affichage activités** | ✅ 11/11 champs | ✅ 11/11 | **0** |
| **Filtres recherche** | ⚠️ 7/9 filtres | ✅ 9/9 | **2 filtres** (30min) |
| **Tracking utilisateur** | ❌ 1/4 actions | ✅ 4/4 | **3 tables** (5h) |
| **Indicateurs** | ✅ 5/10 KPIs | ✅ 10/10 | **5 KPIs** (3h) |

**Blocage démo** : Sans tracking pré-réservation, impossible démontrer :
- Attractivité réelle activités (vues ≠ réservations)
- Efficacité plateforme (conversion)
- ROI collectivités (impact réel)
- Présence effective (no-show rate)

**Recommandation** : **Prioriser P0 (9h dev)** avant démo pour dashboard complet et argumentaire solide financeurs/collectivités.

---

## 8. PROCHAINES ÉTAPES

1. **Valider périmètre P0** avec stakeholders
2. **Créer migration SQL** (search_logs, activity_views, bookings modifications)
3. **Implémenter tracking frontend** (2 pages + 1 lib)
4. **Enrichir dashboard KPIs** (edge function)
5. **Tests E2E** parcours complet (recherche → vue → réservation → confirmation)
6. **Démo dry-run** avec données réelles générées

**Estimation globale P0** : 1.5 jours dev + 0.5 jour tests = **2 jours sprint**
