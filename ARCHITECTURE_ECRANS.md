# Architecture Écrans - Flooow Inklusif

## 🟢 FRONT - Espace Familles

### Authentification
- **Splash** → Écran démarrage + navigation auto
- **Login** → Connexion email/mot de passe
- **SignUp Parent** → Inscription parent avec profil familial
- **SignUp Enfant** → Auto-inscription enfant + validation parentale
- **Onboarding** → 3 étapes (proximité/aides/accessibilité)
- **ForgotPassword** → Récupération mot de passe

### Navigation principale
- **Home (Index)** → 3 blocs info + 3 sections activités (proximité/prix/santé)
- **Activities** → Liste complète avec onglets catégories
- **Search** → Recherche avancée avec filtres géographiques/critères
- **ActivitiesMap** → Carte interactive des activités

### Activités & Réservation
- **ActivityDetail** → Fiche complète + créneaux + simulation aides + transport
- **Booking** → Sélection enfant + récapitulatif + paiement
- **BookingStatus** → Statut réservation (attente/validée/refusée/annulée)

### Profil & Compte
- **MonCompte** → Hub navigation compte utilisateur
- **MesInformations** → Édition profil parent
- **MesEnfants** → Gestion enfants + ajout
- **MesReservations** → Historique réservations
- **ProfilEligibilite** → QF + documents justificatifs + éligibilité
- **ValidationParentale** → Validation inscriptions enfants autonomes
- **MesNotifications** → Centre notifications
- **Parametres** → Confidentialité/sécurité/apparence

### Services connexes
- **Aides** → Catalogue aides financières disponibles
- **EcoMobilite** → Options transport + covoiturage
- **Covoiturage** → Recherche/proposition trajets
- **MonCovoiturage** → Gestion covoiturages actifs
- **Itineraire** → Calcul trajet vers activité
- **Inclusivite** → Filtres accessibilité PMR
- **FAQ** → Questions fréquentes
- **Support** → Contact support
- **Contact** → Formulaire contact organismes

### Légal
- **MentionsLegales** → Mentions légales plateforme
- **CGU** → Conditions générales utilisation
- **PrivacyPolicy** → Politique confidentialité
- **RGPD** → Gestion données personnelles
- **Cookies** → Préférences cookies

---

## 🔵 BACK - Administration & Dashboards

### Dashboards par rôle
- **SuperadminDashboard** → Vue globale multi-territoires + KPIs nationaux
- **CollectiviteDashboard** → Métriques territoire (inscriptions/accessibilité/QPV)
- **FinanceurDashboard** → Suivi utilisation aides + simulations + ROI
- **StructureDashboard** → Gestion activités propres + inscriptions + revenus

### Gestion activités (Structures)
- **StructureActivityForm** → Création/édition activité (horaires/capacité/prix/aides)
- **AdminSessions** → Gestion créneaux disponibilité
- **MesSessions** → Vue structure de ses créneaux publiés

### Gestion utilisateurs & validation
- **DashboardRedirect** → Aiguillage selon rôle utilisateur
- **StructureAuth** → Connexion dédiée structures
- **ValidateChildSignup** → Validation inscriptions enfants par admin

### Reporting & Analytics
- **DemoDashboard** → Écran démo avec données fictives
- **AdminSessions** → Suivi global sessions multi-structures

---

## 🟡 BASE DE DONNÉES - Tables principales

### Utilisateurs & Profils
- **profiles** → Données famille (QF, adresse, territoire, validation)
- **children** → Enfants (prénom, date naissance, handicaps, scolarité)
- **user_roles** → Rôles (parent/structure/admin/financeur/collectivité)

### Activités & Disponibilités
- **activities** → Activités (titre, description, catégorie, prix, structure, aides acceptées)
- **availability_slots** → Créneaux (date/heure, places dispo, récurrence)
- **structures** → Organismes (nom, adresse, territoire, accessibilité)

### Réservations & Aides
- **bookings** → Réservations (parent, enfant, activité, créneau, statut, reste à charge, idempotence)
- **aid_simulations** → Simulations aides (montants simulés par aide/enfant)
- **financial_aids** → Référentiel aides (barème, critères éligibilité, territoire)

### Territoires & Inclusion
- **territories** → Découpage administratif (commune/département/région/national)
- **qpv_reference** → Référentiel quartiers prioritaires + codes postaux

### Sécurité & Sessions
- **sessions** → Sessions utilisateur (JWT, MFA, révocation)
- **refresh_tokens** → Tokens renouvellement sécurisés
- **mfa_settings** → Paramètres authentification multi-facteurs
- **active_sessions** → Suivi sessions actives + device

### Transport & Mobilité
- **transport_offers** → Offres transport (bus/vélo/covoit) par activité
- **transport_stations** → Stations transport collectif
- **transport_stops** → Arrêts bus référencés
- **bike_stations** → Stations vélos partagés

### Audit & Notifications
- **audit_logs** → Journal actions utilisateurs (RGPD, sécurité)
- **notifications** → Alertes utilisateur (validation, rappel, annulation)
- **reports_metrics** → Métriques agrégées pour tableaux de bord

### Vues analytiques
- **v_children_with_age** → Enfants + âge calculé
- **v_profile_completion** → Taux complétion profils
- **v_qpv_stats** → Statistiques QPV
- **v_non_recours_financier** → Indicateurs non-recours aides

---

## 📊 Statut MVP (34/34 critères UI validés)

### ✅ Implémenté
- Design system complet (bleu/orange, tokens sémantiques)
- Authentification parent + enfant autonome
- Recherche activités + filtres avancés
- Réservation avec idempotence
- Simulation aides financières intégrée
- Dashboards multi-rôles
- Transport + éco-mobilité
- WCAG AA (score Lighthouse 95+)

### 🚧 En cours / À compléter
- Paiement échelonné
- Covoiturage avancé (matching)
- Notifications push temps réel
- Export reporting PDF
- Module messagerie interne

---

## 🎯 Priorisation MVP

**P0 (Critique)**
- Home, Activities, ActivityDetail, Booking, BookingStatus
- Login, SignUp Parent, MonCompte
- SuperadminDashboard, StructureDashboard

**P1 (Important)**
- Search, ActivitiesMap
- MesReservations, ProfilEligibilite, MesEnfants
- CollectiviteDashboard, FinanceurDashboard
- StructureActivityForm, AdminSessions

**P2 (Nice to have)**
- Covoiturage, Itineraire, MonCovoiturage
- FAQ, Support, Inclusivite
- MesNotifications, Parametres

**P3 (Future)**
- Export PDF, Messagerie, Notifications push
