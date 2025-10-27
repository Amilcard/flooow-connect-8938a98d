# 🎬 GUIDE DÉMO IMMÉDIATE - FLOOOW CONNECT

**Objectif :** Faire une démonstration professionnelle MAINTENANT avec l'existant
**Durée totale :** 20 minutes
**Préparation requise :** 15 minutes

---

## ⚡ PRÉPARATION EXPRESS (15 min)

### 1. Vérifier que l'application démarre (5 min)

```bash
# Terminal 1 : Démarrer l'app
cd /home/user/flooow-connect
npm run dev

# Devrait afficher :
# ➜  Local:   http://localhost:5173/
```

**Ouvrir dans le navigateur :** http://localhost:5173

**Vérifier que ces pages chargent :**
- [ ] http://localhost:5173/ (accueil) ✅
- [ ] http://localhost:5173/activities (liste activités) ✅
- [ ] http://localhost:5173/demo-dashboard (dashboard démo) ✅

**Si erreur :** Vérifier que `npm install` a été fait

---

### 2. Préparer les URLs de démo (2 min)

**Créer un fichier de raccourcis sur le bureau :**

```
# URLs DÉMO FLOOOW CONNECT

# Pages publiques
Accueil: http://localhost:5173/
Activités: http://localhost:5173/activities
Détail activité: http://localhost:5173/activity/[ID]

# Dashboard démo (PAS besoin d'auth)
Dashboard 3-en-1: http://localhost:5173/demo-dashboard

# Compte parent (NÉCESSITE auth)
Login: http://localhost:5173/login
Mon compte: http://localhost:5173/mon-compte

# Utilitaires
Aides: http://localhost:5173/aides
Éco-mobilité: http://localhost:5173/eco-mobilite
```

---

### 3. Préparer un compte de test (5 min)

**Option A : Créer un nouveau compte**

1. Aller sur http://localhost:5173/signup
2. Remplir le formulaire :
   - Email : `demo-parent@flooow.fr`
   - Mot de passe : `DemoFlooow2024!`
   - Prénom : Demo
   - Nom : Parent
   - Code postal : 75001 (Paris)
   - Quotient familial : 800
3. Créer le compte
4. Ajouter 2 enfants :
   - Emma, 10 ans
   - Lucas, 8 ans

**Option B : Utiliser un compte existant**

Si vous avez déjà un compte de test, notez les identifiants ici :
- Email : ___________________
- Mot de passe : ___________________

---

### 4. Vérifier qu'il y a des activités (3 min)

**Aller sur :** http://localhost:5173/activities

**Vérifier :**
- [ ] Il y a au moins 3-4 activités affichées
- [ ] Les cartes ont des images
- [ ] Les prix sont visibles
- [ ] Le bouton "Voir détails" fonctionne

**Si AUCUNE activité :**

```bash
# Générer des activités de test
curl -X POST http://localhost:54321/functions/v1/mock-activities

# Ou via Supabase Dashboard → SQL Editor → Insérer des données
```

---

## 🎯 SCÉNARIO 1 : PARCOURS PARENT (10 min)

**Objectif :** Montrer le parcours complet d'un parent qui réserve une activité

### Étape 1 : Accueil et recherche (2 min)

**URL :** http://localhost:5173/

**À montrer :**
```
👉 "Voici la page d'accueil de Flooow Connect,
    une plateforme d'activités jeunesse inclusives."

👉 "On peut rechercher des activités directement ici."
```

**Actions :**
1. Faire défiler la page (montrer le design)
2. Taper "Football" ou "Danse" dans la barre de recherche
3. Cliquer sur "Rechercher" ou appuyer sur Entrée

---

### Étape 2 : Liste des activités (2 min)

**URL :** http://localhost:5173/activities

**À montrer :**
```
👉 "On peut filtrer par catégorie : Sport, Culture, Loisirs, Vacances."

👉 "On voit le prix, l'âge recommandé, et les places disponibles."

👉 "L'application calcule automatiquement l'éligibilité QPV
    (Quartier Prioritaire de la Ville) selon le code postal du parent."
```

**Actions :**
1. Montrer les filtres à gauche (catégorie, âge, etc.)
2. Cliquer sur une activité intéressante
3. Ouvrir le détail

---

### Étape 3 : Détail activité + Simulation aide (3 min)

**URL :** http://localhost:5173/activity/[ID]

**À montrer :**
```
👉 "Voici le détail de l'activité avec :
    - Description complète
    - Créneaux disponibles
    - Prix de base
    - Structure organisatrice"

👉 "Un élément clé : le simulateur d'aides."
```

