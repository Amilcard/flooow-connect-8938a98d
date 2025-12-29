# UI Implementation Map — Flooow Connect

> **Audit Date:** 12 Décembre 2025
> **Scope:** 25+ screens, 180+ components
> **Stack:** React 18 + TypeScript + Vite + Tailwind + Shadcn/ui

---

## Table des matières

1. [Découverte / Catalogue](#1-découverte--catalogue)
2. [Informatif / Services](#2-informatif--services)
3. [Espace Client](#3-espace-client)
4. [Patterns Transversaux](#4-patterns-transversaux)

---

## 1. Découverte / Catalogue

### 1.1 Accueil (Index)

| Propriété | Valeur |
|-----------|--------|
| **Route** | `/home` |
| **Fichier** | `src/pages/Index.tsx` |
| **Layout** | `PageLayout` (showHeader=true) |
| **Container** | `max-w-5xl mx-auto px-4 pb-24` |

#### Structure UI

```
Index.tsx
├── SearchBar (sticky top)
├── AdvancedFiltersModal (overlay)
├── TerritoryCheck (conditional alert)
├── Section 1: Hero Cards (grid 1→2→4 cols)
│   ├── AidesFinancieresCard
│   ├── MobiliteCard
│   ├── MaVilleCard
│   └── BonEspritCard
├── Section 2: Activités Recommandées (ActivityThematicSection)
├── Section 3: Petits Budgets (ActivityThematicSection)
├── Section 4: Sport & Bien-Être (ActivityThematicSection)
├── Footer
└── HelpFloatingButton (fixed)
```

#### Composants clés

| Composant | Chemin | Responsabilité |
|-----------|--------|----------------|
| SearchBar | `src/components/SearchBar.tsx` | Input recherche + bouton filtres |
| ActivityThematicSection | `src/components/home/ActivityThematicSection.tsx` | Section carrousel thématique |
| ActivityCarousel | `src/components/Activity/ActivityCarousel.tsx` | Carrousel horizontal |
| PageLayout | `src/components/PageLayout.tsx` | Wrapper layout standard |

#### Data & Hooks

| Source | Hook | Query Key |
|--------|------|-----------|
| User profile | `useQuery` | `["user-profile"]` |
| User children | `useQuery` | `["user-children"]` |
| Activities (x4) | `useActivities()` | `["activities", filters]` |
| Territory | `useTerritoryAccess()` | `["territory-access"]` |

#### Classes Tailwind dominantes

```css
/* Container */ max-w-5xl mx-auto px-4 pb-24
/* Grid cards */ grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4
/* Sections */ py-6
/* Titres */ text-xl md:text-2xl font-bold text-text-main
```

---

### 1.2 Recherche (Search)

| Propriété | Valeur |
|-----------|--------|
| **Route** | `/search` |
| **Fichier** | `src/pages/Search.tsx` |
| **Layout** | Custom (pas de PageLayout) |
| **Container** | `max-w-5xl mx-auto px-4 py-4` |

#### Structure UI

```
Search.tsx
├── div.sticky (BackButton + SearchBar)
├── Query display ("Résultats pour: ...")
├── Active filters pills (Badge chips)
├── Results header (count + view toggles)
├── View content
│   ├── List: ActivitySection
│   └── Map: InteractiveMapActivities
├── AdvancedFiltersModal (overlay)
└── BottomNavigation
```

#### Composants clés

| Composant | Chemin | Responsabilité |
|-----------|--------|----------------|
| ActivitySection | `src/components/Activity/ActivitySection.tsx` | Grid résultats |
| InteractiveMapActivities | `src/components/Search/InteractiveMapActivities.tsx` | Vue carte |
| AdvancedFiltersModal | `src/components/Search/AdvancedFiltersModal.tsx` | Modal filtres avancés |

#### Data & Hooks

| Source | Hook | Query Key |
|--------|------|-----------|
| Activities filtrées | `useActivities(filters)` | `["activities", activityFilters]` |
| Filter state | `useSearchFilters()` | URL sync (debounced 300ms) |

---

### 1.3 Détail Activité (ActivityDetail)

| Propriété | Valeur |
|-----------|--------|
| **Route** | `/activity/:id` |
| **Fichier** | `src/pages/ActivityDetail.tsx` |
| **Layout** | Custom |
| **Container** | `max-w-6xl mx-auto px-4 md:px-6 lg:px-8` |

#### Structure UI

```
ActivityDetail.tsx
├── PageHeader (sticky, share button)
├── ActivityImageCard (hero image)
├── QuickInfoBar (tags: catégorie, période, âge)
├── Header section (titre, location, organizer)
├── Grid 12 colonnes
│   ├── Col 8: Tabs
│   │   ├── Infos (description, infos pratiques)
│   │   ├── Tarifs & Aides (SharedAidCalculator)
│   │   └── Trajets (EcoMobilitySection)
│   └── Col 4: Booking Card (sticky top-24)
│       ├── Prix + aides
│       ├── Sélection créneaux (RadioGroup/Cards)
│       └── CTA "Inscrire mon enfant"
├── ContactOrganizerModal (overlay)
├── StickyBookingCTA (mobile only)
└── BottomNavigation
```

#### Composants clés

| Composant | Chemin | Responsabilité |
|-----------|--------|----------------|
| PageHeader | `src/components/PageHeader.tsx` | Header unifié |
| ActivityImageCard | `src/components/Activity/ActivityImageCard.tsx` | Image hero |
| QuickInfoBar | `src/components/Activity/QuickInfoBar.tsx` | Barre de tags |
| SharedAidCalculator | `src/components/aids/SharedAidCalculator.tsx` | Calculateur aides |
| EcoMobilitySection | `src/components/Activity/EcoMobilitySection.tsx` | Options mobilité |
| StickyBookingCTA | `src/components/Activity/StickyBookingCTA.tsx` | CTA mobile fixe |

#### Composants Shadcn utilisés

- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Badge` (variant="secondary", "outline")
- `Button` (variant="ghost", "outline", "default")
- `RadioGroup`, `RadioGroupItem`, `Label`
- `Separator`, `Alert`

#### Data & Hooks

| Source | Hook | Query Key |
|--------|------|-----------|
| Activity | `useQuery` | `["activity", id]` |
| Sessions | `useQuery` | `["activity-sessions", id]` |
| Slots | `useQuery` | `["availability-slots", id]` |
| User profile | `useQuery` | `["user-profile"]` |
| User children | `useQuery` | `["user-children"]` |
| Booking state | `useActivityBookingState()` | localStorage |

---

## 2. Informatif / Services

### 2.1 Nos Aides

| Propriété | Valeur |
|-----------|--------|
| **Route** | `/aides` |
| **Fichier** | `src/pages/Aides.tsx` |
| **Layout** | `PageLayout` (showHeader=false) |

#### Structure UI

```
Aides.tsx
├── PageHeader ("Nos aides")
├── SharedAidCalculator (formulaire)
├── AidsSectionsList (2 sections)
│   ├── Pendant l'année scolaire
│   └── Vacances & séjours
└── AidsInfoBox ("Bon à savoir")
```

#### Composants clés

| Composant | Chemin |
|-----------|--------|
| SharedAidCalculator | `src/components/aids/SharedAidCalculator.tsx` |
| AidsSectionsList | `src/components/FinancialAid/AidsSectionsList.tsx` |
| AidsInfoBox | `src/components/FinancialAid/AidsInfoBox.tsx` |

---

### 2.2 Simulateur

| Propriété | Valeur |
|-----------|--------|
| **Route** | `/aides/simulateur` |
| **Fichier** | `src/pages/aides/Simulateur.tsx` |
| **Container** | `max-w-2xl px-4 py-6 pb-24` |

#### Composants Shadcn

- `Input`, `Select`, `Label`
- `Card`, `CardContent`
- `Accordion`, `AccordionItem`
- `Alert`, `Badge`, `Button`

---

### 2.3 Éco-Mobilité (Mes trajets)

| Propriété | Valeur |
|-----------|--------|
| **Route** | `/eco-mobilite` |
| **Fichier** | `src/pages/EcoMobilite.tsx` |

#### Structure UI

```
EcoMobilite.tsx
├── PageHeader ("Mes trajets")
├── CO₂ Calculator Banner (Card gradient bleu)
├── "Aides et mobilité" section
├── MobilitySolutionCard grid (7 solutions)
└── MobilityDataSources
```

#### Grid Layout

```css
grid gap-6 md:grid-cols-2 lg:grid-cols-3
```

---

### 2.4 Ma ville, mon actu

| Propriété | Valeur |
|-----------|--------|
| **Route** | `/ma-ville-mon-actu` |
| **Fichier** | `src/pages/MaVilleMonActu.tsx` |

#### Structure UI (données statiques)

```
MaVilleMonActu.tsx
├── PageHeader
├── Section "Actus du moment" (3 cards)
├── Section "À venir près de chez vous" (3 cards)
└── CTA "Voir tous mes services"
```

---

### 2.5 Bon Esprit

| Propriété | Valeur |
|-----------|--------|
| **Route** | `/bon-esprit` |
| **Fichier** | `src/pages/BonEsprit.tsx` |

#### Structure UI

```
BonEsprit.tsx
├── PageHeader
├── Intro Card (gradient, Trophy icon)
├── Form Card
│   ├── Section nominateur (grid 2 cols)
│   ├── Section nominé (grid 2 cols)
│   ├── Checkbox acceptation
│   └── Submit button
└── Explanation Card (gradient bleu)
```

---

## 3. Espace Client

### 3.1 Mon Compte (Menu)

| Propriété | Valeur |
|-----------|--------|
| **Route** | `/mon-compte` |
| **Fichier** | `src/pages/MonCompte.tsx` |

#### Structure UI

```
MonCompte.tsx
├── PageHeader
├── Welcome Card (avatar + greeting)
├── Section "Mes espaces" (9 items)
│   ├── Mes informations → /mon-compte/informations
│   ├── Profil d'éligibilité → /mon-compte/eligibilite
│   ├── Mes demandes d'inscription → /mon-compte/validations
│   ├── Mon Covoiturage → /mon-compte/covoiturage
│   ├── Mes enfants → /mon-compte/enfants
│   ├── Lier un enfant → /mon-compte/lier-enfant
│   ├── Mes réservations → /mon-compte/reservations
│   ├── Mes justificatifs → /mon-compte/justificatifs
│   └── Mes notifications → /mon-compte/notifications
├── Section "Informations" (3 items)
└── Logout button
```

---

### 3.2 Mes Enfants 🚨

| Propriété | Valeur |
|-----------|--------|
| **Route** | `/mon-compte/enfants` |
| **Fichier** | `src/pages/account/kids/MesEnfants.tsx` |
| **Performance** | ⚠️ LENT |

#### Structure UI

```
MesEnfants.tsx
├── ProfilLayout header ("Ajouter" button)
├── Child Cards
│   ├── Avatar (initials)
│   ├── Name, age
│   ├── Gender badge
│   ├── Interests (badges)
│   ├── Special needs section
│   └── Action buttons
├── Empty state (EmptyState component)
└── KidAddModal (dialog)
```

#### ⚠️ Issue Performance

```typescript
// ❌ Raw Supabase call sans React Query
const loadChildren = useCallback(async () => {
  const { data } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', user.id)
}, [user, toast])

// Appelé via useEffect → refetch à chaque mount
```

---

### 3.3 Lier un Enfant 🚨

| Propriété | Valeur |
|-----------|--------|
| **Route** | `/mon-compte/lier-enfant` |
| **Fichier** | `src/pages/account/LierEnfant.tsx` |
| **Performance** | ⚠️ LENT |

#### Structure UI

```
LierEnfant.tsx
├── Family Flooow Welcome Card
├── Mon code Family Flooow
│   ├── Code display (ABC DEF)
│   ├── Copy button
│   └── Generate button
├── Lier avec le code d'un enfant
│   ├── Input 6 chars
│   └── Link button
└── Demandes en attente
    └── Child request cards
```

#### ⚠️ Issue Performance

2 queries bloquantes au mount :
- `["my-profile"]` - linking_code
- `["child-requests"]` - nested selects (minor, activity, slot)

---

### 3.4 Mes Réservations 🚨

| Propriété | Valeur |
|-----------|--------|
| **Route** | `/mon-compte/reservations` |
| **Fichier** | `src/pages/account/MesReservations.tsx` |
| **Performance** | ⚠️ MOCK DATA |

#### Structure UI

```
MesReservations.tsx
├── Header + "Réserver" button
├── Tabs (5 statuts)
│   ├── Toutes
│   ├── Confirmées
│   ├── En attente
│   ├── Terminées
│   └── Annulées
├── ReservationCard grid
└── Empty state
```

#### ⚠️ Issue : Données mockées

```typescript
// ❌ Données statiques, pas de vraies réservations
const [reservations] = useState<Reservation[]>([
  { id: '1', activityName: 'Stage de Tennis', ... },
  { id: '2', activityName: 'Atelier Peinture', ... },
])
```

---

### 3.5 Autres écrans Espace Client

| Écran | Route | Fichier | État Data |
|-------|-------|---------|-----------|
| Mes informations | `/mon-compte/informations` | `MesInformations.tsx` | ⚠️ Mock |
| Profil éligibilité | `/mon-compte/eligibilite` | `ProfilEligibilite.tsx` | ✅ Real |
| Mon covoiturage | `/mon-compte/covoiturage` | `MonCovoiturage.tsx` | ⚠️ Mock |
| Mes justificatifs | `/mon-compte/justificatifs` | `MesJustificatifs.tsx` | ⚠️ Mock |
| Mes notifications | `/mon-compte/notifications` | `MesNotifications.tsx` | ✅ Real |
| Événements favoris | `/mes-evenements-favoris` | `MesEvenementsFavoris.tsx` | ✅ Real |
| Paramètres | `/mon-compte/parametres` | `Parametres.tsx` | ✅ Local |

---

## 4. Patterns Transversaux

### Navigation

| Composant | Hauteur | Position | Safe Area |
|-----------|---------|----------|-----------|
| Header | h-16 (64px) | sticky top-0 | Non |
| BottomNavigation | ~64px + safe-area | fixed bottom-0 | Oui |
| PageHeader | h-16 | sticky top-0 | Non |

### Spacing Bottom Nav (Boussole)

```css
/* Pattern standard */
pb-24 /* 96px - utilisé sur la plupart des pages */
pb-20 /* 80px - variante */
```

### Container Widths

| Context | Max Width | Classes |
|---------|-----------|---------|
| Pages standard | 1280px | `max-w-5xl mx-auto px-4` |
| Detail pages | 1536px | `max-w-6xl mx-auto px-4 md:px-6 lg:px-8` |
| Forms | 672px | `max-w-2xl mx-auto px-4` |

### Responsive Grids

```css
/* Hero cards (Index) */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4

/* Search results */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4

/* Detail page */
grid md:grid-cols-12 gap-8
/* Left: md:col-span-8 | Right: md:col-span-4 */
```

---

## Fichiers de référence

```
src/
├── pages/
│   ├── Index.tsx                    # Accueil
│   ├── Search.tsx                   # Recherche
│   ├── ActivityDetail.tsx           # Détail activité
│   ├── Aides.tsx                    # Nos aides
│   ├── EcoMobilite.tsx              # Mes trajets
│   ├── MaVilleMonActu.tsx           # Ma ville
│   ├── BonEsprit.tsx                # Bon esprit
│   ├── MonCompte.tsx                # Menu compte
│   └── account/
│       ├── kids/MesEnfants.tsx      # Mes enfants 🚨
│       ├── LierEnfant.tsx           # Lier enfant 🚨
│       ├── MesReservations.tsx      # Réservations 🚨
│       └── [autres écrans compte]
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── BottomNavigation.tsx
│   ├── PageLayout.tsx
│   ├── PageHeader.tsx
│   └── [180+ composants]
└── hooks/
    ├── useActivities.ts
    ├── useSearchFilters.ts
    ├── useAuth.tsx
    └── [20+ hooks]
```

---

*Document généré le 12 décembre 2025*
