# AUDIT USETIFUL DÉTAILLÉ - 22 Novembre 2025

## 🎯 Objectif
Audit complet des data-tour-id présents dans le code, vérification de leur présence dans le DOM, et plan de déploiement progressif des nouveaux tours Usetiful avec ton CityCrunch.

---

## 📋 INVENTAIRE COMPLET DES DATA-TOUR-ID

### 🏠 Page d'accueil (`/home`)

#### Fichier : `src/pages/Index.tsx`

| Ligne | data-tour-id | Élément | Statut DOM | Utilisé dans tour |
|-------|--------------|---------|------------|-------------------|
| 215 | `home-aids-card` | Carte Aides Financières | ✅ Présent | GUIDE Step 2 |
| 218 | `home-mobility-card` | Carte Mobilité | ✅ Présent | GUIDE Step 3 |
| 221 | `home-ville-card` | Carte Ma Ville | ✅ Présent | TIP |
| 224 | `home-prix-card` | Carte Bon Esprit | ✅ Présent | - |
| 232 | `home-reco-section` | Section recommandations | ✅ Présent | - |

#### Fichier : `src/components/SearchBar.tsx`

| Ligne | data-tour-id | Élément | Statut DOM | Utilisé dans tour |
|-------|--------------|---------|------------|-------------------|
| 60 | `global-search-bar` | Input de recherche | ✅ Présent | GUIDE Step 1 |

#### Fichier : `src/components/Activity/ActivitySection.tsx`

| Ligne | data-tour-id | Élément | Statut DOM | Utilisé dans tour |
|-------|--------------|---------|------------|-------------------|
| 126 | `activity-card-first` | Première carte activité | ✅ Présent (conditionnel) | GUIDE Step 4 |

**⚠️ ATTENTION** : `activity-card-first` n'apparaît que si `index === 0`, donc uniquement sur la première carte de la liste.

---

### 🎯 Page détail activité (`/activity/:id`)

#### Fichier : `src/pages/ActivityDetail.tsx`

| Ligne | data-tour-id | Élément | Statut DOM | Utilisé dans tour |
|-------|--------------|---------|------------|-------------------|
| 442 | `activity-header` | En-tête activité | ✅ Présent | - |
| 503 | `tab-tarifs` | Onglet Tarifs & aides | ✅ Présent | - |
| 516 | `activity-infos-main` | Section À propos | ✅ Présent | - |
| 542 | `inklusif-badge-detail` | Badge InKlusif | ✅ Conditionnel | - |
| 618 | `reste-charge-title` | Reste à charge (onglet) | ✅ Conditionnel | TIP |
| 629 | `aid-simulation-section` | Section Évaluer son aide | ✅ Conditionnel | - |
| 639 | `aid-simulation-calculator` | Calculateur d'aides | ✅ Conditionnel | - |
| 657 | `mobility-cards` | Cartes de mobilité | ✅ Présent | - |
| 698 | `reste-charge-sticky` | Reste à charge (sticky) | ✅ Conditionnel | - |
| 711 | `aid-creneaux-list` | Liste créneaux | ✅ Conditionnel | - |

**⚠️ ATTENTION** : Plusieurs éléments sont conditionnels :
- `inklusif-badge-detail` : uniquement si `accessibility_checklist.wheelchair === true`
- `reste-charge-title` : uniquement si des aides ont été calculées
- `aid-simulation-section` : uniquement si `accepts_aid_types.length > 0`
- `reste-charge-sticky` : uniquement si des aides ont été calculées

#### Fichier : `src/components/Activity/EcoMobilitySection.tsx`

| Ligne | data-tour-id | Élément | Statut DOM | Utilisé dans tour |
|-------|--------------|---------|------------|-------------------|
| 133 | `mobilite-section` | Section mobilité | ✅ Présent | TIP |

---

### 🧭 Navigation (`BottomNavigation`)

#### Fichier : `src/components/BottomNavigation.tsx`

