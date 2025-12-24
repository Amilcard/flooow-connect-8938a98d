# Supabase Security Advisor — Audit RLS Complet

**Date**: 2024-12-24
**Branche**: `claude/fix-merge-conflict-eveIb`
**Statut**: Audit + Patch baseline appliqué

---

## D1 — Rapport d'Audit

### Tableau 1: Matrice Usage Frontend

| Table | Used Frontend | Fichiers | Access Path | Risk if Locked |
|-------|---------------|----------|-------------|----------------|
| `profiles` | ✅ OUI (27 refs) | useAuth, useTerritory, ProfileEdit, Booking, Index, etc. | supabase-js | 🔴 HIGH |
| `children` | ✅ OUI (30 refs) | MesEnfants, Booking, WhoFilter, KidAddModal, etc. | supabase-js | 🔴 HIGH |
| `activities` | ✅ OUI (17 refs) | useActivities, ActivityDetail, Booking, ActivitiesMap | supabase-js | 🔴 HIGH |
| `availability_slots` | ✅ OUI (4 refs) | Booking, ActivityDetail, Covoiturage | supabase-js | 🔴 HIGH |
| `activity_sessions` | ✅ OUI (2 refs) | Booking, ActivityDetail | supabase-js | 🟡 MEDIUM |
| `bookings` | ✅ OUI (7 refs) | BookingStatus, ValidationParentale, ChildDashboard | supabase-js | 🔴 HIGH |
| `territories` | ✅ OUI (8 refs) | useTerritory, TerritoryCheck, OnboardingProfileForm | supabase-js | 🔴 HIGH |
| `user_roles` | ✅ OUI (11 refs) | Index, DashboardRedirect, RoleProtectedRoute | supabase-js | 🔴 HIGH |
| `structures` | ✅ OUI (5 refs) | StructureAuth, StructureDashboard, StructureActivityForm | supabase-js | 🟡 MEDIUM |
| `notifications` | ✅ OUI (5 refs) | useNotifications | supabase-js | 🟡 MEDIUM |
| `financial_aids` | ✅ OUI (2 refs) | FinancialAidSelector, FinancialAidBadges | supabase-js | 🟡 MEDIUM |
| `events` | ✅ OUI (1 ref) | useEventLogger (INSERT only) | supabase-js | 🟢 LOW |
| `families` | ❌ NON | - | - | 🟢 LOW |
| `reservations` | ❌ NON | (types only) | - | 🟢 LOW |
| `collectivities` | ❌ NON | (types only) | - | 🟢 LOW |
| `financial_partners` | ❌ NON | (types only) | - | 🟢 LOW |
| `registrations` | ❌ NON | (types only) | - | 🟢 LOW |
| `payments` | ❌ NON | (types only) | - | 🟢 LOW |
| `reviews` | ❌ NON | (edge function only) | service_role | 🟢 LOW |
| `favorites` | ❌ NON | (favorite_events used instead) | - | 🟢 LOW |
| `messages` | ❌ NON | - | - | 🟢 LOW |
| `documents` | ❌ NON | - | - | 🟢 LOW |
| `api_keys` | ❌ NON | - | - | 🟢 LOW |
| `webhooks` | ❌ NON | - | - | 🟢 LOW |
| `system_settings` | ❌ NON | - | - | 🟢 LOW |
| `audit_logs` | ❌ NON | - | - | 🟢 LOW |
| `white_labels` | ❌ NON | - | - | 🟢 LOW |
| `search_history` | ❌ NON | - | - | 🟢 LOW |
| `organisms` | ❌ NON | - | - | 🟢 LOW |
| `transport_stations` | ❌ NON | - | - | 🟢 LOW |
| `activity_media` | ❌ NON | - | - | 🟢 LOW |
| `mobility_choices` | ❌ NON | - | - | 🟢 LOW |

---

### Tableau 2: Classification par Risque

| Catégorie | Tables | Description |
|-----------|--------|-------------|
| **C1 - Ultra Sensibles** | `api_keys`, `webhooks`, `system_settings`, `audit_logs`, `white_labels` | Données système/admin - JAMAIS exposées à anon/authenticated |
| **C2 - Métier Utilisateur** | `profiles`, `children`, `families`, `bookings`, `notifications`, `reviews`, `favorites`, `reservations`, `registrations`, `payments`, `messages`, `documents`, `search_history` | Données personnelles - RLS avec policies owner |
| **C3 - Catalogue Public** | `activities`, `availability_slots`, `activity_sessions`, `territories`, `structures`, `organisms`, `financial_aids`, `activity_media`, `transport_stations`, `events`, `collectivities`, `financial_partners`, `user_roles` | Données publiques/catalogue - SELECT public OK, write verrouillé |

