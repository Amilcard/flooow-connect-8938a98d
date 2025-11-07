# Correction : Navigation depuis l'accueil vers /activities

## Date : 2025-11-07

---

## Problème initial

Quand on cliquait sur une carte univers (Sport, Culture, Loisirs, Vacances, Scolarité) depuis l'écran d'accueil :
1. ❌ On arrivait sur `/activities` avec l'onglet **"Toutes"** sélectionné
2. ❌ Message **"Aucune activité trouvée"** affiché
3. ❌ Il fallait re-cliquer manuellement sur l'onglet de l'univers pour voir les activités

**Cause racine** :
- L'onglet était toujours initialisé à `"all"` via `defaultValue="all"`
- Le paramètre URL `category` était ignoré lors de l'initialisation des onglets
- L'onglet "Toutes" utilisait les mêmes filtres que les autres onglets, incluant le filtre de catégorie

---

## Solution implémentée

### 1. Navigation depuis l'accueil (`UniversSection.tsx`)

**Avant** :
```tsx
navigate(`/activities?category=${universId}`);
```

**Après** :
```tsx
navigate(`/activities?universe=${universId}`);
```

**Changement** : Utilisation d'un paramètre `universe` plus explicite pour distinguer la navigation depuis l'accueil.

---

### 2. Mapping univers → catégories (`Activities.tsx`)

**Ajouté** :
```tsx
const UNIVERSE_TO_CATEGORY: Record<string, string> = {
  'sport': 'Sport',
  'culture': 'Culture',
  'apprentissage': 'Scolarité',  // ⚠️ Mapping important
  'loisirs': 'Loisirs',
  'vacances': 'Vacances'
};
```

**Pourquoi** : Les IDs des univers (en minuscule) ne correspondent pas exactement aux noms des catégories. Par exemple, `apprentissage` → `Scolarité`.

---

### 3. Lecture du paramètre et sélection de l'onglet

**Avant** :
```tsx
const category = searchParams.get("category");
// ... pas de logique pour définir l'onglet actif

<Tabs defaultValue="all" className="w-full">
```

**Après** :
```tsx
const universeFromUrl = searchParams.get("universe");
const category = searchParams.get("category");

const getInitialTab = () => {
  if (universeFromUrl && UNIVERSE_TO_CATEGORY[universeFromUrl]) {
    return UNIVERSE_TO_CATEGORY[universeFromUrl]; // Ex: "Sport"
  }
  if (category) {
    return category;
  }
  return "all";
};

const [activeTab, setActiveTab] = useState(getInitialTab());

// Mettre à jour l'onglet si l'URL change
useEffect(() => {
  const newTab = getInitialTab();
  if (newTab !== activeTab) {
    setActiveTab(newTab);
  }
}, [universeFromUrl, category]);

<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
```

**Changements clés** :
- ✅ L'onglet actif est maintenant **contrôlé** via `value={activeTab}`
- ✅ L'onglet initial est calculé à partir du paramètre `universe` de l'URL
- ✅ Un `useEffect` met à jour l'onglet si les paramètres URL changent

---

### 4. Séparation des filtres pour l'onglet "Toutes"

**Avant** :
```tsx
const getFilters = () => {
  const filters: any = {};
  if (category) filters.category = category; // ❌ Appliqué partout
  if (type === "budget") filters.maxPrice = 50;
  if (type === "health") filters.hasAccessibility = true;
  if (selectedVacationPeriod) filters.vacationPeriod = selectedVacationPeriod;
  return filters;
};

const { data: activities = [] } = useActivities(getFilters());

<TabsContent value="all">
  <ActivitySection activities={activities} />
</TabsContent>
```

**Après** :
```tsx
// Filtres SANS catégorie pour l'onglet "Toutes"
const getAllFilters = () => {
  const filters: any = {};
  // ✅ PAS de filtre category ici
  if (type === "budget") filters.maxPrice = 50;
  if (type === "health") filters.hasAccessibility = true;
  if (selectedVacationPeriod) filters.vacationPeriod = selectedVacationPeriod;
  return filters;
};

const { data: allActivities = [] } = useActivities(getAllFilters());

<TabsContent value="all">
  <ActivitySection activities={allActivities} />
</TabsContent>
```

**Résultat** : L'onglet "Toutes" affiche maintenant réellement **toutes** les activités (filtrées uniquement par période/type/budget), et non plus une liste vide.

---

## Flux utilisateur corrigé

### Cas 1 : Clic sur "Sport" depuis l'accueil

```
1. Accueil → Clic sur carte "Sport"
2. Navigation vers /activities?universe=sport
3. Page Activities :
   - Lit universe=sport
   - Convertit en "Sport" via UNIVERSE_TO_CATEGORY
   - Définit activeTab = "Sport"
4. ✅ Onglet "Sport" pré-sélectionné
5. ✅ Activités sport affichées immédiatement
```

### Cas 2 : Clic sur "Vacances" depuis l'accueil

