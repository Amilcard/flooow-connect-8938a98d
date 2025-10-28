# 🎭 GUIDE DÉMO - MULTI-ÉCRANS

**Date :** 28 octobre 2025
**Objectif :** Présenter la plateforme Flooow avec 3 écrans simultanés

---

## 🎯 CONCEPT DE LA DÉMO

Vous avez maintenant **3 pages de démo distinctes** qui peuvent être affichées **simultanément** :

1. **🎨 FRONT (Utilisateur/Parent)** → `/demo/parent`
2. **🏛️ BACK Collectivité** → `/demo/collectivite`
3. **💰 BACK Financeur** → `/demo/financeur`

---

## 📺 CONFIGURATION MULTI-ÉCRANS

### **Option 1 : Projecteur + 2 écrans latéraux**

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Écran gauche   │  │   PROJECTEUR     │  │   Écran droit    │
│  /demo/parent    │  │ /demo/collectivite│  │ /demo/financeur  │
│                  │  │                  │  │                  │
│  Parcours parent │  │ Dashboard territoire│ Dashboard partenaire│
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### **Option 2 : 3 fenêtres sur 1 grand écran**

```
┌─────────────────────────────────────────────────────────────┐
│                    ÉCRAN UNIQUE (16:9 ou ultra-wide)        │
├──────────────────┬────────────────────┬─────────────────────┤
│  /demo/parent    │ /demo/collectivite │  /demo/financeur    │
│                  │                    │                     │
│  (33% largeur)   │   (34% largeur)    │   (33% largeur)     │
└──────────────────┴────────────────────┴─────────────────────┘
```

### **Option 3 : 1 présentateur + 2 écrans participants**

```
Présentateur :   /demo/parent (montre le parcours utilisateur)
Écran public 1 : /demo/collectivite (collectivité suit les KPIs)
Écran public 2 : /demo/financeur (financeur voit ses données)
```

---

## 🔗 URLS DES PAGES DE DÉMO

### **1️⃣ Démo Parcours Parent (FRONT)**

**URL :** `https://votre-domaine.fr/demo/parent`

**Ce qui est affiché :**
- ✅ Barre de recherche Airbnb-style
- ✅ Statistiques : 156 enfants inscrits, 87 activités, 89 aides simulées, 45 680€ économisés
- ✅ Filtres disponibles (Sport, Culture, Âge, Prix, Accessibilité, etc.)
- ✅ Activités à proximité (4 cartes)
- ✅ Activités Petits budgets (4 cartes)
- ✅ Parcours type en 5 étapes (Recherche → Consultation → Simulation → Réservation → Suivi)
- ✅ Fonctionnalités clés (Filtres, Aides automatiques, Inclusion)

**Caractéristiques :**
- ✅ Pas d'authentification requise
- ✅ Données réelles depuis la BDD (41 activités)
- ✅ Navigation fonctionnelle vers `/activities`, `/aides`

---

### **2️⃣ Démo Dashboard Collectivité (BACK)**

**URL :** `https://votre-domaine.fr/demo/collectivite`

**Ce qui est affiché :**
- ✅ Territoire : Saint-Étienne Métropole (12 500 enfants, 24 structures)
- ✅ Objectifs collectivité (30% QPV, 15% handicap, 120 min/semaine sport, 40% transports doux)
- ✅ Dashboard complet (graphiques KPIs)
- ✅ Données disponibles :
  - Indicateurs d'impact social (inscriptions, handicap, QPV, profils familiaux)
  - Indicateurs d'activité (top activités, taux remplissage, couverture géographique)
  - Indicateurs financiers (aides simulées, reste à charge, budget engagé)
  - Indicateurs santé & mobilité (minutes sport/semaine, transport, CO₂ économisé)
- ✅ Exports disponibles (Excel, CSV, PDF, JSON)

**Caractéristiques :**
- ✅ Pas d'authentification requise
- ✅ Données mockées stables (pas de dépendance BDD)
- ✅ Dashboard temps réel

---

### **3️⃣ Démo Dashboard Financeur (BACK)**

**URL :** `https://votre-domaine.fr/demo/financeur`

