# PASSATION COMPLÈTE FLOOOW CONNECT

**Date de création** : 2025-12-12
**Version** : 2.0
**Objectif** : Document de référence pour toute reprise de session IA

---

## 1. INFORMATIONS PROJET

### 1.1 Identification
| Clé | Valeur |
|-----|--------|
| **Nom projet** | Flooow Connect |
| **Cible** | Front familles (parents cherchant des activités 3-17 ans) |
| **Territoire** | Saint-Étienne Métropole (Loire, 42) |
| **Stack technique** | React 18 + TypeScript + Vite + Tailwind + Shadcn/ui + Supabase |

### 1.2 URLs et accès

| Service | URL / ID |
|---------|----------|
| **GitHub Repo** | `https://github.com/Amilcard/flooow-connect-8938a98d` |
| **Branche dev Claude** | `claude/flooow-connect-audit-01Ffyh9JC6NV6Qa7c2wS4S6j` |
| **Supabase Project ID** | `kbrgwezkjaakoecispom` |
| **Supabase URL** | `https://kbrgwezkjaakoecispom.supabase.co` |
| **Netlify** | Déploiement automatique depuis `main` |
| **Chemin local utilisateur** | `~/dev-flooow` (PAS flooow-connect) |

### 1.3 Structure du repo
```
/home/user/flooow-connect-8938a98d/
├── src/
│   ├── pages/              # Pages React Router
│   ├── components/         # Composants UI
│   │   ├── Activity/       # ActivityCard, ActivityDetail, etc.
│   │   ├── aids/           # Calculateurs d'aides
│   │   ├── Search/         # Filtres, résultats recherche
│   │   └── ui/             # Shadcn/ui components
│   ├── hooks/              # useActivities, useChildren, etc.
│   ├── integrations/
│   │   └── supabase/       # Client, types générés
│   ├── utils/              # FinancialAidEngine, formatters
│   ├── lib/                # responsive.ts, imageMapping.ts
│   └── types/              # domain.ts, schemas.ts
├── supabase/
│   ├── migrations/         # 80+ fichiers SQL
│   ├── functions/          # Edge Functions
│   ├── DOMAIN_RULES.md     # Doc 12 aides financières
│   ├── COHERENCE_AUDIT_QUERIES.sql
│   └── schema_reference.sql
├── docs/
│   ├── UI_IMPLEMENTATION_MAP.md
│   ├── SCREENS_COMPONENTS_INVENTORY.md
│   ├── PERF_LOADING_DIAGNOSIS.md
│   └── ui_map_summary.json
└── .github/workflows/
    └── auto-sync-claude.yml  # Sync claude/* vers main
```

---

## 2. PIÈGES CRITIQUES À ÉVITER

### 2.1 Noms de colonnes Supabase (ERREURS FRÉQUENTES)

| ❌ NE PAS UTILISER | ✅ UTILISER |
|-------------------|-------------|
| `published` | `is_published` |
| `category` (singulier) | `categories` (array) |
| `image_url` | `images` (array) ou `image_url` selon contexte |
| `structure_id` | `organism_id` |
| `structure` | `organism` |

### 2.2 Requêtes Supabase

```typescript
// ❌ ERREUR FRÉQUENTE - jointure embed cassée
.select('*, organisms(*)') // ERREUR si FK pas déclarée

// ✅ CORRECT - select simple
.select('*')
.eq('is_published', true)
```

### 2.3 Données de démo

**29 ACTIVITÉS EN BASE - NE JAMAIS SUPPRIMER**

```sql
-- Vérification rapide
SELECT COUNT(*) FROM activities WHERE is_published = true;
-- Doit retourner ~29
```

### 2.4 Contraintes absolues

1. **PAS de modification schéma Supabase** (pas de CREATE/DROP/ALTER)
2. **PAS de nouvelle instance Supabase**
3. **PAS de suppression des 29 activités**
4. **PRÉSERVER** : recherche, filtres, réservation, calcul aides
5. **PROTÉGER** le reste à charge (jamais négatif)

---

## 3. ARCHITECTURE TECHNIQUE

### 3.1 State Management

| Outil | Usage |
|-------|-------|
| **TanStack Query** | Fetching, caching, mutations Supabase |
| **React Context** | Auth, thème, config |
| **Local state** | UI temporaire (modals, forms) |

