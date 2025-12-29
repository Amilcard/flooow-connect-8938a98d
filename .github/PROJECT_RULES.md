# Règles du Projet Flooow

Ce document définit les règles permanentes du projet. Ces règles doivent être respectées par tous les contributeurs (humains et IA).

---

## 🚫 Plateformes Exclues

Les plateformes suivantes **NE FONT PLUS PARTIE** du projet et ne doivent jamais être référencées :

| Plateforme | Statut | Action requise |
|------------|--------|----------------|
| **Lovable** | ❌ Exclu | Ne pas mentionner, supprimer toute référence |
| **Vercel** | ❌ Exclu | Ne pas mentionner, supprimer toute référence |

### Règle
- Ne jamais ajouter de code, commentaire ou documentation faisant référence à Lovable ou Vercel
- Si une référence est trouvée dans le code existant, la supprimer
- Utiliser des termes génériques comme "CI/CD", "déploiement", "hébergeur" si nécessaire

---

## ✅ Stack Technique Actuelle

| Catégorie | Technologie |
|-----------|-------------|
| Frontend | React 18 + TypeScript + Vite |
| UI | shadcn/ui + Tailwind CSS |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| Analytics | Lucky Orange (RGPD compliant) |
| CI/CD | GitHub Actions |

---

## 📋 Règles de Développement

### 1. Naming & Casse
- Les imports doivent respecter la casse exacte des fichiers (Linux-compatible)
- Utiliser PascalCase pour les composants, camelCase pour les fonctions

### 2. Analytics
- Lucky Orange uniquement
- Toujours respecter le consentement RGPD via `setLOConsent()`
- Exclure les routes sensibles : `/onboarding`, `/ma-ville`, `/territoire-non-couvert`

### 3. Hero Tiles
- Format obligatoire : `h-[400px] md:h-[480px]`
- Images locales dans `/assets/`
- Voir `.github/HERO_TILES_GUIDE.md` pour les détails

### 4. Commits
- Messages en anglais, format conventionnel : `type(scope): description`
- Types : `feat`, `fix`, `chore`, `refactor`, `docs`, `test`

---

## 🔄 Mise à jour

**Dernière mise à jour :** Décembre 2025
**Mainteneur :** Équipe Flooow

Pour modifier ces règles, créer une PR avec une justification claire.
