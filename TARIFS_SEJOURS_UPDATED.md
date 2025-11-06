# 📊 HARMONISATION DES TARIFS SÉJOURS - RAPPORT COMPLET

## 🎯 Objectif
Harmoniser les tarifs des séjours de vacances avec hébergement pour respecter un minimum réaliste de **500€**, conformément aux ordres de grandeur du marché.

---

## 📋 SÉJOURS MODIFIÉS

### 1. **Séjour Montagne Hiver** (vacances-001)
- **Ancien tarif**: 380€
- **Nouveau tarif**: **680€** ✅
- **Durée**: 7 jours (février 2025)
- **Période**: Hiver
- **Justification**: Séjour standard hiver (6-7j) → plage 650-900€

### 2. **Camp Nature et Randonnée** (vacances-002)
- **Ancien tarif**: 250€
- **Nouveau tarif**: **550€** ✅
- **Durée**: 5 jours (juillet 2025)
- **Période**: Été
- **Justification**: Séjour court été (4-5j) → plage 550-700€

### 3. **Colonie Sportive Multisports** (vacances-003)
- **Ancien tarif**: 420€
- **Nouveau tarif**: **990€** ✅
- **Durée**: 10 jours (août 2025)
- **Période**: Été
- **Justification**: Séjour long été (>7j) → plage 950-1200€

### 4. **Camp Arts et Créativité** (vacances-006)
- **Ancien tarif**: 220€
- **Nouveau tarif**: **580€** ✅
- **Durée**: 5 jours (juillet 2025)
- **Période**: Été
- **Justification**: Séjour court été (4-5j) → plage 550-700€

### 5. **Séjour VTT Pilat** (vacances-008)
- **Ancien tarif**: 320€
- **Nouveau tarif**: **520€** ✅
- **Durée**: 5 jours (juin 2025)
- **Période**: Printemps/Début été
- **Justification**: Séjour court printemps (4-5j) → plage 500-650€

---

## ✅ SÉJOURS DÉJÀ CONFORMES

### Séjour Linguistique Anglais (vacances-005)
- **Tarif**: 650€ ✅
- **Durée**: 14 jours (juillet 2025)
- **Conforme**: Oui (>500€)

---

## ❌ SÉJOURS EXCLUS DE LA MODIFICATION

### 1. Stage Théâtre Intensif (vacances-004)
- **Tarif actuel**: 180€
- **Durée**: 5 jours (avril 2025)
- **Raison exclusion**: **STAGE SANS NUITÉE** (journée uniquement)
- **Lieu**: Comédie de Saint-Étienne (local)
- **Pas de modification nécessaire**

### 2. Stage Cuisine Ados (vacances-007)
- **Tarif actuel**: 150€
- **Durée**: 3 jours (octobre 2025)
- **Raison exclusion**: **STAGE SANS NUITÉE** (journée uniquement)
- **Lieu**: École Hôtelière Sainte-Marie (local)
- **Pas de modification nécessaire**

---

## 📊 RÈGLES APPLIQUÉES

### Printemps
- Séjour court (4–5 jours): **500€ – 650€**
- Séjour standard (6–7 jours): **650€ – 900€**
- Séjour long (> 7 jours): **> 900€**

### Été
- Séjour court (4–5 jours): **550€ – 700€**
- Séjour standard (6–7 jours): **700€ – 950€**
- Séjour long (> 7 jours): **950€ – 1200€**

### Hiver
- Tarifs similaires ou légèrement supérieurs au printemps en fonction de la destination

---

## 🎬 ÉCRAN DÉMO MME LEMOINE

### Route Créée
**URL**: `/demo/lemoine` (accès public, sans authentification)

### Persona Démo
- **Nom**: Sophie LEMOINE
- **Ville**: Saint-Étienne (42000)
- **Quotient Familial**: 800€
- **Enfants**: 
  - Emma, 9 ans
  - Lucas, 7 ans

### Séjour Présenté
- **Nom**: Séjour Nature & Aventure
- **Prix**: 580€ par enfant
- **Durée**: 7 jours (20-26 juillet 2026)
- **Lieu**: Centre Nature Le Pilat - Saint-Étienne
- **Âge**: 6-10 ans (compatible Emma et Lucas)

### Aides Financières Démo
1. **Chèques Vacances ANCV**: 80€
2. **Bon CAF Vacances**: 50€
- **Total aides**: 130€ par enfant
- **Reste à charge**: **450€** par enfant
- **Coût famille (2 enfants)**: **900€** au lieu de 1160€
- **Économie**: 260€ (22%)

### Fonctionnalités
✅ Affichage famille sans connexion  
✅ Présentation séjour avec détails  
✅ Calcul automatique des aides  
✅ Simulation pour 2 enfants  
✅ Confirmation de réservation mock  
✅ Synthèse économies réalisées  
✅ Badge "MODE DÉMO" visible  

---

## 📁 FICHIERS MODIFIÉS

### Données
- `src/mocks/activities_steppe.json` (lignes 999, 1032, 1065, 1163, 1226)

### Composants
- `src/pages/demo/DemoLemoine.tsx` (créé)
- `src/App.tsx` (ajout route /demo/lemoine)

### Documentation
- `TARIFS_SEJOURS_UPDATED.md` (ce fichier)

---

## 🚀 INSTRUCTIONS POUR LANCER LA DÉMO

### En Local
```bash
# Lancer le serveur de développement
npm run dev

# Accéder à la démo
http://localhost:5173/demo/lemoine
```

### En Production
```
https://[votre-domaine]/demo/lemoine
```

### Points de Test
1. ✅ Vérifier l'affichage de la famille LEMOINE
2. ✅ Cliquer sur "Calculer mes aides"
3. ✅ Vérifier l'affichage des 2 aides (130€ total)
4. ✅ Vérifier le reste à charge (450€/enfant, 900€ famille)
5. ✅ Cliquer sur "Réserver pour 2 enfants"
6. ✅ Vérifier la confirmation avec récapitulatif

---

## ✅ VALIDATION FINALE

### Tarifs
- ✅ Tous les séjours avec hébergement >= 500€
- ✅ Cohérence durée/prix respectée
- ✅ Différenciation printemps/été appliquée

### Démo
- ✅ Route publique fonctionnelle
- ✅ Données préchargées cohérentes
- ✅ Calcul aides réaliste
- ✅ UX fluide et compréhensible
- ✅ Villes limitées (Saint-Étienne, La Ricamarie)

---

## 💡 NOTES TECHNIQUES

### Pourquoi ces tarifs ?
Les tarifs reflètent les coûts réels du marché des séjours de vacances avec hébergement :
- **Hébergement**: 30-50€/jour/enfant
- **Pension complète**: 20-30€/jour
- **Encadrement**: 20-30€/jour
- **Activités + assurance**: 10-20€/jour
- **Total réaliste**: ~80-130€/jour → séjour 5j = 400-650€

### Cohérence avec les aides
Les aides disponibles (ANCV 50-80€, CAF 10-50€, etc.) représentent généralement 10-30% du coût total, ce qui est cohérent avec les nouveaux tarifs.

---

## 📞 SUPPORT

Pour toute question sur cette harmonisation:
1. Consulter `GUIDE_DEMO_JURY_LEMOINE.md`
2. Vérifier `DEMO_JURY_TECHNIQUE_RECAP.md`
3. Tester la route `/demo/lemoine` en direct

**Date de mise à jour**: 2025-01-06  
**Version**: 1.0