### 3.2 Hooks principaux

| Hook | Fichier | Description |
|------|---------|-------------|
| `useActivities` | `src/hooks/useActivities.ts` | Liste activités avec filtres |
| `useActivity` | `src/hooks/useActivity.ts` | Détail d'une activité |
| `useChildren` | `src/hooks/useChildren.ts` | Enfants de la famille |
| `useProfile` | `src/hooks/useProfile.ts` | Profil utilisateur connecté |
| `useActivityBookingState` | `src/hooks/useActivityBookingState.ts` | État réservation + aides |

### 3.3 Routing (React Router v6)

```
/                     → Accueil (carrousels)
/recherche            → Recherche avec filtres
/activite/:id         → Détail activité (3 onglets)
/mes-enfants          → Gestion enfants
/mes-reservations     → Réservations famille
/simulateur           → Simulateur aides
/espace-structure     → Dashboard organisme
/collectivite         → Dashboard collectivité
```

---

## 4. LES 12 AIDES FINANCIÈRES

Documentation complète : `supabase/DOMAIN_RULES.md`

### Résumé

| Code | Niveau | Montant | Critère principal |
|------|--------|---------|-------------------|
| `PASS_SPORT` | National | 50€ | Sport + 6-17 ans + condition sociale |
| `PASS_CULTURE` | National | 20-30€ | Culture + 15-17 ans |
| `PASS_COLO` | National | 200-350€ | Vacances + 11 ans exact |
| `VACAF_AVE` | CAF | 100-200€ | Séjour labellisé + CAF |
| `VACAF_AVF` | CAF | 200-400€ | Vacances familles + CAF |
| `PASS_REGION` | Régional | 30€ | Lycéen |
| `CAF_LOIRE_TEMPS_LIBRE` | CAF Loire | 20-80€ | **Vacances uniquement** + CAF |
| `CHEQUES_LOISIRS_42` | Dept 42 | 30€ | QF ≤ 900 |
| `TARIFS_SOCIAUX_STE` | Communal | 15-70€ | Saint-Étienne + QF |
| `CARTE_BOGE` | Communal | 10€ | 13-29 ans |
| `BONUS_QPV_SEM` | Communal | 20€ | Résidence QPV |
| `REDUCTION_FRATRIE` | Organisateur | 10% | 2+ enfants |

### Règle critique de période

```typescript
// SAISON SCOLAIRE → uniquement ces aides :
['PASS_SPORT', 'PASS_CULTURE', 'PASS_REGION', 'TARIFS_SOCIAUX_STE',
 'CARTE_BOGE', 'BONUS_QPV_SEM', 'REDUCTION_FRATRIE', 'CHEQUES_LOISIRS_42']

// VACANCES → uniquement ces aides :
['PASS_COLO', 'VACAF_AVE', 'VACAF_AVF', 'CAF_LOIRE_TEMPS_LIBRE',
 'CHEQUES_LOISIRS_42', 'CARTE_BOGE', 'BONUS_QPV_SEM', 'REDUCTION_FRATRIE']
```

---

## 5. TÂCHES EFFECTUÉES (Session actuelle)

### 5.1 Audit UI/UX complet
- ✅ `docs/UI_IMPLEMENTATION_MAP.md` - 25+ écrans documentés
- ✅ `docs/SCREENS_COMPONENTS_INVENTORY.md` - Inventaire composants
- ✅ `docs/PERF_LOADING_DIAGNOSIS.md` - Diagnostic 3 écrans lents
- ✅ `docs/ui_map_summary.json` - Export machine-readable

### 5.2 Audit Backend Supabase
- ✅ `supabase/DOMAIN_RULES.md` - 12 aides documentées
- ✅ `supabase/COHERENCE_AUDIT_QUERIES.sql` - 50+ requêtes SELECT
- ✅ `supabase/schema_reference.sql` - Snapshot schéma 16 tables

