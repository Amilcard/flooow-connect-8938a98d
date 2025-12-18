# Rapport d'Audit Sécurité Front vs Back
## Estimation Aides Financières (Supabase) + Éco-mobilité (Google Maps)

**Date**: 2025-12-18
**Auditeur**: Claude Senior Dev
**Scope**: Frontend React + Supabase Edge Functions + RLS Policies

---

## Résumé Exécutif

| Domaine | Niveau de Risque | Statut |
|---------|------------------|--------|
| Logique Aides Frontend | **P1 MEDIUM** | Visible mais non autoritaire |
| Google Maps / Éco-mobilité | **P3 LOW** | Clé proxy via Edge Function |
| Secrets Supabase | **P4 OK** | `service_role` uniquement côté serveur |
| RLS Policies | **P2 LOW** | Correctement configurées |

---

## 1. Analyse Logique Aides Financières

### 1.1 Architecture Identifiée

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Visible)                        │
├─────────────────────────────────────────────────────────────────┤
│ src/utils/FinancialAidEngine.ts                                 │
│   - Thresholds QF hardcodés (Pass Colo, VACAF, CAF Loire...)    │
│   - Calcul estimation INFORMATIONNEL                            │
│   - BUT: Affichage ESTIMATIF pour l'utilisateur                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ POST /bookings
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Autoritaire)                        │
├─────────────────────────────────────────────────────────────────┤
│ supabase/functions/bookings/index.ts:255-288                    │
│   - RPC `calculate_eligible_aids` (SECURITY DEFINER)            │
│   - Lit depuis table `financial_aids` (database-driven)         │
│   - Calcul DÉFINITIF stocké dans booking                        │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Fichier Analysé: `src/utils/FinancialAidEngine.ts`

**Thresholds exposés** (lignes 25-64):
```typescript
// VISIBLE DANS LE CODE SOURCE FRONTEND
const PASS_COLO_QF: QFThreshold[] = [
  { max: 200, montant: 350 },
  { max: 500, montant: 300 },
  { max: 700, montant: 250 },
];

const VACAF_AVE_QF: QFThreshold[] = [
  { max: 450, montant: 200 },
  { max: 700, montant: 150 },
];

// ... etc pour 12 dispositifs
```

### 1.3 Source de Vérité Serveur

**Edge Function** `supabase/functions/bookings/index.ts:255-264`:
```typescript
// SERVER-SIDE AIDS CALCULATION (don't trust client)
const { data: eligibleAids } = await userClient
  .rpc('calculate_eligible_aids', {
    p_age: childAge,
    p_qf: quotientFamilial,
    p_city_code: cityCode,
    p_activity_price: activity.price_base,
    p_duration_days: durationDays,
    p_categories: [activity.category]
  });
```

**RPC Database** `20251116093012_*.sql`:
- Lit depuis `public.financial_aids` (table database)
- `SECURITY DEFINER` - pas d'injection possible
- Vérifie: âge, QF, territoire, catégories, cumul

### 1.4 Verdict Aides

| Question | Réponse |
|----------|---------|
| La logique estimation est-elle copiable via front? | **OUI** - Les thresholds dans `FinancialAidEngine.ts` sont visibles |
| Ces valeurs sont-elles autoritaires? | **NON** - Le calcul définitif utilise la RPC `calculate_eligible_aids` |
| Un attaquant peut-il falsifier les aides? | **NON** - La réservation recalcule côté serveur |
| Risque business? | **MEDIUM** - Concurrent peut voir la grille tarifaire estimative |

### 1.5 Recommandation P1

**Option A (Minimal - Recommandé)**:
- Garder l'architecture actuelle (estimation front + calcul backend)
- Documenter que le frontend est ESTIMATIF uniquement
- ✅ Déjà implémenté dans `bookings/index.ts`

**Option B (Si sensibilité business élevée)**:
- Créer RPC `estimate_aids` pour remplacer calcul frontend
- Supprimer les thresholds hardcodés de `FinancialAidEngine.ts`
- Impact: +1 appel réseau par simulation

---

## 2. Analyse Google Maps / Éco-mobilité

### 2.1 Pattern de Sécurité Implémenté

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
├─────────────────────────────────────────────────────────────────┤
│ src/pages/Itineraire.tsx:                                       │
│   const { data } = await supabase.functions                     │
│     .invoke('google-maps-token');                               │
│   if (data?.token) loadGoogleMapsScript(data.token);            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ invoke('google-maps-token')
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│          supabase/functions/google-maps-token/index.ts          │
├─────────────────────────────────────────────────────────────────┤
│ - Vérifie Auth header                                           │
│ - Retourne: Deno.env.get('GOOGLE_MAPS_API_KEY')                 │
│ - Clé JAMAIS exposée dans le code source                        │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Vérification Clés

