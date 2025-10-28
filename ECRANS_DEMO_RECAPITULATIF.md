# 📺 ÉCRANS DE DÉMO - RÉCAPITULATIF COMPLET

**Date :** 28 octobre 2025
**Version :** 2.0 (corrigée)

---

## 🎯 **VOUS AVEZ 5 ÉCRANS DE DÉMO DISPONIBLES**

### **📊 TABLEAU RÉCAPITULATIF**

| # | URL | Contenu | Public cible | Utilisation |
|---|-----|---------|--------------|-------------|
| **1** | `/demo-dashboard` | 2 onglets : Collectivité + Financeur | **CLIENTS payants** | Démo rapide 1 écran |
| **2** | `/demo/parent` | Parcours utilisateur complet | Parents/Enfants | Démo FRONT |
| **3** | `/demo/collectivite` | Dashboard collectivité seul | Collectivités locales | Démo multi-écrans |
| **4** | `/demo/financeur` | Dashboard financeur seul | CAF, Pass'Sport, fondations | Démo multi-écrans |
| **5** | `/demo/structure` | Dashboard structure seul | Clubs, associations | Démo PARTENAIRES |

---

## 🏗️ **CLARIFICATION : QUI EST QUI ?**

### **👥 LES 4 TYPES D'ACTEURS**