| Ligne | data-tour-id | Élément | Statut DOM | Utilisé dans tour |
|-------|--------------|---------|------------|-------------------|
| 101 | `nav-item-home` | Onglet Accueil | ✅ Présent | GUIDE Step 6 |
| 102 | `nav-item-search` | Onglet Recherche | ✅ Présent | TIP |
| 103 | `nav-item-maville` | Onglet Ma ville | ✅ Présent | TIP |
| 104 | `nav-item-services` | Onglet Mes services | ✅ Présent | - |
| 105 | `nav-item-account` | Onglet Mon compte | ✅ Présent | GUIDE Step 5 |

---

### 📄 Autres pages

#### Fichier : `src/pages/BonsPlansLocaux.tsx`

| Ligne | data-tour-id | Élément | Statut DOM | Utilisé dans tour |
|-------|--------------|---------|------------|-------------------|
| 64 | `local-deals-page` | Container page | ✅ Présent | - |

#### Fichier : `src/pages/MesEvenementsFavoris.tsx`

| Ligne | data-tour-id | Élément | Statut DOM | Utilisé dans tour |
|-------|--------------|---------|------------|-------------------|
| 56 | `account-favorites` | Container page | ✅ Présent | - |

#### Fichier : `src/pages/account/MesJustificatifs.tsx`

| Ligne | data-tour-id | Élément | Statut DOM | Utilisé dans tour |
|-------|--------------|---------|------------|-------------------|
| 81 | `account-documents` | Container page | ✅ Présent | - |

#### Fichier : `src/pages/account/kids/MesEnfants.tsx`

| Ligne | data-tour-id | Élément | Statut DOM | Utilisé dans tour |
|-------|--------------|---------|------------|-------------------|
| 177 | `children-list` | Liste enfants | ✅ Présent | - |

#### Fichier : `src/pages/MonCompte.tsx`

| Ligne | data-tour-id | Élément | Statut DOM | Utilisé dans tour |
|-------|--------------|---------|------------|-------------------|
| 245 | `account-main-list` | Liste principale | ✅ Présent | - |
| 251 | `{item.tourId}` | Items dynamiques | ✅ Présent (dynamique) | - |

#### Fichier : `src/pages/Onboarding.tsx`

| Ligne | data-tour-id | Élément | Statut DOM | Utilisé dans tour |
|-------|--------------|---------|------------|-------------------|
| 185 | `onboarding-step-${currentStep}` | Étapes onboarding | ✅ Présent (dynamique) | - |

#### Fichier : `src/components/aids/SharedAidCalculator.tsx`

| Ligne | data-tour-id | Élément | Statut DOM | Utilisé dans tour |
|-------|--------------|---------|------------|-------------------|
| 389 | `qf-selector-container` | Sélecteur QF | ✅ Présent | - |
| 515 | `reste-charge-calculator` | Reste à charge calc | ✅ Conditionnel | - |

---

## 🔍 ANALYSE DES DATA-TOUR-ID

### ✅ Data-tour-id UTILISÉS dans le tour GUIDE (6/6)

1. `global-search-bar` → `SearchBar.tsx:60` ✅
2. `home-aids-card` → `Index.tsx:215` ✅
3. `home-mobility-card` → `Index.tsx:218` ✅
4. `activity-card-first` → `ActivitySection.tsx:126` ⚠️ Conditionnel
5. `nav-item-account` → `BottomNavigation.tsx:105` ✅
6. `nav-item-home` → `BottomNavigation.tsx:101` ✅

### 💡 Data-tour-id UTILISÉS dans les TIPS (6/6)

1. `reste-charge-title` → `ActivityDetail.tsx:618` ⚠️ Conditionnel
2. `mobilite-section` → `EcoMobilitySection.tsx:133` ✅
3. `nav-item-maville` → `BottomNavigation.tsx:103` ✅
4. `nav-item-search` → `BottomNavigation.tsx:102` ✅
5. `nav-item-account` → `BottomNavigation.tsx:105` ✅ (réutilisé)
6. `nav-item-home` → `BottomNavigation.tsx:101` ✅ (réutilisé)

