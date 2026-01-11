# Proposition: Sessions Multiples pour Activités VACANCES

**Date:** 2026-01-11
**Version:** 2.0
**Contexte:** Permettre plusieurs sessions (occurrences datées) pour les activités VACANCES avec hébergement

---

## 1. Calendrier Vacances Zone A (Lyon/Saint-Étienne) 2026

| Période | Dates | Durée |
|---------|-------|-------|
| **Hiver** | 07/02 - 22/02/2026 | 16 jours |
| **Printemps** | 04/04 - 19/04/2026 | 16 jours |
| **Été** | 04/07 - 31/08/2026 | 59 jours |
| **Toussaint** | 17/10 - 01/11/2026 | 16 jours |
| **Noël** | 19/12/2026 - 04/01/2027 | 17 jours |

---

## 2. Sessions Proposées par Activité

### 2.1 Camp ski – Séjour montagne hiver (560€ / 6 jours)

| Session | Dates | Période | Places |
|---------|-------|---------|--------|
| Hiver S1 | **09 → 15 février 2026** | hiver_2026 | 24 |
| Hiver S2 | **16 → 22 février 2026** | hiver_2026 | 24 |

**Total:** 2 sessions • 48 places

---

### 2.2 Camp nature – Découverte environnement (360€ / 5 jours)

| Session | Dates | Période | Places |
|---------|-------|---------|--------|
| Printemps S1 | **06 → 11 avril 2026** | printemps_2026 | 24 |
| Printemps S2 | **13 → 18 avril 2026** | printemps_2026 | 24 |
| Été S1 | **06 → 11 juillet 2026** | été_2026 | 24 |
| Été S2 | **13 → 18 juillet 2026** | été_2026 | 24 |
| Été S3 | **20 → 25 juillet 2026** | été_2026 | 24 |
| Été S4 | **27 juil. → 01 août 2026** | été_2026 | 24 |
| Été S5 | **03 → 08 août 2026** | été_2026 | 24 |
| Été S6 | **10 → 15 août 2026** | été_2026 | 24 |
| Été S7 | **17 → 22 août 2026** | été_2026 | 24 |
| Toussaint S1 | **19 → 24 octobre 2026** | toussaint_2026 | 24 |

**Total:** 10 sessions • 240 places

---

### 2.3 Colonie de vacances été – Montagne (550€ / 12 jours)

| Session | Dates | Période | Places |
|---------|-------|---------|--------|
| Été S1 | **06 → 17 juillet 2026** | été_2026 | 30 |
| Été S2 | **18 → 29 juillet 2026** | été_2026 | 30 |
| Été S3 | **30 juil. → 10 août 2026** | été_2026 | 30 |
| Été S4 | **11 → 22 août 2026** | été_2026 | 30 |

**Total:** 4 sessions • 120 places

---

### 2.4 Mini-séjour mer – Découverte océan (360€ / 5 jours)

| Session | Dates | Période | Places |
|---------|-------|---------|--------|
| Été S1 | **06 → 11 juillet 2026** | été_2026 | 20 |
| Été S2 | **13 → 18 juillet 2026** | été_2026 | 20 |
| Été S3 | **20 → 25 juillet 2026** | été_2026 | 20 |
| Été S4 | **27 juil. → 01 août 2026** | été_2026 | 20 |
| Été S5 | **03 → 08 août 2026** | été_2026 | 20 |
| Été S6 | **10 → 15 août 2026** | été_2026 | 20 |
| Été S7 | **17 → 22 août 2026** | été_2026 | 20 |

**Total:** 7 sessions • 140 places

---

## 3. Récapitulatif Global

| Activité | Durée | Sessions | Capacité |
|----------|-------|----------|----------|
| Camp ski | 6 jours | 2 | 48 |
| Camp nature | 5 jours | 10 | 240 |
| Colonie été | 12 jours | 4 | 120 |
| Mini-séjour mer | 5 jours | 7 | 140 |
| **TOTAL** | - | **23** | **548** |

