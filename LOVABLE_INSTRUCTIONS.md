# 📋 Instructions pour synchroniser les modifications sur Lovable

## 🚀 MÉTHODE RAPIDE : Copier-Coller Manuel

Voici les fichiers à modifier sur Lovable, dans l'ordre :

---

## 1️⃣ CSS UTILITIES (COPIER EN PREMIER)

**Fichier Lovable** : `src/index.css`

**Action** : Ajouter à la fin du fichier (après la ligne ~127)

```css
/* ============================================================
   Mobile Carousel Utilities
   Purpose: Smooth horizontal scrolling with snap points
   Date: 2025-11-01
   ============================================================ */

@layer utilities {
  /* Hide scrollbar across all browsers */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;     /* Firefox */
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari, Opera */
  }

  /* Horizontal scroll snap */
  .snap-x {
    scroll-snap-type: x mandatory;
  }

  /* Snap children to start position */
  .snap-start {
    scroll-snap-align: start;
  }

  /* Snap children to center position */
  .snap-center {
    scroll-snap-align: center;
  }

  /* Smooth scrolling behavior */
  .scroll-smooth {
    scroll-behavior: smooth;
  }

  /* Prevent overscroll bounce on iOS */
  .overscroll-none {
    overscroll-behavior: none;
  }

  /* Touch-friendly carousel container */
  .carousel-container {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .carousel-container::-webkit-scrollbar {
    display: none;
  }
}
```

---

## 2️⃣ AMÉLIORER ActivityCarousel

**Fichier Lovable** : `src/components/Activity/ActivityCarousel.tsx`

**Action** : Remplacer ligne 26 (le div avec className)

**AVANT** :
```tsx
<div className="w-full overflow-x-auto pb-4 -mx-4 px-4">
```

**APRÈS** :
```tsx
<div className="w-full carousel-container scroll-smooth pb-4 -mx-4 px-4">
```

**ET** ligne 35-36 :

**AVANT** :
```tsx
<div
  key={activity.id}
  className="w-[85vw] max-w-[400px] flex-shrink-0"
```

**APRÈS** :
```tsx
<div
  key={activity.id}
  className="w-[85vw] max-w-[400px] flex-shrink-0 snap-start"
```

---

## 3️⃣ CRÉER UniversSection (NOUVEAU FICHIER)

**Fichier Lovable** : Créer `src/components/UniversSection.tsx`

```tsx
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface Univers {
  id: string;
  name: string;
  image: string;
  gradient: string;
  icon: string;
}

const univers: Univers[] = [
  {
    id: 'sport',
    name: 'Sport',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=280&fit=crop',
    gradient: 'from-blue-600',
    icon: '⚽'
  },
  {
    id: 'culture',
    name: 'Culture',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=280&fit=crop',
    gradient: 'from-purple-600',
    icon: '🎨'
  },
  {
    id: 'apprentissage',
    name: 'Apprentissage',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=280&fit=crop',
    gradient: 'from-green-600',
    icon: '📚'
  },
  {
    id: 'loisirs',
    name: 'Loisirs',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=280&fit=crop',
    gradient: 'from-orange-600',
    icon: '🎮'
  },
  {
    id: 'vacances',
    name: 'Vacances',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=280&fit=crop',
    gradient: 'from-pink-600',
    icon: '🏖️'
  },
];

export const UniversSection = () => {
  const navigate = useNavigate();

  const handleUniversClick = (universId: string) => {
    navigate(`/activities?category=${universId}`);
  };

  return (
    <section className="w-full" aria-labelledby="univers-title">
      <div className="mb-4">
        <h2 id="univers-title" className="text-xl font-bold">
          Découvrir nos univers
        </h2>
      </div>

      <div className="carousel-container scroll-smooth pb-4 -mx-4 px-4">
        <div
          className="flex gap-4"
          style={{ width: "max-content" }}
          role="list"
          aria-label="Univers d'activités"
        >
          {univers.map((item) => (
            <Card
              key={item.id}
              onClick={() => handleUniversClick(item.id)}
              className="relative w-[200px] h-[140px] flex-shrink-0 snap-start overflow-hidden
                         cursor-pointer group hover:scale-105 transition-all duration-300
                         border-0 shadow-md hover:shadow-xl"
              role="listitem"
            >
              <img
                src={item.image}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />

              <div
                className={`absolute inset-0 bg-gradient-to-t ${item.gradient} to-transparent opacity-70
                           group-hover:opacity-80 transition-opacity`}
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <span className="text-4xl mb-2 drop-shadow-lg group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <h3 className="text-xl font-bold drop-shadow-lg text-center">
                  {item.name}
                </h3>
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
```

