# Screens & Components Inventory — Flooow Connect

> **Audit Date:** 12 Décembre 2025
> **Total Screens:** 25+
> **Total Components:** 180+

---

## Table des matières

1. [Composants Navigation](#1-composants-navigation)
2. [Composants Cards](#2-composants-cards)
3. [Composants Badges & Pills](#3-composants-badges--pills)
4. [Composants Buttons](#4-composants-buttons)
5. [Composants Forms](#5-composants-forms)
6. [Composants States](#6-composants-states)
7. [Système d'icônes](#7-système-dicônes)
8. [Divergences UI](#8-divergences-ui)

---

## 1. Composants Navigation

### Header

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/Header.tsx` |
| **Base** | Custom |
| **Hauteur** | h-16 (64px) |
| **Position** | sticky top-0 z-50 |

```tsx
<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white shadow-sm">
  <div className="container px-4 md:px-6">
    <div className="flex h-16 items-center justify-between gap-4">
```

**Éléments:**
- HeaderLogo (gauche)
- Auth buttons / Notification + Avatar (droite)
- Mobile menu toggle (md:hidden)

---

### BottomNavigation (Boussole)

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/BottomNavigation.tsx` |
| **Base** | Custom |
| **Position** | fixed bottom-0 |
| **Safe Area** | padding-bottom: env(safe-area-inset-bottom) |

**5 Tabs:**
| Tab | Route | Icône |
|-----|-------|-------|
| Accueil | `/home` | Home |
| Rechercher | `/search` | Search |
| Aides | `/aides` | Euro |
| Mobilité | `/eco-mobilite` | Compass |
| Compte | `/mon-compte` | User |

**States:**
- Inactif: `stroke-width: 2`, couleur muted
- Actif: `stroke-width: 2.5`, couleur primary, fill pour Home

---

### PageHeader

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/PageHeader.tsx` |
| **Base** | Custom |
| **Props** | `title`, `subtitle?`, `showBackButton?`, `rightContent?`, `backFallback?` |

```tsx
<header className="sticky top-0 z-10 bg-background border-b">
  <div className="container px-4 md:px-6">
    <div className="flex h-16 items-center justify-between">
```

**Utilisé sur:** ActivityDetail, Account pages, Aides, EcoMobilite

---

### BackButton

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/BackButton.tsx` |
| **Props** | `fallback?`, `size?`, `showText?` |
| **Variantes** | sm, default, lg |

---

## 2. Composants Cards

### ActivityCard

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/Activity/ActivityCard.tsx` |
| **Base** | Shadcn Card |
| **Aspect Ratio** | 4:5 |

**Props:**
```typescript
interface ActivityCardProps {
  id: string;
  title: string;
  image?: string;
  category?: string;
  price?: number;
  ageMin?: number;
  ageMax?: number;
  periodType?: string;
  hasAccessibility?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}
```

**Classes clés:**
```css
card-wetransfer  /* Custom class */
hover:shadow-md transition-shadow
aspect-[4/5]
```

---

### ActivityCardMobile

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/Activity/ActivityCardMobile.tsx` |
| **Base** | Custom |
| **Aspect Ratio** | 9:16 |

**Différences vs ActivityCard:**
- Overlay gradient en bas (42%)
- Floating CTA button
- Optimisé pour carrousel mobile

---

### ActivityResultCard

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/Search/ActivityResultCard.tsx` |
| **Base** | Custom |
| **Image Height** | h-180px |

**Classes clés:**
```css
hover:shadow-md hover:-translate-y-1 transition-all
```

---

### Booking Card (Sticky)

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | Inline dans `ActivityDetail.tsx` |
| **Position** | sticky top-24 |
| **Largeur** | md:col-span-4 |

**Sections:**
1. Prix + aides calculées
2. Horaires (scolaire: RadioGroup / vacances: Cards)
3. Récap sélection
4. CTA "Inscrire mon enfant"

---

### AidCard

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/FinancialAid/AidCard.tsx` |
| **Base** | Custom |

**Classes clés:**
```css
border-2 border-border
hover:border-primary
```

---

### Cards Accueil (Hero)

| Composant | Fichier |
|-----------|---------|
| AidesFinancieresCard | `src/components/home/AidesFinancieresCard.tsx` |
| MobiliteCard | `src/components/home/MobiliteCard.tsx` |
| MaVilleCard | `src/components/home/MaVilleCard.tsx` |
| BonEspritCard | `src/components/home/BonEspritCard.tsx` |

---

## 3. Composants Badges & Pills

### Badge (UI)

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/ui/badge.tsx` |
| **Base** | Shadcn CVA |

**Variantes:**
| Variant | Classes |
|---------|---------|
| default | `bg-primary text-primary-foreground` |
| secondary | `bg-secondary text-secondary-foreground` |
| destructive | `bg-destructive text-destructive-foreground` |
| outline | `border border-input bg-background` |
| success | `bg-green-100 text-green-800` |
| warning | `bg-amber-100 text-amber-800` |

**Classes communes:**
```css
inline-flex items-center rounded-full
px-2.5 py-0.5 text-xs font-semibold
```

---

### NotificationBadge

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/NotificationBadge.tsx` |
| **Position** | absolute -top-1 -right-1 |
| **Size** | h-5 w-5 |

**Logic:**
- Affiche count (max "9+")
- Variant destructive

---

### Badges Catégories (ActivityCard)

**Pattern inline:**
```tsx
<span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800
  text-[10px] uppercase font-poppins font-semibold backdrop-blur-sm">
  Sport
</span>
```

**Couleurs par catégorie:**
| Catégorie | Background | Text |
|-----------|------------|------|
| Sport | amber-100 | amber-800 |
| Culture | violet-100 | violet-800 |
| Loisirs | green-100 | green-800 |
| Vacances | blue-100 | blue-800 |
| Scolarité | pink-100 | pink-800 |

---

### FinancialAidBadges

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/activities/FinancialAidBadges.tsx` |

**États:**
| État | Style |
|------|-------|
| eligible | Badge success + Check icon |
| verify | Badge warning + AlertCircle icon |
| not_eligible | Badge secondary + X icon |

---

## 4. Composants Buttons

### Button (UI)

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/ui/button.tsx` |
| **Base** | Shadcn CVA |

**Variantes:**

| Variant | Classes |
|---------|---------|
| default | `bg-primary text-primary-foreground shadow hover:bg-primary/90` |
| secondary | `bg-white border-border hover:bg-muted` |
| outline | `border border-border bg-background hover:bg-muted` |
| ghost | `hover:bg-muted` |
| link | `text-primary underline-offset-4 hover:underline` |
| accent | `bg-accent text-accent-foreground hover:bg-accent/90` |

**Sizes:**

| Size | Classes |
|------|---------|
| default | `h-11 px-4 py-2` |
| sm | `h-9 px-3` |
| lg | `h-14 px-8` |
| icon | `h-10 w-10` |

**States:**
```css
disabled:pointer-events-none disabled:opacity-50
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

---

### StickyBookingCTA

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/Activity/StickyBookingCTA.tsx` |
| **Position** | fixed bottom (mobile only) |
| **Props** | `price`, `discount?`, `onBook`, `disabled?` |

---

## 5. Composants Forms

### Input

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/ui/input.tsx` |
| **Base** | Native HTML |
| **Hauteur** | h-10 |

```css
flex h-10 w-full rounded-md border border-input bg-background
px-3 py-2 text-sm
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

---

### Select

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/ui/select.tsx` |
| **Base** | Radix UI Select |

**Sous-composants:**
- SelectTrigger
- SelectContent
- SelectItem
- SelectValue
- SelectGroup
- SelectSeparator

---

### Checkbox

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/ui/checkbox.tsx` |
| **Base** | Radix UI Checkbox |
| **Size** | h-4 w-4 |

```css
peer h-4 w-4 shrink-0 rounded-sm border border-primary
data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground
```

---

### RadioGroup

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/ui/radio-group.tsx` |
| **Base** | Radix UI RadioGroup |

**Utilisé sur:** ActivityDetail (sélection créneaux scolaires)

---

### Textarea

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/ui/textarea.tsx` |
| **Min Height** | min-h-[80px] |

---

### Form (React Hook Form wrapper)

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/ui/form.tsx` |
| **Base** | React Hook Form |

**Sous-composants:**
- FormProvider
- FormField
- FormItem
- FormLabel
- FormControl
- FormDescription
- FormMessage

---

## 6. Composants States

### LoadingState

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/LoadingState.tsx` |
| **Props** | `text?`, `fullScreen?`, `className?` |

**Pattern:**
```tsx
<div className="flex flex-col items-center justify-center">
  <Loader2 className="h-8 w-8 animate-spin text-primary" />
  {text && <p className="mt-2 text-muted-foreground">{text}</p>}
</div>
```

---

### ErrorState

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/ErrorState.tsx` |
| **Props** | `title?`, `message`, `onRetry?` |

**Pattern:**
```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>{title}</AlertTitle>
  <AlertDescription>{message}</AlertDescription>
  {onRetry && <Button onClick={onRetry}>Réessayer</Button>}
</Alert>
```

---

### Skeleton

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/ui/skeleton.tsx` |
| **Animation** | animate-pulse |

```tsx
<div className="animate-pulse rounded-md bg-muted" />
```

---

### ActivityCardSkeleton

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/Activity/ActivityCardSkeleton.tsx` |
| **Aspect** | 4:3 |

**Structure:**
- Image placeholder (aspect-[4/3])
- Title placeholder (h-4 w-3/4)
- Details placeholders (h-3 w-1/2, h-3 w-1/4)

---

### Empty States (par page)

**Pas de composant générique.** Chaque page implémente son propre empty state :

| Page | Icône | CTA |
|------|-------|-----|
| MesEnfants | Baby | "Ajouter un enfant" |
| MesReservations | Calendar | "Découvrir les activités" |
| MesNotifications | Bell | — |
| MesEvenementsFavoris | Heart | "Découvrir les événements" |

---

## 7. Système d'icônes

### Librairie: Lucide React

| Propriété | Valeur |
|-----------|--------|
| **Package** | `lucide-react` |
| **Import** | Named imports |

**Icônes fréquentes:**
```tsx
import {
  Home, Search, User, Bell, Settings,
  Heart, Calendar, MapPin, Euro, Users,
  ChevronLeft, ChevronRight, X, Check,
  Loader2, AlertCircle, Info
} from "lucide-react";
```

---

### AppIcon (Wrapper)

| Propriété | Valeur |
|-----------|--------|
| **Fichier** | `src/components/ui/app-icon.tsx` |

**Sizes:**
| Size | Pixels |
|------|--------|
| xs | 16px |
| sm | 20px |
| md | 24px (default) |
| lg | 28px |

**Colors:**
| Color | Value |
|-------|-------|
| default | currentColor |
| primary | hsl(var(--primary)) |
| muted | hsl(var(--text-muted)) |
| success | hsl(var(--success-green)) |
| accent | hsl(var(--accent)) |

---

### Stroke Width Patterns

| Context | strokeWidth |
|---------|-------------|
| Navigation inactive | 2 |
| Navigation active | 2.5 |
| Badges/inline | 1.75 |
| Buttons | 2 |

---

## 8. Divergences UI

### P0 — Critiques

| Divergence | Fichiers impactés | Impact |
|------------|-------------------|--------|
| **Mix imports icônes** | Multiple | Lucide direct vs AppIcon wrapper |
| **Couleurs hardcodées** | ActivityCard, badges | Hex values vs CSS variables |
| **Empty states non standardisés** | Pages compte | Chaque page son pattern |
| **Spacing incohérent** | Cards | p-3, p-4, p-6 selon contexte |

### P1 — Importants

| Divergence | Fichiers impactés | Impact |
|------------|-------------------|--------|
| **Border radius variable** | Cards, badges | rounded-lg, rounded-2xl, rounded-full |
| **Stroke width variable** | Icônes | 1.5, 1.75, 2, 2.5 sans règle |
| **Button loading** | Forms | Pas de state loading intégré |
| **Form error styling** | Forms | Via FormMessage, pas standardisé |

### P2 — Mineurs

| Divergence | Fichiers impactés | Impact |
|------------|-------------------|--------|
| **Text truncation** | Cards | line-clamp-X incohérent |
| **Shadow system** | Cards | shadow-sm, shadow-md, custom |
| **Z-index layers** | Modals, sticky | Multiples z-50 |
| **Emojis vs icons** | FinancialAidBadges | Territoire avec emoji 🇫🇷 |

---

## Recommandations de standardisation

### Quick Wins (< 2h)

1. **Créer EmptyState générique**
```tsx
// src/components/ui/empty-state.tsx
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}
```

2. **Normaliser imports icônes via AppIcon**

3. **Ajouter loading state au Button**
```tsx
// Dans button.tsx
{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
```

### Moyen terme (1-2 jours)

4. **Créer tokens couleurs catégories**
```css
/* tailwind.config.js */
category: {
  sport: { bg: 'amber-100', text: 'amber-800' },
  culture: { bg: 'violet-100', text: 'violet-800' },
  // ...
}
```

5. **Standardiser spacing cards**
```tsx
// Définir variants dans Card
variants: {
  padding: {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }
}
```

---

*Document généré le 12 décembre 2025*