### 📊 Data-tour-id DISPONIBLES mais NON UTILISÉS (13)

| data-tour-id | Fichier | Ligne | Potentiel |
|--------------|---------|-------|-----------|
| `home-ville-card` | Index.tsx | 221 | Tour secondaire |
| `home-prix-card` | Index.tsx | 224 | Tour secondaire |
| `home-reco-section` | Index.tsx | 232 | Tour secondaire |
| `activity-header` | ActivityDetail.tsx | 442 | Tour détail activité |
| `tab-tarifs` | ActivityDetail.tsx | 503 | Tour détail activité |
| `activity-infos-main` | ActivityDetail.tsx | 516 | Tour détail activité |
| `inklusif-badge-detail` | ActivityDetail.tsx | 542 | TIP contextuel |
| `aid-simulation-section` | ActivityDetail.tsx | 629 | Tour aides |
| `aid-simulation-calculator` | ActivityDetail.tsx | 639 | Tour aides |
| `mobility-cards` | ActivityDetail.tsx | 657 | Tour mobilité |
| `reste-charge-sticky` | ActivityDetail.tsx | 698 | TIP contextuel |
| `aid-creneaux-list` | ActivityDetail.tsx | 711 | Tour réservation |
| `nav-item-services` | BottomNavigation.tsx | 104 | Tour secondaire |

---

## ⚠️ POINTS D'ATTENTION CRITIQUES

### 1. Éléments conditionnels

Certains data-tour-id ne sont présents dans le DOM que sous certaines conditions :

#### `activity-card-first` (GUIDE Step 4)
- **Condition** : `index === 0` dans la boucle d'activités
- **Risque** : Si aucune activité n'est affichée, le tour échouera
- **Solution** : Vérifier qu'il y a au moins 1 activité avant de déclencher le tour

#### `reste-charge-title` (TIP)
- **Condition** : `aidsData !== null` (aides calculées)
- **Risque** : Le TIP ne s'affichera que si l'utilisateur a calculé ses aides
- **Solution** : Configurer le TIP comme optionnel ou déclencher uniquement si condition remplie

#### `inklusif-badge-detail`
- **Condition** : `accessibility_checklist.wheelchair === true`
- **Risque** : Présent uniquement sur les activités accessibles PMR
- **Solution** : Ne pas utiliser dans un tour obligatoire

### 2. Routes et navigation

Les tours doivent respecter les routes :

- **Tour GUIDE** : Entièrement sur `/home` (sauf Step 4 qui nécessite des activités)
- **TIPS** : Contextuels selon la page (`/home`, `/activity/:id`)

### 3. Timing et déclenchement

- **Après onboarding** : Le tour GUIDE doit se déclencher après la fin de l'onboarding
- **Première visite** : Utiliser le flag `showOnce: true` pour ne pas harceler l'utilisateur
- **Déconnexion** : Certains TIPS (compte) ne doivent s'afficher que si déconnecté

---

## 🧪 PLAN DE TESTS AVANT ACTIVATION

### Test 1 : Vérification DOM (Automatique)

```bash
# Vérifier que tous les data-tour-id du tour GUIDE existent
cd /Users/laidhamoudi/flooow-connect-8938a98d/flooow-connect-8938a98d
grep -r "global-search-bar" src/ --include="*.tsx"
grep -r "home-aids-card" src/ --include="*.tsx"
grep -r "home-mobility-card" src/ --include="*.tsx"
grep -r "activity-card-first" src/ --include="*.tsx"
grep -r "nav-item-account" src/ --include="*.tsx"
grep -r "nav-item-home" src/ --include="*.tsx"
```

**Résultat attendu** : Chaque commande doit retourner au moins 1 résultat.

