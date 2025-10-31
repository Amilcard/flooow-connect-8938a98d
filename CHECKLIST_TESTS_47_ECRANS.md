# ✅ Checklist Tests - 47 Écrans Réels

**Base de données** : 41 activités réelles publiées
**État** : Prêt pour tests utilisateurs
**Date** : 30/10/2025

---

## 🎯 Parcours Prioritaires (à tester en premier)

### 1. Parcours Inscription/Connexion (5 écrans)
- [ ] `/signup` - Inscription nouveau compte
  - Tester avec/sans téléphone
  - Vérifier validation mot de passe complexe
  - Tester boutons OAuth (après config secrets)
  - Tester bouton Apple
- [ ] `/login` - Connexion
  - Tester connexion email/password
  - Vérifier redirection dashboard
  - Tester logout
- [ ] `/dashboards` - Redirection dashboard selon rôle
  - Vérifier redirection parent → `/parent/dashboard`
  - Vérifier redirection admin → `/admin/dashboard`
- [ ] `/forgot-password` - Réinitialisation mot de passe
- [ ] `/reset-password` - Nouveau mot de passe

### 2. Parcours Découverte Activités (5 écrans)
- [ ] `/` - Page d'accueil
  - Vérifier 3 sections d'activités (proximité, budget, innovantes)
  - Vérifier que section "Saint-Étienne Mocks" ne s'affiche PAS
  - Tester barre de recherche
- [ ] `/search` - Recherche
  - Taper "Judo" puis Entrée → résultats
  - Taper "Séjour" → doit trouver (accents)
  - Vérifier fallback (toutes activités si 0 résultat)
- [ ] `/activities` - Catalogue complet
  - Vérifier onglets par catégorie (Sport, Culture, Loisirs, etc.)
  - ~8-9 activités par catégorie
- [ ] `/activity/:id` - Fiche détail activité
  - Vérifier affichage complet (titre, description, prix, horaires)
  - Tester bouton "Réserver"
- [ ] `/activites/carte` - Vue carte (⚠️ Placeholder)
  - Vérifier message "Vue carte à venir"

### 3. Parcours Réservation (3 écrans)
- [ ] `/activity/:id` → Bouton Réserver
- [ ] `/booking/:activityId` - Formulaire réservation
  - Remplir nom, prénom, email
  - Sélectionner date/créneau
  - Soumettre
- [ ] Confirmation réservation (email ou page de succès)

---

## 📋 Écrans par Rôle

### 👤 Parent (12 écrans)
- [ ] `/parent/dashboard` - Tableau de bord parent
- [ ] `/parent/children` - Liste enfants
- [ ] `/parent/children/new` - Ajouter enfant
- [ ] `/parent/children/:id` - Fiche enfant
- [ ] `/parent/bookings` - Mes réservations
- [ ] `/parent/bookings/:id` - Détail réservation
- [ ] `/parent/profile` - Mon profil
- [ ] `/parent/messages` - Messagerie
- [ ] `/parent/payments` - Paiements
- [ ] `/parent/documents` - Documents
- [ ] `/parent/help` - Aide
- [ ] `/parent/settings` - Paramètres

### 👨‍💼 Animateur (8 écrans)
- [ ] `/animateur/dashboard` - Tableau de bord animateur
- [ ] `/animateur/sessions` - Mes sessions
- [ ] `/animateur/sessions/:id` - Détail session
- [ ] `/animateur/participants` - Liste participants
- [ ] `/animateur/schedule` - Planning
- [ ] `/animateur/profile` - Mon profil
- [ ] `/animateur/messages` - Messagerie
- [ ] `/animateur/help` - Aide

### 👔 Partenaire (7 écrans)
- [ ] `/partenaire/dashboard` - Tableau de bord partenaire
- [ ] `/partenaire/activities` - Mes activités
- [ ] `/partenaire/activities/new` - Créer activité
- [ ] `/partenaire/activities/:id/edit` - Modifier activité
- [ ] `/partenaire/bookings` - Réservations reçues
- [ ] `/partenaire/profile` - Mon profil
- [ ] `/partenaire/stats` - Statistiques

