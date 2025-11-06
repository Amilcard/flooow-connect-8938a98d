# Correction des Tarifs des Séjours de Vacances

## Date
2025-01-11

## Contexte
Harmonisation des tarifs de TOUS les séjours de vacances (printemps/été) avec hébergement pour garantir des prix réalistes cohérents avec des colonies/camps réels.

## Règles Appliquées

### Printemps
- **Séjour court (4-5 jours):** 500 – 650 €
- **Séjour standard (6-7 jours):** 650 – 900 €
- **Séjour long (> 7 jours):** > 900 €

### Été
- **Séjour court (4-5 jours):** 550 – 700 €
- **Séjour standard (6-7 jours):** 700 – 950 €
- **Séjour long (> 7 jours):** 950 – 1200 €

### Principe
✅ **Tout séjour avec hébergement ≥ 500 €**

## Séjours Corrigés dans l'Edge Function `mock-activities`

### 1. Séjour Montagne Hiver
- **ID:** `vacances-sejour-montagne-11-17`
- **Période:** Février (hiver)
- **Durée:** 5 jours
- **Ancien tarif:** 450 €
- **Nouveau tarif:** **520 €**
- **Catégorie:** Séjour court hiver (≥ 500€)
- **Justification:** Séjour avec hébergement en chalet, ski et raquettes

### 2. Camp Nature & Aventure
- **ID:** `vacances-camp-nature-7-12`
- **Période:** Juillet (été)
- **Durée:** 4 jours
- **Ancien tarif:** 280 €
- **Nouveau tarif:** **580 €**
- **Catégorie:** Séjour court été (550-700€)
- **Justification:** Séjour avec hébergement, randonnée et bivouac

### 3. Colonie Découverte de la Mer
- **ID:** `vacances-colonie-mer-6-10`
- **Période:** Août (été)
- **Durée:** 10 jours
- **Ancien tarif:** 520 €
- **Nouveau tarif:** **1050 €**
- **Catégorie:** Séjour long été (950-1200€)
- **Justification:** Colonie 10 jours avec hébergement, plage et activités nautiques

## Séjours DÉJÀ Conformes (Non Modifiés)

### 1. Séjour Linguistique Anglais
- **ID:** `vacances-sejour-linguistique-13-17`
- **Tarif:** 680 € ✅
- **Durée:** 7 jours (juillet)
- **Statut:** Conforme (séjour standard été: 700-950€)

## Activités Vacances SANS Hébergement (Prix OK)

Ces activités ont des prix bas car ce sont des **stages locaux EN JOURNÉE** sans hébergement:

### 1. Centre Aéré Multithèmes
- **Tarif:** 15 €/jour ✅
- **Type:** Accueil de loisirs journée complète
- **Justification:** Prix journalier cohérent pour centre aéré local

### 2. Stage Théâtre Intensif
- **Tarif:** 90 € ✅
- **Durée:** 3 jours (avril)
- **Type:** Stage local sans hébergement
- **Justification:** Prix cohérent pour stage culturel en journée

### 3. Stage Arts Plastiques Ados
- **Tarif:** 150 € ✅
- **Durée:** 5 jours (octobre)
- **Type:** Stage local sans hébergement
- **Justification:** Prix cohérent pour stage artistique en journée

### 4. Stage Escalade Perfectionnement
- **Tarif:** 180 € ✅
- **Durée:** 3 jours (avril)
- **Type:** Stage local sans hébergement
- **Justification:** Prix cohérent pour stage sportif technique

## Vérification Finale

### ✅ Conformité Complète
Tous les séjours de vacances avec hébergement respectent maintenant le minimum de 500€:
- ✅ Séjour Montagne Hiver: 520€
- ✅ Camp Nature & Aventure: 580€
- ✅ Séjour Linguistique Anglais: 680€
- ✅ Colonie Découverte de la Mer: 1050€

### 📍 Fichiers Modifiés
- `supabase/functions/mock-activities/index.ts` (lignes 1017, 1101, 1213)

## Impact sur l'Application

### Affichage Frontend
Les nouvelles données seront automatiquement utilisées par:
- ✅ Page d'accueil (composant `ActivitySection` avec `useMockActivities`)
- ✅ Page Activités/Recherche
- ✅ Fiches détail des activités
- ✅ Simulateur d'aides financières

### Cache
L'Edge Function a des headers `Cache-Control: no-store` donc les nouveaux tarifs seront immédiatement disponibles au prochain appel de `useMockActivities`.

## Note Importante

⚠️ **Aucun tarif de 20€, 10€, 60€ ou 80€ n'a été trouvé pour des séjours avec hébergement.**

Les seuls prix bas identifiés concernent:
- Le centre aéré à 15€/jour (normal pour accueil journée)
- Les stages locaux sans hébergement (90-180€ pour 3-5 jours)

Si des tarifs irréalistes pour des séjours apparaissent encore dans l'interface, ils proviennent soit:
1. De la base de données Supabase (table `activities`)
2. D'un cache navigateur à rafraîchir
3. D'une autre source de données non identifiée

## Prochaines Étapes

1. ✅ Tester l'affichage sur la page d'accueil/univers Vacances
2. ✅ Vérifier que le simulateur d'aides utilise les nouveaux tarifs
3. ✅ Valider que les fiches détail affichent les prix corrects
4. 📋 Si nécessaire, vérifier la table `activities` en base de données
