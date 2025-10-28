# 📚 GUIDE COMPLET DE LA BASE DE DONNÉES

## 🎯 Vue d'ensemble

Votre application est une **plateforme de réservation d'activités pour enfants** avec gestion des aides financières, des structures organisatrices, et du tracking analytique.

---

## 📊 LES TABLES PRINCIPALES

### 1️⃣ **profiles** (2 lignes)
**Objectif** : Stocker les informations des utilisateurs (parents, admins, structures)

| Colonne | Explication | Exemple concret |
|---------|-------------|-----------------|
| `id` | Identifiant unique de l'utilisateur | `a1b2c3d4-...` |
| `email` | Email de connexion | `parent@example.com` |
| `postal_code` | Code postal du domicile | `13001` |
| `quotient_familial` | Revenu pour calculer les aides | `850` (€/mois) |
| `account_status` | Statut du compte | `pending`, `validated`, `rejected` |
| `territory_id` | Territoire de résidence | Lien vers `territories` |
| `seuil_prix_max` | Prix maximum payable | `150.00` (€) |
| `validated_at` | Date de validation du compte | `2025-10-20 10:30:00` |

**💡 Exemple concret** : Quand un parent s'inscrit, une ligne `profiles` est créée avec son email, code postal, et quotient familial pour calculer ses aides.

---

### 2️⃣ **children** (16 lignes)
**Objectif** : Les enfants rattachés aux comptes parents

| Colonne | Explication | Exemple concret |
|---------|-------------|-----------------|
| `id` | Identifiant unique de l'enfant | `e5f6g7h8-...` |
| `user_id` | Parent propriétaire | Lien vers `profiles` |
| `first_name` | Prénom de l'enfant | `Emma` |
| `dob` | Date de naissance | `2015-06-15` |
| `education_level` | Niveau scolaire | `CM1` |
| `accessibility_flags` | Besoins spécifiques | `{"pmr": true, "allergies": ["gluten"]}` |

**💡 Exemple concret** : Emma, 9 ans, fille de `user_id=xxx`, est en CM1 et a une allergie au gluten.

---

### 3️⃣ **activities** (41 lignes)
**Objectif** : Les activités proposées par les structures

| Colonne | Explication | Exemple concret |
|---------|-------------|-----------------|
| `id` | Identifiant unique de l'activité | `act-123` |
| `structure_id` | Structure organisatrice | Lien vers `structures` |
| `title` | Nom de l'activité | `Stage de football 6-9 ans` |
| `description` | Texte descriptif | `Initiation au foot...` |
| `category` | Catégorie | `sport` |
| `price_base` | Prix sans aide | `120.00` (€) |
| `age_min` / `age_max` | Tranche d'âge | `6` / `9` |
| `published` | Visible sur le site | `true` |
| `period_type` | Type de période | `vacances_scolaires` |
| `vacation_periods` | Périodes précises | `["noel", "fevrier"]` |
| `accepts_aid_types` | Aides acceptées | `["pass_colo", "caf"]` |

**💡 Exemple concret** : Un stage de foot pour 6-9 ans à 120€, pendant les vacances de Noël, acceptant le Pass Colo.

---

### 4️⃣ **availability_slots** (161 lignes)
**Objectif** : Les créneaux disponibles pour chaque activité

| Colonne | Explication | Exemple concret |
|---------|-------------|-----------------|
| `id` | Identifiant unique du créneau | `slot-456` |
| `activity_id` | Activité concernée | Lien vers `activities` |
| `start` | Date/heure de début | `2025-12-23 09:00:00` |
| `end` | Date/heure de fin | `2025-12-27 17:00:00` |
| `seats_total` | Places totales | `20` |
| `seats_remaining` | Places restantes | `15` |
| `recurrence_type` | Répétition | `weekly`, `one_time` |

**💡 Exemple concret** : Stage du 23 au 27 décembre, 20 places, il en reste 15.

---

### 5️⃣ **bookings** (35 lignes)
**Objectif** : Les réservations effectuées par les parents

