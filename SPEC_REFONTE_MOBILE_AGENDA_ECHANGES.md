# Spécification : Refonte Mobile/Tablette + Intégration Agenda & Échanges

## 1. Breakpoints et Responsivité

### Définition des breakpoints
```typescript
// Configuration Tailwind actuelle à conserver
{
  'sm': '640px',   // Smartphone large
  'md': '768px',   // Tablette
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Desktop large
  '2xl': '1536px'  // Desktop très large
}
```

### Comportements par device

#### 📱 Smartphone (< 768px)
- **Layout** : 1 colonne stricte
- **Navigation** : Barre fixe en bas avec 5 items
- **Hero images** : max-h-[40vh] (limite à 40% hauteur viewport)
- **Marges** : px-4 standard
- **Boutons** : min-h-[44px] (zone tactile accessible)
- **Cards** : pleine largeur avec padding réduit

#### 📱 Tablette (768px - 1024px)
- **Layout** : 2 colonnes sur pages complexes
- **Navigation** : Barre fixe en bas (même que mobile)
- **Hero images** : max-h-[45vh]
- **Marges** : px-6
- **Cards** : grid-cols-2 pour listes d'activités
- **Détail activité** : 
  - Colonne gauche (60%) : Infos + Mobilité
  - Colonne droite (40%) : Tarifs/Aides sticky

#### 💻 Desktop (≥ 1024px)
- **Layout** : 2-3 colonnes selon contexte
- **Navigation** : Header + optionnel sidebar
- **Hero images** : max-h-[480px]
- **Container** : max-w-7xl centré
- **Détail activité** :
  - Colonne principale (66%) : Infos détaillées
  - Sidebar (33%) : Tarifs/Aides/Réservation sticky

---

## 2. Nouvelle Structure Page d'Accueil

### Architecture globale
```
┌─────────────────────────────────────┐
│         Header (sticky)             │
├─────────────────────────────────────┤
│      Barre de recherche             │
├─────────────────────────────────────┤
│   BLOC 1: Trouver une activité      │
│   - Univers (carrousel)             │
│   - Filtres rapides                 │
├─────────────────────────────────────┤
│   BLOC 2: Mes aides & mobilités     │
│   ┌─────────────┬─────────────┐     │
│   │ Calculer    │ Éco-        │     │
│   │ mes aides   │ mobilité    │     │
│   └─────────────┴─────────────┘     │
├─────────────────────────────────────┤
│   BLOC 3: Vivre mon territoire      │
│   ┌─────────────┬─────────────┐     │
│   │ Agenda du   │ Échanges &  │     │
│   │ territoire  │ communauté  │     │
│   └─────────────┴─────────────┘     │
├─────────────────────────────────────┤
│   Sections d'activités              │
│   - À la une                        │
│   - Petits budgets                  │
│   - Innovantes                      │
├─────────────────────────────────────┤
│         Footer                      │
├─────────────────────────────────────┤
│    Bottom Nav (mobile/tablette)     │
└─────────────────────────────────────┘
```

### Détail des blocs

#### BLOC 1 : Trouver une activité
```typescript
interface TrouverActiviteBloc {
  elements: [
    {
      type: "UniversSection",
      display: "carousel horizontal",
      univers: ["Sport", "Culture", "Vacances", "Scolarité", "Insertion"]
    },
    {
      type: "FiltresRapides",
      filtres: [
        { icon: Users, label: "Pour qui", link: "/search?filter=who" },
        { icon: Calendar, label: "Quand", link: "/search?filter=when" },
        { icon: MapPin, label: "Où", link: "/search?filter=where" },
        { icon: Euro, label: "Budget", link: "/search?filter=budget" }
      ]
    }
  ]
}
```

**Responsive** :
- Mobile : Carrousel univers pleine largeur + filtres en grille 2x2
- Tablette : Même comportement, marges élargies
- Desktop : Univers en ligne + filtres inline

