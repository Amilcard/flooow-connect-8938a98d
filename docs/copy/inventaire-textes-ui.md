# Inventaire des textes UI - Flooow

**Date :** 2025-12-25
**Auditeur :** Claude Code
**Version :** 1.0

---

## 1. Écran Accueil (`/home`)

### Fichiers concernés
- `src/pages/Index.tsx`
- `src/components/home/ActivityThematicSection.tsx`
- `src/components/home/AidesFinancieresCard.tsx`
- `src/components/home/MobiliteCard.tsx`
- `src/components/home/MaVilleCard.tsx`
- `src/components/home/BonEspritCard.tsx`

### Textes

| Zone | Texte exact | Fichier | Notes |
|------|-------------|---------|-------|
| Section 1 - Titre | "Activités à proximité" | Index.tsx:308 | Renommé récemment |
| Section 1 - Sous-titre | "Une sélection d'activités adaptées au profil de votre famille." | Index.tsx:309 | Vouvoiement OK |
| Section 2 - Titre | "Activités petits budgets" | Index.tsx:323 | Renommé récemment |
| Section 2 - Sous-titre | "Des idées d'activités à coût maîtrisé." | Index.tsx:324 | OK |
| Section 2 - Badge | "Budget maîtrisé" | Index.tsx:326 | OK |
| Erreur chargement | "Impossible de charger les activités" | Index.tsx:294 | OK |
| Erreur sous-texte | "Vérifiez votre connexion ou réessayez plus tard." | Index.tsx:295 | OK |
| CTA erreur | "Réessayer" | Index.tsx:301 | OK |

### Cartes Portrait (4 outils)

| Carte | Titre | Sous-titre/CTA | Fichier |
|-------|-------|----------------|---------|
| Aides | "Mes aides" | "Estimez vos droits en 2 minutes" / "Estimer mes aides" | AidesFinancieresCard.tsx |
| Mobilité | "Mes trajets" | "Vélo, bus ou covoiturage : à vous de choisir." / "Trouver mon trajet" | MobiliteCard.tsx |
| Ma ville | "Ma ville" | "Actus, agenda et bons plans près de chez vous" / "Explorer ma ville" | MaVilleCard.tsx |
| Bon esprit | "Clubs solidaires" | "Un coach ou bénévole vous a marqué ? Dites-le" / "Proposer un héros" | BonEspritCard.tsx |

---

## 2. Écran Recherche (`/search`)

### Fichiers concernés
- `src/pages/Search.tsx`
- `src/components/Search/AdvancedFiltersModal.tsx`
- `src/components/Activity/ZeroResultState.tsx`

### Textes

| Zone | Texte exact | Fichier | Notes |
|------|-------------|---------|-------|
| Placeholder recherche | "Rechercher..." | Search.tsx:105 | Court, OK |
| Label résultats | "{n} sur {total} activité(s)" | Search.tsx:156 | OK |
| Titre résultats | "Résultats de recherche" | Search.tsx:192 | OK |
| CTA charger plus | "Voir {n} activités de plus" | Search.tsx:205 | OK |
| Filtres actifs label | "Filtres actifs:" | Search.tsx:130 | OK |
| CTA effacer | "Tout effacer" | Search.tsx:148 | OK |
| Alert relaxed | "Aucun résultat exact trouvé avec vos filtres. Nous avons élargi la recherche pour vous montrer ces activités correspondantes." | Search.tsx:120 | Long mais OK |

### Empty State (ZeroResultState)

| Zone | Texte exact | Fichier | Notes |
|------|-------------|---------|-------|
| Titre principal | "Pas de {searchTerm} ici." ou "Aucun résultat." | ZeroResultState.tsx:137 | OK |

---

## 3. Écran Détail Activité (`/activity/:id`)

### Fichiers concernés
- `src/pages/ActivityDetail.tsx`
- `src/components/Activity/SessionSelector.tsx`
- `src/components/ContactOrganizerModal.tsx`

### Textes

| Zone | Texte exact | Fichier | Notes |
|------|-------------|---------|-------|
| Label sessions | "Aucun créneau disponible pour le moment" | SessionSelector.tsx:292 | OK |
| CTA inscription | Variable selon contexte | ActivityDetail.tsx | À vérifier |
| Erreur contact | "Une erreur s'est produite. Veuillez réessayer." | ContactOrganizerModal.tsx:54 | Vouvoiement OK |

---

