# 🧪 VALIDATION TESTS - Correctifs Tracking & KPI

## ⚠️ ERREURS DÉTECTÉES

Vous avez utilisé **"ma_table"** qui est un placeholder d'exemple.
Vous avez utilisé **DBCC CHECKDB** qui est SQL Server (Supabase = PostgreSQL).

---

## ✅ VRAIES REQUÊTES À EXÉCUTER

### 1️⃣ Vérifier création des tables de tracking

```sql
-- Vérifier table search_logs existe
SELECT COUNT(*) as nb_lignes FROM search_logs;

-- Vérifier table activity_views existe  
SELECT COUNT(*) as nb_lignes FROM activity_views;

-- Vérifier colonnes ajoutées à bookings
SELECT 
  participation_confirmed,
  participation_confirmed_at,
  participation_confirmed_by
FROM bookings 
LIMIT 5;
```

---

### 2️⃣ Vérifier structure des tables

```sql
-- Colonnes de search_logs
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'search_logs'
ORDER BY ordinal_position;

-- Colonnes de activity_views
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'activity_views'
ORDER BY ordinal_position;
```

---

### 3️⃣ Vérifier les données trackées (après avoir utilisé l'app)

```sql
-- Dernières recherches
SELECT 
  search_query,
  filters_applied,
  results_count,
  created_at
FROM search_logs
ORDER BY created_at DESC
LIMIT 10;

-- Dernières vues d'activités
SELECT 
  activity_id,
  view_duration_seconds,
  created_at
FROM activity_views
ORDER BY created_at DESC
LIMIT 10;

-- Activités les plus vues (TOP 5)
SELECT 
  a.title,
  COUNT(av.id) as nb_vues
FROM activity_views av
JOIN activities a ON av.activity_id = a.id
GROUP BY a.id, a.title
ORDER BY nb_vues DESC
LIMIT 5;
```

---

### 4️⃣ Vérifier les indexes (performance)

```sql
-- Lister tous les indexes créés
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('search_logs', 'activity_views', 'bookings');
```

---

### 5️⃣ Vérifier RLS (Row Level Security)

```sql
-- Politiques RLS sur search_logs
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'search_logs';

-- Politiques RLS sur activity_views
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'activity_views';
```

---

### 6️⃣ Test calcul KPI (conversion rate)

```sql
-- Taux de conversion recherche → réservation
WITH stats AS (
  SELECT 
    (SELECT COUNT(*) FROM search_logs) as total_searches,
    (SELECT COUNT(*) FROM bookings) as total_bookings
)
SELECT 
  total_searches,
  total_bookings,
  CASE 
    WHEN total_searches > 0 
    THEN ROUND((total_bookings::numeric / total_searches::numeric) * 100, 2)
    ELSE 0 
  END as conversion_rate_pct
FROM stats;
```

---

## 🎯 RÉSULTATS ATTENDUS

| Requête | Résultat attendu |
|---------|------------------|
| COUNT search_logs | 0 (vide si app pas encore utilisée) |
| COUNT activity_views | 0 (vide si app pas encore utilisée) |
| Colonnes bookings | 3 nouvelles colonnes présentes |
| Indexes | 4 indexes créés (user_id, activity_id sur chaque table) |
| RLS policies | 2-3 policies par table |

---

## 🚨 SI ERREUR "relation does not exist"

Cela signifie que la **migration SQL n'a pas été exécutée**.

**Solution :**
1. Aller dans Lovable Cloud (Backend)
2. Onglet "Migrations" 
3. Exécuter la migration `20251028092339_df4e8315...`
4. Relancer les requêtes ci-dessus

---

## 📊 APRÈS TESTS MANUELS DE L'APP

Une fois que vous avez :
- Effectué 3-5 recherches sur l'app
- Consulté 3-5 fiches activités
- Créé 1-2 réservations

Relancez les requêtes section 3️⃣ pour voir les données réelles trackées.