#### BLOC 2 : Mes aides & mobilités
```typescript
interface AidesMobiliteBloc {
  cards: [
    {
      title: "Calculer mes aides",
      icon: Euro,
      description: "Estimez vos aides financières en 2 minutes",
      cta: {
        label: "Simuler mes aides",
        link: "/aides"
      },
      color: "bg-primary/10"
    },
    {
      title: "Éco-mobilité",
      icon: Bus,
      description: "Trouvez le meilleur trajet vers l'activité",
      cta: {
        label: "Voir mes options",
        link: "/eco-mobilite"
      },
      color: "bg-green-500/10"
    }
  ]
}
```

**Responsive** :
- Mobile : 2 cards empilées verticalement
- Tablette : 2 cards côte à côte (grid-cols-2)
- Desktop : 2 cards côte à côte avec max-width

#### BLOC 3 : Vivre mon territoire (NOUVEAU)
```typescript
interface VivreTerritoireBloc {
  cards: [
    {
      title: "Agenda du territoire",
      icon: CalendarRange,
      description: "Événements, réunions parents, infos collectivités",
      preview: {
        type: "event_list",
        max_items: 3,
        source: "supabase.territory_events"
      },
      cta: {
        label: "Voir l'agenda complet",
        link: "/agenda"
      },
      color: "bg-orange-500/10"
    },
    {
      title: "Échanges & communauté",
      icon: MessageCircle,
      description: "Rejoignez les discussions de votre communauté",
      preview: {
        type: "heartbeat_widget",
        community_selector: true // Parents / Pros / Collectivités
      },
      cta: {
        label: "Rejoindre les échanges",
        link: "/community" // Redirige vers Heartbeat
      },
      color: "bg-blue-500/10"
    }
  ]
}
```

**Responsive** :
- Mobile : 2 cards empilées
- Tablette : 2 cards côte à côte
- Desktop : 2 cards côte à côte avec preview étendu

---

## 3. Page Détail Activité - Structure en Onglets

### Architecture avec onglets

```
┌─────────────────────────────────────────────┐
│  Hero Image (réduit: 40vh max)              │
│  + Badges flottants (catégorie, âge)        │
├─────────────────────────────────────────────┤
│  Titre activité + Quick actions (partage)   │
├─────────────────────────────────────────────┤
│  [Infos] [Tarifs & aides] [Mobilité] [Échanges] │ ← Onglets
├─────────────────────────────────────────────┤
│                                             │
│  CONTENU DE L'ONGLET ACTIF                  │
│                                             │
│  (Layout adaptatif selon device)            │
│                                             │
├─────────────────────────────────────────────┤
│  CTA fixe : "Réserver un créneau" (sticky)  │
└─────────────────────────────────────────────┘
```

### Contenu des onglets

#### Onglet 1️⃣ : Infos
```typescript
interface InfosTab {
  sections: [
    {
      title: "À propos",
      content: "activity.description"
    },
    {
      title: "Informations pratiques",
      items: [
        { icon: Users, label: "Âge", value: "activity.ageRange" },
        { icon: MapPin, label: "Lieu", value: "activity.location" },
        { icon: Calendar, label: "Dates", value: "activity.dates" },
        { icon: Building2, label: "Structure", value: "activity.structure.name" }
      ]
    },
    {
      title: "Accessibilité",
      content: "activity.accessibility_checklist"
    },
    {
      title: "Documents requis",
      list: "activity.required_documents"
    }
  ]
}
```

#### Onglet 2️⃣ : Tarifs & aides
```typescript
interface TarifsAidesTab {
  layout: {
    mobile: "1 colonne",
    tablet: "2 colonnes (tarif | calculateur)",
    desktop: "2 colonnes avec sidebar sticky"
  },
  sections: [
    {
      title: "Tarif de référence",
      price: "activity.price",
      unit: "activity.price_unit",
      badges: ["has_installments", "accepts_aids"]
    },
    {
      title: "Évaluer ton aide",
      component: "EnhancedFinancialAidCalculator",
      inputs: [
        "child_selector",
        "quotient_familial",
        "city_code"
      ],
      outputs: [
        "total_aids",
        "remaining_price",
        "aid_breakdown"
      ]
    },
    {
      title: "Facilités de paiement",
      options: "activity.payment_plans"
    }
  ]
}
```

