# Rapport d'Audit Usetiful - Flooow InKlusif

**Date** : 22 novembre 2025  
**Version** : 2.0  
**Ton** : Courtois + Léger + CityCrunch

---

## 📊 Résumé Exécutif

Ce rapport présente l'état actuel des attributs `data-tour-id` implémentés dans l'application Flooow, les modifications apportées pour supporter la nouvelle configuration Usetiful, et les recommandations pour le déploiement.

### ✅ Changements effectués

1. **Ajout de `data-tour-id="global-search-bar"`** dans `SearchBar.tsx`
2. **Création de `usetiful-config.json`** avec 6 bulles GUIDE + 6 TIPS
3. **Génération de ce rapport d'audit**

### 📈 Statistiques

- **Data-tour-id existants** : 24
- **Data-tour-id ajoutés** : 1 (`global-search-bar`)
- **Total** : 25 data-tour-id
- **Bulles GUIDE** : 6 (limite respectée ✅)
- **TIPS additionnels** : 6

---

## 🔍 Inventaire Complet des data-tour-id

### 🏠 Écran d'accueil (`/home`)

| data-tour-id | Élément | Fichier | Statut |
|--------------|---------|---------|--------|
| `global-search-bar` | Barre de recherche | `SearchBar.tsx` | ✅ Ajouté |
| `home-aids-card` | Carte Aides Financières | `Index.tsx` | ✅ Existant |
| `home-mobility-card` | Carte Mobilité | `Index.tsx` | ✅ Existant |
| `home-ville-card` | Carte Ma Ville | `Index.tsx` | ✅ Existant |
| `home-prix-card` | Carte Bon Esprit | `Index.tsx` | ✅ Existant |
| `home-reco-section` | Section recommandations | `Index.tsx` | ✅ Existant |
| `activity-card-first` | Première carte d'activité | `ActivitySection.tsx` | ✅ Existant |
| `home-city-events` | Événements ville | `FamilySpaceSection.tsx` | ✅ Existant |
| `home-bon-esprit` | Section Bon Esprit | `FamilySpaceSection.tsx` | ✅ Existant |

### 🎯 Page détail activité (`/activity/:id`)

| data-tour-id | Élément | Fichier | Statut |
|--------------|---------|---------|--------|
| `activity-header` | En-tête activité | `ActivityDetail.tsx` | ✅ Existant |
| `tab-tarifs` | Onglet Tarifs & aides | `ActivityDetail.tsx` | ✅ Existant |
| `activity-infos-main` | Section À propos | `ActivityDetail.tsx` | ✅ Existant |
| `inklusif-badge-detail` | Badge InKlusif | `ActivityDetail.tsx` | ✅ Existant |
| `reste-charge-title` | Reste à charge (onglet) | `ActivityDetail.tsx` | ✅ Existant |
| `aid-simulation-section` | Section Évaluer son aide | `ActivityDetail.tsx` | ✅ Existant |
| `aid-simulation-calculator` | Calculateur d'aides | `ActivityDetail.tsx` | ✅ Existant |
| `reste-charge-sticky` | Reste à charge (sticky) | `ActivityDetail.tsx` | ✅ Existant |
| `reste-charge-calculator` | Reste à charge (calc) | `SharedAidCalculator.tsx` | ✅ Existant |
| `mobility-cards` | Cartes de mobilité | `ActivityDetail.tsx` | ✅ Existant |
| `mobilite-section` | Section mobilité | `EcoMobilitySection.tsx` | ✅ Existant |
| `aid-creneaux-list` | Liste créneaux | `ActivityDetail.tsx` | ✅ Existant |
| `qf-selector-container` | Sélecteur QF | `SharedAidCalculator.tsx` | ✅ Existant |

### 🧭 Navigation (`BottomNavigation`)

| data-tour-id | Élément | Route | Statut |
|--------------|---------|-------|--------|
| `nav-item-home` | Onglet Accueil | `/home` | ✅ Existant |
| `nav-item-search` | Onglet Recherche | `/search` | ✅ Existant |
| `nav-item-maville` | Onglet Ma ville | `/ma-ville-mon-actu` | ✅ Existant |
| `nav-item-services` | Onglet Mes services | `/mes-services` | ✅ Existant |
| `nav-item-account` | Onglet Mon compte | `/mon-compte` | ✅ Existant |

### 📄 Autres pages

| data-tour-id | Élément | Route | Statut |
|--------------|---------|-------|--------|
| `local-deals-page` | Page bons plans | `/bons-plans-locaux` | ✅ Existant |
| `account-favorites` | Mes favoris | `/mes-evenements-favoris` | ✅ Existant |
| `account-documents` | Mes justificatifs | `/mes-justificatifs` | ✅ Existant |
| `children-list` | Liste enfants | `/mes-enfants` | ✅ Existant |
| `account-main-list` | Liste compte | `/mon-compte` | ✅ Existant |
| `onboarding-step-*` | Étapes onboarding | `/onboarding` | ✅ Existant (dynamique) |

---

## 🎯 Configuration Usetiful

### Tour GUIDE Principal (6 bulles max)

Le tour principal respecte la limite de 6 bulles et suit un parcours logique :

1. **`global-search-bar`** - Point d'entrée : recherche d'activités
2. **`home-aids-card`** - Estimation des aides (avec disclaimer)
3. **`home-mobility-card`** - Options de mobilité écologique
4. **`activity-card-first`** - Découverte d'une carte d'activité
5. **`nav-item-account`** - Accès à l'espace personnel
6. **`nav-item-home`** - Retour à l'accueil

### TIPS Additionnels (6 tips)

Les tips fournissent des informations contextuelles sans surcharger le tour principal :

