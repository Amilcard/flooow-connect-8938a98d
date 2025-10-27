# 🎯 RÉPONSE À L'AGENT IA - CONTOURNER RLS ET ADAPTER MIGRATIONS

Copiez-collez ce message à ChatGPT :

---

## ÉTAPE 1 : DÉSACTIVER TEMPORAIREMENT RLS POUR VOIR LES CATÉGORIES

La table `categories` existe mais est protégée par RLS (Row Level Security). Exécutez cette requête **en tant que superadmin** :

```sql
-- Désactiver temporairement RLS sur categories
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Voir toutes les catégories
SELECT id, name, slug FROM public.categories ORDER BY name;

-- Réactiver RLS immédiatement après
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
```

**IMPORTANT :** Copiez-moi le résultat de `SELECT id, name, slug FROM public.categories`.

---

## ÉTAPE 2 : SI LA REQUÊTE CI-DESSUS ÉCHOUE (permissions insuffisantes)

Essayez cette alternative sans désactiver RLS :

```sql
-- Contourner RLS avec une fonction SECURITY DEFINER temporaire
CREATE OR REPLACE FUNCTION public.get_all_categories()
RETURNS TABLE(id UUID, name TEXT, slug TEXT)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql AS $$
  SELECT id, name, slug FROM public.categories ORDER BY name;
$$;

-- Appeler la fonction
SELECT * FROM public.get_all_categories();

-- Supprimer la fonction après usage
DROP FUNCTION IF EXISTS public.get_all_categories();
```

**Copiez-moi le résultat.**

---

## ÉTAPE 3 : VÉRIFIER LE SCHÉMA COMPLET ACTIVITIES

```sql
-- Lister TOUTES les colonnes de activities avec leurs types
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'activities'
ORDER BY ordinal_position;
```

**Copiez-moi TOUT le résultat (toutes les colonnes).**

---

## ÉTAPE 4 : IDENTIFIER LA CATÉGORIE "SCOLARITÉ"

Une fois que vous avez la liste des catégories, cherchez :
- "Scolarité" ou "scolarite" ou "Scolaire"
- OU "Education" / "School" / "Academic"

**Notez l'ID** (UUID ou nombre) de cette catégorie.

---

## ÉTAPE 5 : ME TRANSMETTRE CES INFOS

Répondez-moi avec ce format :

```
Catégorie "Scolarité" :
- ID : [l'ID trouvé]
- Name : [le nom exact]

Autres catégories disponibles :
- [liste complète avec ID et nom]

Colonnes activities confirmées :
- organism_id : [type]
- category_id : [type]
- [autres colonnes importantes]
```

---

## ⏸️ EN ATTENDANT

Une fois ces infos reçues, je créerai des **migrations SQL 100% adaptées** à votre schéma réel qui utiliseront :
- `category_id` (au lieu de `category`)
- `organism_id` (au lieu de `structure_id`)
- Les bons UUIDs/IDs pour les catégories

**N'exécutez rien d'autre pour l'instant.**
