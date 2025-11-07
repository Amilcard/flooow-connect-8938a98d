# Refonte : Section "Découvrir nos univers" sur l'accueil

## Date : 2025-11-07

---

## Problème initial

### 1. Alignement défaillant
- ❌ Les 5 univers n'étaient **pas alignés horizontalement** sur une grille cohérente
- ❌ Utilisaient un **carousel horizontal** (scroll latéral) au lieu d'une grille fixe
- ❌ Cartes de **largeur fixe** (200px) qui ne s'adaptaient pas proprement au responsive

### 2. Confusion visuelle
- ❌ Les cartes univers ressemblaient **trop aux 3 blocs InfoBlocks** du dessus (Aides financières, Éco-mobilité, Handicap)
- ❌ Même style : grandes images + gradient coloré + texte blanc
- ❌ Pas de distinction claire entre "blocs de services" et "catégories d'activités"

---

## Solution implémentée

### 1. Passage d'un carousel à une grille responsive

**Avant** :
```tsx
<div className="carousel-container scroll-smooth pb-4 -mx-4 px-4">
  <div className="flex gap-4" style={{ width: "max-content" }}>
    {univers.map((item) => (
      <Card className="w-[200px] h-[140px] flex-shrink-0">
        {/* Grandes cartes avec image de fond */}
      </Card>
    ))}
  </div>
</div>
```

**Après** :
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
  {univers.map((item) => (
    <Card className="h-32 flex flex-col items-center justify-center">
      {/* Cartes compactes centrées */}
    </Card>
  ))}
</div>
```

**Changements clés** :
- ✅ **Grille CSS** au lieu de flex horizontal
- ✅ **5 colonnes sur desktop** (lg:grid-cols-5) pour aligner parfaitement les 5 univers
- ✅ **3 colonnes sur tablette** (sm:grid-cols-3)
- ✅ **2 colonnes sur mobile** (grid-cols-2)
- ✅ **Hauteur fixe** (h-32 = 128px) plus compacte que les blocs InfoBlocks (aspect-ratio 16/10)

---

### 2. Différenciation visuelle forte

#### A. Titre de section avec séparateur

**Avant** :
```tsx
<div className="mb-4">
  <h2 className="text-xl font-bold">
    Découvrir nos univers
  </h2>
</div>
```

**Après** :
```tsx
<section className="mt-12">
  <div className="mb-6 pb-3 border-b border-border">
    <h2 className="text-2xl font-bold text-foreground">
      Découvrir nos univers
    </h2>
    <p className="text-sm text-muted-foreground mt-1">
      Explorez nos catégories d'activités
    </p>
  </div>
</section>
```

**Avantages** :
- ✅ **Espacement vertical** `mt-12` pour créer une séparation nette avec la section InfoBlocks
- ✅ **Bordure inférieure** `border-b` pour marquer visuellement le changement de section
- ✅ **Sous-titre explicatif** pour clarifier le rôle de cette section

---

#### B. Style de carte sobre et compact

**InfoBlocks (blocs de services)** :
```
- Grandes cartes : aspect-ratio 16/10
- Image plein écran + gradient coloré fort
- Icônes + texte blanc sur fond coloré
- Ombre forte (shadow-xl au hover)
- Effet de translation verticale au hover
```

**Univers (catégories d'activités)** :
```
- Petites cartes : hauteur fixe 128px
- Fond clair (bg-card) avec bordure subtile
- Icône emoji + nom simple centré
- Ombre douce au hover (shadow-lg)
- Effet de scale minimal au hover (1.02)
- Barre de couleur en bas au hover
```

**Code des cartes univers** :
```tsx
<Card
  className="h-32 flex flex-col items-center justify-center
             bg-card border border-border/50
             hover:border-primary/50 hover:shadow-lg
             transition-all duration-300 hover:scale-[1.02]"
>
  {/* Fond subtil au survol */}
  <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity" />
  
  {/* Contenu centré */}
  <div className="flex flex-col items-center gap-2">
    <span className="text-4xl">{item.icon}</span>
    <h3 className="text-base font-semibold">{item.name}</h3>
  </div>

  {/* Barre indicatrice au hover */}
  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary 
                  scale-x-0 group-hover:scale-x-100 transition-transform" />