```
1. Accueil → Clic sur carte "Vacances"
2. Navigation vers /activities?universe=vacances
3. activeTab = "Vacances"
4. ✅ Onglet "Vacances" pré-sélectionné avec activités vacances
```

### Cas 3 : Clic sur "Apprentissage" depuis l'accueil

```
1. Accueil → Clic sur carte "Apprentissage"
2. Navigation vers /activities?universe=apprentissage
3. Conversion : apprentissage → "Scolarité"
4. ✅ Onglet "Scolarité" pré-sélectionné avec activités scolarité
```

### Cas 4 : Clic sur "Toutes" après avoir navigué

```
1. Déjà sur /activities avec un univers sélectionné
2. Clic sur onglet "Toutes"
3. getAllFilters() utilisé (sans filtre de catégorie)
4. ✅ Affichage de TOUTES les activités (pas de liste vide)
```

---

## Fichiers modifiés

### 1. `src/components/UniversSection.tsx`
- **Ligne 53-56** : Changement du paramètre `category` → `universe`

### 2. `src/pages/Activities.tsx`
- **Lignes 12-19** : Ajout du mapping `UNIVERSE_TO_CATEGORY`
- **Lignes 21-48** : 
  - Lecture du paramètre `universe`
  - Fonction `getInitialTab()` pour déterminer l'onglet actif
  - État `activeTab` contrôlé
  - `useEffect` pour réagir aux changements d'URL
- **Lignes 50-57** : Nouvelle fonction `getAllFilters()` sans filtre de catégorie
- **Ligne 59** : Utilisation de `getAllFilters()` pour l'onglet "Toutes"
- **Ligne 103** : Onglets contrôlés via `value={activeTab}` au lieu de `defaultValue="all"`
- **Ligne 113-119** : Utilisation de `allActivities` dans l'onglet "Toutes"

---

## Vérifications effectuées

### ✅ Checklist validée

1. **Navigation Sport** :
   - Clic sur "Sport" depuis l'accueil
   - ✅ Arrive sur `/activities?universe=sport`
   - ✅ Onglet "Sport" pré-sélectionné
   - ✅ Activités sport affichées immédiatement

2. **Navigation Vacances** :
   - Clic sur "Vacances" depuis l'accueil
   - ✅ Onglet "Vacances" actif
   - ✅ Activités vacances visibles

3. **Navigation Apprentissage → Scolarité** :
   - Clic sur "Apprentissage" depuis l'accueil
   - ✅ Conversion correcte vers "Scolarité"
   - ✅ Onglet "Scolarité" actif

4. **Onglet "Toutes"** :
   - Clic sur "Toutes" après avoir navigué depuis un univers
   - ✅ Affiche toutes les activités disponibles
   - ✅ Plus de message "Aucune activité trouvée" injustifié

5. **Combinaison avec filtres de période** :
   - Navigation depuis univers + sélection période "Vacances Printemps 2026"
   - ✅ Les deux filtres fonctionnent ensemble
   - ✅ Onglet "Toutes" respecte le filtre de période

---

## Points techniques importants

### Onglets contrôlés vs non-contrôlés

**Avant** : `defaultValue="all"` → onglet non-contrôlé
- Le composant Tabs gère son propre état
- Les paramètres URL sont ignorés après le premier rendu

**Après** : `value={activeTab}` → onglet contrôlé
- L'état `activeTab` est la source unique de vérité
- Réagit aux changements d'URL via `useEffect`
- Permet un contrôle total sur l'onglet actif

### Mapping des IDs

Le mapping `UNIVERSE_TO_CATEGORY` est crucial car :
- Les cartes univers utilisent des IDs en minuscule (`sport`, `culture`, `apprentissage`)
- Les onglets utilisent des noms avec majuscule (`Sport`, `Culture`, `Scolarité`)
- Certains noms ne correspondent pas (ex: `apprentissage` → `Scolarité`)

---

## Logs de débogage

Des logs ont été ajoutés pour faciliter le débogage :
```tsx
console.log("📊 Activities page state:", { 
  activitiesCount: allActivities.length, 
  mockActivitiesCount: mockActivities.length,
  loadingMocks,
  mockError,
  activeTab,         // ← Nouvel ajout
  universeFromUrl    // ← Nouvel ajout
});
```

Ces logs permettent de vérifier :
- Quel onglet est actif
- Quel paramètre universe a été reçu
- Combien d'activités sont chargées

---

## Conclusion

✅ **Objectif 1 (Navigation univers)** : ATTEINT  
Les clics sur les cartes univers de l'accueil arrivent maintenant directement sur l'onglet correspondant avec des activités affichées.

✅ **Objectif 2 (Onglet "Toutes")** : CORRIGÉ  
L'onglet "Toutes" affiche maintenant réellement toutes les activités et non plus une liste vide.

✅ **Objectif 3 (Conversion des IDs)** : IMPLÉMENTÉ  
Le mapping `apprentissage` → `Scolarité` fonctionne correctement.

**Navigation fluide et prête pour la démo !** 🎯
