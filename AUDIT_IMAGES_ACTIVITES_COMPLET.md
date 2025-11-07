# Audit Images Activités - Attribution Automatique Complète

## Contexte
Sur de nombreux écrans (Accueil, Recherche, Univers, Démos), certaines activités s'affichaient sans image, donnant une impression d'inachevé et nuisant à la compréhension.

## Solution Implémentée

### 1. Création du système d'attribution automatique

**Fichier créé**: `src/lib/imageMapping.ts`
- Fonction intelligente `getActivityImage(title, theme, ageMin, ageMax)`
- Mapping par mots-clés spécifiques (ex: "football", "judo", "théâtre"...)
- Prise en compte de la tranche d'âge (6-9, 10-13, 14-17)
- Fallback par thème général puis par âge si aucune correspondance

### 2. Images disponibles par thématique et âge

**Sport**:
- Football/Multisports: `activity-stage-foot-6-9.jpg` (6-9 ans), `activity-multisports-10-13.jpg` (10-13 ans)
- Judo: `activity-judo-6-9.jpg`, `activity-judo-kids.jpg`
- Natation: `activity-natation-6-9.jpg`
- Escalade: `activity-escalade-14-17.jpg`
- Danse/Hip-hop: `activity-hiphop-14-17.jpg`

**Culture**:
- Musique/Piano: `activity-musique-6-9.jpg`
- Théâtre: `activity-theatre-6-9.jpg`
- Arts plastiques: `activity-arts-6-9.jpg`, `activity-arts-10-13.jpg`
- Photo/Vidéo: `activity-photo-14-17.jpg`

**Loisirs/Technologie**:
- Robotique/Code: `activity-code-10-13.jpg`, `activity-robotique-10-13.jpg`
- Cuisine: `activity-cuisine-6-9.jpg`
- Jardinage/Nature: `activity-jardinage-10-13.jpg`
- Jeux: `activity-jeux-6-9.jpg`

**Vacances**:
- Séjours/Colonies: `activity-camp-10-13.jpg`, `activity-sejour-14-17.jpg`
- Centres de loisirs: Selon âge

**Scolarité**:
- Soutien scolaire: `activity-soutien-6-9.jpg`

**Images génériques par thème**:
- Sport: `activity-sport.jpg`
- Culture: `activity-culture.jpg`
- Loisirs: `activity-loisirs.jpg`
- Vacances: `activity-vacances.jpg`

### 3. Intégration dans le système

**Modification**: `src/types/schemas.ts`
- Import de `getActivityImage`
- Utilisation dans `toActivity()` au lieu du fallback Unsplash
- Attribution automatique pour toutes les activités sans image définie

### 4. Logique d'attribution

```
1. Si l'activité a déjà une image définie → on la garde
2. Sinon:
   a. Recherche de correspondance par mots-clés dans le titre
   b. Prise en compte de la tranche d'âge pour affiner
   c. Fallback sur le thème général
   d. Fallback ultime sur l'âge moyen
```

### 5. Exemples de mapping

| Activité | Âge | Image attribuée |
|----------|-----|-----------------|
| École de Football - ASSE Kids | 6-10 | `activity-stage-foot-6-9.jpg` |
| Escalade Aventure Ados | 13-17 | `activity-escalade-14-17.jpg` |
| Cours de Piano Individuels | 7-15 | `activity-musique-6-9.jpg` |
| Club Robotique et Code | 9-14 | `activity-code-10-13.jpg` |
| Séjour Multi-activités Été | 10-13 | `activity-camp-10-13.jpg` |
| Théâtre Enfants | 6-10 | `activity-theatre-6-9.jpg` |
| Atelier Cuisine Jeunes Chefs | 8-13 | `activity-cuisine-6-9.jpg` |
| Jardinage et Nature | 6-11 | `activity-jardinage-10-13.jpg` |

## Couverture complète

### ✅ Parcours testés

1. **Accueil (/)**: 
   - Carrousels "Activités à la une", "Petits budgets", "Innovantes"
   - Section mocks Saint-Étienne
   - ✅ Toutes les cartes ont désormais une image

2. **Recherche (/search)**:
   - Résultats de recherche libre
   - Filtres appliqués
   - ✅ Toutes les cartes ont une image

3. **Univers (/activities)**:
   - Onglets Sport, Culture, Loisirs, Vacances, Scolarité
   - ✅ Toutes les activités par univers ont une image

4. **Pages de détail (/activity/[id])**:
   - Hero réduit affiche l'image correcte
   - ✅ Pas de placeholder vide

5. **Écrans démo**:
   - Mme Lemoine
   - Dashboards collectivités
   - ✅ Tous utilisent le même système d'images

## Bénéfices

1. **Cohérence visuelle**: Toutes les cartes d'activités affichent une image pertinente
2. **Compréhension immédiate**: L'image donne une indication claire du type d'activité et de l'âge ciblé
3. **Automatisation**: Plus besoin d'attribuer manuellement les images, le système le fait intelligemment
4. **Évolutivité**: Facile d'ajouter de nouvelles images spécifiques
5. **Performance**: Pas de requête externe, toutes les images sont locales

## Fichiers modifiés

1. `src/lib/imageMapping.ts` (créé) - Fonction d'attribution intelligente
2. `src/types/schemas.ts` - Intégration de la fonction dans le flow de parsing

## Points de vigilance

- Les activités qui avaient déjà une image définie la conservent
- Le système privilégie toujours les mots-clés spécifiques avant les thèmes généraux
- La tranche d'âge est prise en compte pour affiner le choix
- Fallback robuste garantissant qu'aucune activité ne reste sans image

## Résultat final

✅ **Objectif atteint**: Plus aucune activité sans image sur l'ensemble du projet (parcours famille réel, mocks, démos)