</Card>
```

---

### 3. Comparaison visuelle : InfoBlocks vs Univers

| Critère | InfoBlocks (Services) | Univers (Catégories) |
|---------|----------------------|----------------------|
| **Taille** | Grande (aspect-ratio 16/10) | Compacte (h-32 / 128px) |
| **Fond** | Image + gradient coloré fort | Fond clair avec bordure |
| **Texte** | Blanc sur gradient | Foreground sur fond clair |
| **Icône** | Lucide icons (Euro, Bike, Heart) | Emoji (⚽, 🎨, 📚, etc.) |
| **Hover** | Translation Y + shadow-xl | Scale 1.02 + barre primaire |
| **Ombre** | Forte (shadow-card) | Douce (shadow-lg) |
| **Layout** | 3 colonnes (md:grid-cols-3) | 5 colonnes (lg:grid-cols-5) |
| **Espacement** | Section normale | mt-12 + border-b |

---

## Responsive : Breakpoints définis

### Desktop (lg: 1024px+)
```
InfoBlocks : 3 colonnes (grid-cols-3)
Univers    : 5 colonnes (grid-cols-5) → alignement parfait des 5 univers
```

### Tablette (sm: 640px - 1023px)
```
InfoBlocks : 3 colonnes (grid-cols-3)
Univers    : 3 colonnes (grid-cols-3) → 2 rangées (3 + 2)
```

### Mobile (< 640px)
```
InfoBlocks : 1 colonne (grid-cols-1)
Univers    : 2 colonnes (grid-cols-2) → 3 rangées (2 + 2 + 1)
```

**Résultat** : Sur tous les écrans, les cartes univers sont **toujours alignées proprement** sans décalage ni scroll horizontal.

---

## Hiérarchie visuelle clarifiée

### Niveau 1 : Blocs de services (InfoBlocks)
- **Rôle** : Entrées principales vers des pages d'information/service
- **Style** : Grandes cartes immersives avec images colorées
- **Position** : Haut de page, juste après la barre de recherche
- **Titre section** : "Informations pratiques"

### Niveau 2 : Catégories d'activités (Univers)
- **Rôle** : Filtres pour explorer les activités par thème
- **Style** : Petites cartes sobres avec emojis
- **Position** : Après les blocs services, avant les listes d'activités
- **Titre section** : "Découvrir nos univers" + sous-titre explicatif

### Niveau 3 : Listes d'activités
- **Rôle** : Contenu principal (activités à la une, petits budgets, etc.)
- **Style** : Carousels ou listes d'activités détaillées
- **Position** : Après les univers

---

## Éléments conservés

✅ **Navigation fonctionnelle** : Les clics sur les univers redirigent toujours vers `/activities?universe=sport` (ou culture, vacances, etc.)

✅ **Icônes emoji** : Gardées pour leur aspect visuel immédiat et universel
- ⚽ Sport
- 🎨 Culture
- 📚 Apprentissage
- 🎮 Loisirs
- 🏖️ Vacances

✅ **Interactions au hover** :
- Effet de scale subtil
- Barre de couleur primaire en bas
- Fond gradient au survol

---

## Accessibilité maintenue

✅ **Sémantique HTML** :
- `<section>` avec `aria-labelledby`
- `role="list"` et `role="listitem"`
- Titre `<h2>` avec ID unique

✅ **Navigation clavier** :
- Les cartes sont cliquables
- Focus visible sur les cartes

✅ **Texte alternatif** : Les icônes emoji sont décoratives, le texte du nom suffit

---

## Fichiers modifiés

### `src/components/UniversSection.tsx`
**Lignes 1-115** : Refonte complète du composant

**Changements majeurs** :
1. Suppression du carousel horizontal
2. Implémentation d'une grille responsive (2/3/5 colonnes)
3. Nouveau style de carte sobre et compact
4. Titre de section avec séparateur visuel
5. Hauteur fixe (h-32) au lieu de dimensions variables
6. Fond clair + bordure au lieu d'image + gradient
7. Barre indicatrice primaire au hover

---

## Tests de validation

### ✅ Checklist complète

1. **Alignement** :
   - ✅ Desktop : 5 univers alignés sur une seule ligne (5 colonnes)
   - ✅ Tablette : 3 + 2 distribution propre (3 colonnes)
   - ✅ Mobile : 2 + 2 + 1 distribution propre (2 colonnes)
   - ✅ Aucun scroll horizontal non désiré

2. **Distinction visuelle** :
   - ✅ InfoBlocks : grandes cartes colorées avec images
   - ✅ Univers : petites cartes sobres avec emojis
   - ✅ Séparation nette via `mt-12` et `border-b`
   - ✅ Différence de taille évidente

3. **Navigation** :
   - ✅ Clic sur "Sport" → `/activities?universe=sport` avec onglet Sport actif
   - ✅ Clic sur "Vacances" → `/activities?universe=vacances` avec onglet Vacances actif
   - ✅ Fonctionne sur desktop, tablette et mobile

4. **Interactions** :
   - ✅ Hover : scale subtil + barre primaire + ombre
   - ✅ Focus clavier : visible et accessible
   - ✅ Animations fluides (duration-300)

---

## Avantages de la nouvelle approche

### UX améliorée
1. **Visibilité immédiate** : Les 5 univers sont tous visibles sans scroll
2. **Distinction claire** : Pas de confusion entre services et catégories
3. **Navigation intuitive** : Grille vs carousel = moins de friction

### Performance
1. **Moins de DOM** : Pas de carousel avec scroll complexe
2. **CSS Grid natif** : Plus performant que flex avec largeurs fixes
3. **Pas de JavaScript** : Tout en CSS pour les animations

### Maintenabilité
1. **Code plus simple** : Grille CSS standard
2. **Responsive prévisible** : Breakpoints clairs et testés
3. **Scalable** : Facile d'ajouter un 6ème univers si besoin

---

## Conclusion

✅ **Objectif 1 (Alignement)** : ATTEINT  
Les 5 univers sont maintenant alignés sur une grille propre et responsive (5/3/2 colonnes selon l'écran).

✅ **Objectif 2 (Différenciation)** : ATTEINT  
Les univers sont clairement distincts des blocs InfoBlocks par leur taille, style et position dans la hiérarchie visuelle.

✅ **Objectif 3 (Navigation)** : MAINTENU  
La navigation vers `/activities?universe=X` fonctionne parfaitement et s'intègre avec le système d'onglets corrigé précédemment.

**Interface claire, alignée et prête pour la démo !** ✨