#### Onglet 3️⃣ : Mobilité
```typescript
interface MobiliteTab {
  component: "EcoMobilitySection",
  options: [
    {
      mode: "bus",
      provider: "STAS",
      duration: "calculated_real_time",
      cost: "from_api_or_static"
    },
    {
      mode: "bike",
      provider: "Vélivert",
      duration: "calculated_real_time",
      cost: "from_api_or_static"
    },
    {
      mode: "walk",
      duration: "calculated_real_time"
    },
    {
      mode: "car",
      duration: "calculated_real_time",
      note: "impact_carbone"
    }
  ],
  persistence: "localStorage per activity",
  display: {
    mobile: "liste verticale",
    tablet: "grille 2 colonnes",
    desktop: "grille 2 colonnes avec détails étendus"
  }
}
```

#### Onglet 4️⃣ : Échanges (NOUVEAU)
```typescript
interface EchangesTab {
  integration: "Heartbeat",
  modes: [
    {
      type: "activity_thread",
      title: "Discussion autour de cette activité",
      description: "Posez vos questions, partagez vos expériences",
      implementation: "iframe ou deep link vers Heartbeat thread spécifique"
    },
    {
      type: "territory_forum",
      title: "Forum du territoire",
      description: "Échanges généraux avec la communauté locale",
      implementation: "lien vers Heartbeat community"
    }
  ],
  role_based_redirect: {
    family: "heartbeat.com/flooow/parents",
    structure: "heartbeat.com/flooow/organismes",
    territory_admin: "heartbeat.com/flooow/collectivites"
  }
}
```

### Responsive des onglets

**Mobile** :
```
┌─────────────────┐
│ [Tab1] [Tab2]   │
│ [Tab3] [Tab4]   │ ← 2x2 grid ou scrollable horizontal
├─────────────────┤
│                 │
│  Contenu        │
│  (1 colonne)    │
│                 │
└─────────────────┘
```

**Tablette** :
```
┌───────────────────────────────┐
│ [Infos] [Tarifs] [Mobilité] [Échanges] │ ← Inline tabs
├───────────────────────────────┤
│         │                     │
│ Contenu │  Sidebar (si tab    │
│ (60%)   │  Tarifs active)     │
│         │  (40% sticky)       │
└───────────────────────────────┘
```

**Desktop** :
```
┌─────────────────────────────────────┐
│ [Infos] [Tarifs & aides] [Mobilité] [Échanges] │
├─────────────────────────────────────┤
│                    │                │
│  Contenu (66%)     │  Sidebar (33%) │
│                    │  - Créneaux    │
│                    │  - Réservation │
│                    │  (sticky)      │
└─────────────────────────────────────┘
```

---

## 4. Navigation Bas (Bottom Nav)

### Nouvelle structure (5 items)

```typescript
interface BottomNavItem {
  id: string;
  icon: LucideIcon;
  label: string;
  route: string;
  requiredAuth?: boolean;
  roles?: string[];
}

const newBottomNav: BottomNavItem[] = [
  {
    id: "home",
    icon: Home,
    label: "Accueil",
    route: "/"
  },
  {
    id: "activities",
    icon: Search,
    label: "Activités",
    route: "/activities"
  },
  {
    id: "agenda",
    icon: CalendarRange,
    label: "Agenda",
    route: "/agenda",
    requiredAuth: false // Accessible même non connecté
  },
  {
    id: "community",
    icon: MessageCircle,
    label: "Échanges",
    route: "/community",
    requiredAuth: false // Redirige vers Heartbeat
  },
  {
    id: "account",
    icon: User,
    label: "Mon espace",
    route: "/mon-compte",
    requiredAuth: true // Redirige vers /login si non connecté
  }
]
```