### Test 2 : Parcours utilisateur (Manuel)

#### Scénario : Nouvel utilisateur

1. **Accéder à** `/home`
2. **Vérifier** : Barre de recherche visible → `global-search-bar` ✅
3. **Vérifier** : Carte Aides visible → `home-aids-card` ✅
4. **Vérifier** : Carte Mobilité visible → `home-mobility-card` ✅
5. **Scroller** : Au moins 1 activité affichée → `activity-card-first` ✅
6. **Vérifier** : Navigation bottom visible → `nav-item-account`, `nav-item-home` ✅

#### Scénario : Utilisateur sur détail activité

1. **Accéder à** `/activity/:id`
2. **Onglet Tarifs** : Vérifier présence section mobilité → `mobilite-section` ✅
3. **Calculer aides** : Vérifier apparition reste à charge → `reste-charge-title` ✅

### Test 3 : Responsive (Manuel)

- [ ] **iPhone SE** (375px) : Toutes les bulles s'affichent correctement
- [ ] **iPhone 14** (390px) : Toutes les bulles s'affichent correctement
- [ ] **iPad** (768px) : Toutes les bulles s'affichent correctement
- [ ] **Desktop** (1440px) : Toutes les bulles s'affichent correctement

### Test 4 : Navigation tour (Manuel)

- [ ] **Bouton "Suivant"** : Passe à la bulle suivante
- [ ] **Bouton "Précédent"** : Revient à la bulle précédente
- [ ] **Bouton "Passer"** : Ferme le tour
- [ ] **Bouton "Terminer"** (dernière bulle) : Ferme le tour
- [ ] **Croix fermeture** : Ferme le tour
- [ ] **Clic en dehors** : Ne ferme PAS le tour (comportement par défaut)

### Test 5 : TIPS contextuels (Manuel)

- [ ] **TIP Reste à charge** : Apparaît au focus sur l'input QF
- [ ] **TIP Mobilité** : Apparaît au scroll sur la section mobilité
- [ ] **TIP Navigation** : Apparaît au hover sur les icônes (optionnel)
- [ ] **ShowOnce** : Le TIP ne réapparaît pas après fermeture
- [ ] **Dismissible** : La croix ferme le TIP

### Test 6 : Performance (Automatique)

```bash
# Lighthouse audit
npm run build
npx lighthouse http://localhost:3000/home --view
```

**Métriques attendues** :
- Performance : > 90
- Accessibility : > 95
- Best Practices : > 90
- SEO : > 90

---

## 🚀 PLAN DE DÉPLOIEMENT PROGRESSIF

### Phase 1 : Préparation (J-7 à J-1)

#### J-7 : Backup et documentation
- [x] Sauvegarder la configuration Usetiful actuelle (export JSON)
- [x] Documenter tous les tours actifs
- [x] Créer le plan de rollback

#### J-3 : Tests en environnement de staging
- [ ] Déployer le code avec les nouveaux data-tour-id sur staging
- [ ] Créer les tours dans Usetiful (mode brouillon)
- [ ] Tester le parcours complet
- [ ] Corriger les bugs éventuels

#### J-1 : Validation finale
- [ ] Revue du ton CityCrunch avec l'équipe
- [ ] Validation des disclaimers sur les aides
- [ ] Test final sur staging
- [ ] Préparer le monitoring (Google Analytics, Usetiful Analytics)

---

### Phase 2 : Déploiement progressif (J0 à J+30)

#### J0 : Activation 10% (A/B test)

**Dashboard Usetiful** :
- Créer le tour `tour_guide_accueil_v2_citycrunch`
- Audience : 10% des utilisateurs (segment aléatoire)
- Status : Active
- Trigger : Après onboarding OU première visite `/home`

**Monitoring** :
- Activer Google Analytics events pour chaque étape du tour
- Activer Usetiful Analytics

