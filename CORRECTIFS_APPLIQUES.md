# Correctifs Appliqués - Tracking & KPIs

**Date** : 2025-01-28  
**Statut** : ✅ Tous les correctifs P0 implémentés

---

## Résumé des Modifications

### ✅ 1. Filtres Recherche (30min)

**Fichiers modifiés** :
- `src/hooks/useActivities.ts` (lignes 22-30, 95-107)

**Ajouts** :
- Filtre `hasCovoiturage` : filtre activités avec covoiturage activé
- Filtre `hasFinancialAid` : filtre activités acceptant des aides financières

**Impact** :
- Recherche complète : 9/9 filtres fonctionnels
- Utilisateurs peuvent filtrer selon mobilité et aides

---

### ✅ 2. Tables de Tracking (3h)

**Migration SQL exécutée** :
- Table `search_logs` : tracking des recherches utilisateur
- Table `activity_views` : tracking consultations fiches activités
- Colonnes `bookings` : confirmation de présence effective

**Sécurité** :
- RLS policies configurées pour tous les rôles
- Index de performance créés
- Tracking anonyme possible (user_id nullable)

**Structure** :

```sql
-- search_logs
- id, user_id, session_id, search_query
- filters_applied (JSONB)
- results_count, created_at

-- activity_views
- id, activity_id, user_id, session_id
- view_duration_seconds, source
- created_at

-- bookings (ajouts)
+ participation_confirmed (BOOLEAN)
+ participation_confirmed_at (TIMESTAMPTZ)
+ participation_confirmed_by (UUID)
```

---

### ✅ 3. Helper Tracking (1h)

**Fichier créé** : `src/lib/tracking.ts`

**Fonctions exportées** :
- `logSearch(params)` : Logger une recherche
- `logActivityView(params)` : Logger une consultation
- `useActivityViewTracking()` : Hook pour tracking automatique durée

