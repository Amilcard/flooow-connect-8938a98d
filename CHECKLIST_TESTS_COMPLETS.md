# ✅ CHECKLIST TESTS COMPLETS - FLOOOW CONNECT

## 📋 COMMENT REPORTER UN BUG

Pour chaque problème, note :
```
PAGE : /nom-de-la-page
BUG : Description courte
GRAVITÉ : 🔴 Bloquant / 🟡 Gênant / 🟢 Mineur
ÉTAPES :
1. Action 1
2. Action 2
RÉSULTAT : Ce qui se passe
ATTENDU : Ce qui devrait se passer
```

---

## 🏠 PAGES PUBLIQUES (sans connexion)

### 1. Page d'accueil `/`
- [ ] La page charge
- [ ] Les onglets (Nouveautés, Sports, Petits budgets, Proximité) fonctionnent
- [ ] Les cartes d'activités s'affichent
- [ ] Clic sur une carte ouvre la page détail
- [ ] Le header s'affiche
- [ ] Le footer s'affiche

### 2. Page Recherche `/search`
- [ ] La barre de recherche fonctionne
- [ ] Les filtres s'ouvrent (bouton filtres)
- [ ] Filtrer par âge fonctionne
- [ ] Filtrer par catégorie fonctionne
- [ ] Filtrer par prix max fonctionne
- [ ] Filtre PMR fonctionne
- [ ] Filtre Covoiturage fonctionne
- [ ] Filtre Aides financières fonctionne
- [ ] Les résultats s'affichent
- [ ] Les résultats correspondent aux filtres

### 3. Page Activités `/activities`
- [ ] Liste des activités s'affiche
- [ ] Onglets catégories fonctionnent (Sport, Culture, etc.)
- [ ] Clic sur activité ouvre le détail

### 4. Page Détail Activité `/activities/:id`
- [ ] Détails activité s'affichent
- [ ] Images s'affichent
- [ ] Prix affiché
- [ ] Créneaux disponibles affichés
- [ ] Bouton "Réserver" visible
- [ ] Structure organisatrice affichée

### 5. Pages d'authentification
- [ ] `/login` - Connexion fonctionne
- [ ] `/signup` - Inscription fonctionne
- [ ] Email de confirmation reçu

---

## 👤 PAGES PARENT (connecté comme parent)

### 6. Dashboard Parent `/parent/dashboard`
- [ ] La page charge
- [ ] Mes enfants affichés
- [ ] Mes réservations affichées
- [ ] Statistiques affichées

### 7. Mes Enfants `/mon-compte/mes-enfants`
- [ ] Liste enfants affichée
- [ ] Bouton "Ajouter un enfant" fonctionne
- [ ] Modifier enfant fonctionne
- [ ] Supprimer enfant fonctionne

### 8. Inscription Enfant

#### Par code famille `/child-signup` (méthode code)
- [ ] Page charge
- [ ] Formulaire visible
- [ ] Champs : Code famille, Prénom, Date naissance
- [ ] Validation fonctionne
- [ ] Message succès affiché
- [ ] Enfant ajouté au compte

#### Par email parent `/child-signup` (méthode email)
- [ ] Formulaire visible
- [ ] Champs : Email parent, Prénom enfant, Date naissance
- [ ] Bouton "Envoyer" fonctionne
- [ ] Message succès affiché
- [ ] Email reçu
- [ ] Lien dans email fonctionne
- [ ] Page validation `/validate-child-signup` charge
- [ ] Clic "OUI" crée l'enfant
- [ ] Clic "NON" rejette
- [ ] Enfant apparaît dans le compte parent

### 9. Mes Réservations `/bookings` ou `/mon-compte/reservations`
- [ ] Liste réservations affichée
- [ ] Détails réservation corrects
- [ ] Statut réservation affiché
- [ ] Annulation fonctionne

### 10. Mon Profil `/profile` ou `/mon-compte`
- [ ] Informations profil affichées
- [ ] Modification profil fonctionne
- [ ] Quotient familial modifiable
- [ ] Adresse modifiable

### 11. Nouvelle Réservation
- [ ] Depuis page activité, clic "Réserver"
- [ ] Sélection enfant fonctionne
- [ ] Sélection créneau fonctionne
- [ ] Calcul reste à charge correct
- [ ] Aides détectées affichées
- [ ] Confirmation réservation fonctionne
- [ ] Réservation apparaît dans "Mes réservations"