| Colonne | Explication | Exemple concret |
|---------|-------------|-----------------|
| `id` | Identifiant unique de la réservation | `book-789` |
| `user_id` | Parent qui réserve | Lien vers `profiles` |
| `child_id` | Enfant inscrit | Lien vers `children` |
| `activity_id` | Activité réservée | Lien vers `activities` |
| `slot_id` | Créneau choisi | Lien vers `availability_slots` |
| `status` | État de la réservation | `en_attente`, `validee`, `refusee` |
| `reste_a_charge` | Montant à payer | `45.00` (€) après aides |
| `participation_confirmed` | Présence confirmée | `true` (après l'activité) |
| `transport_mode` | Mode de transport | `bus`, `covoiturage`, `voiture` |

**💡 Exemple concret** : Réservation d'Emma au stage de foot du 23/12, reste à charge 45€ après aides, elle viendra en bus.

---

### 6️⃣ **structures** (24 lignes)
**Objectif** : Les organismes qui proposent les activités

| Colonne | Explication | Exemple concret |
|---------|-------------|-----------------|
| `id` | Identifiant unique | `struct-001` |
| `name` | Nom de la structure | `MJC Marseille Centre` |
| `address` | Adresse physique | `12 rue de la République` |
| `territory_id` | Territoire couvert | Lien vers `territories` |
| `contact_json` | Infos de contact | `{"email": "mjc@...", "tel": "04..."}` |
| `accessibility_profile` | Accessibilité PMR | `{"pmr": true, "parking": false}` |

**💡 Exemple concret** : La MJC de Marseille propose des activités culturelles, accessible PMR, pas de parking.

---

### 7️⃣ **financial_aids** (8 lignes)
**Objectif** : Les aides financières nationales/locales

| Colonne | Explication | Exemple concret |
|---------|-------------|-----------------|
| `id` | Identifiant unique | `aid-caf-001` |
| `name` | Nom de l'aide | `Aide CAF Vacances` |
| `amount_type` | Type de calcul | `fixed`, `per_day` |
| `amount_value` | Montant | `75.00` (€) ou `15.00` (€/jour) |
| `age_min` / `age_max` | Âge éligible | `6` / `17` |
| `qf_max` | Quotient familial max | `1200` (€) |
| `territory_level` | Niveau territorial | `national`, `region`, `commune` |
| `categories` | Catégories d'activités | `["sport", "culture"]` |
| `cumulative` | Cumulable avec d'autres | `true` |

**💡 Exemple concret** : Aide CAF de 75€ pour les familles QF < 1200€, enfants 6-17 ans, activités sport/culture, cumulable.

---

### 8️⃣ **territories** (7 lignes)
**Objectif** : Les zones géographiques couvertes

| Colonne | Explication | Exemple concret |
|---------|-------------|-----------------|
| `id` | Identifiant unique | `terr-marseille` |
| `name` | Nom du territoire | `Marseille` |
| `type` | Type de territoire | `commune`, `metropole`, `region` |
| `postal_codes` | Codes postaux inclus | `["13001", "13002", ...]` |
| `parent_id` | Territoire parent | Lien vers autre `territories` |
| `active` | Actif | `true` |
| `covered` | Couverture du service | `true` |

**💡 Exemple concret** : Marseille (commune), codes postaux 13001-13016, fait partie de la Métropole Aix-Marseille.

---

### 9️⃣ **user_roles** (2 lignes)
**Objectif** : Attribuer des rôles aux utilisateurs

| Colonne | Explication | Exemple concret |
|---------|-------------|-----------------|
| `user_id` | Utilisateur concerné | Lien vers `profiles` |
| `role` | Rôle attribué | `parent`, `structure`, `superadmin` |
| `territory_id` | Territoire de compétence | Pour admins territoriaux |

**💡 Exemple concret** : Marie a le rôle `parent`, Jean a le rôle `structure` pour la MJC, Paul est `superadmin`.

---

## 📈 TABLES DE TRACKING (NOUVELLES)

### 🔟 **search_logs** (0 lignes)
**Objectif** : Tracker les recherches des utilisateurs pour calculer des KPIs

| Colonne | Explication | Exemple concret |
|---------|-------------|-----------------|
| `id` | Identifiant unique | Auto-généré |
| `user_id` | Qui a cherché | Lien vers `profiles` (nullable si anonyme) |
| `session_id` | Session de navigation | `sess-abc123` |
| `search_query` | Texte recherché | `"judo marseille"` |
| `filters_applied` | Filtres utilisés | `{"category": "sport", "age": 8}` |
| `results_count` | Nombre de résultats | `12` |
| `created_at` | Quand | `2025-10-28 14:30:00` |

**💡 Utilité** : Savoir quelles recherches mènent à des réservations (taux de conversion).

---

### 1️⃣1️⃣ **activity_views** (0 lignes)
**Objectif** : Tracker les consultations de fiches activités

| Colonne | Explication | Exemple concret |
|---------|-------------|-----------------|
| `id` | Identifiant unique | Auto-généré |
| `activity_id` | Activité consultée | Lien vers `activities` |
| `user_id` | Qui a consulté | Lien vers `profiles` (nullable) |
| `session_id` | Session de navigation | `sess-abc123` |
| `source` | Origine du clic | `search`, `home`, `favorites` |
| `view_duration_seconds` | Temps passé sur la page | `45` (secondes) |
| `created_at` | Quand | `2025-10-28 14:32:00` |

**💡 Utilité** : Identifier les activités populaires, calculer le temps d'engagement.

---

## 🗺️ TABLES TRANSPORT & MOBILITÉ

### 1️⃣2️⃣ **transport_offers** (0 lignes)
**Objectif** : Options de transport pour se rendre aux activités

| Colonne | Explication |
|---------|-------------|
| `activity_id` | Activité concernée |
| `mode` | Type de transport (`bus`, `covoiturage`, `velo`) |
| `price_estimate` | Coût estimé |
| `travel_time_min` | Temps de trajet (minutes) |
| `carbon_saved_kg` | CO2 économisé vs voiture |

---

### 1️⃣3️⃣ **transport_stops** (0 lignes)
**Objectif** : Arrêts de bus/métro/tram proches des activités

| Colonne | Explication |
|---------|-------------|
| `stop_id` | ID de l'arrêt externe |
| `name` | Nom de l'arrêt (`"Castellane"`) |
| `lat` / `lon` | Coordonnées GPS |
| `lines` | Lignes desservant (`["M1", "Bus 81"]`) |

---

## 🔒 TABLES SÉCURITÉ & ADMIN

### 1️⃣4️⃣ **sessions** (0 lignes)
**Objectif** : Gérer les connexions actives des utilisateurs

### 1️⃣5️⃣ **audit_logs** (0 lignes)
**Objectif** : Tracer toutes les actions sensibles (modifications admin, suppressions)

### 1️⃣6️⃣ **mfa_settings** (0 lignes)
**Objectif** : Paramètres d'authentification à deux facteurs (pour admins)

---

## 🎓 TABLES COMPLÉMENTAIRES

### 1️⃣7️⃣ **aid_simulations** (0 lignes)
**Objectif** : Historique des simulations d'aides effectuées

### 1️⃣8️⃣ **reviews** (0 lignes)
**Objectif** : Avis des parents après participation

### 1️⃣9️⃣ **notifications** (1 ligne)
**Objectif** : Notifications push/email des utilisateurs

### 2️⃣0️⃣ **qpv_reference** (20 lignes)
**Objectif** : Liste des Quartiers Prioritaires de la Ville (pour aides spécifiques)

### 2️⃣1️⃣ **promo_codes** (0 lignes)
**Objectif** : Codes promotionnels pour réductions

---

## 🔗 RELATIONS ENTRE TABLES

```
profiles (parent)
  └─> children (ses enfants)
       └─> bookings (réservations pour cet enfant)
            ├─> activities (quelle activité)
            │    └─> structures (organisée par qui)
            └─> availability_slots (quel créneau)

profiles
  └─> search_logs (ce qu'il cherche)
  └─> activity_views (ce qu'il consulte)

activities
  └─> financial_aids (via calcul dynamique selon profil)
  └─> transport_offers (comment y aller)
```

---

## 📊 EXEMPLE CONCRET DE FLUX COMPLET

### 👨‍👩‍👧 **Scénario : Marie réserve un stage pour Emma**

1. **Marie se connecte** → ligne dans `profiles` (id=`user-marie`)
2. **Elle a déclaré Emma** → ligne dans `children` (user_id=`user-marie`, dob=`2015-06-15`)
3. **Elle cherche "foot marseille"** → ligne dans `search_logs` (search_query=`"foot marseille"`)
4. **Elle ouvre la fiche "Stage foot 6-9 ans"** → ligne dans `activity_views` (activity_id=`act-foot-123`)
5. **Elle simule ses aides** :
   - QF = 850€ → éligible à Aide CAF (75€)
   - Ligne dans `aid_simulations`
6. **Elle réserve le stage** → ligne dans `bookings` :
   - `child_id` = Emma
   - `activity_id` = Stage foot
   - `slot_id` = 23-27 décembre
   - `reste_a_charge` = 45€ (120€ - 75€)
   - `status` = `en_attente`
7. **La structure valide** → `status` passe à `validee`
8. **Emma participe** → `participation_confirmed` = `true`

---

## 🎯 POURQUOI CES TABLES ?

| Table | Rôle métier |
|-------|-------------|
| **profiles** | Qui utilise le service |
| **children** | Pour qui on réserve |
| **activities** | Que propose-t-on |
| **bookings** | Les inscriptions |
| **financial_aids** | Combien d'aide on peut avoir |
| **search_logs** | Mesurer l'efficacité du moteur de recherche |
| **activity_views** | Identifier les activités attractives |
| **structures** | Qui organise |
| **territories** | Où est-ce disponible |

---

## ❓ QUESTIONS FRÉQUENTES

**Q : Pourquoi `search_logs` et `activity_views` sont vides ?**
→ Elles se remplissent automatiquement quand les utilisateurs naviguent. C'est normal au démarrage.

**Q : C'est quoi le "reste à charge" ?**
→ Le montant que le parent doit payer après déduction de toutes les aides cumulées.

**Q : Pourquoi certains `user_id` sont NULL ?**
→ Pour permettre le tracking des visiteurs non connectés (session anonyme).

**Q : C'est quoi RLS ?**
→ Row Level Security : un parent ne peut voir que SES enfants, SES réservations. Un admin voit tout.

---

## 🚀 PROCHAINES ÉTAPES POUR TESTER

1. **Connectez-vous sur l'app**
2. **Faites 3-5 recherches** (ex: "sport", "culture", "6-9 ans")
3. **Ouvrez 3-5 fiches activités**
4. **Relancez les requêtes Section 3** de `VALIDATION_TESTS.md`
5. **Vous verrez des lignes dans `search_logs` et `activity_views`** ✅

---

**📧 Besoin d'aide ?** Ce guide couvre 100% de votre base de données actuelle.