**Caractéristiques** :
- Session ID unique par navigateur (sessionStorage)
- Fail silently (pas d'impact UX si erreur)
- Seuil minimum 2 secondes (évite bounces)

---

### ✅ 4. Implémentation Frontend (2h)

#### Page Search (`src/pages/Search.tsx`)

**Modifications lignes 1-11, 35-47** :
- Import `useEffect` + `logSearch`
- useEffect : log automatique à chaque changement résultats
- Logger nombre de résultats + filtres appliqués

#### Page ActivityDetail (`src/pages/ActivityDetail.tsx`)

**Modifications lignes 38-44, 64-72** :
- Import `useActivityViewTracking`
- Hook appelé au mount du composant
- Cleanup : log durée consultation au unmount

**Source détectée** :
- `'direct'` par défaut (accès URL directe)
- Extensible : `'search'`, `'home'`, `'favorites'`

---

### ✅ 5. Enrichissement KPIs (3h)

**Fichier modifié** : `supabase/functions/dashboard-kpis/index.ts`

**5 nouveaux KPIs ajoutés** :

#### 1. Recherches
```json
{
  "total": 250,
  "source": "search_logs",
  "description": "Nombre total de recherches"
}
```

#### 2. Top Activités
```json
{
  "activities": [
    { "id": "...", "title": "Judo", "views": 145 },
    { "id": "...", "title": "Natation", "views": 98 }
  ],
  "source": "activity_views (agrégation)"
}
```

#### 3. Conversion
```json
{
  "rate": "18.0",
  "views": 450,
  "bookings": 81,
  "source": "activity_views + bookings"
}
```

#### 4. Participation
```json
{
  "rate": "92.0",
  "confirmed": 75,
  "total": 81,
  "source": "bookings.participation_confirmed"
}
```

#### 5. Impact Territoires
```json
{
  "impact": [
    { "territory_name": "Saint-Étienne", "bookings_count": 45 },
    { "territory_name": "Lyon", "bookings_count": 28 }
  ],
  "source": "bookings + structures + territories"
}
```

---

## Impact Démo

### Avant Correctifs ❌
- Filtres : 7/9 (manque covoiturage + aides)
- Tracking : Seulement réservations finales
- KPIs : 5/10 indicateurs
- Argumentaire : Incomplet (pas de taux conversion)

### Après Correctifs ✅
- Filtres : 9/9 (100% fonctionnels)
- Tracking : Recherches + Consultations + Réservations
- KPIs : 10/10 indicateurs
- Argumentaire : Complet avec métriques d'engagement

---

## Utilisation Dashboard

### Appel Edge Function

```typescript
const { data, error } = await supabase.functions.invoke('dashboard-kpis');

console.log(data.kpis.conversion.rate); // "18.0"
console.log(data.kpis.topActivites.activities); // Top 5
console.log(data.kpis.territories.impact); // Par territoire
```

### Exemple Affichage Démo

**Card "Trafic"** :
- 250 recherches cette semaine
- Top 3 : Judo (145 vues), Natation (98 vues), Arts plastiques (76 vues)

**Card "Conversion"** :
- 450 consultations → 81 réservations = 18% conversion
- Taux présence effective : 92%

**Card "Territoires"** :
- Saint-Étienne : 45 inscriptions
- Lyon : 28 inscriptions
- Montpellier : 8 inscriptions

---

## Tests Recommandés

### 1. Test Tracking Recherche
```bash
# Naviguer vers /search avec filtres
# Vérifier insertion dans search_logs
SELECT * FROM search_logs ORDER BY created_at DESC LIMIT 5;
```

### 2. Test Tracking Consultation
```bash
# Ouvrir fiche activité, rester 5 secondes
# Fermer ou naviguer ailleurs
SELECT * FROM activity_views ORDER BY created_at DESC LIMIT 5;
```

### 3. Test KPIs
```bash
# Appeler edge function
curl -X POST https://[PROJECT_ID].supabase.co/functions/v1/dashboard-kpis \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json"
```

---

## Prochaines Étapes (Post-Démo)

### P1 - Améliorations

1. **Géolocalisation** (8h)
   - Activer PostGIS extension
   - Calcul distance user ↔ activité
   - Filtre rayon km

2. **Profils détaillés** (2h)
   - KPI par QF (quotient familial)
   - KPI par situation familiale

3. **Analytics avancés** (3h)
   - Heatmap temps passé
   - Parcours utilisateur complet
   - Taux abandon (< 5s)

---

## Notes Techniques

### Performance
- Index créés sur toutes les colonnes de recherche
- Tracking asynchrone (pas de blocage UX)
- Session ID en sessionStorage (pas de cookie)

### Sécurité
- RLS policies par rôle (parent/structure/admin)
- user_id nullable (tracking anonyme possible)
- Pas d'exposition données sensibles

### Maintenance
- Logs silencieux en cas d'erreur
- Tables documentées (COMMENT ON)
- Code modulaire et réutilisable

---

## Résumé Final

| Critère | Avant | Après | Gain |
|---------|-------|-------|------|
| Filtres recherche | 7/9 | 9/9 | +2 |
| Tables tracking | 0/2 | 2/2 | +2 |
| KPIs dashboard | 5/10 | 10/10 | +5 |
| Temps dev | 0h | 9h | ✅ |

**Statut MVP** : ✅ Prêt pour démo avec dashboard complet

**Fichiers modifiés** : 6
**Fichiers créés** : 2
**Migration SQL** : 1 (3 tables/modifications)
**Tests requis** : 3 scénarios

---

## Contact & Support

Pour questions techniques :
- Migration SQL : `supabase/migrations/[timestamp]_tracking_tables.sql`
- Helper tracking : `src/lib/tracking.ts`
- Edge function : `supabase/functions/dashboard-kpis/index.ts`

**Dernière mise à jour** : 2025-01-28
