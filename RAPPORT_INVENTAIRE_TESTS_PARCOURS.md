# 📊 Inventaire des Tests de Parcours Utilisateurs - Flooow Connect

**Date**: 12 novembre 2025  
**Contexte**: Après refonte onboarding + territorialisation + correction bug enfant  
**Objectif**: Vérifier cohérence des tests avec l'état actuel de l'application

---

## 🎯 Synthèse Globale

| Métrique | Valeur |
|----------|--------|
| **Parcours définis** | 14 parcours distincts |
| **Tests E2E automatisés** | 4 scénarios (4 parcours couverts) |
| **Tests manuels documentés** | 10 parcours additionnels |
| **Tests obsolètes après modifs** | 2 parcours nécessitent mise à jour |
| **Nouveaux parcours non testés** | 3 parcours critiques (onboarding, territoires, bug enfant) |

---

## 📋 Liste des Parcours Testés

### ✅ P1 - Inscription Parent Express
- **Type**: Signup rapide
- **Fichier test**: `tests/e2e/01-parent-signup.spec.ts`
- **Statut couverture**: ⚠️ **Partiellement obsolète**
- **Description**: Inscription parent avec infos minimales + ajout enfant
- **Étapes**:
  1. Signup avec email + password
  2. Redirection vers `/` ❌ **OBSOLÈTE** (devrait aller vers `/onboarding`)
  3. Navigation vers `/profile` ❌ **OBSOLÈTE** (route changée)
  4. Clic "Ajouter un enfant"
  5. Formulaire enfant minimal
  6. Vérification enfant dans liste

**🔴 Cause probable d'échec**: 
- Nouveau flow d'onboarding (4 écrans) non pris en compte
- Route `/profile` remplacée par `/mon-compte`
- Route `/profile/children/add` inexistante

---

### ✅ P2 - Inscription Parent Complète
- **Type**: Signup complet avec profil
- **Fichier test**: `tests/e2e/01-parent-signup.spec.ts`
- **Statut couverture**: ⚠️ **Partiellement obsolète**
- **Description**: Inscription parent + profil complet + enfant avec besoins
- **Étapes**:
  1. Signup avec email + password
  2. Complétion profil (`/profile/complete`) ❌ **Route à vérifier**
  3. Ajout enfant avec besoins spéciaux
  4. Redirection vers `/`

**🔴 Cause probable d'échec**: 
- Même problème que P1 (onboarding manquant)
- Routes profil changées

---

### ✅ P4 - Réservation Standard Complète
- **Type**: Booking avec aides financières
- **Fichier test**: `tests/e2e/04-booking-standard.spec.ts`
- **Statut couverture**: ✅ **Probablement OK** (à vérifier)
- **Description**: Flow recherche → détail activité → réservation → aide → idempotence
- **Étapes**:
  1. Setup parent + enfant
  2. Recherche activité "Tennis"
  3. Ouverture fiche détail
  4. Sélection créneau
  5. Sélection enfant
  6. Ajout aide CAF (50€)
  7. Soumission avec clé idempotence
  8. Vérification statut "en_attente"
  9. Retry pour tester idempotence

**⚠️ Points à vérifier**:
- Le setup initial (signup + enfant) est-il compatible avec le nouveau flow ?
- La territorialisation des aides est-elle testée ?

---

### ✅ P7 - Tests de Concurrence (Anti-Overbooking)
- **Type**: Tests de stress / concurrence
- **Fichier test**: `tests/e2e/07-concurrency-stress.spec.ts`
- **Statut couverture**: ✅ **OK** (tests DB uniquement)
- **Description**: Validation atomicité des places disponibles
- **Tests**:
  1. **Test 1**: 10 requêtes concurrentes → 0 overbooking
  2. **Test 2**: 5 requêtes identiques (même idempotency_key) → 1 seul booking créé

**✅ Statut**: Tests au niveau DB, indépendants du frontend → **Toujours valides**

---

## 📝 Parcours Manuels Documentés

### P5 - Connexion Utilisateur
- **Type**: Login
- **Fichier doc**: `CHECKLIST_TESTS_COMPLETS.md` (section 5)
- **Statut**: ✅ **Automatique** (couvert par auth-helpers)
- **Description**: Login email/password + redirection dashboard selon rôle

