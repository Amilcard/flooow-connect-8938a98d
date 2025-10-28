# 🧪 Plan de Tests - Flooow Connect

## 🎯 Objectif : Vérifier que tout fonctionne avant la démo

**Durée totale** : 30 minutes
**Prérequis** : Avoir lancé `npm run dev`

---

## ✅ PARCOURS 1 : Page d'accueil Familles (5 min)

### Test 1.1 : Chargement page
- [ ] Aller sur `http://localhost:5173/`
- [ ] **Attendu** : Page se charge en < 3 secondes
- [ ] **Attendu** : Activités s'affichent (au moins 5)
- [ ] ❌ **Si échec** : Vérifier console navigateur (F12)

### Test 1.2 : Filtres activités
- [ ] Cliquer sur bouton "Filtres" ou icône filtre
- [ ] Sélectionner catégorie "Santé & Bien-être"
- [ ] **Attendu** : Liste se filtre
- [ ] Désélectionner filtre
- [ ] **Attendu** : Toutes les activités réapparaissent

### Test 1.3 : Affichage aides + mobilité
- [ ] Regarder une carte activité
- [ ] **Attendu** : Badges verts aides visibles (Pass'Sport, CAF, etc.)
- [ ] **Attendu** : Icônes mobilité visibles (🚌 Bus, 🚴 Vélo, 🚗 Covoit)
- [ ] **Attendu** : Bouton "Je suis intéressé" (pas "Voir détails")

### Test 1.4 : Clic sur activité
- [ ] Cliquer sur une activité
- [ ] **Attendu** : Redirection vers page détail OU modal
- [ ] ❌ **Si page 404** : Noter l'erreur

---

## ✅ PARCOURS 2 : Connexion Dashboard Collectivité (10 min)

### Test 2.1 : Accès page auth
- [ ] Aller sur `http://localhost:5173/auth`
- [ ] **Attendu** : Formulaire login visible

### Test 2.2 : Login collectivité
- [ ] Email : `collectivite@demo.flooow.fr`
- [ ] Mot de passe : `Demo2025!`
- [ ] Cliquer "Se connecter"
- [ ] **Attendu** : Redirection vers `/dashboard/collectivite`
- [ ] ❌ **Si erreur "Invalid credentials"** : Vérifier que l'user existe dans Supabase

### Test 2.3 : Dashboard général
- [ ] **Attendu** : 5 KPIs en haut affichent des chiffres (pas "0" partout)
- [ ] **Attendu** : Voir "347 inscriptions", "12.5% handicap", etc.
- [ ] ❌ **Si "0" partout** : Problème données mock

### Test 2.4 : Navigation onglets (CRITIQUE)
**Tester CHAQUE onglet dans l'ordre** :

- [ ] **Onglet Activités** : Graphique camembert visible + tableau
- [ ] **Onglet Aides** : Tableau QF + graphique barres
- [ ] **Onglet Éco-mobilité** : Répartition transport visible
- [ ] **Onglet Démographie** : Tableau démographie visible
- [ ] **Onglet Réussite éduc.** : "87 demandes", "19 sans solution" visible
- [ ] **Onglet Santé** : "124 demandes", motivations (stress 34%) visible
- [ ] **Onglet Tranquillité** : "156 jeunes", saturation QPV 89% visible
- [ ] **Onglet Égalité F/G** : Écart 9.3%, comparatif filles/garçons visible
- [ ] **Onglet Mobilité** : "34 abandons", temps trajet visible
- [ ] **Onglet Handicap** : "43 enfants", 65% inclusion visible

**Pour CHAQUE onglet, vérifier** :
- [ ] Pas d'erreur console (F12)
- [ ] Chiffres affichés (pas "undefined" ou "NaN")
- [ ] Graphiques se chargent
- [ ] Texte lisible (pas de chevauchement)

### Test 2.5 : Responsive mobile (bonus)
- [ ] Ouvrir DevTools (F12) → Mode responsive
- [ ] Tester largeur 375px (iPhone)
- [ ] **Attendu** : Onglets accessibles (scroll horizontal OK)

---

## ✅ PARCOURS 3 : Dashboard Financeur (5 min)

### Test 3.1 : Déconnexion
- [ ] Cliquer sur bouton déconnexion (Header)
- [ ] **Attendu** : Retour page login

### Test 3.2 : Login financeur
- [ ] Email : `financeur@demo.flooow.fr`
- [ ] Mot de passe : `Demo2025!`
- [ ] Cliquer "Se connecter"
- [ ] **Attendu** : Redirection vers `/dashboard/financeur`

### Test 3.3 : Dashboard financeur
- [ ] **Attendu** : 4 KPIs en haut (412 simulations, etc.)
- [ ] **Attendu** : Tableau aides (Pass'Sport, CAF, etc.) visible
- [ ] **Attendu** : Chiffres cohérents

---

## ✅ PARCOURS 4 : Connexion BDD Supabase (5 min)

### Test 4.1 : Vérifier connexion
Ouvrir console navigateur (F12) → Onglet Network

- [ ] Recharger page dashboard
- [ ] Filtrer par "supabase"
- [ ] **Attendu** : Requêtes vers `lddlzlthtwuwxxrrbxuc.supabase.co` OU `kbrgwezjkaakoecisspom.supabase.co`
- [ ] **Attendu** : Statut 200 (pas 401/403/500)
- [ ] ❌ **Si 401 Unauthorized** : Problème clés API

### Test 4.2 : Edge Functions
Dans console Network :
- [ ] Chercher requête vers `/functions/v1/dashboard-kpis-mock`
- [ ] **Attendu** : Statut 200
- [ ] **Attendu** : Réponse JSON avec données
- [ ] ❌ **Si 404** : Edge Function pas déployée (normal, on utilise mock local)

### Test 4.3 : Vérifier données utilisateurs
- [ ] Aller sur https://app.supabase.com
- [ ] Sélectionner votre projet
- [ ] Table Editor → `profiles`
- [ ] **Attendu** : Voir profils existants
- [ ] Table Editor → `user_roles`
- [ ] **Attendu** : Voir rôles (territory_admin, partner, structure)

---

## ✅ PARCOURS 5 : Performance (5 min)

### Test 5.1 : Temps chargement
- [ ] Ouvrir DevTools → Onglet Performance
- [ ] Recharger page dashboard
- [ ] **Attendu** : First Contentful Paint < 2 secondes
- [ ] **Attendu** : Largest Contentful Paint < 4 secondes

### Test 5.2 : Console errors
- [ ] Ouvrir console (F12)
- [ ] Naviguer entre tous les onglets
- [ ] **Attendu** : Pas d'erreurs rouges
- [ ] ⚠️ **Warnings jaunes acceptables** (React, deprecations)
- [ ] ❌ **Erreurs rouges = problème**

---

## 📋 CHECKLIST RÉCAPITULATIVE

### ✅ Parcours OK
- [ ] Page accueil charge
- [ ] Filtres fonctionnent
- [ ] Aides + mobilité visibles
- [ ] Login collectivité OK
- [ ] 10 onglets dashboard s'affichent
- [ ] Données mockées cohérentes
- [ ] Login financeur OK
- [ ] Connexion Supabase OK
- [ ] Pas d'erreurs console critiques

### ❌ Bugs trouvés
**Lister ici les problèmes rencontrés** :

1. ____________________________________________
2. ____________________________________________
3. ____________________________________________

---

## 🚨 BUGS CRITIQUES (bloquants démo)

Si vous rencontrez **UN** de ces bugs, **STOP et me contacter** :

❌ **Dashboard ne charge pas** (page blanche)
❌ **Login échoue pour tous les comptes**
❌ **Aucun onglet ne s'affiche**
❌ **Tous les chiffres = 0 ou undefined**
❌ **Erreur Supabase 401/403**

---

## 🟨 BUGS MINEURS (non bloquants)

Ces bugs sont OK pour la démo, on corrigera après :

🟨 **Un onglet a un graphique cassé**
🟨 **Responsive mobile imparfait**
🟨 **Warnings console (jaunes)**
🟨 **Temps chargement > 4 secondes**

---

## ✅ APRÈS LES TESTS

**Si TOUT est OK** :
→ Passer à Phase 1 Sécurité (30 min)

**Si bugs mineurs** :
→ Noter, ignorer pour démo, corriger après

**Si bugs critiques** :
→ Me contacter avec :
1. Description bug
2. Screenshot erreur console
3. Étape où ça plante

---

## 📞 AIDE RAPIDE

**Commandes utiles** :

```bash
# Relancer le serveur
Ctrl+C (dans terminal)
npm run dev

# Vider cache navigateur
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)

# Voir logs en temps réel
Ouvrir console navigateur (F12)
```

**Vérifications de base** :

```bash
# Node.js installé ?
node --version  # Doit afficher v18+

# Dépendances OK ?
npm list --depth=0

# Port 5173 libre ?
lsof -i :5173  # Mac/Linux
netstat -ano | findstr :5173  # Windows
```