### 5.3 Corrections
- ✅ Footer centré (alignement navbar)
- ✅ Workflow auto-sync claude/* → main

---

## 6. TÂCHES À FAIRE (Priorité P0)

### TECH-002: Corriger commentaire is_published
**Fichier** : `src/hooks/useActivities.ts:101`
**Problème** : Commentaire dit "Champ `published`" mais code utilise `is_published`
**Action** : Mettre à jour le commentaire

### TECH-005: Ré-afficher organisme sur cartes
**Fichiers** :
- `src/hooks/useActivities.ts` (ajouter données organisme)
- `src/components/Activity/ActivityCard.tsx` (afficher nom)

**Approche** :
1. La table `activities` a déjà `organism_name` (dénormalisé)
2. Mapper dans `mapActivityFromDB()`
3. Passer à `ActivityCard` via `structureName`

### TECH-009: Protéger reste à charge négatif
**Fichiers concernés** :
- `src/components/Activity/ActivityCard.tsx:85` - Calcul hardcodé sans protection
- Tous les calculateurs d'aides (déjà protégés avec `Math.max(0, ...)`)

**Action** : Vérifier TOUS les affichages de prix

---

## 7. PROBLÈMES CONNUS / DETTE TECHNIQUE

### 7.1 Jointure organisms cassée
```typescript
// Dans useActivities.ts - la jointure est désactivée :
structures: {
  name: null,  // ← Toujours null car pas de JOIN
  address: null,
  ...
}
```
**Solution** : Utiliser les colonnes dénormalisées `organism_name`, `organism_email`, etc. de la table `activities`

### 7.2 Mock data éco-mobilité
`src/components/Activity/EcoMobilitySection.tsx:28-40`
- Durées trajets TC/vélo sont mockées
- Pas de vraie API STAS/Vélivert

### 7.3 Logo Header incohérent
- Spec : h-8 mobile, h-9 desktop
- Réel : h-14 mobile, h-16 desktop (+75% trop grand)
- Fichier : `src/components/common/HeaderLogo.tsx:31`

### 7.4 Dashboard grid-cols-11 invalide
`src/pages/CollectiviteDashboard.tsx:473`
- Tailwind n'a pas `grid-cols-11`
- Tabs cassés sur desktop

---

## 8. REQUÊTES SUPABASE UTILES

### Vérifier les 29 activités
```sql
SELECT id, title, is_published, organism_name, categories, price_base
FROM activities
WHERE is_published = true
ORDER BY title;
```

### Activités sans organisme
```sql
SELECT id, title
FROM activities
WHERE is_published = true
  AND organism_name IS NULL;
```

### Aides financières en base
```sql
SELECT id, name, amount, amount_type
FROM financial_aids
ORDER BY name;
```

### Score complétude activités
```sql
SELECT title,
  (CASE WHEN description IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN categories IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN age_min IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN price_base IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN city IS NOT NULL THEN 1 ELSE 0 END) as score
FROM activities
WHERE is_published = true
ORDER BY score ASC;
```

---

## 9. COMMANDES GIT

### Cloner et setup
```bash
git clone https://github.com/Amilcard/flooow-connect-8938a98d.git
cd flooow-connect-8938a98d
npm install
```

### Branches
```bash
# Branche de dev Claude
git checkout claude/flooow-connect-audit-01Ffyh9JC6NV6Qa7c2wS4S6j

# Sync depuis main
git pull origin main --rebase

# Push (avec retry si erreur réseau)
git push -u origin claude/flooow-connect-audit-01Ffyh9JC6NV6Qa7c2wS4S6j
```

### Workflow auto-sync
Le fichier `.github/workflows/auto-sync-claude.yml` merge automatiquement les branches `claude/*` vers `main` après push.

---

## 10. CONTACTS / RESSOURCES

| Ressource | Lien |
|-----------|------|
| GitHub Issues | https://github.com/Amilcard/flooow-connect-8938a98d/issues |
| Supabase Dashboard | https://supabase.com/dashboard/project/kbrgwezkjaakoecispom |
| Tailwind Docs | https://tailwindcss.com/docs |
| Shadcn/ui | https://ui.shadcn.com |
| TanStack Query | https://tanstack.com/query/latest |

---

## 11. CHECKLIST REPRISE SESSION

Avant de commencer une nouvelle session :

- [ ] Lire ce document en entier
- [ ] Vérifier la branche active (`claude/flooow-connect-audit-*`)
- [ ] `git pull origin main` pour être à jour
- [ ] Vérifier que les 29 activités sont présentes
- [ ] NE PAS modifier le schéma Supabase
- [ ] Protéger le reste à charge (toujours ≥ 0)
- [ ] Utiliser `is_published` (pas `published`)
- [ ] Utiliser `categories` (pas `category`)

---

**Fin du document de passation**