---

### P6 - Découverte Activités (Homepage)
- **Type**: Navigation
- **Fichier doc**: `CHECKLIST_TESTS_47_ECRANS.md` (section 2)
- **Statut**: 📋 **Manuel uniquement**
- **Écrans**:
  - `/` - Page d'accueil
  - `/search` - Recherche
  - `/activities` - Catalogue
  - `/activity/:id` - Détail activité

---

### P7 - Gestion Enfants (Parent)
- **Type**: CRUD enfants
- **Fichier doc**: `CHECKLIST_TESTS_COMPLETS.md` (section 7)
- **Statut**: 📋 **Manuel uniquement**
- **Actions**:
  - Ajouter enfant
  - Modifier enfant
  - Supprimer enfant
  - Liste enfants

---

### P8 - Gestion Réservations (Parent)
- **Type**: Bookings CRUD
- **Fichier doc**: `CHECKLIST_TESTS_COMPLETS.md` (section 9)
- **Statut**: 📋 **Manuel uniquement**
- **Actions**:
  - Liste réservations
  - Détails réservation
  - Annulation

---

### P9 - Dashboard Structure
- **Type**: Espace pro
- **Fichier doc**: `CHECKLIST_TESTS_COMPLETS.md` (section 12-15)
- **Statut**: 📋 **Manuel uniquement**
- **Écrans**:
  - Dashboard structure
  - Mes activités
  - Créer activité
  - Gérer réservations

---

### P10 - Dashboard Admin
- **Type**: Back-office
- **Fichier doc**: `CHECKLIST_TESTS_COMPLETS.md` (section 16-20)
- **Statut**: 📋 **Manuel uniquement**
- **Écrans**:
  - Dashboard admin
  - Gestion utilisateurs
  - Gestion structures
  - Gestion territoires
  - Rapports

---

### P11 - Responsive Mobile
- **Type**: Non-fonctionnel
- **Fichier doc**: `CHECKLIST_TESTS_COMPLETS.md` (section 24)
- **Statut**: 📋 **Manuel uniquement**
- **Tests**:
  - Pages sur mobile
  - Menu burger
  - Formulaires
  - Images adaptées

---

### P12 - Performance
- **Type**: Non-fonctionnel
- **Fichier doc**: `CHECKLIST_TESTS_COMPLETS.md` (section 25)
- **Statut**: ⚡ **Partiellement automatisé**
- **Métriques**:
  - Pages < 3s ✅ **Mesuré dans 04-booking-standard**
  - Recherche < 2s ✅ **Mesuré dans 04-booking-standard**

---

## ❌ Parcours NON Testés (Nouveaux Flows)

### 🆕 PN1 - Onboarding Complet (CRITIQUE)
- **Type**: Première connexion
- **Statut**: ⚠️ **NON COUVERT**
- **Description**: Nouveau flow 4 écrans après signup
- **Étapes**:
  1. Écran Hero (bienvenue)
  2. Écran Bêta + Territoires couverts
  3. Sélection territoire (dropdown + géoloc optionnelle)
  4. Confirmation + RGPD
- **Impact**: **BLOQUANT** - Tous les tests signup sont cassés

---

### 🆕 PN2 - Sélection Territoire (HAUTE PRIORITÉ)
- **Type**: Configuration initiale
- **Statut**: ⚠️ **NON COUVERT**
- **Description**: Choix territoire dans onboarding
- **Cas à tester**:
  - Sélection manuelle (dropdown)
  - Géolocalisation acceptée
  - Géolocalisation refusée
  - Territoire couvert → accès app
  - Territoire non couvert → mode démo / waitlist

---

### 🆕 PN3 - Création Enfant Corrigée (HAUTE PRIORITÉ)
- **Type**: Bug fix validation
- **Statut**: ⚠️ **NON COUVERT**
- **Description**: Validation du fix écran blanc
- **Parcours**:
  1. Parent connecté → `/mon-compte`
  2. Clic "Ajouter un enfant" (modal ou route `/mon-compte/enfants`)
  3. Formulaire enfant
  4. Soumission
  5. Vérification: **PAS d'écran blanc** ✅
  6. Redirection vers `/mon-compte/enfants`
  7. Enfant visible dans liste