| Acteur | Rôle | Modèle économique | Dashboard |
|--------|------|-------------------|-----------|
| **CLIENTS** | **Collectivités locales** | 💰 **PAYANT** (commandent la plateforme) | Dashboard Collectivité |
| **CLIENTS** | **Financeurs** (CAF, Pass'Sport, etc.) | 💰 **PAYANT** (tracking des aides) | Dashboard Financeur |
| **PARTENAIRES** | **Structures** (clubs, assos) | 🆓 **GRATUIT** (utilisateurs de la plateforme) | Dashboard Structure |
| **UTILISATEURS** | **Parents + Enfants** | 🆓 **GRATUIT** (bénéficiaires finaux) | Pages publiques |

---

## 📋 **DÉTAIL DES 5 ÉCRANS**

### **1️⃣ `/demo-dashboard` - Démo CLIENTS (1 écran, 2 onglets)**

**URL complète :** `https://votre-domaine.fr/demo-dashboard`

**Contenu :**
- ✅ Onglet 1 : **Collectivité Locale** (Dashboard territorial)
- ✅ Onglet 2 : **Partenaire Financeur** (Suivi des aides)
- ❌ **Structure retirée** (car c'est un partenaire, pas un client)

**Quand l'utiliser :**
- ✅ Démo courte (1 seul écran)
- ✅ Présentation aux CLIENTS (collectivités + financeurs)
- ✅ Pas d'authentification requise
- ✅ Bascule rapide entre les 2 vues

**Bannière affichée :**
> 🎭 **Mode Démo CLIENTS** - Dashboards Collectivité & Financeur
> Bascule entre les 2 vues clients sans authentification

---

### **2️⃣ `/demo/parent` - Parcours Utilisateur (FRONT)**

**URL complète :** `https://votre-domaine.fr/demo/parent`

**Contenu :**
- ✅ Hero avec titre : "Trouvez l'activité parfaite pour votre enfant"
- ✅ Statistiques en direct (156 enfants, 87 activités, 45 680€ économisés)
- ✅ Barre de recherche + Filtres disponibles
- ✅ Activités à proximité (4 cartes)
- ✅ Activités Petits budgets (4 cartes)
- ✅ Parcours type en 5 étapes
- ✅ Fonctionnalités clés (Filtres, Aides automatiques, Inclusion)
- ✅ Navigation vers vraies pages (`/activities`, `/aides`)

**Quand l'utiliser :**
- ✅ Montrer le parcours parent
- ✅ Démo FRONT (expérience utilisateur)
- ✅ Multi-écrans (écran gauche OU écran principal)
- ✅ Peut être combiné avec `/demo/collectivite` + `/demo/financeur`

---

### **3️⃣ `/demo/collectivite` - Dashboard Collectivité (BACK)**

**URL complète :** `https://votre-domaine.fr/demo/collectivite`

**Contenu :**
- ✅ Territoire : Saint-Étienne Métropole (12 500 enfants, 24 structures)
- ✅ Objectifs (30% QPV, 15% handicap, 120 min sport/semaine, 40% transports doux)
- ✅ Dashboard complet avec graphiques KPIs
- ✅ 4 catégories de données (Impact social, Activité, Financier, Santé & mobilité)
- ✅ Exports disponibles (Excel, CSV, PDF, JSON)

**Quand l'utiliser :**
- ✅ Démo multi-écrans (écran central ou droite)
- ✅ Focus sur les collectivités locales
- ✅ Montrer le pilotage territorial en temps réel

---

### **4️⃣ `/demo/financeur` - Dashboard Financeur (BACK)**

**URL complète :** `https://votre-domaine.fr/demo/financeur`

**Contenu :**
- ✅ Partenaire : CAF Loire (250 000€ budget)
- ✅ Objectifs financeur (taux recours, QPV, impact social)
- ✅ Dashboard complet avec graphiques KPIs
- ✅ 4 catégories de données (Utilisation aides, Profil bénéficiaires, Impact territorial, ROI)
- ✅ Cas d'usage (CAF, Pass'Sport, fondations, conseils départementaux)
- ✅ Avantages plateforme

**Quand l'utiliser :**
- ✅ Démo multi-écrans (écran droite ou central)
- ✅ Focus sur les partenaires financiers
- ✅ Montrer le suivi des aides en temps réel

---

### **5️⃣ `/demo/structure` - Dashboard Structure (PARTENAIRE)**

**URL complète :** `https://votre-domaine.fr/demo/structure`

**Contenu :**
- ✅ Structure : Association Jungle Attitude (12 activités)
- ✅ Rôle de la structure partenaire
- ✅ Dashboard gestion activités + créneaux + réservations
- ✅ Fonctionnalités (Gestion activités, créneaux, réservations, validation présence)
- ✅ Modèle économique (Utilisation GRATUITE de la plateforme)
- ✅ Distinction PARTENAIRE vs CLIENT

**Quand l'utiliser :**
- ✅ Démo aux structures (clubs, associations)
- ✅ Montrer la valeur pour les partenaires opérationnels
- ✅ Expliquer le modèle GRATUIT pour eux
- ❌ **NE PAS utiliser dans la démo CLIENTS** (car pas payant)

---

## 🎬 **SCÉNARIOS D'UTILISATION**

### **📱 Scénario 1 : Démo CLIENTS simple (1 écran)**

**Configuration :** 1 écran / 1 projecteur

**URL à ouvrir :** `/demo-dashboard`

**Déroulement :**
1. Onglet "Collectivité Locale" (5 min) → Montrer les KPIs territoriaux
2. Onglet "Partenaire Financeur" (5 min) → Montrer le suivi des aides
3. Q&R (5 min)

**Avantages :**
- ✅ Rapide (15 min)
- ✅ Pas besoin de multi-écrans
- ✅ Focus sur les CLIENTS payants

---

### **🖥️🖥️🖥️ Scénario 2 : Démo COMPLÈTE multi-écrans (3 écrans)**

**Configuration :** 3 écrans ou 1 projecteur + 2 écrans latéraux

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Écran GAUCHE   │  │   PROJECTEUR     │  │   Écran DROIT    │
│  /demo/parent    │  │ /demo/collectivite│  │ /demo/financeur  │
│                  │  │                  │  │                  │
│  Parcours parent │  │ Dashboard territoire│ Dashboard partenaire│
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

**Déroulement :**
1. **Phase 1 (8 min)** : Focus écran gauche `/demo/parent`
   - Montrer recherche activité
   - Filtres (catégorie, âge, prix, accessibilité)
   - Simulation aides financières
   - Réservation

2. **Phase 2 (5 min)** : Focus écran central `/demo/collectivite`
   - KPIs territoriaux (156 enfants, 22% handicap, 35% QPV)
   - Graphiques (activités, transport, structures)
   - Données disponibles

3. **Phase 3 (5 min)** : Focus écran droit `/demo/financeur`
   - Utilisation budget CAF (89 simulations, 67 validées)
   - Profil bénéficiaires (45 familles, 78% QPV)
   - ROI social (250€/enfant)

4. **Conclusion (2 min)** : Montrer les 3 écrans simultanément
   - "Voilà comment Flooow connecte les 3 acteurs"

---

### **🏢 Scénario 3 : Démo STRUCTURES (partenaires)**

**Configuration :** 1 écran

**URL à ouvrir :** `/demo/structure`

**Déroulement :**
1. Présentation de l'outil (gestion activités, créneaux, réservations)
2. Insister sur le modèle GRATUIT pour les structures
3. Montrer les bénéfices (visibilité, simplification, nouveaux publics)
4. Q&R

**Public cible :**
- ✅ Clubs sportifs
- ✅ Associations culturelles
- ✅ Centres de loisirs
- ✅ MJC, FJT, etc.

---

## ✅ **CHECKLIST AVANT LA DÉMO**

### **30 min avant (15 min)**

- [ ] **Décider du scénario** (Scénario 1, 2 ou 3)
- [ ] **Ouvrir les URLs correspondantes** dans des onglets/fenêtres séparés
- [ ] **Tester la navigation** (cliquer sur les cartes, onglets)
- [ ] **Vérifier que tout charge** (pas d'erreur 404, images OK)
- [ ] **Préparer les écrans/projecteur**
- [ ] **Boomarker les URLs** pour accès rapide

### **URLs à tester selon le scénario**

**Scénario 1 (CLIENTS simple) :**
- [ ] `https://votre-domaine.fr/demo-dashboard`

**Scénario 2 (Multi-écrans COMPLET) :**
- [ ] `https://votre-domaine.fr/demo/parent`
- [ ] `https://votre-domaine.fr/demo/collectivite`
- [ ] `https://votre-domaine.fr/demo/financeur`

**Scénario 3 (STRUCTURES) :**
- [ ] `https://votre-domaine.fr/demo/structure`

---

## 🚀 **COMMENT TESTER LOCALEMENT**

Si vous voulez tester avant de déployer :

```bash
# 1. Relancer le serveur de dev
npm run dev

# 2. Ouvrir les URLs dans votre navigateur
http://localhost:5173/demo-dashboard
http://localhost:5173/demo/parent
http://localhost:5173/demo/collectivite
http://localhost:5173/demo/financeur
http://localhost:5173/demo/structure
```

---

## 📊 **RÉSUMÉ : QUELLE URL POUR QUEL BESOIN ?**

| Besoin | URL recommandée | Durée |
|--------|-----------------|-------|
| Démo rapide CLIENTS (1 écran) | `/demo-dashboard` | 15 min |
| Démo complète CLIENTS (3 écrans) | `/demo/parent` + `/demo/collectivite` + `/demo/financeur` | 20 min |
| Démo parcours utilisateur (FRONT) | `/demo/parent` | 10 min |
| Démo collectivité seule | `/demo/collectivite` | 5 min |
| Démo financeur seul | `/demo/financeur` | 5 min |
| Démo structures partenaires | `/demo/structure` | 10 min |

---

## 💡 **CONSEILS PRATIQUES**

### **Pour la démo CLIENTS (scénario 1) :**
✅ Utilisez `/demo-dashboard` (2 onglets, simple)
✅ Insistez sur "Collectivité" ET "Financeur" = CLIENTS payants
❌ Ne parlez PAS de "Structure" (c'est un partenaire gratuit)

### **Pour la démo COMPLÈTE (scénario 2) :**
✅ Utilisez 3 URLs séparées pour 3 écrans
✅ Montrez le FRONT + BACK en simultané
✅ Effet "waouh" garanti !

### **Pour la démo STRUCTURES (scénario 3) :**
✅ Utilisez `/demo/structure`
✅ Insistez sur le modèle GRATUIT pour eux
✅ Montrez les bénéfices concrets (visibilité, simplification)

---

## ❓ **FAQ**

**Q : Pourquoi "Structure" n'est plus dans `/demo-dashboard` ?**
**R :** Parce que Structure = PARTENAIRE (utilise gratuitement), pas CLIENT (payant). Pour les clients, on ne montre que Collectivité + Financeur.

**Q : Où est passé le dashboard Structure ?**
**R :** Il a sa propre page dédiée : `/demo/structure` (scénario 3).

**Q : Les 3 nouvelles pages (`/demo/parent`, `/demo/collectivite`, `/demo/financeur`) ne fonctionnent pas ?**
**R :** Elles sont créées et committées. Vérifiez que vous avez :
1. Pull/rebuild le code (`git pull`, `npm install`, `npm run build`)
2. Relancé votre serveur (`npm run dev`)
3. Testé les bonnes URLs (avec `/demo/` pas `/demo-`)

**Q : Quand utiliser `/demo-dashboard` vs les 3 écrans séparés ?**
**R :**
- `/demo-dashboard` → Démo simple, 1 écran, 15 min
- 3 écrans séparés → Démo complète, multi-écrans, 20 min, effet "waouh"

---

**✅ Vous êtes maintenant prêt pour toutes les configurations de démo !**
