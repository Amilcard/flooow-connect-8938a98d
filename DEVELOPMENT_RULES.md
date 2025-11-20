# Règles de Développement et Bonnes Pratiques

## 1. Gestion des Fichiers et Dossiers (CRITIQUE)
### Sensibilité à la Casse (Case Sensitivity)
**Problème :** macOS et Windows sont insensibles à la casse par défaut (Search == search), mais Linux (serveurs de déploiement, CI/CD, Lovable) est sensible à la casse (Search != search).
**Règle :**
- Ne JAMAIS changer la casse d'un dossier ou fichier sans utiliser `git mv`.
- Ne JAMAIS avoir deux dossiers avec le même nom mais une casse différente (ex: `components/Search` et `components/search`).
- Toujours vérifier les imports : `import ... from '@/components/Search/...'` doit correspondre EXACTEMENT au nom du dossier sur le disque.

**Vérification :**
Si une erreur "Module not found" apparaît uniquement en production/déploiement :
1. Vérifier la casse du fichier dans Git : `git ls-tree HEAD path/to/file`
2. Vérifier l'import dans le code.

## 2. UI et Design System
- Utiliser les composants Shadcn UI de base.
- Respecter le ton "CityCrunch" pour les textes (tutoiement, dynamique, engageant).
- Vérifier systématiquement le responsive mobile.

## 3. Navigation
- Les pages de niveau 2 (détails, formulaires) doivent avoir un bouton "Retour" explicite.
- Le header doit être cohérent (complet sur les pages principales, simplifié sur les tunnels).
