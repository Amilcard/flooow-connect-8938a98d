# Protocole de Tests Manuels OAuth Mobile

> **Note importante** : Les tests OAuth (Google, Facebook, LinkedIn) ne peuvent pas être automatisés de manière fiable avec Playwright car ces providers utilisent des mécanismes de protection anti-bot (CAPTCHA, détection de navigateurs automatisés, etc.). Ce document décrit le protocole de tests manuels à suivre sur téléphone.

## 📱 Appareils de Test

### iPhone (Safari)
- **Modèles recommandés** : iPhone 13 ou ultérieur
- **Version iOS** : iOS 16+
- **Navigateur** : Safari (navigateur par défaut)

### Android (Chrome)
- **Modèles recommandés** : Pixel 7, Samsung Galaxy S21 ou équivalent
- **Version Android** : Android 12+
- **Navigateur** : Chrome (dernière version)

---

## 🔐 Tests OAuth - Google Login

### Prérequis
- Compte Google de test (ne pas utiliser un compte personnel/production)
- Application configurée dans la Google Cloud Console
- Redirect URI configuré pour l'environnement de staging

### Scénario 1 : Connexion Google depuis iPhone Safari

| Étape | Action | Résultat Attendu |
|-------|--------|------------------|
| 1 | Ouvrir Safari et naviguer vers `https://staging.flooow.fr/auth` | Page de connexion affichée |
| 2 | Cliquer sur "Continuer avec Google" | Redirection vers la page Google |
| 3 | Saisir email et mot de passe Google | Authentification réussie |
| 4 | Accepter les permissions (si demandé) | Retour vers l'application |
| 5 | Vérifier le header "Bonjour [Prénom]" | Utilisateur connecté visible |
| 6 | Naviguer vers "Mon compte" | Page Mon compte affichée avec contenu |
| 7 | Vérifier les informations du profil | Email Google visible |

**📹 Capture vidéo obligatoire** : Enregistrer l'écran pendant toute la procédure

### Scénario 2 : Connexion Google depuis Android Chrome

| Étape | Action | Résultat Attendu |
|-------|--------|------------------|
| 1 | Ouvrir Chrome et naviguer vers `https://staging.flooow.fr/auth` | Page de connexion affichée |
| 2 | Cliquer sur "Continuer avec Google" | Popup ou redirection Google |
| 3 | Sélectionner le compte Google (si plusieurs) | Compte sélectionné |
| 4 | Retour automatique vers l'application | Page d'accueil connectée |
| 5 | Vérifier le bottom navigation "Mon compte" | Bouton accessible |
| 6 | Naviguer vers une activité | Page détail affichée |

**📹 Capture vidéo obligatoire** : Enregistrer l'écran pendant toute la procédure

---

## 📘 Tests OAuth - Facebook Login

### Prérequis
- Compte Facebook de test (compte développeur ou test user)
- Application Facebook configurée
- Mode développeur activé si nécessaire

### Scénario 3 : Connexion Facebook depuis iPhone Safari

| Étape | Action | Résultat Attendu |
|-------|--------|------------------|
| 1 | Ouvrir Safari et naviguer vers `https://staging.flooow.fr/auth` | Page de connexion affichée |
| 2 | Cliquer sur "Continuer avec Facebook" | Redirection vers Facebook |
| 3 | Se connecter avec les identifiants Facebook | Authentification réussie |
| 4 | Accepter les permissions demandées | Retour vers l'application |
| 5 | Vérifier la connexion réussie | Header "Bonjour" visible |
| 6 | Naviguer vers "Mon compte" | Page sans écran blanc |
| 7 | Déconnexion | Retour à la page d'auth |

**📹 Capture vidéo obligatoire**

### Scénario 4 : Connexion Facebook depuis Android Chrome

| Étape | Action | Résultat Attendu |
|-------|--------|------------------|
| 1 | Ouvrir Chrome et naviguer vers `https://staging.flooow.fr/auth` | Page de connexion affichée |
| 2 | Cliquer sur "Continuer avec Facebook" | Popup ou redirection Facebook |
| 3 | Se connecter ou choisir un compte existant | Authentification réussie |
| 4 | Retour vers l'application | Utilisateur connecté |
| 5 | Naviguer dans l'application | Navigation fluide |
| 6 | Accéder à une activité et consulter les aides | Calcul d'aides fonctionnel |

**📹 Capture vidéo obligatoire**

---

## 💼 Tests OAuth - LinkedIn Login

### Prérequis
- Compte LinkedIn de test
- Application LinkedIn configurée dans le Developer Portal
- Redirect URI configuré

### Scénario 5 : Connexion LinkedIn depuis iPhone Safari

| Étape | Action | Résultat Attendu |
|-------|--------|------------------|
| 1 | Ouvrir Safari et naviguer vers `https://staging.flooow.fr/auth` | Page de connexion affichée |
| 2 | Cliquer sur "Continuer avec LinkedIn" | Redirection vers LinkedIn |
| 3 | Se connecter avec les identifiants LinkedIn | Authentification réussie |
| 4 | Accepter les permissions OpenID/email | Retour vers l'application |
| 5 | Vérifier la connexion réussie | Utilisateur connecté |
| 6 | Naviguer vers "Mon compte" | Contenu affiché correctement |

**📹 Capture vidéo obligatoire**

### Scénario 6 : Connexion LinkedIn depuis Android Chrome

| Étape | Action | Résultat Attendu |
|-------|--------|------------------|
| 1 | Ouvrir Chrome et naviguer vers `https://staging.flooow.fr/auth` | Page de connexion affichée |
| 2 | Cliquer sur "Continuer avec LinkedIn" | Redirection vers LinkedIn |
| 3 | Se connecter | Authentification réussie |
| 4 | Retour vers l'application | Page d'accueil connectée |
| 5 | Tester la navigation | Pas d'écran blanc |

