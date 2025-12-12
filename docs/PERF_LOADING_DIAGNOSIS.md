# Performance & Loading Diagnosis — Flooow Connect

> **Audit Date:** 12 Décembre 2025
> **Focus:** 3 écrans lents identifiés
> **Objectif:** Diagnostic causes + recommandations

---

## Table des matières

1. [Résumé exécutif](#1-résumé-exécutif)
2. [MesEnfants — Diagnostic](#2-mesenfants--diagnostic)
3. [LierEnfant — Diagnostic](#3-lierenfant--diagnostic)
4. [MesReservations — Diagnostic](#4-mesreservations--diagnostic)
5. [Patterns de performance globaux](#5-patterns-de-performance-globaux)
6. [Recommandations prioritaires](#6-recommandations-prioritaires)

---

## 1. Résumé exécutif

### Classification des écrans

| Écran | Temps estimé | Cause principale | Priorité fix |
|-------|--------------|------------------|--------------|
| **MesEnfants** | 500-1500ms | Raw Supabase + JSON parsing | P0 |
| **LierEnfant** | 800-1500ms | 2 queries bloquantes + nested selects | P0 |
| **MesReservations** | Instant (mock) | Données hardcodées, pas de vraies données | P1 |

### Queries au mount (comparatif)

| Écran | Queries | Bloquant UI | Cache |
|-------|---------|-------------|-------|
| Index (Accueil) | 4x useActivities | Non (parallel) | React Query |
| Search | 1x useActivities | Oui (LoadingState) | React Query |
| ActivityDetail | 5+ queries | Oui (LoadingState) | React Query |
| **MesEnfants** | 1 raw call | **Oui** | **Aucun** |
| **LierEnfant** | 2 useQuery | **Oui** | React Query |
| **MesReservations** | 0 (mock) | Non | N/A |

---

## 2. MesEnfants — Diagnostic

### Fichier
`src/pages/account/kids/MesEnfants.tsx`

### Symptômes
- Spinner visible 500-1500ms au chargement
- Rechargement complet à chaque navigation
- Délai perceptible après suppression d'un enfant

### Analyse du code

#### ❌ Problème 1: Raw Supabase sans cache

```typescript
// Ligne ~50
const loadChildren = useCallback(async () => {
  setIsLoading(true);
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
  } else {
    setChildren(data || []);
  }
  setIsLoading(false);
}, [user, toast]);  // ⚠️ toast dans deps peut causer re-renders

// Appelé via useEffect
useEffect(() => {
  if (user) {
    loadChildren();
  }
}, [user, loadChildren]);
```

**Impact:**
- Pas de cache → refetch à chaque mount
- `setIsLoading(true)` bloque le rendu immédiatement
- Dépendance `toast` peut causer des re-renders inutiles

#### ❌ Problème 2: JSON parsing complexe

```typescript
// Parsing défensif de needs_json pour chaque enfant
children.map(child => {
  let parsedNeeds = undefined;
  if (child.needs_json) {
    try {
      if (typeof child.needs_json === 'string') {
        parsedNeeds = JSON.parse(child.needs_json);
      } else if (typeof child.needs_json === 'object') {
        parsedNeeds = child.needs_json;
      }
    } catch (e) {
      console.error('Failed to parse needs_json:', e);
    }
  }
  return { ...child, needs: parsedNeeds };
});
```

**Impact:**
- O(n) parsing pour chaque enfant
- Try-catch overhead
- Devrait être fait côté serveur ou lors de l'insertion

#### ❌ Problème 3: Reload complet après mutation

```typescript
const handleDeleteChild = async (childId: string) => {
  const { error } = await supabase
    .from('children')
    .delete()
    .eq('id', childId);

  if (!error) {
    loadChildren();  // ⚠️ Recharge TOUTE la liste
  }
};
```

**Impact:**
- Suppression déclenche un reload complet
- Pas d'update optimiste
- UX lente (flash de loading)

### Métriques de performance

| Phase | Temps estimé | Bloquant |
|-------|--------------|----------|
| Auth check | 50ms | Non |
| `loadChildren()` call | 200-800ms | **Oui** |
| JSON parsing (5 enfants) | 10-50ms | Oui |
| Render cards | 50-100ms | Non |
| **Total** | **310-1000ms** | |

### Recommandations

#### Fix immédiat (30min)

```typescript
// Remplacer par React Query
const { data: children, isLoading, refetch } = useQuery({
  queryKey: ['children', user?.id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(child => ({
      ...child,
      needs: parseNeeds(child.needs_json)  // Helper function
    })) || [];
  },
  enabled: !!user,
  staleTime: 5 * 60 * 1000,  // 5 min cache
});
```

#### Fix moyen terme (1h)

```typescript
// Optimistic delete
const deleteMutation = useMutation({
  mutationFn: (id: string) =>
    supabase.from('children').delete().eq('id', id),
  onMutate: async (deletedId) => {
    await queryClient.cancelQueries(['children', user?.id]);
    const previous = queryClient.getQueryData(['children', user?.id]);
    queryClient.setQueryData(['children', user?.id], (old: Child[]) =>
      old?.filter(c => c.id !== deletedId)
    );
    return { previous };
  },
  onError: (err, id, context) => {
    queryClient.setQueryData(['children', user?.id], context?.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['children', user?.id]);
  },
});
```

---

## 3. LierEnfant — Diagnostic

### Fichier
`src/pages/account/LierEnfant.tsx`

### Symptômes
- LoadingState visible 800-1500ms
- Page blanche pendant le chargement
- Délai après génération de code

### Analyse du code

#### ❌ Problème 1: Deux queries bloquantes parallèles

```typescript
// Query 1: Profile (linking code)
const { data: profile, isLoading: loadingProfile } = useQuery({
  queryKey: ['my-profile'],
  queryFn: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('profiles')
      .select('id, email, linking_code, first_name')
      .eq('id', user.id)
      .single();
    return data;
  }
});

// Query 2: Pending requests (nested selects)
const { data: requests, isLoading: loadingRequests } = useQuery({
  queryKey: ['child-requests'],
  queryFn: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('child_temp_requests')
      .select(`
        *,
        minor:minor_profile_id(id, email, first_name),
        activity:activity_id(title, images),
        slot:slot_id(start, end)
      `)
      .eq('parent_id', user.id)
      .in('status', ['parent_linked'])
      .order('created_at', { ascending: false });
    return data || [];
  }
});

// UI bloquée jusqu'à ce que les deux soient chargées
if (loadingProfile || loadingRequests) {
  return <LoadingState text="Chargement..." />;
}
```

**Impact:**
- Page entièrement bloquée pendant les 2 queries
- `auth.getUser()` appelé 2 fois (redondant)
- Nested selects (minor, activity, slot) = requête complexe

#### ❌ Problème 2: Nested selects sur child_temp_requests

```sql
-- Équivalent SQL généré
SELECT
  child_temp_requests.*,
  profiles.id, profiles.email, profiles.first_name,  -- minor join
  activities.title, activities.images,               -- activity join
  availability_slots.start, availability_slots.end   -- slot join
FROM child_temp_requests
LEFT JOIN profiles ON child_temp_requests.minor_profile_id = profiles.id
LEFT JOIN activities ON child_temp_requests.activity_id = activities.id
LEFT JOIN availability_slots ON child_temp_requests.slot_id = availability_slots.id
WHERE parent_id = $1 AND status IN ('parent_linked')
ORDER BY created_at DESC;
```

**Impact:**
- 3 JOINs → requête lente
- `activities.images` est un array (potentiellement lourd)
- Pas de LIMIT → charge toutes les demandes

### Métriques de performance

| Phase | Temps estimé | Bloquant |
|-------|--------------|----------|
| Auth getUser (x2) | 100ms total | Oui |
| Profile query | 150-300ms | **Oui** |
| Child requests query | 400-800ms | **Oui** |
| Render UI | 50ms | Non |
| **Total** | **700-1250ms** | |

### Recommandations

#### Fix immédiat (30min)

```typescript
// 1. Combiner auth.getUser() en amont
const { data: { user } } = await supabase.auth.getUser();

// 2. Charger profile de façon non-bloquante pour la section code
const { data: profile } = useQuery({
  queryKey: ['my-profile'],
  queryFn: () => fetchProfile(user.id),
  // Ne pas bloquer le render
});

// 3. Charger requests séparément avec suspense
const { data: requests } = useQuery({
  queryKey: ['child-requests'],
  queryFn: () => fetchRequests(user.id),
  enabled: !!user,
});

// Render progressif au lieu de tout bloquer
return (
  <>
    <CodeSection profile={profile} isLoading={!profile} />
    <LinkSection />
    <RequestsSection requests={requests} isLoading={!requests} />
  </>
);
```

#### Fix moyen terme (2h)

```typescript
// Limiter et paginer les requests
const { data: requests } = useQuery({
  queryKey: ['child-requests', { limit: 10 }],
  queryFn: async () => {
    const { data } = await supabase
      .from('child_temp_requests')
      .select(`
        id, status, created_at,
        minor:minor_profile_id(first_name),
        activity:activity_id(title)
      `)  // Sélection minimale
      .eq('parent_id', user.id)
      .in('status', ['parent_linked'])
      .order('created_at', { ascending: false })
      .limit(10);  // Pagination
    return data;
  }
});
```

---

## 4. MesReservations — Diagnostic

### Fichier
`src/pages/account/MesReservations.tsx`

### Symptômes
- Chargement instantané (car mock)
- **Problème:** Données ne reflètent pas les vraies réservations
- Pas de sync avec la BDD

### Analyse du code

#### ❌ Problème: Données entièrement mockées

```typescript
// Ligne ~30
const [reservations] = useState<Reservation[]>([
  {
    id: '1',
    activityName: 'Stage de Tennis',
    activityImage: '/images/tennis.jpg',
    childName: 'Lucas',
    date: '2024-07-15',
    time: '09:00 - 12:00',
    location: 'Tennis Club Saint-Étienne',
    price: 150,
    status: 'confirmed',
    organizerName: 'Club de Tennis',
    organizerPhone: '04 77 12 34 56',
    category: 'Sport',
    notes: 'Raquette fournie'
  },
  // ... 3 autres objets mock
]);
```

**Impact:**
- Performance "excellente" car aucune requête
- **MAIS** ne montre pas les vraies réservations de l'utilisateur
- Inutilisable en production

### Recommandations

#### Fix requis (1h)

```typescript
// Remplacer mock par vraie requête
const { data: reservations, isLoading } = useQuery({
  queryKey: ['reservations', user?.id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        status,
        base_price_cents,
        final_price_cents,
        aids_applied,
        created_at,
        activity:activity_id(
          id, title, images, categories
        ),
        child:child_id(
          id, first_name
        ),
        slot:slot_id(
          start, end
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(transformBookingToReservation) || [];
  },
  enabled: !!user
});

// Helper pour transformer le format
function transformBookingToReservation(booking: BookingRow): Reservation {
  return {
    id: booking.id,
    activityName: booking.activity?.title || 'Activité',
    activityImage: booking.activity?.images?.[0] || '/placeholder.jpg',
    childName: booking.child?.first_name || '',
    date: booking.slot?.start ? format(new Date(booking.slot.start), 'yyyy-MM-dd') : '',
    time: booking.slot ? formatTimeRange(booking.slot.start, booking.slot.end) : '',
    price: (booking.final_price_cents || booking.base_price_cents || 0) / 100,
    status: mapStatus(booking.status),
    // ...
  };
}
```

---

## 5. Patterns de performance globaux

### ✅ Bonnes pratiques observées

| Pattern | Où | Impact |
|---------|-----|--------|
| React Query avec cache | useActivities, useNotifications | Évite refetch inutiles |
| Parallel queries | Index.tsx (4x activities) | Chargement rapide |
| Lazy loading pages | Toutes les routes | Bundle initial réduit |
| staleTime: 5min | useActivities | Cache efficace |

### ❌ Anti-patterns observés

| Anti-pattern | Où | Impact |
|--------------|-----|--------|
| Raw Supabase sans cache | MesEnfants | Refetch à chaque mount |
| LoadingState bloquant | LierEnfant | Page blanche |
| Données mock | MesReservations, MesInfos | Pas de vraies données |
| auth.getUser() répété | LierEnfant | Requêtes redondantes |
| Pas de pagination | child_requests | Charge tout |

### Queries les plus lourdes

| Query | Table | Joins | Temps estimé |
|-------|-------|-------|--------------|
| child_requests | child_temp_requests | 3 (minor, activity, slot) | 400-800ms |
| activities filtrées | activities | 0 (simplifié) | 200-500ms |
| bookings | bookings | 3 (activity, child, slot) | 300-600ms |

---

## 6. Recommandations prioritaires

### P0 — Cette semaine

| Action | Écran | Effort | Impact |
|--------|-------|--------|--------|
| Migrer MesEnfants vers React Query | MesEnfants | 1h | -50% temps chargement |
| Render progressif LierEnfant | LierEnfant | 30min | UX non-bloquante |
| Implémenter vraies réservations | MesReservations | 2h | Fonctionnalité critique |

### P1 — Prochaine sprint

| Action | Écran | Effort | Impact |
|--------|-------|--------|--------|
| Optimistic updates MesEnfants | MesEnfants | 1h | UX fluide |
| Pagination child_requests | LierEnfant | 30min | -40% temps |
| Prefetch profile au login | Global | 1h | Cache prêt |

### P2 — Backlog

| Action | Écran | Effort | Impact |
|--------|-------|--------|--------|
| Migrer MesInfos vers vraies données | MesInfos | 2h | Data réelle |
| Migrer MonCovoiturage vers vraies données | MonCovoiturage | 2h | Data réelle |
| Skeleton loading partout | Global | 2h | UX perçue |

---

## Code snippets prêts à l'emploi

### useChildren hook (remplace raw call)

```typescript
// src/hooks/useChildren.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useChildren() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['children', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      supabase.from('children').delete().eq('id', id).throwOnError(),
    onMutate: async (id) => {
      await queryClient.cancelQueries(['children', user?.id]);
      const previous = queryClient.getQueryData(['children', user?.id]);
      queryClient.setQueryData(['children', user?.id], (old: any[]) =>
        old?.filter(c => c.id !== id)
      );
      return { previous };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['children', user?.id], context?.previous);
    },
  });

  return {
    children: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    deleteChild: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
```

### useBookings hook (remplace mock)

```typescript
// src/hooks/useBookings.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useBookings(status?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['bookings', user?.id, status],
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        .select(`
          id, status, base_price_cents, final_price_cents, created_at,
          activity:activity_id(id, title, images),
          child:child_id(id, first_name),
          slot:slot_id(start, end)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });
}
```

---

*Document généré le 12 décembre 2025*