### 🔧 Admin (10 écrans)
- [ ] `/admin/dashboard` - Tableau de bord admin
- [ ] `/admin/users` - Gestion utilisateurs
- [ ] `/admin/users/:id` - Fiche utilisateur
- [ ] `/admin/activities` - Gestion activités
- [ ] `/admin/activities/:id` - Modération activité
- [ ] `/admin/bookings` - Toutes réservations
- [ ] `/admin/sessions` - Sessions actives
- [ ] `/admin/reports` - Rapports
- [ ] `/admin/settings` - Configuration système
- [ ] `/admin/logs` - Logs système

---

## 🎭 Écrans Démo (5 écrans - NE PAS TESTER)

⚠️ **Ces écrans sont statiques, à réserver pour démos commerciales uniquement**

- [ ] `/demo/parent` - Démo espace parent
- [ ] `/demo/animateur` - Démo espace animateur
- [ ] `/demo/partenaire` - Démo espace partenaire
- [ ] `/demo/admin` - Démo espace admin
- [ ] `/demo/activity` - Démo fiche activité

---

## 🔍 Recherches Recommandées

**Recherches qui doivent fonctionner (avec accents)** :
- [ ] "Judo" → 1 résultat
- [ ] "Foot" ou "Football" → 2 résultats
- [ ] "Natation" → 1 résultat
- [ ] "Séjour" ou "sejour" → résultats vacances
- [ ] "Théâtre" ou "theatre" → résultats culture
- [ ] "Escalade" → 2 résultats (sport + stage vacances)
- [ ] "Code" ou "Informatique" → robotique + code

---

## ✅ Critères de Validation

### ✓ Test RÉUSSI si :
1. L'écran se charge sans erreur
2. Les données s'affichent correctement (41 activités réelles)
3. Les boutons/liens fonctionnent
4. Pas d'erreur console navigateur

### ✗ Test ÉCHOUÉ si :
1. Erreur 404 ou 500
2. Page blanche
3. Données vides alors qu'elles devraient s'afficher
4. Boutons/formulaires ne répondent pas
5. Erreur visible dans console navigateur

---

## 📊 Résumé

| Type           | Nombre | État            | Action          |
|----------------|--------|-----------------|-----------------|
| **RÉELS**      | 47     | ✅ Opérationnels | À tester        |
| **DÉMO**       | 5      | ✅ Statiques     | Ignorer         |
| **MOCKS**      | 0      | ❌ Cassé         | Masqué          |
| **TOTAL**      | 52     | -               | -               |

---

## 🆘 En cas de problème

### Problème : Connexion impossible
→ Vérifier que la migration SQL a été appliquée (voir commit précédent)

### Problème : Edge function error (inscription enfant)
→ Configurer les secrets Supabase (voir SECRETS_SUPABASE.md)

### Problème : Recherche ne trouve rien
→ Normal si aucune activité en BDD ne correspond au mot-clé
→ Le fallback affiche toutes les activités disponibles

### Problème : Section mocks Saint-Étienne apparaît
→ Edge function mock-activities déployée mais non configurée
→ La section devrait être masquée automatiquement

---

## 📝 Template de Bug Report

```markdown
**Écran** : /path/to/screen
**Rôle** : Parent / Animateur / Partenaire / Admin / Public
**Action effectuée** : Clic sur bouton X, formulaire Y, etc.
**Résultat attendu** : Ce qui devrait se passer
**Résultat obtenu** : Ce qui s'est passé
**Message d'erreur** : Copier le message exact
**Console** : Copier les erreurs console (F12)
**Capture d'écran** : Si pertinent
```

---

✅ **Checklist prête - Tous les 47 écrans réels sont testables avec les 41 activités en base**