**Ce qui est affiché :**
- ✅ Partenaire : CAF Loire (Aide vacances + QF, budget 250 000€)
- ✅ Objectifs financeur (taux recours, 80% QPV, impact social, optimisation budget)
- ✅ Dashboard complet (graphiques KPIs)
- ✅ Données disponibles :
  - Utilisation des aides (simulations, validations, montants distribués, budget utilisé)
  - Profil bénéficiaires (familles, QF, QPV, territoires, typologie)
  - Impact territorial (couverture, zones non-recours, structures partenaires)
  - ROI & Impact social (coût/enfant, satisfaction, départs vacances, santé)
- ✅ Cas d'usage (CAF, Pass'Sport, fondations privées, conseils départementaux)
- ✅ Avantages plateforme (transparence, reporting automatisé, collaboration, impact mesuré)

**Caractéristiques :**
- ✅ Pas d'authentification requise
- ✅ Données mockées stables
- ✅ Dashboard temps réel

---

## 📋 SCÉNARIO DE DÉMO RECOMMANDÉ (20 min)

### **Phase 1 : Introduction (2 min)**

**Présentateur (écran principal) :**
> "Bienvenue ! Nous allons vous montrer comment Flooow connecte 3 acteurs clés :
> - À gauche : Le parcours d'un parent qui cherche une activité pour son enfant
> - Au centre : La collectivité locale qui pilote son territoire
> - À droite : Le partenaire financier qui suit l'utilisation de ses aides"

---

### **Phase 2 : Parcours Parent (8 min)**

**Focus sur `/demo/parent`** (écran gauche ou principal)

**1. Recherche d'activité (2 min)**
- Montrer la barre de recherche
- Expliquer les filtres (catégorie, âge, prix, accessibilité, QPV, aides, vacances)
- Scroller sur les sections "Activités à proximité" et "Petits budgets"
- **Cliquer sur une carte** → Aller vers `/activity/:id` (détail)

**2. Fiche activité détaillée (3 min)**
- Montrer les informations complètes (horaires, prix, accessibilité, documents)
- **Point clé : Simulation d'aides financières**
  - Prix initial : 120€
  - Aide CAF : -50€
  - Pass'Sport : -50€
  - **Reste à charge : 20€** ✅
- Montrer les options transport (bus, vélo, covoiturage)

**3. Réservation (2 min)**
- Cliquer "Réserver"
- Sélectionner un enfant
- Choisir un créneau
- Valider → Confirmation immédiate

**4. Mon compte (1 min)**
- Aller dans "Mon compte" → Voir l'historique, les enfants, les notifications

**Message clé :**
> "Le parent voit en temps réel le reste à charge après cumul de TOUTES les aides disponibles. Aucune démarche manuelle."

---

### **Phase 3 : Dashboard Collectivité (5 min)**

**Focus sur `/demo/collectivite`** (écran central ou projecteur)

**1. KPIs principaux (2 min)**
- **156 enfants inscrits** (objectif : 200 d'ici fin d'année)
- **22% enfants en situation de handicap** (objectif : 15% → **dépassé** ✅)
- **35% enfants issus de QPV** (objectif : 30% → **dépassé** ✅)
- **128 min/semaine d'activité physique** (objectif : 120 min → **dépassé** ✅)

**2. Graphiques (2 min)**
- Répartition activités par catégorie (Sport 45%, Culture 20%, Loisirs 15%...)
- Modes de transport (Transports collectifs 38%, Vélo 12%, Covoiturage 8%, Voiture 42%)
- Top structures (Association Jungle Attitude : 34 inscriptions, Club Omnisports : 28...)

**3. Données disponibles (1 min)**
- Montrer la section "Données disponibles" (impact social, activité, financier, santé)
- Insister sur **anonymisation automatique** (conformité RGPD)

**Message clé :**
> "La collectivité pilote son territoire en temps réel. Elle sait si elle atteint ses objectifs d'inclusion sociale, d'accessibilité et de santé publique."

---

### **Phase 4 : Dashboard Financeur (5 min)**

**Focus sur `/demo/financeur`** (écran droit)

