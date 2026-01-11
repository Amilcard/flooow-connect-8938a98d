# Proposition: Sessions Multiples pour Activités VACANCES

**Date:** 2026-01-11
**Contexte:** Permettre plusieurs sessions (occurrences datées) pour les activités VACANCES avec hébergement

---

## 1. État Actuel

### Activités VACANCES avec Hébergement Identifiées

| Activité | Type | Durée | Prix | Session Actuelle |
|----------|------|-------|------|------------------|
| Camp nature – Découverte environnement | sejour_hebergement | 7j → 5j | 360€ | 1 seule (été) |
| Camp ski – Séjour montagne hiver | sejour_hebergement | 7j → 5j | 560€ | 1 seule (hiver) |
| Colonie de vacances été – Montagne | sejour_hebergement | 14j | 550€ | 1 seule (été) |
| Mini-séjour mer – Découverte océan | sejour_hebergement | 5j | 360€ | 1 seule (été) |

### Stages VACANCES (sans hébergement)

| Activité | Type | Durée | Prix | Session Actuelle |
|----------|------|-------|------|------------------|
| Stage dessin – Techniques artistiques | stage_journee | 5j | 360€ | 1 seule |
| Stage multi-sports – Été | stage_journee | 5j | 410€ | 1 seule |
| Stage photo – Initiation photographie | stage_journee | 3j | 360€ | 1 seule |
| Stage sciences – Expériences et découvertes | stage_journee | 5j | 360€ | 1 seule |

### Problème

Actuellement, chaque activité VACANCES n'a qu'**une seule date** stockée dans `activities.date_debut/date_fin`. Les familles ne peuvent réserver que sur cette unique période.

---

## 2. Calendrier Vacances Zone A (Lyon/Saint-Étienne) 2026

| Période | Dates | Durée |
|---------|-------|-------|
| **Hiver** | 07/02 - 22/02/2026 | 16 jours |
| **Printemps** | 04/04 - 19/04/2026 | 16 jours |
| **Été** | 04/07 - 31/08/2026 | 59 jours |
| **Toussaint** | 17/10 - 01/11/2026 | 16 jours |
| **Noël** | 19/12/2026 - 04/01/2027 | 17 jours |

---

## 3. Modèle de Données Proposé

### Option A: Utiliser `availability_slots` (Recommandé)

```sql
-- Structure existante à enrichir
ALTER TABLE availability_slots ADD COLUMN IF NOT EXISTS vacation_period TEXT;
ALTER TABLE availability_slots ADD COLUMN IF NOT EXISTS week_label TEXT;
ALTER TABLE availability_slots ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';

-- Exemple d'insertion pour Camp nature
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining, vacation_period, week_label)
VALUES
  -- Session Été Semaine 1
  ((SELECT id FROM activities WHERE title = 'Camp nature – Découverte environnement'),
   '2026-07-06 09:00:00+02', '2026-07-11 17:00:00+02', 24, 24, 'été_2026', 'Semaine 1'),
  -- Session Été Semaine 2
  ((SELECT id FROM activities WHERE title = 'Camp nature – Découverte environnement'),
   '2026-07-13 09:00:00+02', '2026-07-18 17:00:00+02', 24, 24, 'été_2026', 'Semaine 2');
```

### Option B: Utiliser `activity_sessions` (Alternative)

```sql
-- Ajouter les colonnes nécessaires
ALTER TABLE activity_sessions ADD COLUMN IF NOT EXISTS vacation_period TEXT;
ALTER TABLE activity_sessions ADD COLUMN IF NOT EXISTS session_label TEXT;
ALTER TABLE activity_sessions ADD COLUMN IF NOT EXISTS booking_status TEXT DEFAULT 'open';
```

---

## 4. Sessions Proposées par Activité

### 4.1 Camp ski – Séjour montagne hiver (560€/5j)

| Session | Dates | Période | Places |
|---------|-------|---------|--------|
| Hiver S1 | 09/02 - 14/02/2026 | hiver_2026 | 24 |
| Hiver S2 | 16/02 - 21/02/2026 | hiver_2026 | 24 |

### 4.2 Camp nature – Découverte environnement (360€/5j)

| Session | Dates | Période | Places |
|---------|-------|---------|--------|
| Printemps S1 | 06/04 - 11/04/2026 | printemps_2026 | 24 |
| Printemps S2 | 13/04 - 18/04/2026 | printemps_2026 | 24 |
| Été S1 | 06/07 - 11/07/2026 | été_2026 | 24 |
| Été S2 | 13/07 - 18/07/2026 | été_2026 | 24 |
| Été S3 | 20/07 - 25/07/2026 | été_2026 | 24 |
| Été S4 | 27/07 - 01/08/2026 | été_2026 | 24 |
| Toussaint S1 | 19/10 - 24/10/2026 | toussaint_2026 | 24 |

### 4.3 Colonie de vacances été – Montagne (550€/14j)

| Session | Dates | Période | Places |
|---------|-------|---------|--------|
| Été S1 | 06/07 - 19/07/2026 | été_2026 | 30 |
| Été S2 | 20/07 - 02/08/2026 | été_2026 | 30 |
| Été S3 | 03/08 - 16/08/2026 | été_2026 | 30 |
| Été S4 | 17/08 - 30/08/2026 | été_2026 | 30 |