---

## 4. Modèle de Données

### Option Recommandée: `availability_slots`

```sql
-- Enrichissement table existante
ALTER TABLE availability_slots ADD COLUMN IF NOT EXISTS vacation_period TEXT;
ALTER TABLE availability_slots ADD COLUMN IF NOT EXISTS week_label TEXT;
ALTER TABLE availability_slots ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
ALTER TABLE availability_slots ADD COLUMN IF NOT EXISTS price_override NUMERIC(10,2);

COMMENT ON COLUMN availability_slots.vacation_period IS 'hiver_2026, printemps_2026, été_2026, toussaint_2026';
COMMENT ON COLUMN availability_slots.week_label IS 'Semaine 1, Semaine 2, etc.';
```

---

## 5. Migration SQL

### 5.1 Camp ski (6 jours)

```sql
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining, vacation_period, week_label)
SELECT id, '2026-02-09 09:00:00+01'::timestamptz, '2026-02-15 17:00:00+01'::timestamptz, 24, 24, 'hiver_2026', 'Semaine 1'
FROM activities WHERE title = 'Camp ski – Séjour montagne hiver'
UNION ALL
SELECT id, '2026-02-16 09:00:00+01'::timestamptz, '2026-02-22 17:00:00+01'::timestamptz, 24, 24, 'hiver_2026', 'Semaine 2'
FROM activities WHERE title = 'Camp ski – Séjour montagne hiver';
```

### 5.2 Camp nature (5 jours)

```sql
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining, vacation_period, week_label)
SELECT id, '2026-04-06 09:00:00+02'::timestamptz, '2026-04-11 17:00:00+02'::timestamptz, 24, 24, 'printemps_2026', 'Printemps S1' FROM activities WHERE title = 'Camp nature – Découverte environnement'
UNION ALL SELECT id, '2026-04-13 09:00:00+02'::timestamptz, '2026-04-18 17:00:00+02'::timestamptz, 24, 24, 'printemps_2026', 'Printemps S2' FROM activities WHERE title = 'Camp nature – Découverte environnement'
UNION ALL SELECT id, '2026-07-06 09:00:00+02'::timestamptz, '2026-07-11 17:00:00+02'::timestamptz, 24, 24, 'été_2026', 'Été S1' FROM activities WHERE title = 'Camp nature – Découverte environnement'
UNION ALL SELECT id, '2026-07-13 09:00:00+02'::timestamptz, '2026-07-18 17:00:00+02'::timestamptz, 24, 24, 'été_2026', 'Été S2' FROM activities WHERE title = 'Camp nature – Découverte environnement'
UNION ALL SELECT id, '2026-07-20 09:00:00+02'::timestamptz, '2026-07-25 17:00:00+02'::timestamptz, 24, 24, 'été_2026', 'Été S3' FROM activities WHERE title = 'Camp nature – Découverte environnement'
UNION ALL SELECT id, '2026-07-27 09:00:00+02'::timestamptz, '2026-08-01 17:00:00+02'::timestamptz, 24, 24, 'été_2026', 'Été S4' FROM activities WHERE title = 'Camp nature – Découverte environnement'
UNION ALL SELECT id, '2026-08-03 09:00:00+02'::timestamptz, '2026-08-08 17:00:00+02'::timestamptz, 24, 24, 'été_2026', 'Été S5' FROM activities WHERE title = 'Camp nature – Découverte environnement'
UNION ALL SELECT id, '2026-08-10 09:00:00+02'::timestamptz, '2026-08-15 17:00:00+02'::timestamptz, 24, 24, 'été_2026', 'Été S6' FROM activities WHERE title = 'Camp nature – Découverte environnement'
UNION ALL SELECT id, '2026-08-17 09:00:00+02'::timestamptz, '2026-08-22 17:00:00+02'::timestamptz, 24, 24, 'été_2026', 'Été S7' FROM activities WHERE title = 'Camp nature – Découverte environnement'
UNION ALL SELECT id, '2026-10-19 09:00:00+02'::timestamptz, '2026-10-24 17:00:00+02'::timestamptz, 24, 24, 'toussaint_2026', 'Toussaint S1' FROM activities WHERE title = 'Camp nature – Découverte environnement';
```

