# Instructions : Appliquer les migrations et régénérer les types

## 1️⃣ Appliquer les migrations SQL sur Supabase

### Méthode recommandée : Via Supabase Studio (web)

1. **Ouvrir Supabase Studio**
   - Aller sur https://supabase.com/dashboard
   - Sélectionner votre projet `flooow-connect`

2. **Accéder au SQL Editor**
   - Menu latéral → `SQL Editor`
   - Cliquer `New query`

3. **Exécuter Migration 1** (3 axes partiels)
   - Ouvrir le fichier `supabase/migrations/20251026120000_complete_partial_axes.sql`
   - Copier tout le contenu (193 lignes)
   - Coller dans le SQL Editor
   - Cliquer `Run` ou `Ctrl+Enter`
   - ✅ Vérifier le message : "Migration terminée: X activités..."

4. **Exécuter Migration 2** (4 axes manquants)
   - Ouvrir le fichier `supabase/migrations/20251026121500_complete_missing_axes.sql`
   - Copier tout le contenu (304 lignes)
   - Coller dans le SQL Editor
   - Cliquer `Run` ou `Ctrl+Enter`
   - ✅ Vérifier le message : "Migration terminée: X enfants..."

### Alternative : Via Supabase CLI

```bash
# 1. Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# 2. Se connecter à Supabase
supabase login

# 3. Lier le projet local au projet Supabase
supabase link --project-ref YOUR_PROJECT_REF

# 4. Appliquer toutes les migrations
supabase db push

# Ou appliquer les migrations une par une
supabase db execute --file supabase/migrations/20251026120000_complete_partial_axes.sql
supabase db execute --file supabase/migrations/20251026121500_complete_missing_axes.sql
```

---

## 2️⃣ Régénérer les types TypeScript

### Méthode A : Via Supabase CLI (recommandé)

```bash
# Générer les types depuis le projet lié
supabase gen types typescript --linked > src/integrations/supabase/types.ts

# Ou en utilisant l'URL et la clé API
supabase gen types typescript --project-id YOUR_PROJECT_REF > src/integrations/supabase/types.ts
```

### Méthode B : Via Supabase Studio (manuelle)

1. Aller sur https://supabase.com/dashboard/project/YOUR_PROJECT/api
2. Section **"Generated types"** → onglet **"TypeScript"**
3. Copier tout le code TypeScript généré
4. Ouvrir `src/integrations/supabase/types.ts`
5. Remplacer tout le contenu par le code copié
6. Sauvegarder

### Méthode C : Script npm (à ajouter au package.json)

Ajouter dans `package.json` → `"scripts"`:
```json
"generate-types": "supabase gen types typescript --linked > src/integrations/supabase/types.ts"
```

Puis exécuter :
```bash
npm run generate-types
```

---

## 3️⃣ Vérifier que tout fonctionne

### Après avoir appliqué les migrations :

1. **Vérifier les nouvelles colonnes dans Supabase Studio**
   - Table `activities` : `activity_purpose`, `is_health_focused`, `is_apa`, `is_insertion_pro`, `complexity_score`, etc.
   - Table `children` : `sexe`
   - Table `profiles` : `price_blocked`, `seuil_prix_max`, `besoin_accompagnement`, `conseiller_assigne_id`
   - Table `bookings` : `reste_a_charge`, `abandon_raison_financiere`, `abandon_raison`, `documents_status`, `documents_incomplete`
   - Nouvelle table `accompagnements`

2. **Vérifier les vues créées**
   - `v_mixite_activities`
   - `v_non_recours_admin`
   - `v_non_recours_financier`
   - `v_insertion_pro_activities`
   - `v_kpis_nouveaux_axes`

3. **Vérifier les fonctions créées**
   - `refresh_mixite_stats()`
   - `calculate_reste_a_charge()`

### Après avoir régénéré les types :

1. **Compiler le projet**
   ```bash
   npm run build
   ```

2. **Vérifier qu'il n'y a pas d'erreurs TypeScript**
   ```bash
   npx tsc --noEmit
   ```

3. **Démarrer le serveur de dev**
   ```bash
   npm run dev
   ```

---

## 🎯 Résultat attendu

Une fois les 2 étapes terminées, vous aurez :

✅ **7 nouvelles colonnes sur `activities`**
- activity_purpose (soutien/raccrochage/orientation)
- is_health_focused + is_apa (santé)
- is_insertion_pro + insertion_type (15-25 ans)
- complexity_score (admin)
- taux_filles_inscrites (mixité)

✅ **1 nouvelle colonne sur `children`**
- sexe (F/M/X)

✅ **4 nouvelles colonnes sur `profiles`**
- price_blocked + seuil_prix_max (non-recours financier)
- besoin_accompagnement + conseiller_assigne_id (accompagnement)

✅ **5 nouvelles colonnes sur `bookings`**
- reste_a_charge + abandon_raison_financiere (finance)
- abandon_raison + documents_status + documents_incomplete (admin)

✅ **1 nouvelle table `accompagnements`**

✅ **5 nouvelles vues SQL** pour statistiques

✅ **2 nouvelles fonctions** pour calculs automatiques

---

## ⚠️ Important

- Les migrations sont **non-destructives** (ADD COLUMN IF NOT EXISTS)
- Toutes les colonnes sont **nullables** ou ont des **DEFAULT**
- **Aucune donnée existante n'est supprimée**
- Les RLS policies existantes ne sont **pas impactées**
- Certaines données sont **migrées automatiquement** (sexe depuis needs_json, détection activités santé/insertion)

---

## 🆘 En cas de problème

Si une migration échoue :

1. **Lire le message d'erreur** dans Supabase Studio
2. **Vérifier que la colonne n'existe pas déjà** (les migrations utilisent `IF NOT EXISTS`)
3. **Contacter le support** si l'erreur persiste

Si les types TypeScript ne se régénèrent pas :

1. Vérifier que Supabase CLI est bien installé : `supabase --version`
2. Vérifier que vous êtes bien connecté : `supabase status`
3. Utiliser la méthode manuelle (Méthode B) via Supabase Studio