1. **`reste-charge-title`** - Simulation personnalisée
2. **`mobilite-section`** - Trajet simplifié
3. **`nav-item-maville`** - Actualités locales
4. **`nav-item-search`** - Recherche complète
5. **`nav-item-account`** - Connexion simplifiée
6. **`nav-item-home`** - Navigation principale

---

## 📝 Nouveau Ton CityCrunch

### Exemples de transformation

#### ❌ Ancien ton (formel/administratif)
> "Utilisez cette fonctionnalité pour calculer le montant des aides auxquelles vous avez droit."

#### ✅ Nouveau ton (CityCrunch)
> "Votre reste à charge… sans la prise de tête. Ici, vous obtenez une estimation de vos aides et du reste à charge probable."

### Principes appliqués

- **Courtois** : Vouvoiement, respect, bienveillance
- **Léger** : Phrases courtes, vocabulaire accessible, humour subtil
- **CityCrunch** : Ton moderne, décontracté mais professionnel
- **Disclaimers clairs** : Toujours préciser "estimation" pour les aides

---

## ⚠️ Points d'Attention

### Disclaimers sur les aides financières

> **CRITIQUE** : Tous les textes relatifs aux aides doivent inclure un disclaimer clair :
> 
> - ✅ "estimation"
> - ✅ "à confirmer avec l'organisme"
> - ✅ "Ce n'est pas un devis officiel"
> - ❌ Éviter : "vous recevrez", "montant garanti", "aide confirmée"

### Limite de 6 bulles GUIDE

Le tour principal est limité à **6 bulles maximum**. Les contenus supplémentaires doivent être :
- Configurés comme **TIPS** (ne s'affichent pas dans le tour principal)
- Ou intégrés dans un **tour secondaire** distinct

### Vérification DOM

Tous les `data-tour-id` référencés dans la configuration Usetiful **doivent exister dans le DOM** au moment de l'affichage de la bulle. Vérifier :

- ✅ L'élément est bien rendu (pas de `display: none` ou condition non remplie)
- ✅ Le `data-tour-id` correspond exactement (sensible à la casse)
- ✅ L'élément est visible sur la route spécifiée

---

## 🔄 Mapping Ancien → Nouveau

### Bulles à CONSERVER

Si des bulles Usetiful existent déjà en production, voici le mapping :

| Ancien ID | Nouveau ID | Action |
|-----------|------------|--------|
| `search-bar` | `global-search-bar` | ✅ Renommer |
| `aide-card` | `home-aids-card` | ✅ Conserver |
| `mobility-card` | `home-mobility-card` | ✅ Conserver |
| `activity-card` | `activity-card-first` | ✅ Conserver |

### Bulles à SUPPRIMER

⚠️ **Ne supprimer qu'après validation du nouveau tour** :

- Anciennes bulles avec ton formel/administratif
- Bulles référençant des éléments supprimés du DOM
- Bulles en doublon avec le nouveau tour

### Bulles à CRÉER

Nouvelles bulles ajoutées avec le nouveau ton :

- ✅ `global-search-bar` (nouvelle)
- ✅ `nav-item-account` (nouvelle dans le tour principal)
- ✅ `nav-item-home` (nouvelle dans le tour principal)

---

## ✅ Checklist de Déploiement

### Avant le déploiement

- [x] Tous les `data-tour-id` existent dans le code
- [x] La configuration JSON est valide
- [x] Le ton CityCrunch est respecté
- [x] Les disclaimers sur les aides sont présents
- [x] Limite de 6 bulles GUIDE respectée

### Tests à effectuer

- [ ] **Test DOM** : Vérifier que `global-search-bar` est bien présent dans le DOM de `/home`
- [ ] **Test navigation** : Vérifier que tous les `nav-item-*` sont accessibles
- [ ] **Test parcours** : Suivre le tour GUIDE complet (6 bulles)
- [ ] **Test TIPS** : Vérifier que les TIPS ne s'affichent pas dans le tour principal
- [ ] **Test responsive** : Vérifier l'affichage sur mobile et desktop
- [ ] **Test ton** : Valider que le ton CityCrunch est cohérent

### Import dans Usetiful

1. Se connecter à l'interface Usetiful
2. Créer un nouveau tour "Découverte de Flooow"
3. Importer les 6 bulles GUIDE depuis `usetiful-config.json`
4. Configurer les TIPS dans un tour séparé ou en mode contextuel
5. Tester le parcours en mode preview
6. Publier après validation

---

## 🎯 Recommandations

### Priorité 1 : Validation utilisateur

> **ACTION REQUISE** : Faire valider le nouveau ton et le parcours par l'équipe avant déploiement en production.

### Priorité 2 : Protection des données

> **IMPORTANT** : Ne pas supprimer les anciennes bulles Usetiful tant que le nouveau tour n'est pas validé et déployé.

### Priorité 3 : Monitoring

> **SUIVI** : Après déploiement, monitorer les taux de complétion du tour et ajuster si nécessaire.

---

## 📦 Fichiers Livrables

1. **`SearchBar.tsx`** - Ajout de `data-tour-id="global-search-bar"`
2. **`usetiful-config.json`** - Configuration complète (GUIDE + TIPS)
3. **`rapport-audit-usetiful.md`** - Ce rapport

---

## 📞 Contact & Support

Pour toute question sur cette configuration Usetiful :

- **Documentation** : `/docs/usetiful-config.json`
- **Plan d'implémentation** : `implementation_plan.md`
- **Checklist** : `task.md`

---

**Rapport généré le** : 2025-11-22  
**Responsable** : Claude Code  
**Statut** : ✅ Prêt pour validation utilisateur