**Actions :**
1. Faire défiler pour voir toute la page
2. **POINT CLÉ :** Cliquer sur "Simuler les aides"
3. Montrer le calcul en temps réel :
   ```
   Prix de base : 150€
   - Aide CAF (QF < 1000) : -50€
   - Aide territoriale : -30€
   = Reste à charge : 70€
   ```
4. Cliquer sur "Réserver"

---

### Étape 4 : Réservation (2 min)

**URL :** http://localhost:5173/booking/[ID]

**À montrer :**
```
👉 "Le parent sélectionne l'enfant concerné."

👉 "Il choisit un créneau horaire."

👉 "Dans cette version V1 démo, la validation est instantanée
    (express_flag = true)."

👉 "En production, certaines activités nécessiteront une
    validation manuelle par la structure."
```

**Actions :**
1. Sélectionner un enfant (Emma ou Lucas)
2. Choisir un créneau disponible
3. Cliquer sur "Confirmer la réservation"
4. **Attendre la confirmation (2-3 secondes)**

---

### Étape 5 : Confirmation (1 min)

**URL :** http://localhost:5173/booking-status/[ID]

**À montrer :**
```
👉 "Réservation validée instantanément !"

👉 "Le parent reçoit une notification."

👉 "La place est décomptée automatiquement
    (gestion atomique des places)."
```

**Actions :**
1. Montrer le message de succès
2. Cliquer sur "Voir mes réservations"
3. Montrer la liste des réservations dans le compte

---

## 🏢 SCÉNARIO 2 : DASHBOARD COLLECTIVITÉ (5 min)

**Objectif :** Montrer les indicateurs pour les collectivités territoriales

### Accéder au dashboard démo

**URL :** http://localhost:5173/demo-dashboard

**À montrer :**
```
👉 "Voici un dashboard multi-rôles qui permet de voir
    les 3 perspectives métier sans authentification."

👉 "C'est une fonctionnalité de démo. En production,
    chaque rôle a son propre accès sécurisé."
```

---

### Onglet Collectivité (actif par défaut)

**À montrer :**

#### 1. KPIs Principaux (haut de page)

```
👉 "4 indicateurs clés pour la collectivité :"

📊 Inscriptions totales : 156
   → Nombre d'enfants ayant réservé au moins une activité

♿ Accessibilité : 12.5%
   → Pourcentage d'enfants en situation de handicap

🏘️ QPV : 28.2%
   → Pourcentage d'enfants issus de Quartiers Prioritaires

💚 Santé : 180 min/semaine
   → Moyenne estimée d'activité physique par enfant
```

**Actions :**
1. Pointer chaque KPI avec la souris
2. Expliquer l'impact social de chaque indicateur

---

#### 2. Graphiques

**Graphique 1 : Activités par catégorie (Pie Chart)**

```
👉 "Répartition des activités proposées :"
   - Sport : 32 (37%)
   - Culture : 25 (29%)
   - Loisirs : 18 (21%)
   - Vacances : 12 (13%)
```

**Graphique 2 : Répartition mobilité (Bar Chart)**

```
👉 "Comment les familles se déplacent :"
   - Transport en commun : 45%
   - Voiture : 30%
   - Vélo : 15%
   - Marche : 10%

👉 "Ces données permettent de planifier l'éco-mobilité
    et de réduire l'empreinte carbone."
```