---

## 🔧 Tests en Échec Après Modifications

### ❌ Échec 1: Tests Signup (P1 + P2)
- **Parcours concernés**: P1, P2
- **Fichiers**: `tests/e2e/01-parent-signup.spec.ts`
- **Cause probable**:
  1. **Onboarding manquant**: Après signup, redirection vers `/onboarding` au lieu de `/`
  2. **Routes profil changées**: `/profile` → `/mon-compte`, `/profile/children/add` n'existe plus
  3. **Nouveau composant enfant**: Modal ou page dédiée au lieu de formulaire inline

**🔧 Actions correctives**:
1. Ajouter helper `completeOnboarding(page, territory)` dans `auth-helpers.ts`
2. Mettre à jour routes: `/profile` → `/mon-compte`, `/profile/children/add` → `/mon-compte/enfants`
3. Adapter sélecteurs pour le nouveau formulaire enfant

---

### ⚠️ Échec 2: Test Booking (P4) - À VÉRIFIER
- **Parcours concerné**: P4
- **Fichier**: `tests/e2e/04-booking-standard.spec.ts`
- **Cause probable**:
  - Le setup initial (ligne 29-36) utilise l'ancien flow signup + enfant
  - Si signup est cassé, tout le test échoue

**🔧 Actions correctives**:
1. Utiliser le nouveau helper `completeOnboarding()` après signup
2. Adapter route ajout enfant

---

## 🎯 Recommandations Prioritaires

### 1️⃣ URGENT - Corriger Tests Signup
**Priorité**: 🔴 **CRITIQUE**  
**Effort**: 🟡 **Moyen** (2-3h)  
**Impact**: Tous les tests E2E sont bloqués

**Actions**:
- [ ] Créer `completeOnboarding(page, territory)` dans `auth-helpers.ts`
- [ ] Mettre à jour routes dans `01-parent-signup.spec.ts`
- [ ] Adapter sélecteurs formulaire enfant
- [ ] Tester localement avec `npx playwright test 01-parent-signup --debug`

---

### 2️⃣ HAUTE PRIORITÉ - Créer Tests Onboarding
**Priorité**: 🟠 **HAUTE**  
**Effort**: 🟢 **Faible** (1-2h)  
**Impact**: Valider nouveau flow critique

**Actions**:
- [ ] Créer `tests/e2e/02-onboarding.spec.ts`
- [ ] Tester scénario territoire couvert
- [ ] Tester scénario territoire non couvert
- [ ] Tester géolocalisation (acceptée/refusée)

---

### 3️⃣ HAUTE PRIORITÉ - Valider Fix Écran Blanc Enfant
**Priorité**: 🟠 **HAUTE**  
**Effort**: 🟢 **Faible** (30min)  
**Impact**: Éviter régression sur bug critique

**Actions**:
- [ ] Ajouter test dans `01-parent-signup.spec.ts` ou créer `tests/e2e/03-child-management.spec.ts`
- [ ] Scénario: signup → onboarding → ajout enfant → **vérifier pas d'écran blanc**
- [ ] Vérifier redirection vers `/mon-compte/enfants`

---

### 4️⃣ MOYENNE PRIORITÉ - Ajouter Tests Territorialisation Aides
**Priorité**: 🟡 **MOYENNE**  
**Effort**: 🟡 **Moyen** (2h)  
**Impact**: Valider calcul aides selon territoire

**Actions**:
- [ ] Étendre `04-booking-standard.spec.ts`
- [ ] Tester calcul aide Paris vs Lyon vs Marseille
- [ ] Vérifier affichage badges aides selon territoire

---

### 5️⃣ BASSE PRIORITÉ - Automatiser Tests Manuels
**Priorité**: 🟢 **BASSE**  
**Effort**: 🔴 **Élevé** (5-10h)  
**Impact**: Réduire temps de regression manuelle

**Actions**:
- [ ] Automatiser P5 (Login)
- [ ] Automatiser P6 (Découverte activités)
- [ ] Automatiser P7 (Gestion enfants)
- [ ] Automatiser P8 (Gestion réservations)

---

## 📊 Tableau Récapitulatif