| Fichier | Contenu | Risque |
|---------|---------|--------|
| `src/pages/Itineraire.tsx` | `supabase.functions.invoke('google-maps-token')` | **OK** |
| `.env*` | Non committé (vérifié `.gitignore`) | **OK** |
| `supabase/functions/google-maps-token/` | Lit depuis `Deno.env` | **OK** |
| `supabase/functions/google-maps-directions/` | Idem | **OK** |

### 2.3 Données Éco-mobilité (RGPD)

**Migration analysée**: `20251208000000_prepare_ecomobility_tracking.sql`
- Table `mobility_choices` **COMMENTÉE** (non active)
- Données prévues: `distance_km`, `co2_saved_kg`, `transport_type`
- RLS prévu: `auth.uid() = user_id` (utilisateur voit ses propres données)

**Verdict RGPD**: ✅ Conforme - données anonymisées par utilisateur, pas de tracking cross-user

---

## 3. Vérification Secrets Supabase

### 3.1 Scan Complet

```bash
# Recherche effectuée
grep -r "service_role" --include="*.ts" --include="*.tsx"
```

| Localisation | Usage | Risque |
|--------------|-------|--------|
| `supabase/functions/*/index.ts` | `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` | **OK** - Serveur only |
| `src/integrations/supabase/client.ts` | `VITE_SUPABASE_PUBLISHABLE_KEY` (anon) | **OK** |

### 3.2 Client Frontend

```typescript
// src/integrations/supabase/client.ts
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {...});
```

**Verdict**: ✅ `service_role` jamais côté frontend

---

## 4. Analyse RLS Policies

### 4.1 Tables Critiques

| Table | RLS Enabled | Policy SELECT | Policy INSERT/UPDATE |
|-------|-------------|---------------|---------------------|
| `profiles` | ✅ | Own profile + Admins territory | Own profile only |
| `children` | ✅ | Own children | Own children |
| `bookings` | ✅ | Own bookings + Structure | Own children |
| `financial_aids` | ✅ | **All authenticated** | Admins only |
| `active_sessions` | ✅ | Own sessions | System managed |

### 4.2 Point d'Attention

**Table `financial_aids`** (migrations 20251013152847 + 20251116092953):
```sql
CREATE POLICY "Financial aids visible to all authenticated users"
  ON financial_aids FOR SELECT TO authenticated USING (true);
```

**Impact**: Un utilisateur authentifié peut lister toutes les aides et leurs seuils via:
```sql
SELECT * FROM financial_aids;
```

**Risque**: P2 LOW - Les données sont publiques par design (aides officielles)

---

## 5. Matrice de Risques

| ID | Risque | Niveau | Impact | Mitigation |
|----|--------|--------|--------|------------|
| R1 | Thresholds QF visibles frontend | **P1** | Copie grille tarifaire | Architecture OK (estimation vs calcul) |
| R2 | Table `financial_aids` lisible | **P2** | Concurrent voit les aides | Données publiques par nature |
| R3 | Google Maps key exposée | **P4** | - | Proxy Edge Function ✅ |
| R4 | `service_role` frontend | **P4** | - | Non présent ✅ |
| R5 | Mobilité tracking RGPD | **P4** | - | Table non active, RLS prévu |

---

## 6. Conclusion

### La logique d'estimation aides est-elle copiable via front ?

**OUI** pour l'estimation (visible dans `FinancialAidEngine.ts`)
**NON** pour le calcul définitif (RPC server-side `calculate_eligible_aids`)

### L'architecture est-elle sécurisée ?

**OUI** - Le pattern estimation/validation est correct:
1. Frontend affiche une **estimation** (UX)
2. Backend calcule le **montant définitif** (sécurité)
3. Les réservations stockent les vraies valeurs calculées serveur

### Actions Recommandées

| Priorité | Action | Effort |
|----------|--------|--------|
| P2 | Documenter l'architecture estimation vs calcul | 1h |
| P3 | Optionnel: Migrer estimation vers RPC si sensibilité business | 2-3j |
| P4 | Ajouter CI guard `service_role` dans frontend | 30min |

---

## Annexe: Fichiers Audités

- `src/utils/FinancialAidEngine.ts` - Logique estimation frontend
- `src/integrations/supabase/client.ts` - Client Supabase
- `src/pages/Itineraire.tsx` - Éco-mobilité Google Maps
- `supabase/functions/bookings/index.ts` - Calcul aides serveur
- `supabase/functions/google-maps-token/index.ts` - Proxy clé Maps
- `supabase/functions/simulate-aid/index.ts` - Stockage simulations
- `supabase/migrations/20251116093012_*.sql` - RPC calculate_eligible_aids
- `supabase/migrations/20251208000000_*.sql` - Table mobilité (inactive)
- `supabase/migrations/20251013102632_*.sql` - RLS policies initiales