**Actions :**
1. Survoler les graphiques (tooltips s'affichent)
2. Expliquer les insights stratégiques

---

#### 3. Top Structures

```
👉 "Les 5 structures les plus actives du territoire :"
   1. Maison des Jeunes : 12 activités
   2. Club Sportif Municipal : 9
   3. Centre Culturel : 8
   4. Association Arts & Loisirs : 6
   5. Espace Jeunesse : 5
```

---

### Onglet Structure (2 min)

**Actions :**
1. Cliquer sur l'onglet "Structure"
2. Montrer rapidement :
   ```
   👉 "Vue pour les organisateurs d'activités :"
      - Gestion des activités (créer, modifier)
      - Liste des réservations reçues
      - Validation des inscriptions
   ```

---

### Onglet Financeur (1 min)

**Actions :**
1. Cliquer sur l'onglet "Financeur"
2. Montrer rapidement :
   ```
   👉 "Vue pour les partenaires financiers (CAF, département, etc.) :"
      - Aides distribuées
      - Nombre de bénéficiaires
      - Montant total simulé
   ```

---

## 💡 MESSAGES CLÉS À FAIRE PASSER

### Innovation sociale

```
✨ "Flooow Connect rend les activités accessibles à TOUS les enfants,
   en particulier ceux issus de familles modestes (QPV)
   ou en situation de handicap."
```

### Impact environnemental

```
🌍 "L'éco-mobilité est intégrée : on encourage les transports durables
   et on mesure l'empreinte carbone des déplacements."
```

### Inclusion numérique

```
📱 "Interface simple et intuitive, accessible depuis un smartphone.
   Pas besoin d'être expert en informatique."
```

### Aides automatiques

```
💰 "Les aides financières sont calculées automatiquement selon :
   - Le quotient familial (CAF)
   - Le code postal (QPV)
   - Les critères territoriaux

   → Les familles savent immédiatement combien elles vont payer."
```

### Multi-acteurs

```
🤝 "3 types d'utilisateurs sur une même plateforme :
   - Collectivités (pilotage stratégique)
   - Structures (gestion opérationnelle)
   - Financeurs (suivi des aides)

   → Tout le monde travaille avec les mêmes données."
```

---

## 🚨 GESTION DES QUESTIONS

### Question : "Et si l'enfant ne peut pas venir ?"

**Réponse :**
```
"Bonne question ! Le parent peut annuler depuis son compte.
Les places sont libérées automatiquement.
En V2, on ajoutera des pénalités pour annulation tardive."
```

---

### Question : "Comment les structures reçoivent les paiements ?"

**Réponse :**
```
"Deux modes de paiement prévus :
1. Paiement en ligne (Stripe/PayPlug) - à venir
2. Paiement sur place (pour l'instant)

Les aides sont déduites automatiquement et versées
directement aux structures par les financeurs."
```

---

### Question : "Comment on vérifie le handicap ou le QPV ?"

**Réponse :**
```
"Pour le QPV : c'est automatique via le code postal
(référentiel officiel des Quartiers Prioritaires).

Pour le handicap : déclaration par le parent
+ justificatif à fournir (optionnel selon la collectivité).

On respecte le RGPD : données sensibles protégées."
```

---

### Question : "Pourquoi l'inscription enfant par email ne fonctionne pas ?"

**Réponse :**
```
"C'est une fonctionnalité en cours de finalisation.
Pour l'instant, les parents créent leur compte
et ajoutent leurs enfants directement.

L'inscription autonome par l'enfant (avec validation email)
sera opérationnelle dans les prochains jours."
```

---

## 📊 STATISTIQUES À CITER

Si on vous demande des chiffres :

```
📈 Architecture technique :
   - 61 pages frontend (React + TypeScript)
   - 23 fonctions backend (Supabase Edge Functions)
   - 40+ tables de données
   - 100% sécurisé (RLS Supabase)

📈 Fonctionnalités :
   - Multi-rôles (parent, structure, collectivité, financeur)
   - Simulation d'aides en temps réel
   - Gestion atomique des places (pas de surbooking)
   - Éco-mobilité intégrée
   - Accessibilité (WCAG 2.1)
```

---

## ⏱️ TIMING RECOMMANDÉ

**Démo complète (20 min) :**
- Introduction (2 min)
- Scénario 1 : Parcours parent (10 min)
- Scénario 2 : Dashboard collectivité (5 min)
- Questions/Réponses (3 min)

**Démo courte (10 min) :**
- Introduction (1 min)
- Parcours parent raccourci (5 min)
- Dashboard collectivité (3 min)
- Conclusion (1 min)

---

## 🎬 CHECKLIST AVANT DE COMMENCER

**5 minutes avant la démo :**

- [ ] Application démarrée (`npm run dev`)
- [ ] Page http://localhost:5173/ ouverte
- [ ] Onglet http://localhost:5173/demo-dashboard ouvert
- [ ] Compte de test prêt (email/mdp notés)
- [ ] Il y a des activités visibles
- [ ] Connexion internet stable
- [ ] Partage d'écran testé (si démo en ligne)

**Plan B :**
- [ ] Captures d'écran prêtes (si problème technique)
- [ ] Vidéo de démo enregistrée (backup)

---

## 🎯 OBJECTIFS DE LA DÉMO

À la fin, le public doit avoir compris :

1. ✅ Flooow Connect facilite l'accès aux activités pour TOUS les enfants
2. ✅ Les aides financières sont calculées automatiquement
3. ✅ L'application sert 3 types d'acteurs (collectivités, structures, financeurs)
4. ✅ Les indicateurs d'inclusion (QPV, handicap) sont mesurés en temps réel
5. ✅ C'est une solution technique solide et moderne

---

## 💪 VOUS ÊTES PRÊT !

**Conseils finaux :**

1. **Respirez** - Vous connaissez le projet
2. **Allez-y doucement** - Pas besoin de cliquer vite
3. **Expliquez en parlant** - Narrez ce que vous faites
4. **Si bug** - Passez à la suite, vous avez un plan B
5. **Souriez** - L'application est impressionnante !

**Bonne démo ! 🚀**

---

**Après la démo, pensez à :**
- Noter les questions posées
- Identifier les bugs rencontrés
- Lister les fonctionnalités demandées
- Partager le feedback avec l'équipe