### 5.3 Colonie été (12 jours)

```sql
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining, vacation_period, week_label)
SELECT id, '2026-07-06 09:00:00+02'::timestamptz, '2026-07-17 17:00:00+02'::timestamptz, 30, 30, 'été_2026', 'Été S1' FROM activities WHERE title = 'Colonie de vacances été – Montagne'
UNION ALL SELECT id, '2026-07-18 09:00:00+02'::timestamptz, '2026-07-29 17:00:00+02'::timestamptz, 30, 30, 'été_2026', 'Été S2' FROM activities WHERE title = 'Colonie de vacances été – Montagne'
UNION ALL SELECT id, '2026-07-30 09:00:00+02'::timestamptz, '2026-08-10 17:00:00+02'::timestamptz, 30, 30, 'été_2026', 'Été S3' FROM activities WHERE title = 'Colonie de vacances été – Montagne'
UNION ALL SELECT id, '2026-08-11 09:00:00+02'::timestamptz, '2026-08-22 17:00:00+02'::timestamptz, 30, 30, 'été_2026', 'Été S4' FROM activities WHERE title = 'Colonie de vacances été – Montagne';
```

### 5.4 Mini-séjour mer (5 jours)

```sql
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining, vacation_period, week_label)
SELECT id, '2026-07-06 09:00:00+02'::timestamptz, '2026-07-11 17:00:00+02'::timestamptz, 20, 20, 'été_2026', 'Été S1' FROM activities WHERE title = 'Mini-séjour mer – Découverte océan'
UNION ALL SELECT id, '2026-07-13 09:00:00+02'::timestamptz, '2026-07-18 17:00:00+02'::timestamptz, 20, 20, 'été_2026', 'Été S2' FROM activities WHERE title = 'Mini-séjour mer – Découverte océan'
UNION ALL SELECT id, '2026-07-20 09:00:00+02'::timestamptz, '2026-07-25 17:00:00+02'::timestamptz, 20, 20, 'été_2026', 'Été S3' FROM activities WHERE title = 'Mini-séjour mer – Découverte océan'
UNION ALL SELECT id, '2026-07-27 09:00:00+02'::timestamptz, '2026-08-01 17:00:00+02'::timestamptz, 20, 20, 'été_2026', 'Été S4' FROM activities WHERE title = 'Mini-séjour mer – Découverte océan'
UNION ALL SELECT id, '2026-08-03 09:00:00+02'::timestamptz, '2026-08-08 17:00:00+02'::timestamptz, 20, 20, 'été_2026', 'Été S5' FROM activities WHERE title = 'Mini-séjour mer – Découverte océan'
UNION ALL SELECT id, '2026-08-10 09:00:00+02'::timestamptz, '2026-08-15 17:00:00+02'::timestamptz, 20, 20, 'été_2026', 'Été S6' FROM activities WHERE title = 'Mini-séjour mer – Découverte océan'
UNION ALL SELECT id, '2026-08-17 09:00:00+02'::timestamptz, '2026-08-22 17:00:00+02'::timestamptz, 20, 20, 'été_2026', 'Été S7' FROM activities WHERE title = 'Mini-séjour mer – Découverte océan';
```

---

## 6. Prochaines Actions

- [ ] Valider le modèle de données (`availability_slots`)
- [ ] Créer migration Supabase officielle
- [ ] Insérer les 23 sessions
- [ ] Adapter UI pour afficher liste des sessions
- [ ] Tester calcul aides par session