**1. Indicateurs utilisation (2 min)**
- **89 simulations d'aides CAF** effectuées
- **67 demandes validées** (taux conversion 75%)
- **33 500€ distribués** sur 250 000€ budget (13% utilisé, début d'année)
- **Montant moyen : 500€/famille**

**2. Profil bénéficiaires (2 min)**
- **45 familles** bénéficiaires
- **Répartition par QF :** 60% QF < 600€, 30% QF 600-1200€, 10% QF > 1200€
- **78% issus de QPV** (objectif 80% presque atteint)
- **12 communes** couvertes sur Saint-Étienne Métropole

**3. ROI & Impact (1 min)**
- **134 enfants** ont accédé à une activité grâce à l'aide CAF
- **Coût moyen : 250€/enfant** (très bon ROI)
- **Impact santé :** 128 min/semaine d'activité physique générées

**Message clé :**
> "Le financeur voit précisément où va son budget, qui en bénéficie, et quel impact social il génère. Transparence totale."

---

## 💡 POINTS CLÉS À METTRE EN AVANT

### **🎯 Pour le FRONT (parent) :**
1. ✅ **Simplicité d'utilisation** : Recherche type Airbnb, filtres intuitifs
2. ✅ **Transparence financière** : Simulation aides en temps réel, reste à charge affiché
3. ✅ **Inclusion** : Accessibilité PMR, QPV, handicaps pris en compte
4. ✅ **Mobilité durable** : Transport collectif, vélo, covoiturage intégrés

### **🏛️ Pour le BACK Collectivité :**
1. ✅ **Pilotage territorial** : KPIs en temps réel (inscription, inclusion, santé)
2. ✅ **Objectifs mesurables** : % QPV, % handicap, minutes sport/semaine
3. ✅ **Impact social** : Données anonymisées, conformes RGPD
4. ✅ **Couverture géographique** : Carte de chaleur, zones blanches identifiées

### **💰 Pour le BACK Financeur :**
1. ✅ **Transparence budgétaire** : Suivi en temps réel de l'utilisation du budget
2. ✅ **Profil bénéficiaires** : QF, QPV, territoires, typologie familles
3. ✅ **ROI social** : Nombre d'enfants réellement aidés, coût par bénéficiaire
4. ✅ **Zones non-recours** : Identification rapide pour ajuster la communication

---

## 🚀 PRÉPARATION AVANT LA DÉMO

### **Checklist 1h avant (15 min)**

- [ ] **Tester les 3 URLs** (ouvrir dans 3 onglets/fenêtres)
  - [ ] `/demo/parent` → Scroll OK, cartes cliquables
  - [ ] `/demo/collectivite` → Dashboard charge, graphiques visibles
  - [ ] `/demo/financeur` → Dashboard charge, données affichées

- [ ] **Vérifier la connexion Internet** (démo utilise vraies activités BDD)

- [ ] **Préparer les écrans**
  - [ ] Résolution adaptée (1920x1080 minimum)
  - [ ] Mode plein écran (F11) pour chaque fenêtre
  - [ ] Zoom navigateur à 100% (Ctrl+0)

- [ ] **Bookmarker les URLs** pour accès rapide

### **Checklist matériel (si multi-écrans)**

- [ ] 3 écrans ou projecteur + 2 écrans
- [ ] Câbles HDMI/DisplayPort
- [ ] Souris + clavier (ou pavé tactile)
- [ ] Télécommande présentation (optionnel)

---

## 🔄 VARIANTES DE DÉMO

### **Variante 1 : Démo courte (10 min)**
- 3 min : Parcours parent (recherche → fiche → réservation)
- 3 min : Dashboard collectivité (KPIs principaux)
- 2 min : Dashboard financeur (utilisation budget)
- 2 min : Q&R

### **Variante 2 : Démo technique (30 min)**
- 10 min : Parcours parent (tous les filtres, simulation aides détaillée)
- 10 min : Dashboard collectivité (tous les graphiques, exports)
- 10 min : Dashboard financeur (cas d'usage CAF, Pass'Sport, fondations)

### **Variante 3 : Focus utilisateur parent (15 min)**
- 100% sur `/demo/parent`
- Montrer recherche → fiche → simulation → réservation → mon compte
- Naviguer vers les vraies pages (`/activities`, `/aides`, `/mon-compte`)

---

## 🎬 SCRIPT DÉMONSTRATION (VERSION COMPLÈTE)

### **Introduction (30 secondes)**

> "Bonjour ! Aujourd'hui, je vais vous présenter Flooow, la plateforme qui connecte les familles aux activités périscolaires de leur territoire, tout en maximisant l'accès aux aides financières.
>
> Nous avons 3 écrans devant nous :
> - **À gauche** : Le parcours d'un parent qui cherche une activité pour son enfant
> - **Au centre** : Le tableau de bord d'une collectivité locale
> - **À droite** : Le tableau de bord d'un partenaire financier comme la CAF
>
> Commençons par le parcours parent."

---

### **Parcours Parent (7 minutes)**

**[FOCUS ÉCRAN GAUCHE : `/demo/parent`]**

> "Voici ce que voit un parent lorsqu'il arrive sur la plateforme.
>
> **1. La recherche (1 min)**
> En haut, une barre de recherche simple, style Airbnb. Le parent peut taper 'football', 'danse', ou utiliser les filtres avancés.
>
> [**Cliquer sur l'icône filtre**]
>
> Les filtres disponibles :
> - Catégorie : Sport, Culture, Loisirs, Scolarité...
> - Âge de l'enfant : de 3 à 18 ans
> - Budget maximum : 0 à 200€
> - Accessibilité PMR, Covoiturage, Aides financières, Périodes de vacances
>
> Ici, on voit qu'il y a déjà **87 activités** disponibles, **156 enfants** inscrits, et surtout **45 680€ économisés** grâce aux aides automatiques.
>
> **2. Les activités (2 min)**
> En dessous, 2 sections :
> - **Activités à proximité** : Basées sur l'adresse du parent
> - **Activités Petits budgets** : Moins de 50€
>
> [**Scroller sur les cartes**]
>
> Chaque carte affiche :
> - Le nom de l'activité
> - L'image
> - Le prix
> - La tranche d'âge
> - Les badges : 'Aides disponibles', 'Accessibilité PMR', 'Covoiturage'
>
> [**Cliquer sur une carte → Aller vers `/activity/:id`**]
>
> **3. La fiche activité (3 min)**
> Nous voilà sur la fiche complète d'une activité. Le parent voit :
> - Le prix initial : 120€
> - Les horaires et créneaux disponibles
> - L'accessibilité (fauteuil roulant, malvoyant, etc.)
> - Les documents requis
>
> Et maintenant, la fonctionnalité clé : **la simulation d'aides financières**.
>
> [**Scroller vers la section simulation**]
>
> La plateforme calcule automatiquement :
> - Aide CAF selon le Quotient Familial : -50€
> - Pass'Sport national : -50€
> - Prix initial : 120€
> - **Reste à charge : 20€** ✅
>
> Le parent voit immédiatement ce qu'il paiera VRAIMENT, sans avoir à faire 3 dossiers différents.
>
> [**Cliquer 'Réserver'**]
>
> **4. La réservation (1 min)**
> Le parent sélectionne son enfant, choisit un créneau, et valide.
> Confirmation immédiate. La réservation est enregistrée.
>
> [**Retour vers `/demo/parent`**]
>
> Voilà le parcours parent en 4 étapes : Recherche → Consultation → Simulation → Réservation.
> Simple, rapide, transparent."

---

### **Dashboard Collectivité (5 minutes)**

**[FOCUS ÉCRAN CENTRAL : `/demo/collectivite`]**

> "Passons maintenant au tableau de bord de la collectivité locale.
>
> **1. Vue d'ensemble (1 min)**
> Ici, nous sommes sur Saint-Étienne Métropole :
> - **12 500 enfants** de 3 à 18 ans dans le territoire
> - **24 structures partenaires** (associations sportives, centres de loisirs, etc.)
>
> La collectivité a défini des objectifs :
> - Toucher **30% d'enfants issus de Quartiers Prioritaires (QPV)**
> - **15% d'enfants en situation de handicap**
> - **120 minutes d'activité physique par semaine** (santé publique)
> - **40% de transports doux** (vélo, bus, covoiturage)
>
> **2. Les KPIs en temps réel (2 min)**
> [**Scroller vers les KPIs**]
>
> - **156 enfants inscrits** (sur un objectif de 200 d'ici fin d'année → bon démarrage)
> - **22% enfants en situation de handicap** → Objectif dépassé ✅
> - **35% enfants QPV** → Objectif dépassé ✅
> - **128 min/semaine d'activité physique** → Objectif dépassé ✅
>
> La collectivité sait en temps réel si elle atteint ses objectifs d'inclusion sociale.
>
> **3. Les graphiques (1 min)**
> [**Montrer les graphiques**]
>
> - Répartition par catégorie : Sport 45%, Culture 20%, Loisirs 15%...
> - Modes de transport : 38% transports collectifs, 12% vélo, 8% covoiturage
> - Top structures : Association Jungle Attitude (34 inscriptions), Club Omnisports (28)...
>
> **4. Les données disponibles (1 min)**
> [**Scroller vers 'Données disponibles'**]
>
> La collectivité a accès à :
> - Indicateurs d'impact social (profils familiaux, QPV, handicap)
> - Indicateurs d'activité (top activités, taux remplissage, couverture géographique)
> - Indicateurs financiers (aides simulées, budget engagé)
> - Indicateurs santé & mobilité (minutes sport, CO₂ économisé)
>
> Toutes les données sont **anonymisées automatiquement** (conformité RGPD).
>
> La collectivité peut exporter en Excel, CSV, PDF, ou via API pour son SI."

---

### **Dashboard Financeur (5 minutes)**

**[FOCUS ÉCRAN DROIT : `/demo/financeur`]**

> "Enfin, le tableau de bord du partenaire financier.
>
> **1. Contexte (1 min)**
> Ici, c'est la CAF Loire qui finance des aides vacances.
> - Budget annuel alloué : **250 000€**
> - Type d'aide : Aide vacances + quotient familial
>
> Objectifs de la CAF :
> - Maximiser le **taux de recours** aux aides (réduire le non-recours)
> - Toucher **80% des familles éligibles dans les QPV**
> - Mesurer l'**impact social** : nombre de départs en vacances
>
> **2. Utilisation du budget (2 min)**
> [**Scroller vers les KPIs**]
>
> - **89 simulations** effectuées (parents ont testé leur éligibilité)
> - **67 demandes validées** (taux de conversion 75% → très bon)
> - **33 500€ distribués** (13% du budget, début d'année)
> - **Montant moyen : 500€/famille**
>
> La CAF sait en temps réel où va son budget.
>
> **3. Profil des bénéficiaires (1 min)**
> [**Montrer les données**]
>
> - **45 familles** bénéficiaires
> - Répartition par Quotient Familial :
>   - 60% avec QF < 600€ (familles prioritaires)
>   - 30% avec QF 600-1200€
>   - 10% avec QF > 1200€
> - **78% issus de QPV** (objectif 80% presque atteint ✅)
> - **12 communes** couvertes sur la métropole
>
> **4. Impact social (1 min)**
> [**Scroller vers ROI & Impact**]
>
> - **134 enfants** ont accédé à une activité grâce à l'aide CAF
> - **Coût par enfant : 250€** (très bon ROI)
> - **Impact santé** : 128 min/semaine d'activité physique générées
>
> La CAF peut démontrer à ses tutelles que l'aide a un impact réel et mesurable."

---

### **Conclusion (1 minute)**

> "Voilà ce que permet Flooow :
>
> **Pour les familles** : Simplicité, transparence financière, accès facilité aux aides
> **Pour les collectivités** : Pilotage en temps réel de l'inclusion sociale et de la santé publique
> **Pour les financeurs** : Transparence budgétaire, mesure de l'impact social, réduction du non-recours
>
> Et tout ça avec une seule plateforme, conforme RGPD, hébergée en France.
>
> Avez-vous des questions ?"

---

## ✅ CHECKLIST POST-DÉMO

Après la démo, vérifier :

- [ ] **Feedback recueilli** : Questions posées, points d'intérêt, objections
- [ ] **Follow-up planifié** : Envoyer les URLs de démo, documentation, devis
- [ ] **Données réinitialisées** (si nécessaire) : Supprimer les réservations test

---

## 📞 CONTACTS & RESSOURCES

**URLs de démo :**
- Parent : `https://votre-domaine.fr/demo/parent`
- Collectivité : `https://votre-domaine.fr/demo/collectivite`
- Financeur : `https://votre-domaine.fr/demo/financeur`

**Documentation complémentaire :**
- Architecture écrans : `ARCHITECTURE_ECRANS.md`
- Audit cohérence : `AUDIT_COHERENCE_FRONT_BACK_BDD.md`
- Conformité RGPD : `AUDIT_CONFORMITE_RGPD_CONTRACTUEL.md`

**Support technique :**
- Email : support@flooow.fr
- GitHub Issues : [https://github.com/Amilcard/flooow-connect/issues](https://github.com/Amilcard/flooow-connect/issues)

---

**✅ Vous êtes prêt pour la démo multi-écrans !**