### Design specs

**Dimensions** :
- Hauteur : h-20 (80px)
- Icônes : w-6 h-6 (24px)
- Labels : text-xs (12px)
- Zone tactile min : 44px x 44px

**Espacement** :
```css
.bottom-nav {
  @apply fixed bottom-0 inset-x-0 z-40;
  @apply bg-card/95 backdrop-blur-lg;
  @apply border-t border-border/40;
  @apply safe-area-inset-bottom; /* iOS notch support */
}

.bottom-nav-item {
  @apply flex-1 flex flex-col items-center justify-center;
  @apply gap-1 py-2 px-1;
  @apply min-h-[44px]; /* Accessibilité tactile */
  @apply transition-colors duration-200;
}

.bottom-nav-item-active {
  @apply text-primary;
}

.bottom-nav-item-inactive {
  @apply text-muted-foreground;
  @apply hover:text-foreground;
}
```

**Responsive** :
- Mobile : Affiché (< 1024px)
- Tablette : Affiché (768px - 1024px)
- Desktop : Masqué (≥ 1024px) → Navigation via Header

---

## 5. Intégration Heartbeat

### Stratégie d'intégration

#### Option 1 : Deep Links (Phase 1 - Simple)
```typescript
// Redirection simple vers Heartbeat avec context
const getCommunityUrl = (userRole: string, context?: string) => {
  const baseUrls = {
    family: "https://heartbeat.com/flooow-parents",
    structure: "https://heartbeat.com/flooow-organismes",
    territory_admin: "https://heartbeat.com/flooow-collectivites"
  };
  
  const base = baseUrls[userRole] || baseUrls.family;
  
  // Ajouter contexte si fourni (ex: activité spécifique)
  if (context) {
    return `${base}?context=${encodeURIComponent(context)}`;
  }
  
  return base;
};
```

#### Option 2 : iFrame Embed (Phase 2 - Avancé)
```typescript
// Composant d'embed Heartbeat
interface HeartbeatEmbedProps {
  communityId: string;
  threadId?: string;
  height?: string;
}

const HeartbeatEmbed: React.FC<HeartbeatEmbedProps> = ({
  communityId,
  threadId,
  height = "600px"
}) => {
  const embedUrl = threadId 
    ? `https://heartbeat.com/embed/${communityId}/thread/${threadId}`
    : `https://heartbeat.com/embed/${communityId}`;
    
  return (
    <iframe
      src={embedUrl}
      className="w-full border-0 rounded-lg"
      style={{ height }}
      allow="encrypted-media; fullscreen"
    />
  );
};
```

### Espaces Heartbeat à créer

1. **Flooow Parents** (heartbeat.com/flooow-parents)
   - Discussions générales familles
   - Threads par activité/structure
   - Avis et retours d'expérience
   - Entraide covoiturage

2. **Flooow Organismes** (heartbeat.com/flooow-organismes)
   - Questions/support structures
   - Partage bonnes pratiques
   - Coordination inter-structures

3. **Flooow Collectivités** (heartbeat.com/flooow-collectivites)
   - Pilotage territorial
   - Annonces officielles
   - Coordination partenaires

---

## 6. Nouvelles Pages à Créer

### Page `/agenda`
```typescript
interface AgendaPage {
  sections: [
    {
      title: "À venir cette semaine",
      events: "territory_events filtered by date_range",
      display: "list with date grouping"
    },
    {
      title: "Événements par catégorie",
      tabs: [
        "Tous",
        "Enfants/Ados",
        "Réunions parents",
        "Infos collectivités",
        "Ateliers"
      ]
    },
    {
      title: "Calendrier",
      component: "MonthCalendar with event markers"
    }
  ],
  responsive: {
    mobile: "Liste verticale + filtres en sheet",
    tablet: "Liste + mini calendrier sidebar",
    desktop: "Grille 2 colonnes (liste + calendrier)"
  }
}
```

### Page `/community`
```typescript
interface CommunityPage {
  role_detection: true,
  redirect_logic: {
    logged_in: "redirect to appropriate Heartbeat space",
    logged_out: "show landing page with 3 communities preview + login CTA"
  },
  landing_page: {
    hero: "Rejoignez la communauté Flooow",
    communities: [
      {
        name: "Parents",
        description: "Échangez avec d'autres familles",
        members: "count from Heartbeat API",
        cta: "Rejoindre"
      },
      {
        name: "Organismes",
        description: "Réseau des structures partenaires",
        members: "count",
        cta: "Rejoindre"
      },
      {
        name: "Collectivités",
        description: "Coordination territoriale",
        members: "count",
        cta: "Rejoindre"
      }
    ]
  }
}
```

---

## 7. Migration Database

### Nouvelle table `territory_events`
```sql
CREATE TABLE territory_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- 'children_teens' | 'parent_meeting' | 'official_info' | 'workshop'
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  organizer TEXT,
  organizer_contact TEXT,
  target_audience TEXT[], -- ['families', 'structures', 'all']
  registration_required BOOLEAN DEFAULT false,
  registration_url TEXT,
  image_url TEXT,
  postal_codes TEXT[], -- Zones concernées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherches fréquentes