### 4.4 Mini-séjour mer – Découverte océan (360€/5j)

| Session | Dates | Période | Places |
|---------|-------|---------|--------|
| Été S1 | 06/07 - 11/07/2026 | été_2026 | 20 |
| Été S2 | 13/07 - 18/07/2026 | été_2026 | 20 |
| Été S3 | 20/07 - 25/07/2026 | été_2026 | 20 |
| Été S4 | 17/08 - 22/08/2026 | été_2026 | 20 |
| Été S5 | 24/08 - 29/08/2026 | été_2026 | 20 |

### 4.5 Stage multi-sports – Été (410€/5j)

| Session | Dates | Période | Places |
|---------|-------|---------|--------|
| Printemps S1 | 06/04 - 10/04/2026 | printemps_2026 | 30 |
| Été S1 | 06/07 - 10/07/2026 | été_2026 | 30 |
| Été S2 | 13/07 - 17/07/2026 | été_2026 | 30 |
| Été S3 | 20/07 - 24/07/2026 | été_2026 | 30 |
| Été S4 | 17/08 - 21/08/2026 | été_2026 | 30 |
| Toussaint S1 | 19/10 - 23/10/2026 | toussaint_2026 | 30 |

---

## 5. Migration Sécurisée (Sans Régression)

### Étape 1: Enrichir la table `availability_slots`

```sql
-- Ajout colonnes (non destructif)
ALTER TABLE availability_slots ADD COLUMN IF NOT EXISTS vacation_period TEXT;
ALTER TABLE availability_slots ADD COLUMN IF NOT EXISTS week_label TEXT;
ALTER TABLE availability_slots ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
ALTER TABLE availability_slots ADD COLUMN IF NOT EXISTS price_override NUMERIC(10,2);

COMMENT ON COLUMN availability_slots.vacation_period IS 'Période de vacances: hiver_2026, printemps_2026, été_2026, toussaint_2026, noel_2026';
COMMENT ON COLUMN availability_slots.week_label IS 'Label lisible: Semaine 1, Semaine 2, etc.';
```

### Étape 2: Créer sessions par défaut depuis date_debut/date_fin existants

```sql
-- Pour chaque activité VACANCES sans slot, créer un slot depuis date_debut/date_fin
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining, vacation_period)
SELECT
  a.id,
  a.date_debut::timestamptz,
  a.date_fin::timestamptz,
  COALESCE(a.max_participants, 24),
  COALESCE(a.max_participants, 24),
  'été_2026'
FROM activities a
LEFT JOIN availability_slots s ON s.activity_id = a.id
WHERE a.period_type = 'vacances'
  AND a.vacation_type = 'sejour_hebergement'
  AND s.id IS NULL
  AND a.date_debut IS NOT NULL;
```

### Étape 3: Ajouter les nouvelles sessions

```sql
-- Exemple: Camp ski - 2 sessions hiver
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining, vacation_period, week_label)
SELECT
  id,
  '2026-02-09 09:00:00+01'::timestamptz,
  '2026-02-14 17:00:00+01'::timestamptz,
  24, 24,
  'hiver_2026',
  'Semaine 1'
FROM activities WHERE title = 'Camp ski – Séjour montagne hiver'
UNION ALL
SELECT
  id,
  '2026-02-16 09:00:00+01'::timestamptz,
  '2026-02-21 17:00:00+01'::timestamptz,
  24, 24,
  'hiver_2026',
  'Semaine 2'
FROM activities WHERE title = 'Camp ski – Séjour montagne hiver';
```

---

## 6. Adaptation UI

### Affichage Carte Activité

```
Avant: "Prochaine : 7 juil."
Après: "Prochaine session : 9 févr. (3 sessions disponibles)"
```

### Page Détail

```
┌─────────────────────────────────────────────────────┐
│ Sessions disponibles                                │
├─────────────────────────────────────────────────────┤
│ ○ 9-14 février 2026 (Semaine 1) - 18 places        │
│ ○ 16-21 février 2026 (Semaine 2) - 24 places       │
├─────────────────────────────────────────────────────┤
│ Sélectionnez une session pour voir le tarif        │
└─────────────────────────────────────────────────────┘
```

---

## 7. Récapitulatif Sessions Totales

| Activité | Sessions Actuelles | Sessions Proposées |
|----------|-------------------|-------------------|
| Camp ski | 1 | **2** (Hiver) |
| Camp nature | 1 | **7** (Printemps + Été + Toussaint) |
| Colonie été | 1 | **4** (Été) |
| Mini-séjour mer | 1 | **5** (Été) |
| Stage multi-sports | 1 | **6** (Printemps + Été + Toussaint) |

**Total sessions hébergement:** 5 → **24 sessions**

---

## 8. Prochaines Actions

1. [ ] Valider le modèle de données (availability_slots vs activity_sessions)
2. [ ] Créer la migration SQL pour enrichir la table
3. [ ] Insérer les sessions initiales depuis date_debut/date_fin
4. [ ] Insérer les nouvelles sessions multi-périodes
5. [ ] Adapter l'UI pour afficher la liste des sessions
6. [ ] Tester le calcul des aides par session
