# 🔓 CORRECTION: Activer l'accès public aux activités et événements

## ⚠️ PROBLÈME IDENTIFIÉ

Les utilisateurs **non connectés** ne peuvent pas voir :
- ✗ Les activités sur la page d'accueil
- ✗ Les événements de "Ma ville mon actu"

**Cause :** Les politiques RLS (Row Level Security) de Supabase bloquent l'accès aux utilisateurs anonymes.

---

## ✅ SOLUTION

Une nouvelle migration a été créée : `supabase/migrations/20251115160000_public_access_activities_events.sql`

Cette migration permet aux visiteurs **non connectés** de consulter :
- ✅ Les activités publiées
- ✅ Les créneaux disponibles
- ✅ Les structures organisatrices
- ✅ Les événements territoriaux publiés

---

## 📝 COMMENT APPLIQUER LA MIGRATION

### Option 1 : Via le Dashboard Supabase (RECOMMANDÉ)

1. **Connectez-vous au Dashboard Supabase**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Ouvrez l'éditeur SQL**
   - Menu latéral → SQL Editor
   - Cliquez sur "+ New query"

3. **Copiez-collez le contenu du fichier suivant :**
   ```
   supabase/migrations/20251115160000_public_access_activities_events.sql
   ```

4. **Exécutez la requête**
   - Cliquez sur "Run" ou appuyez sur `Ctrl+Enter`
   - Vérifiez qu'il n'y a pas d'erreurs

---

### Option 2 : Via Supabase CLI (si disponible)

Si vous avez Supabase CLI installé localement :

```bash
# Se placer dans le répertoire du projet
cd /path/to/flooow-connect

# Appliquer la migration
supabase db push
```

---

## ✅ VÉRIFICATION

Après avoir appliqué la migration, vérifiez que les politiques sont actives :

### Dans Supabase Dashboard :

1. **Allez dans** : Database → Policies

2. **Vérifiez que ces politiques existent :**

   **Table `activities`** :
   - ✅ "Activities visible to all authenticated users" (existante)
   - ✅ "Activities visible to anonymous users" (NOUVELLE)

   **Table `availability_slots`** :
   - ✅ "Slots visible to all authenticated users" (existante)
   - ✅ "Slots visible to anonymous users" (NOUVELLE)

   **Table `structures`** :
   - ✅ "Structures visible to all authenticated users" (existante)
   - ✅ "Structures visible to anonymous users" (NOUVELLE)

   **Table `territory_events`** :
   - ✅ "Territory events visible to authenticated users" (NOUVELLE)
   - ✅ "Territory events visible to anonymous users" (NOUVELLE)

---

## 🧪 TEST

Une fois la migration appliquée :

1. **Ouvrez votre application en navigation privée** (sans être connecté)

2. **Page d'accueil** :
   - ✅ Les activités "à la une" doivent apparaître
   - ✅ Les images doivent être visibles

3. **"Ma ville mon actu"** :
   - ✅ Cliquez depuis l'accueil sur "Ma ville, mon actu"
   - ✅ Les événements doivent s'afficher

4. **"Mes trajets"** (Éco-mobilité) :
   - ✅ Doit rester accessible

---

## 🔒 SÉCURITÉ

Ces modifications sont **sûres** :

- ✅ Les utilisateurs anonymes peuvent **SEULEMENT lire** (SELECT)
- ✅ Seules les activités/événements **publiés** sont visibles
- ✅ Les utilisateurs anonymes **ne peuvent PAS** :
  - Créer des activités
  - Modifier des données
  - Voir des informations privées
  - Réserver (nécessite toujours une connexion)

---

## 💡 POURQUOI CETTE APPROCHE ?

**Avant :**
- Les visiteurs devaient créer un compte juste pour voir les activités
- Frein à l'inscription

**Après :**
- Les visiteurs découvrent les activités disponibles
- Ils s'inscrivent **après** avoir vu l'intérêt du service
- Meilleur taux de conversion !

---

## 🆘 EN CAS DE PROBLÈME

Si après application de la migration, les activités ne s'affichent toujours pas :

### 1. Vérifier les données

```sql
-- Dans SQL Editor, vérifier qu'il y a des activités publiées :
SELECT count(*) FROM activities WHERE published = true;

-- Vérifier qu'il y a des événements publiés :
SELECT count(*) FROM territory_events WHERE published = true;
```

### 2. Vérifier les politiques RLS

```sql
-- Lister toutes les politiques sur activities
SELECT * FROM pg_policies WHERE tablename = 'activities';

-- Lister toutes les politiques sur territory_events
SELECT * FROM pg_policies WHERE tablename = 'territory_events';
```

### 3. Test direct

Testez l'accès anonyme directement dans le SQL Editor :

```sql
-- Se mettre en mode anonyme (anon role)
SET ROLE anon;

-- Essayer de lire les activités
SELECT id, title, published FROM activities LIMIT 5;

-- Réinitialiser le rôle
RESET ROLE;
```

Si la requête retourne des résultats → Les politiques fonctionnent ✅

Si erreur "permission denied" → Les politiques ne sont pas encore appliquées ❌

---

## 📞 BESOIN D'AIDE ?

Si vous rencontrez des difficultés :
1. Vérifiez les logs dans Supabase Dashboard → Logs
2. Assurez-vous que la migration a bien été exécutée sans erreur
3. Vérifiez que la colonne `published` existe sur la table `activities`