**Métriques à surveiller** :
- Completion rate (objectif : > 60%)
- Skip rate (objectif : < 30%)
- Time to complete (objectif : < 2 min)
- Feedback score (si widget activé)

#### J+2 : Analyse des premières données

**Si métriques OK** :
- Completion rate > 60% ✅
- Skip rate < 30% ✅
- Pas d'erreurs console ✅
- Feedback positif > 70% ✅

→ **Passer à 50% audience**

**Si métriques KO** :
- Analyser les points de friction
- Ajuster le tour (textes, placement, timing)
- Retester sur 10%

#### J+7 : Analyse hebdomadaire

**Si métriques OK** :
- Completion rate > 60% ✅
- Skip rate < 30% ✅
- Pas de régression performance ✅
- Feedback positif > 70% ✅

→ **Passer à 100% audience**

**Si métriques KO** :
- Rollback à 10%
- Ajuster le tour
- Retester

#### J+14 : Désactivation ancien tour

**Si nouveau tour stable** :
- Dashboard Usetiful → `tour_accueil_v1` → Status: **Inactive**
- **NE PAS SUPPRIMER** (garder pour rollback)
- Monitoring : vérifier que le nouveau tour fonctionne seul

#### J+30 : Archivage

**Si aucun incident** :
- Dashboard Usetiful → `tour_accueil_v1` → Status: **Archived**
- Documenter les métriques finales
- Rapport de succès

---

### Phase 3 : TIPS contextuels (J+7 à J+14)

**Après stabilisation du tour GUIDE** :

#### J+7 : Activation TIPS (50% audience)

**Dashboard Usetiful** :
- Créer les TIPS `tips_contextuels_v2_citycrunch`
- Audience : 50% des utilisateurs
- Trigger : Contextuel (focus, scroll, hover)
- ShowOnce : true