---

### Tableau 3: Statut RLS Actuel (Post-Patch)

| Table | RLS Enabled | Policies |
|-------|-------------|----------|
| `profiles` | ✅ | `profiles_select_own`, `profiles_update_own`, `profiles_insert_own`, `profiles_service_role_all` |
| `children` | ✅ | `children_select_own`, `children_insert_own`, `children_update_own`, `children_delete_own`, `children_service_role_all` |
| `reviews` | ✅ | `reviews_select_verified`, `reviews_select_own`, `reviews_insert_own`, `reviews_update_own`, `reviews_delete_own`, `reviews_service_role_all` |
| `financial_aids` | ✅ | `financial_aids_select_authenticated`, `financial_aids_service_role_all` |
| `reservations` | ✅ | (none - deny all) |
| `collectivities` | ✅ | (none - deny all) |
| `financial_partners` | ✅ | (none - deny all) |
| `registrations` | ✅ | (none - deny all) |
| `payments` | ✅ | (none - deny all) |
| `favorites` | ✅ | (none - deny all) |

---

### Tableau 4: Vues Security Definer (Corrigées)

| Vue | Avant | Après | Impact |
|-----|-------|-------|--------|
| `activities_with_age_groups` | security_definer | security_invoker=true | Aucun (vue non appelée directement) |
| `vw_fratrie_groups` | security_definer | security_invoker=true | Aucun (vue non appelée directement) |
| `vw_inscriptions_stats` | security_definer | security_invoker=true | Aucun (vue non appelée directement) |
| `vw_enfants_infos_sante` | security_definer | security_invoker=true | Aucun (vue non appelée directement) |

---

## D2 — Patch Baseline SAFE (C1)

### Tables C1 à verrouiller (non utilisées par frontend)

```sql
-- PATCH C1: Verrouiller tables ultra-sensibles
-- Ces tables ne sont PAS utilisées par le frontend

REVOKE ALL ON TABLE public.api_keys FROM anon, authenticated;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.webhooks FROM anon, authenticated;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.system_settings FROM anon, authenticated;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.audit_logs FROM anon, authenticated;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.white_labels FROM anon, authenticated;
ALTER TABLE public.white_labels ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.search_history FROM anon, authenticated;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.messages FROM anon, authenticated;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.documents FROM anon, authenticated;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.mobility_choices FROM anon, authenticated;
ALTER TABLE public.mobility_choices ENABLE ROW LEVEL SECURITY;
```

---

## D3 — Plan C2/C3 (Non Appliqué - Validation Requise)

### Tables C2 nécessitant policies additionnelles

| Table | Owner Column | Policy Proposée |
|-------|--------------|-----------------|
| `families` | `profile_id`, `user_id` | SELECT/UPDATE/DELETE WHERE profile_id = auth.uid() OR user_id = auth.uid() |
| `bookings` | via `children.family_id` | SELECT WHERE child_id IN (enfants de la famille) |
| `notifications` | `profile_id` | SELECT/UPDATE/DELETE WHERE profile_id = auth.uid() |

### Tables C3 nécessitant policies publiques

| Table | Policy Proposée |
|-------|-----------------|
| `activities` | SELECT public (is_published=true), INSERT/UPDATE/DELETE via structure owner |
| `availability_slots` | SELECT public, write via activity owner |
| `territories` | SELECT public, write service_role only |
| `user_roles` | SELECT own roles, write service_role only |
| `structures` | SELECT public, write via structure owner |

---

## D4 — Scripts SQL Appliqués

### Migration 1: Lock Unused Tables
```
supabase/migrations/20241224_security_step1_lock_unused_tables.sql
```

### Migration 2: User Tables RLS
```
supabase/migrations/20241224_security_step2_user_tables_rls.sql
```

### Migration 3: Fix Views
```
supabase/migrations/20241224_security_step3_fix_views.sql
```

---

## Checklist de Tests

- [x] Build frontend OK
- [ ] Smoke test: Connexion utilisateur
- [ ] Smoke test: Affichage profil
- [ ] Smoke test: Liste des enfants
- [ ] Smoke test: Recherche activités
- [ ] Smoke test: Détail activité
- [ ] Smoke test: Simulateur aides
- [ ] Smoke test: Booking flow

---

## Rollback

En cas de régression, exécuter les scripts de rollback inclus dans chaque fichier de migration.