CREATE INDEX idx_territory_events_dates ON territory_events(start_date, end_date);
CREATE INDEX idx_territory_events_type ON territory_events(event_type);
CREATE INDEX idx_territory_events_postal_codes ON territory_events USING GIN(postal_codes);

-- RLS
ALTER TABLE territory_events ENABLE ROW LEVEL SECURITY;

-- Politique : tous peuvent voir
CREATE POLICY "Territory events are viewable by everyone"
  ON territory_events FOR SELECT
  USING (true);

-- Politique : seuls admins territoriaux peuvent créer/modifier
CREATE POLICY "Territory admins can manage events"
  ON territory_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('territory_admin', 'superadmin')
    )
  );
```

---

## 8. Plan d'Implémentation par Étapes

### 🎯 Phase 1 : Fondations Responsive (Semaine 1)
**Objectif** : Stabiliser les breakpoints et comportements mobile/tablette

- [ ] **Step 1.1** : Audit complet responsive
  - Tester toutes les pages clés sur 3 devices (mobile/tablet/desktop)
  - Identifier les points de rupture UI
  - Documenter les incohérences

- [ ] **Step 1.2** : Harmoniser les breakpoints
  - Mettre à jour `tailwind.config.ts` si nécessaire
  - Créer des mixins/utilities pour layouts récurrents
  - Standardiser les marges/paddings par device

- [ ] **Step 1.3** : Fix hero images
  - Limiter hauteur à 40vh mobile, 45vh tablette, 480px desktop
  - Appliquer à toutes les pages (Index, ActivityDetail, etc.)
  - Vérifier ratios d'image

- [ ] **Step 1.4** : Optimiser BottomNav
  - Ajuster tailles icônes/labels
  - Vérifier zones tactiles (min 44px)
  - Tester z-index et overlaps

**Validation** : Aucun débordement, navigation fluide sur tous devices

---

### 🏠 Phase 2 : Refonte Page d'Accueil (Semaine 2)
**Objectif** : Intégrer les nouveaux blocs "Aides & Mobilités" + "Vivre mon territoire"

- [ ] **Step 2.1** : Créer composants cards compacts
  - `<AidesMobiliteBloc />` : 2 cards côte à côte
  - `<VivreTerritoireBloc />` : 2 cards Agenda + Échanges
  - Design responsive (stack mobile, grid tablette/desktop)

- [ ] **Step 2.2** : Intégrer dans Index.tsx
  - Réorganiser ordre des sections
  - Remplacer ancien bloc éco-mobilité volumineux
  - Garder InfoBlocks si pertinent

- [ ] **Step 2.3** : Créer page `/agenda` (MVP)
  - Liste simple d'événements (mock data)
  - Filtres par catégorie
  - Responsive mobile-first

- [ ] **Step 2.4** : Créer page `/community` (landing)
  - Page d'orientation vers Heartbeat
  - 3 communautés présentées
  - Liens deep link selon rôle

**Validation** : Home harmonieux, nouvelles pages accessibles

---

### 📑 Phase 3 : Refonte ActivityDetail en Onglets (Semaine 3)
**Objectif** : Structurer la page détail activité avec 4 onglets

- [ ] **Step 3.1** : Créer système d'onglets réutilisable
  - Composant `<ActivityTabs />` avec state management
  - Responsive : horizontal desktop, vertical/sheet mobile
  - Accessible (ARIA, keyboard nav)

- [ ] **Step 3.2** : Refactoriser contenu en 4 onglets
  - Onglet "Infos" : description, pratique, accessibilité
  - Onglet "Tarifs & aides" : prix + calculateur
  - Onglet "Mobilité" : composant existant EcoMobilitySection
  - Onglet "Échanges" : placeholder + deep link Heartbeat

- [ ] **Step 3.3** : Adapter layout responsive
  - Mobile : onglets horizontaux scrollables + contenu empilé
  - Tablette : onglets inline + contenu 2 colonnes
  - Desktop : onglets + sidebar sticky (réservation)

- [ ] **Step 3.4** : Gérer état persisté
  - Mémoriser onglet actif (query param ?)
  - Restaurer scroll position
  - Conserver données aides/transport

**Validation** : Navigation fluide entre onglets, pas de perte de données

---

### 🧭 Phase 4 : Mise à Jour Bottom Nav (Semaine 4)
**Objectif** : Nouvelle navigation avec Agenda + Échanges

- [ ] **Step 4.1** : Modifier BottomNavigation.tsx
  - Remplacer items actuels par nouveaux 5 items
  - Icônes : Home, Search, CalendarRange, MessageCircle, User
  - Labels : Accueil, Activités, Agenda, Échanges, Mon espace

- [ ] **Step 4.2** : Logique de redirection
  - Échanges → route `/community` (puis Heartbeat)
  - Agenda → route `/agenda`
  - Mon espace → `/mon-compte` (avec guard auth)

- [ ] **Step 4.3** : Ajuster z-index et safe-areas
  - Support iOS notch (safe-area-inset-bottom)
  - Vérifier que contenu ne passe pas sous la nav

- [ ] **Step 4.4** : Analytics
  - Tracker clics sur chaque item
  - Mesurer adoption Agenda/Échanges

**Validation** : 5 items visibles, navigation sans bug

---

### 🤝 Phase 5 : Intégration Heartbeat (Semaine 5)
**Objectif** : Connecter réellement à Heartbeat

- [ ] **Step 5.1** : Créer espaces Heartbeat
  - Flooow Parents community
  - Flooow Organismes community
  - Flooow Collectivités community
  - Configurer permissions/roles

- [ ] **Step 5.2** : Implémenter deep links
  - Fonction `getCommunityUrl(role, context)`
  - Redirection depuis `/community`
  - Redirection depuis onglet "Échanges" ActivityDetail

- [ ] **Step 5.3** : (Optionnel) Tester embed iframe
  - Composant `<HeartbeatEmbed />`
  - Intégrer dans onglet "Échanges" si API le permet
  - Fallback vers deep link si embed impossible

- [ ] **Step 5.4** : Onboarding utilisateurs
  - Message explicatif "Vous allez rejoindre Heartbeat"
  - Auto-login si possible (SSO/JWT)
  - Guide de première utilisation

**Validation** : Utilisateurs redirigés vers bon espace Heartbeat

---

### 📊 Phase 6 : Database Agenda (Semaine 6)
**Objectif** : Remplacer mocks par vraies données événements

- [ ] **Step 6.1** : Migration SQL
  - Créer table `territory_events`
  - Index + RLS policies
  - Seed data exemple (10-20 événements)

- [ ] **Step 6.2** : Edge function ou query directe
  - Endpoint GET `/api/events?type=...&date_range=...`
  - Filtres par postal_code, event_type, dates

- [ ] **Step 6.3** : Intégrer dans page `/agenda`
  - Remplacer mocks par vraies queries
  - Pagination/infinite scroll
  - Recherche/filtres dynamiques

- [ ] **Step 6.4** : Dashboard admin pour créer événements
  - Formulaire création/édition événements
  - Upload images
  - Prévisualisation

**Validation** : Événements réels affichés, admins peuvent CRUD

---

### ✅ Phase 7 : Tests & Optimisations (Semaine 7)
**Objectif** : QA globale et peaufinage

- [ ] **Step 7.1** : Tests multi-devices
  - iPhone SE, iPhone 14 Pro, iPad, Desktop
  - Chrome, Safari, Firefox
  - Mode sombre / clair

- [ ] **Step 7.2** : Performance
  - Lighthouse scores (Perf, A11y, SEO)
  - Optimiser images (WebP, lazy loading)
  - Code splitting si pages lourdes

- [ ] **Step 7.3** : Accessibilité
  - WCAG AA compliance
  - Screen reader testing
  - Keyboard navigation

- [ ] **Step 7.4** : Documentation
  - Mettre à jour README
  - Guide utilisateur (FAQ)
  - Vidéos démo si pertinent

**Validation** : Lighthouse >90, 0 bugs critiques

---

## 9. Wireframes

### Home Mobile (< 768px)
```
┌─────────────────────┐
│     Header          │
├─────────────────────┤
│  🔍 Recherche       │
├─────────────────────┤
│ 🌟 Univers →        │
│ [Sport][Culture]... │
├─────────────────────┤
│ 💶 Calculer aides   │
├─────────────────────┤
│ 🚌 Éco-mobilité     │
├─────────────────────┤
│ 📅 Agenda territoire│
├─────────────────────┤
│ 💬 Échanges         │
├─────────────────────┤
│ Activités à la une  │
│ [Card] [Card]       │
├─────────────────────┤
│ Petits budgets      │
│ [Card] [Card]       │
├─────────────────────┤
│     Footer          │
├─────────────────────┤
│ [🏠][🔍][📅][💬][👤]│ ← Bottom Nav
└─────────────────────┘
```

### Home Tablette (768px - 1024px)
```
┌───────────────────────────────┐
│          Header               │
├───────────────────────────────┤
│       🔍 Recherche            │
├───────────────────────────────┤
│ 🌟 Univers horizontal scroll  │
├───────────────────────────────┤
│  💶 Aides    │  🚌 Mobilité   │
├───────────────────────────────┤
│  📅 Agenda   │  💬 Échanges   │
├───────────────────────────────┤
│ Activités à la une            │
│ [Card] [Card] [Card]          │
├───────────────────────────────┤
│         Footer                │
├───────────────────────────────┤
│ [🏠]  [🔍]  [📅]  [💬]  [👤] │
└───────────────────────────────┘
```

### ActivityDetail Mobile - Onglet Infos
```
┌─────────────────────┐
│  Hero Image (40vh)  │
│  [Sport] [6-9 ans]  │
├─────────────────────┤
│ ← Activité Judo     │
│    🔗 Partager      │
├─────────────────────┤
│[Infos][Tarifs]      │
│[Mobilité][Échanges] │
├─────────────────────┤
│ 📝 À propos         │
│ Description...      │
├─────────────────────┤
│ ℹ️ Infos pratiques  │
│ Âge: 6-9 ans        │
│ Lieu: Centre social │
├─────────────────────┤
│ ♿ Accessibilité    │
│ ✓ Rampe accès       │
│ ✓ Toilettes adapt.  │
├─────────────────────┤
│ RÉSERVER (sticky)   │
└─────────────────────┘
```

### ActivityDetail Tablette - Onglet Tarifs
```
┌───────────────────────────────┐
│  Hero Image (45vh)            │
│  [Sport] [6-9 ans]            │
├───────────────────────────────┤
│ ← Activité Judo    🔗 Partager│
├───────────────────────────────┤
│[Infos][Tarifs][Mobilité][Éch.]│
├───────────────────────────────┤
│  Tarif 180€  │ 🗓️ Créneaux   │
│  /an         │  Mer 14h-15h   │
│              │  Sam 10h-11h   │
│ 💶 Calculer  │ ┌────────────┐ │
│  mes aides:  │ │  RÉSERVER  │ │
│              │ │  (sticky)  │ │
│ [Enfant ▼]   │ └────────────┘ │
│ [QF: ___]    │                │
│ [Ville ▼]    │                │
│              │                │
│ → Total aide:│                │
│   45€        │                │
│ Reste: 135€  │                │
└───────────────────────────────┘
```

---

## 10. Checklist de Validation Finale

### Responsive
- [ ] Toutes les pages testées sur iPhone SE (320px)
- [ ] Toutes les pages testées sur iPad (768px)
- [ ] Toutes les pages testées sur Desktop (1920px)
- [ ] Pas de débordement horizontal
- [ ] Images hero limitées en hauteur
- [ ] Bottom Nav ne recouvre pas le contenu

### Navigation
- [ ] Bottom Nav affiche 5 items corrects
- [ ] Redirection Agenda → `/agenda` fonctionne
- [ ] Redirection Échanges → `/community` → Heartbeat fonctionne
- [ ] Flèche retour présente partout
- [ ] Breadcrumbs cohérents

### Page d'Accueil
- [ ] 3 blocs visibles (Activités, Aides/Mobilité, Territoire)
- [ ] Cards Agenda et Échanges fonctionnelles
- [ ] Univers en carrousel responsive
- [ ] Sections d'activités s'affichent correctement

### ActivityDetail
- [ ] 4 onglets présents et fonctionnels
- [ ] Contenu complet dans chaque onglet
- [ ] Layout responsive (1 col mobile, 2 col tablette/desktop)
- [ ] Calculateur d'aides fonctionne
- [ ] Onglet Mobilité affiche options transport
- [ ] Onglet Échanges redirige vers Heartbeat

### Heartbeat
- [ ] 3 espaces créés (Parents, Organismes, Collectivités)
- [ ] Deep links fonctionnent selon rôle utilisateur
- [ ] Message onboarding affiché avant redirection

### Base de données
- [ ] Table `territory_events` créée
- [ ] RLS policies actives
- [ ] Seed data présent (>10 événements)
- [ ] API/queries fonctionnelles

### Performance
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 95
- [ ] Images optimisées (WebP, lazy load)
- [ ] Pas de layout shift (CLS < 0.1)

### Accessibilité
- [ ] Navigation au clavier OK
- [ ] Screen reader compatible
- [ ] Contrastes WCAG AA
- [ ] Labels ARIA présents
- [ ] Focus visible

---

## Conclusion

Cette spécification définit une refonte complète de l'expérience mobile/tablette avec l'ajout de fonctionnalités "Agenda & Échanges" positionnant Flooow en concurrence partielle avec les apps citoyennes tout en conservant son ADN d'agrégateur d'activités + aides + éco-mobilité.

**Points clés** :
- Breakpoints clairs et cohérents
- Home réorganisée en 3 blocs thématiques
- ActivityDetail structurée en onglets accessibles
- Bottom Nav étendue à 5 items
- Intégration Heartbeat pour la dimension communautaire

**Approche incrémentale** : 7 phases sur 7 semaines pour minimiser les risques de régression et permettre des validations intermédiaires.

**Prochaine étape** : Valider cette spec avec l'équipe puis lancer Phase 1 (Fondations Responsive).