**Monitoring** :
- Trigger rate (combien de fois les TIPS s'affichent)
- Dismissal rate (combien de fois fermés)
- Usefulness score (si feedback activé)

#### J+14 : Activation TIPS (100% audience)

**Si métriques OK** :
- Trigger rate raisonnable (pas de spam)
- Dismissal rate < 50%
- Feedback positif > 60%

→ **Passer à 100% audience**

---

## 📊 MÉTRIQUES ET KPI

### Métriques Usetiful (Dashboard)

| Métrique | Objectif | Critique |
|----------|----------|----------|
| **Completion rate** | > 60% | ✅ Oui |
| **Skip rate** | < 30% | ✅ Oui |
| **Time to complete** | < 2 min | ⚠️ Moyen |
| **Step dropout** | < 10% par étape | ✅ Oui |
| **Feedback score** | > 70% positif | ⚠️ Moyen |

### Métriques Google Analytics

| Event | Description | Objectif |
|-------|-------------|----------|
| `usetiful_tour_start` | Tour démarré | Tracking |
| `usetiful_tour_complete` | Tour terminé | > 60% des starts |
| `usetiful_tour_skip` | Tour passé | < 30% des starts |
| `usetiful_step_view` | Étape vue | Tracking |
| `usetiful_tip_trigger` | TIP affiché | Tracking |
| `usetiful_tip_dismiss` | TIP fermé | < 50% des triggers |

### Métriques Performance

| Métrique | Avant | Après | Objectif |
|----------|-------|-------|----------|
| **Lighthouse Performance** | 95 | ? | > 90 |
| **First Contentful Paint** | 1.2s | ? | < 1.5s |
| **Time to Interactive** | 2.1s | ? | < 3s |
| **Total Blocking Time** | 150ms | ? | < 300ms |

---

## 🔄 PLAN DE ROLLBACK

### Scénario 1 : Bugs critiques (J0 à J+7)

**Symptômes** :
- Tour ne se déclenche pas
- Bulles mal positionnées (hors écran)
- Erreurs console
- Crash de l'application

**Action immédiate** :
1. Dashboard Usetiful → `tour_guide_accueil_v2_citycrunch` → Status: **Inactive**
2. Dashboard Usetiful → `tour_accueil_v1` → Status: **Active**
3. Analyser les logs et corriger
4. Retester sur staging
5. Redéployer avec fix

**Délai** : < 1 heure

### Scénario 2 : Métriques insuffisantes (J+2 à J+14)

**Symptômes** :
- Completion rate < 40%
- Skip rate > 50%
- Feedback négatif > 50%

**Action** :
1. Analyser les points de friction (quelle étape ?)
2. Ajuster le tour (textes, placement, timing)
3. Retester sur 10% audience
4. Si toujours KO, rollback complet

**Délai** : 2-3 jours d'analyse + ajustements

### Scénario 3 : Régression performance (J+7)

**Symptômes** :
- Lighthouse Performance < 80
- Plaintes utilisateurs (lenteur)
- Augmentation du bounce rate

**Action** :
1. Désactiver immédiatement les tours
2. Analyser l'impact (Usetiful script ? Taille ?)
3. Optimiser (lazy loading, defer, etc.)
4. Retester
5. Redéployer

**Délai** : 1-2 jours

---

## ✅ CHECKLIST DE DÉPLOIEMENT

### Avant J0

- [ ] Code déployé en production avec nouveaux data-tour-id
- [ ] Tours créés dans Usetiful (mode brouillon)
- [ ] Tests complets effectués sur staging
- [ ] Backup de la configuration Usetiful actuelle
- [ ] Plan de rollback documenté
- [ ] Équipe informée du planning
- [ ] Monitoring configuré (GA + Usetiful Analytics)

### J0 (Activation 10%)

- [ ] Activer `tour_guide_accueil_v2_citycrunch` (10% audience)
- [ ] Vérifier que le tour se déclenche correctement
- [ ] Vérifier les métriques en temps réel (premières heures)
- [ ] Pas d'erreurs console
- [ ] Pas de plaintes utilisateurs

### J+2 (Analyse)

- [ ] Analyser les métriques (completion, skip, time)
- [ ] Lire les feedbacks utilisateurs
- [ ] Décision : passer à 50% ou ajuster

### J+7 (Analyse hebdomadaire)

- [ ] Analyser les métriques (semaine complète)
- [ ] Vérifier la performance (Lighthouse)
- [ ] Décision : passer à 100% ou ajuster

### J+14 (Désactivation ancien tour)

- [ ] Désactiver `tour_accueil_v1`
- [ ] Vérifier que le nouveau tour fonctionne seul
- [ ] Monitoring renforcé (24h)

### J+30 (Archivage)

- [ ] Archiver `tour_accueil_v1`
- [ ] Documenter les métriques finales
- [ ] Rapport de succès
- [ ] Célébrer ! 🎉

---

## 📞 CONTACTS ET SUPPORT

### En cas de problème

- **Bugs critiques** : Rollback immédiat (voir plan ci-dessus)
- **Questions Usetiful** : Support Usetiful (dashboard)
- **Métriques** : Google Analytics + Usetiful Analytics
- **Code** : Repository GitHub

### Documentation

- **Configuration** : [`usetiful-config.json`](file:///Users/laidhamoudi/flooow-connect-8938a98d/flooow-connect-8938a98d/docs/usetiful-config.json)
- **Rapport audit** : [`rapport-audit-usetiful.md`](file:///Users/laidhamoudi/flooow-connect-8938a98d/flooow-connect-8938a98d/docs/rapport-audit-usetiful.md)
- **Plan d'implémentation** : [`implementation_plan.md`](file:///Users/laidhamoudi/.gemini/antigravity/brain/8d3dc327-9729-4c64-8f59-2d5817b82684/implementation_plan.md)

---

**Rapport généré le** : 22 novembre 2025  
**Responsable** : Claude Code  
**Statut** : ✅ Prêt pour déploiement progressif