## 4. Écran Aides (`/aides`)

### Fichiers concernés
- `src/pages/Aides.tsx`

### Textes

| Zone | Texte exact | Fichier | Notes |
|------|-------------|---------|-------|
| Titre | "Nos aides" | Aides.tsx:153 | OK |
| Sous-titre | "On simule. On économise." | Aides.tsx:154 | Tutoiement implicite |

---

## 5. Écran Éco-mobilité (`/aides-mobilite`)

### Fichiers concernés
- `src/pages/AidesMobilite.tsx`

### Textes

| Zone | Texte exact | Fichier | Notes |
|------|-------------|---------|-------|
| Titre | "Nos trajets éco-mobilité" | AidesMobilite.tsx:144 | OK |
| Sous-titre | "On pense planète et santé." | AidesMobilite.tsx:145 | Tutoiement implicite |

---

## 6. Privacy (Consent + ParentGate)

### Fichiers concernés
- `src/components/privacy/ConsentBanner.tsx`
- `src/components/privacy/ParentGateModal.tsx`

### ConsentBanner

| Zone | Texte exact | Fichier | Notes |
|------|-------------|---------|-------|
| Header | "Votre vie privée compte" | ConsentBanner.tsx | Vouvoiement |
| Body | "Nous utilisons des cookies analytiques pour comprendre comment vous utilisez Flooow et améliorer votre expérience. Aucune donnée personnelle n'est partagée avec des tiers publicitaires." | ConsentBanner.tsx | Vouvoiement, OK |
| CTA accepter | "Tout accepter" | ConsentBanner.tsx | OK |
| CTA refuser | "Tout refuser" | ConsentBanner.tsx | OK |
| Lien 1 | "Politique de confidentialité" | ConsentBanner.tsx | OK |
| Lien 2 | "Gestion des cookies" | ConsentBanner.tsx | OK |

### ParentGateModal

| Zone | Texte exact | Fichier | Notes |
|------|-------------|---------|-------|
| Titre | "Qui utilise Flooow ?" | ParentGateModal.tsx | OK |
| Sous-titre | "Pour vous offrir la meilleure expérience et respecter votre vie privée, merci de nous indiquer votre profil." | ParentGateModal.tsx | Vouvoiement |
| Option adulte titre | "Je suis parent ou responsable légal" | ParentGateModal.tsx | OK |
| Option adulte sous-titre | "J'ai 18 ans ou plus" | ParentGateModal.tsx | OK |
| Option mineur titre | "Je suis un enfant ou adolescent" | ParentGateModal.tsx | OK |
| Option mineur sous-titre | "J'ai moins de 18 ans" | ParentGateModal.tsx | OK |
| Footer | "Cette information nous aide à personnaliser votre expérience et à respecter la réglementation sur la protection des mineurs." | ParentGateModal.tsx | Vouvoiement |

---

## 7. États d'erreur (ErrorState)

### Fichiers concernés
- `src/components/ErrorState.tsx`

### Textes

| Zone | Texte exact | Fichier | Notes |
|------|-------------|---------|-------|
| Titre défaut | "Une erreur est survenue" | ErrorState.tsx:15 | OK |
| CTA défaut | "Réessayer" | ErrorState.tsx:16 | OK |

---

## 8. Empty States divers

### Textes récurrents

| Contexte | Texte exact | Fichiers | Notes |
|----------|-------------|----------|-------|
| Liste activités | "Aucune activité trouvée" | ActivitySection.tsx:98, ActivityListMobile.tsx:50 | OK |
| Créneaux | "Aucun créneau disponible pour le moment" | SessionSelector.tsx:292, AvailableSlotsSection.tsx:81, SlotPicker.tsx:75 | Répété 3x - à centraliser ? |
| Carte | "Aucune localisation disponible" | ActivityMap.tsx:248 | OK |
| Filtres | "Aucune activité ne correspond à vos critères" | ResultsGrid.tsx:46 | Vouvoiement |
| Aides | "Aucune aide disponible pour ce quotient familial" | StandaloneAidCalculator.tsx:128, :363 | Répété 2x |

---

## Résumé statistique

| Métrique | Valeur |
|----------|--------|
| Écrans audités | 8 |
| Textes inventoriés | ~50+ |
| Vouvoiement | Majoritaire |
| Tutoiement | Rare (Aides, Mobilité sous-titres) |
| Répétitions détectées | 3-4 |