---

## 4️⃣ MODIFIER ActivitySection

**Fichier Lovable** : `src/components/Activity/ActivitySection.tsx`

**Action 1** : Ajouter import en haut (ligne 1-2)

**AVANT** :
```tsx
import { ActivityCard } from "./ActivityCard";
import { ChevronRight } from "lucide-react";
```

**APRÈS** :
```tsx
import { ActivityCard } from "./ActivityCard";
import { ActivityCarousel } from "./ActivityCarousel";
import { ChevronRight } from "lucide-react";
```

**Action 2** : Modifier l'interface (ligne ~24-30)

**AVANT** :
```tsx
interface ActivitySectionProps {
  title: string;
  activities: Activity[];
  onSeeAll?: () => void;
  onActivityClick?: (id: string) => void;
}
```

**APRÈS** :
```tsx
interface ActivitySectionProps {
  title: string;
  activities: Activity[];
  onSeeAll?: () => void;
  onActivityClick?: (id: string) => void;
  layout?: 'grid' | 'carousel';
}
```

**Action 3** : Modifier la signature de la fonction (ligne ~32)

**AVANT** :
```tsx
export const ActivitySection = ({
  title,
  activities,
  onSeeAll,
  onActivityClick
}: ActivitySectionProps) => {
```

**APRÈS** :
```tsx
export const ActivitySection = ({
  title,
  activities,
  onSeeAll,
  onActivityClick,
  layout = 'grid'
}: ActivitySectionProps) => {
```

**Action 4** : Remplacer la div de grille (ligne ~59-71)

**AVANT** :
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {activities.map((activity) => (
    <ActivityCard
      key={activity.id}
      {...activity}
      ageRange={activity.age_min && activity.age_max ? `${activity.age_min}-${activity.age_max} ans` : activity.ageRange}
      periodType={activity.periodType}
      structureName={activity.structureName}
      structureAddress={activity.structureAddress}
      onRequestClick={() => navigate(`/activity/${activity.id}`)}
    />
  ))}
</div>
```

**APRÈS** :
```tsx
{layout === 'carousel' ? (
  <ActivityCarousel
    activities={activities}
    onActivityClick={(id) => navigate(`/activity/${id}`)}
  />
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {activities.map((activity) => (
      <ActivityCard
        key={activity.id}
        {...activity}
        ageRange={activity.age_min && activity.age_max ? `${activity.age_min}-${activity.age_max} ans` : activity.ageRange}
        periodType={activity.periodType}
        structureName={activity.structureName}
        structureAddress={activity.structureAddress}
        onRequestClick={() => navigate(`/activity/${activity.id}`)}
      />
    ))}
  </div>
)}
```

---

## 5️⃣ MODIFIER Index.tsx (Page d'accueil)

**Fichier Lovable** : `src/pages/Index.tsx`

**Action 1** : Ajouter import (ligne ~4)

**AVANT** :
```tsx
import { ActivitySection } from "@/components/Activity/ActivitySection";
```

**APRÈS** :
```tsx
import { ActivitySection } from "@/components/Activity/ActivitySection";
import { UniversSection } from "@/components/UniversSection";
```

**Action 2** : Ajouter UniversSection après InfoBlocks (ligne ~151-164)

**AVANT** :
```tsx
<>
  <InfoBlocks />

  {/* Filtres d'accessibilité discrets */}
  <div className="flex items-center gap-3 min-h-10">
```

**APRÈS** :
```tsx
<>
  <InfoBlocks />

  {/* Section Univers - Carousel horizontal */}
  <UniversSection />

  {/* Filtres d'accessibilité discrets */}
  <div className="flex items-center gap-3 min-h-10">
```

**Action 3** : Changer première ActivitySection en mode carousel (ligne ~164-169)

**AVANT** :
```tsx
<ActivitySection
  title="Activités à proximité"
  activities={nearbyActivities}
  onSeeAll={() => navigate("/activities?type=nearby")}
  onActivityClick={(id) => console.log("Activity clicked:", id)}
/>
```

**APRÈS** :
```tsx
<ActivitySection
  title="Activités à la une"
  activities={nearbyActivities}
  layout="carousel"
  onSeeAll={() => navigate("/activities?type=nearby")}
  onActivityClick={(id) => console.log("Activity clicked:", id)}