| ID | Parcours | Type | Fichier | Couverture | Statut | Priorité Correction |
|----|----------|------|---------|------------|--------|---------------------|
| P1 | Parent Express Signup | E2E | `01-parent-signup.spec.ts` | Automatique | ❌ Obsolète | 🔴 URGENT |
| P2 | Parent Full Signup | E2E | `01-parent-signup.spec.ts` | Automatique | ❌ Obsolète | 🔴 URGENT |
| P4 | Booking Standard | E2E | `04-booking-standard.spec.ts` | Automatique | ⚠️ À vérifier | 🟡 MOYENNE |
| P7 | Concurrency Stress | E2E | `07-concurrency-stress.spec.ts` | Automatique | ✅ OK | - |
| P5 | Connexion | Manuel | `CHECKLIST_TESTS_COMPLETS.md` | Manuel | ✅ OK | 🟢 BASSE |
| P6 | Découverte Activités | Manuel | `CHECKLIST_TESTS_47_ECRANS.md` | Manuel | ✅ OK | 🟢 BASSE |
| P7 | Gestion Enfants | Manuel | `CHECKLIST_TESTS_COMPLETS.md` | Manuel | ✅ OK | 🟢 BASSE |
| P8 | Gestion Réservations | Manuel | `CHECKLIST_TESTS_COMPLETS.md` | Manuel | ✅ OK | 🟢 BASSE |
| P9 | Dashboard Structure | Manuel | `CHECKLIST_TESTS_COMPLETS.md` | Manuel | ✅ OK | 🟢 BASSE |
| P10 | Dashboard Admin | Manuel | `CHECKLIST_TESTS_COMPLETS.md` | Manuel | ✅ OK | 🟢 BASSE |
| P11 | Responsive Mobile | Manuel | `CHECKLIST_TESTS_COMPLETS.md` | Manuel | ✅ OK | 🟢 BASSE |
| P12 | Performance | E2E | `04-booking-standard.spec.ts` | Partiel | ✅ OK | - |
| PN1 | **Onboarding Complet** | **Nouveau** | - | **Non couvert** | ❌ Manquant | 🟠 HAUTE |
| PN2 | **Sélection Territoire** | **Nouveau** | - | **Non couvert** | ❌ Manquant | 🟠 HAUTE |
| PN3 | **Création Enfant Fix** | **Nouveau** | - | **Non couvert** | ❌ Manquant | 🟠 HAUTE |

---

## 🎬 Prochaines Étapes Immédiates

### Étape 1: Diagnostic Tests Actuels (30 min)
```bash
# Lancer tests existants pour confirmer les échecs
npx playwright test --reporter=html

# Vérifier rapport
npx playwright show-report
```

### Étape 2: Correction Tests Signup (2-3h)
1. Mettre à jour `auth-helpers.ts`
2. Corriger `01-parent-signup.spec.ts`
3. Tester localement

### Étape 3: Nouveaux Tests (3-4h)
1. Créer `02-onboarding.spec.ts`
2. Créer `03-child-management.spec.ts`
3. Étendre `04-booking-standard.spec.ts` (territoires)

### Étape 4: CI/CD (1h)
1. Configurer GitHub Actions
2. Ajouter tests au pipeline PR
3. Activer rapports HTML en artefacts

---

## ✅ Conclusion

**État actuel**: 
- ✅ **4 parcours automatisés** (mais 2 obsolètes)
- 📋 **10 parcours manuels** (documentés)
- ❌ **3 nouveaux parcours critiques non testés**

**Actions prioritaires**:
1. 🔴 **URGENT**: Corriger tests signup (P1, P2) pour compatibilité onboarding
2. 🟠 **HAUTE**: Créer tests onboarding (PN1, PN2)
3. 🟠 **HAUTE**: Valider fix écran blanc enfant (PN3)

**Estimation totale**: **~6-8h** pour remettre l'ensemble des tests E2E à jour et couvrir les nouveaux flows critiques.

---

**Fichiers à modifier en priorité**:
- `tests/e2e/utils/auth-helpers.ts` → Ajouter `completeOnboarding()`
- `tests/e2e/01-parent-signup.spec.ts` → Mettre à jour routes + onboarding
- `tests/e2e/02-onboarding.spec.ts` → **À créer**
- `tests/e2e/03-child-management.spec.ts` → **À créer** (validation fix)