---

## 🏢 PAGES STRUCTURE (connecté comme structure)

### 12. Dashboard Structure `/structure/dashboard`
- [ ] La page charge
- [ ] Mes activités affichées
- [ ] Statistiques affichées
- [ ] Réservations affichées

### 13. Mes Activités `/structure/activities`
- [ ] Liste activités affichée
- [ ] Bouton "Créer activité" fonctionne
- [ ] Modifier activité fonctionne
- [ ] Supprimer activité fonctionne
- [ ] Publier/Dépublier fonctionne

### 14. Créer Activité `/structure/activities/new`
- [ ] Formulaire complet visible
- [ ] Tous les champs fonctionnent
- [ ] Upload images fonctionne
- [ ] Créneaux ajoutables
- [ ] Sauvegarde fonctionne
- [ ] Activité créée apparaît dans liste

### 15. Gérer Réservations `/structure/bookings`
- [ ] Liste réservations affichée
- [ ] Filtres fonctionnent
- [ ] Valider réservation fonctionne
- [ ] Refuser réservation fonctionne
- [ ] Confirmer présence fonctionne

---

## 👑 PAGES ADMIN (connecté comme admin)

### 16. Dashboard Admin `/admin/dashboard`
- [ ] KPIs affichés
- [ ] Graphiques chargent
- [ ] Données cohérentes

### 17. Gestion Utilisateurs `/admin/users`
- [ ] Liste utilisateurs affichée
- [ ] Recherche fonctionne
- [ ] Filtres rôles fonctionnent
- [ ] Valider compte fonctionne
- [ ] Changer rôle fonctionne
- [ ] Désactiver compte fonctionne

### 18. Gestion Structures `/admin/structures`
- [ ] Liste structures affichée
- [ ] Créer structure fonctionne
- [ ] Modifier structure fonctionne
- [ ] Valider structure fonctionne

### 19. Gestion Territoires `/admin/territories`
- [ ] Liste territoires affichée
- [ ] Créer territoire fonctionne
- [ ] Associer structures fonctionne

### 20. Rapports `/admin/reports`
- [ ] Export données fonctionne
- [ ] Statistiques affichées
- [ ] Filtres par date fonctionnent

---

## 🔧 FONCTIONNALITÉS TRANSVERSES

### 21. Navigation
- [ ] Menu principal fonctionne
- [ ] Menu mobile fonctionne (responsive)
- [ ] Liens footer fonctionnent
- [ ] Breadcrumb affiché
- [ ] Retour arrière navigateur fonctionne

### 22. Recherche
- [ ] Barre recherche header fonctionne
- [ ] Auto-complétion fonctionne
- [ ] Résultats pertinents

### 23. Notifications
- [ ] Notifications affichées
- [ ] Clic notification fonctionne
- [ ] Marquer lu fonctionne
- [ ] Badge nombre affiché

### 24. Responsive (mobile)
- [ ] Pages s'affichent sur mobile
- [ ] Menu burger fonctionne
- [ ] Formulaires utilisables
- [ ] Images adaptées

### 25. Performance
- [ ] Pages chargent < 3 secondes
- [ ] Pas de freeze / lag
- [ ] Images chargent
- [ ] Transitions fluides

---

## 🐛 BUGS CONNUS À VÉRIFIER

### De la session précédente
- [ ] Inscription enfant par email : email reçu ?
- [ ] Validation lien email : page charge ?
- [ ] Doublons enfants : bloqués par contrainte ?

---

## 📊 TEMPLATE RAPPORT

Copie-colle ce template pour chaque bug :

```
---
PAGE :
BUG :
GRAVITÉ : 🔴 / 🟡 / 🟢
ÉTAPES :
1.
2.
3.
RÉSULTAT :
ATTENDU :
SCREENSHOT : (optionnel)
---
```

---

## 🎯 PRIORISATION

**🔴 BLOQUANT** : L'utilisateur ne peut pas continuer
**🟡 GÊNANT** : L'utilisateur peut contourner mais c'est difficile
**🟢 MINEUR** : Cosmétique, pas d'impact fonctionnel

---

**Prends ton temps, teste page par page !** 🚀