**📹 Capture vidéo obligatoire**

---

## ⏱️ Mesures de Performance

### Temps Ressenti - Checklist

Pour chaque test OAuth, mesurer et noter les temps suivants :

| Métrique | Cible | Méthode de Mesure |
|----------|-------|-------------------|
| **Temps de redirection OAuth** | < 3s | Chronomètre du clic au retour |
| **Temps d'affichage Home connecté** | < 2s | Du retour OAuth à l'affichage complet |
| **Temps d'ouverture Mon compte** | < 2s | Du clic au contenu visible |
| **Temps d'ouverture Détail activité** | < 3s | Du clic à l'affichage prix/créneaux |
| **Temps de calcul aides** | < 2s | De la validation à l'affichage résultat |

### Template de Mesures

```
Date du test: ____/____/____
Testeur: _______________
Appareil: ______________
Provider OAuth: ________

MESURES DE TEMPS:
- Redirection OAuth: _______ secondes
- Home connecté: _______ secondes
- Mon compte: _______ secondes
- Détail activité: _______ secondes
- Calcul aides: _______ secondes

OBSERVATIONS:
________________________________
________________________________
```

---

## 📸 Captures Obligatoires

### Screenshots à prendre (format PNG)

1. **Écran de connexion** - Page `/auth` avec les boutons OAuth visibles
2. **Page OAuth provider** - Écran de connexion Google/Facebook/LinkedIn
3. **Home connecté** - Page d'accueil avec header "Bonjour [Prénom]"
4. **Mon compte** - Page de profil avec les informations
5. **Détail activité** - Page d'une activité avec prix visible
6. **Calcul aides** - Si applicable, résultat du calculateur

### Nommage des fichiers

```
YYYY-MM-DD_[device]_[provider]_[screen].png

Exemples:
- 2026-01-04_iphone13_google_auth-page.png
- 2026-01-04_pixel7_facebook_home-connected.png
- 2026-01-04_iphone13_linkedin_mon-compte.png
```

---

## 🎬 Enregistrement Vidéo

### Configuration recommandée

**iPhone** :
- Utiliser l'enregistrement d'écran natif iOS
- Activer le microphone pour les commentaires
- Résolution: 1080p ou plus

**Android** :
- Utiliser l'enregistrement d'écran natif ou AZ Screen Recorder
- Activer le son du microphone
- Résolution: 1080p minimum

### Contenu de la vidéo

La vidéo doit capturer :
1. L'URL dans la barre d'adresse
2. Tous les clics et interactions
3. Les temps de chargement visibles
4. Les messages d'erreur éventuels
5. Le comportement du clavier virtuel

### Durée recommandée

- Chaque scénario : 2-5 minutes
- Total par session de test : 20-30 minutes

---

## ✅ Checklist de Validation

### Avant chaque session de test

- [ ] Vider le cache et les cookies du navigateur
- [ ] S'assurer d'avoir une connexion stable (WiFi ou 4G)
- [ ] Préparer les identifiants de test
- [ ] Activer l'enregistrement d'écran
- [ ] Noter l'heure de début

### Après chaque scénario

- [ ] Vérifier que la vidéo est sauvegardée
- [ ] Prendre les screenshots nécessaires
- [ ] Noter les temps mesurés
- [ ] Documenter les anomalies observées
- [ ] Effectuer la déconnexion avant le test suivant

### Après la session de test

- [ ] Transférer les vidéos/screenshots
- [ ] Remplir le rapport de test
- [ ] Signaler les bugs critiques immédiatement
- [ ] Archiver les preuves de test

---

## 🐛 Signalement de Bugs

### Informations à inclure

1. **Provider OAuth concerné** (Google/Facebook/LinkedIn)
2. **Appareil et version OS**
3. **Navigateur et version**
4. **Étapes de reproduction**
5. **Comportement attendu vs observé**
6. **Captures d'écran/vidéo**
7. **Logs console si accessibles**

### Template de bug report

```markdown
## Bug OAuth Mobile

**Provider**: Google / Facebook / LinkedIn
**Appareil**: iPhone 13 / Pixel 7 / autre
**OS**: iOS XX / Android XX
**Navigateur**: Safari / Chrome
**Environnement**: staging / production

### Description
[Description claire du problème]

### Étapes de reproduction
1. ...
2. ...
3. ...

### Résultat attendu
[Ce qui devrait se passer]

### Résultat observé
[Ce qui se passe réellement]

### Preuves
- Vidéo: [lien]
- Screenshots: [liens]

### Priorité estimée
Critique / Haute / Moyenne / Basse
```

---

## 📊 Rapport de Test

### Format du rapport final

```markdown
# Rapport de Tests OAuth Mobile

**Date**: ____/____/____
**Testeur**: _______________
**Durée totale**: _____ minutes

## Résumé

| Provider | iPhone Safari | Android Chrome |
|----------|--------------|----------------|
| Google   | ✅ / ❌      | ✅ / ❌       |
| Facebook | ✅ / ❌      | ✅ / ❌       |
| LinkedIn | ✅ / ❌      | ✅ / ❌       |

## Bugs Identifiés

1. [Bug #1 - Description courte]
2. [Bug #2 - Description courte]

## Performances

[Tableau des temps mesurés]

## Recommandations

[Liste des améliorations suggérées]

## Preuves

- Vidéos: [liens vers stockage]
- Screenshots: [liens vers stockage]
```

---

## 📚 Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Google OAuth Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [LinkedIn OpenID Connect](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2)

---

*Dernière mise à jour : Janvier 2026*