/>
```

---

## 6️⃣ MODIFIER BottomNavigation

**Fichier Lovable** : `src/components/BottomNavigation.tsx`

**Action 1** : Modifier les imports (ligne 1)

**AVANT** :
```tsx
import { Home, Search, DollarSign, User, MessageCircle, BarChart3 } from "lucide-react";
```

**APRÈS** :
```tsx
import { Home, Search, Grid, User, MessageCircle, BarChart3 } from "lucide-react";
```

**Action 2** : Modifier baseNavItems (ligne ~15-19)

**AVANT** :
```tsx
const baseNavItems: NavItem[] = [
  { icon: Home, label: "Accueil", path: "/" },
  { icon: Search, label: "Recherche", path: "/activities" },
  { icon: DollarSign, label: "Aides", path: "/aides" },
  { icon: User, label: "Mon compte", path: "/mon-compte" },
];
```

**APRÈS** :
```tsx
const baseNavItems: NavItem[] = [
  { icon: Grid, label: "Univers", path: "/univers" },
  { icon: Search, label: "Recherche", path: "/activities" },
  { icon: Home, label: "Accueil", path: "/" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: User, label: "Compte", path: "/mon-compte" },
];
```

---

## 7️⃣ CRÉER PAGES (optionnel pour tester)

### Page Univers

**Fichier Lovable** : Créer `src/pages/Univers.tsx`

```tsx
import { UniversSection } from "@/components/UniversSection";
import PageLayout from "@/components/PageLayout";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Univers = () => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Nos Univers</h1>
        </div>

        <p className="text-muted-foreground mb-6">
          Découvrez toutes nos activités organisées par thématiques : Sport, Culture, Apprentissage, Loisirs et Vacances.
        </p>

        <UniversSection />
      </div>
    </PageLayout>
  );
};

export default Univers;
```

### Page Chat

**Fichier Lovable** : Créer `src/pages/Chat.tsx`

```tsx
import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Chat = () => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Messagerie</h1>
        </div>

        <Card className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <MessageCircle className="w-12 h-12 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              Messagerie bientôt disponible
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              La fonctionnalité de communication sera bientôt disponible.
            </p>
          </div>

          <Button onClick={() => navigate('/')} variant="outline">
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Chat;
```

---

## 8️⃣ AJOUTER ROUTES (App.tsx)

**Fichier Lovable** : `src/App.tsx`

**Action 1** : Ajouter imports (après ligne ~27-28)

**AVANT** :
```tsx
import MonCompte from "./pages/MonCompte";
import Aides from "./pages/Aides";
import EcoMobilite from "./pages/EcoMobilite";
```

**APRÈS** :
```tsx
import MonCompte from "./pages/MonCompte";
import Aides from "./pages/Aides";
import Univers from "./pages/Univers";
import Chat from "./pages/Chat";
import EcoMobilite from "./pages/EcoMobilite";
```

**Action 2** : Ajouter routes (après ligne ~148-150)

**AVANT** :
```tsx
<Route path="/mon-compte" element={<MonCompte />} />
<Route path="/aides" element={<Aides />} />
<Route path="/eco-mobilite" element={<EcoMobilite />} />
```

**APRÈS** :
```tsx
<Route path="/mon-compte" element={<MonCompte />} />
<Route path="/aides" element={<Aides />} />
<Route path="/univers" element={<Univers />} />
<Route path="/chat" element={<Chat />} />
<Route path="/eco-mobilite" element={<EcoMobilite />} />
```

---

## ✅ ORDRE D'EXÉCUTION

1. ✅ CSS utilities (index.css)
2. ✅ ActivityCarousel
3. ✅ UniversSection (nouveau)
4. ✅ ActivitySection
5. ✅ BottomNavigation
6. ✅ Index.tsx
7. ⏩ Pages Univers/Chat (optionnel)
8. ⏩ Routes (optionnel)

---

## 🎯 RÉSULTAT ATTENDU

Après avoir fait ces modifications sur Lovable, vous devriez voir :

✅ Section "Découvrir nos univers" avec 5 cartes scrollables
✅ "Activités à la une" en mode carrousel horizontal
✅ Navigation bottom avec 5 icônes
✅ Scroll fluide avec snap points
✅ Aucune scrollbar visible

---

## ⚠️ SI PROBLÈMES

**Erreur "Module not found"** : Vérifiez que vous avez bien créé les fichiers UniversSection.tsx, Univers.tsx, Chat.tsx

**CSS ne marche pas** : Vérifiez que le code CSS est bien après la ligne 127 dans index.css

**Carrousel ne scroll pas** : Videz le cache navigateur (Ctrl+Shift+R)

---

Besoin d'aide pour copier-coller sur Lovable ? Demandez-moi !
