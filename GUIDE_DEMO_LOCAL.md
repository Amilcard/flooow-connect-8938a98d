# 🎬 Guide Démo Locale - Flooow Connect

## ⏰ À faire AVANT la réunion (10 minutes)

### Étape 1 : Ouvrir le Terminal

**Sur Windows** :
- Appuyer sur `Windows + R`
- Taper `cmd` ou `powershell`
- Appuyer sur Entrée

**Sur Mac** :
- Appuyer sur `Cmd + Espace`
- Taper `Terminal`
- Appuyer sur Entrée

**Sur Linux** :
- Appuyer sur `Ctrl + Alt + T`

---

### Étape 2 : Aller dans le dossier du projet

```bash
cd /home/user/flooow-connect
```

**OU** si le dossier est ailleurs :
```bash
cd /chemin/vers/flooow-connect
```

**💡 Astuce** : Vous pouvez aussi glisser-déposer le dossier dans le terminal sur Mac/Linux.

---

### Étape 3 : Installer les dépendances (une seule fois)

```bash
npm install
```

**⏱️ Durée** : 2-3 minutes

**✅ Vous verrez** : Plein de lignes qui défilent, c'est normal !

**❌ Si erreur "npm not found"** :
- Vous devez installer Node.js : https://nodejs.org/
- Télécharger la version LTS
- Relancer le terminal après installation

---

### Étape 4 : Lancer le site

```bash
npm run dev
```

**✅ Résultat attendu** :
```
VITE v5.4.19  ready in 532 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

**🎉 C'EST BON ! Votre site tourne !**

**❌ Ne fermez PAS le terminal** (le site s'arrêterait)

---

### Étape 5 : Ouvrir le site dans votre navigateur

**Méthode 1** :
- Cliquer sur le lien `http://localhost:5173/` dans le terminal (Ctrl+Clic ou Cmd+Clic)

**Méthode 2** :
- Ouvrir votre navigateur (Chrome, Firefox, Safari)
- Taper dans la barre d'adresse : `http://localhost:5173`
- Appuyer sur Entrée

---

## 🎬 Séquence de démo recommandée (7 minutes)

### 🔑 Se connecter au dashboard

**URL** : `http://localhost:5173`

1. Cliquer sur "Connexion" ou aller sur `/auth`
2. **Email** : `collectivite@demo.flooow.fr`
3. **Mot de passe** : `Demo2025!`
4. Cliquer sur "Se connecter"

**✅ Résultat** : Vous êtes redirigé vers `/dashboard/collectivite`

---

### 📊 Présentation du dashboard (6 minutes)

#### **[1 min] Vue générale**
- Montrer les 5 KPIs en haut :
  - 347 inscriptions
  - 12.5% handicap
  - 18.3% QPV
  - 40.9% bus (éco-mobilité)
  - 90 min/semaine activité

#### **[1 min] Onglet "Réussite éducative"**
- Cliquer sur l'onglet (icône 🎓)
- Montrer :
  - 87 demandes soutien scolaire
  - 59% en QPV (52 demandes)
  - 19 jeunes sans solution
  - Raisons abandon (places, distance, horaires)
- **Message clé** : "On voit où investir en accompagnement scolaire"

#### **[1 min] Onglet "Santé"**
- Cliquer sur l'onglet (icône ❤️)
- Montrer :
  - 124 demandes activités santé
  - 34% pour stress/anxiété (42 jeunes)
  - 98 places trouvées, 26 sans solution
- **Message clé** : "Alerte santé mentale jeunes, besoin offre prévention"

#### **[1 min] Onglet "Tranquillité publique"**
- Cliquer sur l'onglet (icône 🛡️)
- Montrer :
  - 156 jeunes 11-17 ans occupés temps sensibles
  - 89% saturation QPV (vs 62% hors QPV)
  - Répartition : 67 soirs, 54 week-ends, 35 vacances
- **Message clé** : "Occupation encadrée jeunes temps où ça chauffe"

#### **[1 min] Onglet "Égalité F/G"**
- Cliquer sur l'onglet (icône 👫)
- Montrer :
  - Écart accès 9.3% (filles 73% vs garçons 82%)
  - 14 filles QPV sans solution
  - Comparatif sport/culture
- **Message clé** : "Accès filles du quartier aux activités prioritaire"

#### **[1 min] Onglets Mobilité + Handicap**
- **Mobilité** (icône 🧭) : 34 abandons transport, 28min QPV vs 15min
- **Handicap** (icône ♿) : 43 enfants, 65% inclusion, 15 sans solution
- **Message clé** : "Besoin navette QPV + offre adaptée handicap"

---

### 🎯 Conclusion (1 minute)

> "Ces 6 indicateurs politiques sont **opérationnels aujourd'hui**. Chacun donne des leviers d'action concrets :
> - Où ouvrir un centre de soutien scolaire
> - Où créer une offre prévention santé mentale
> - Où augmenter les créneaux soirs/week-ends
> - Comment réduire l'écart filles-garçons
> - Où mettre des navettes
> - Quelles activités adapter au handicap
>
> Phase 2 : On ajoute non-recours aux aides, parentalité, insertion jeunes."

---

## ⚠️ En cas de problème technique

### Le site ne charge pas ?

**Vérifier** :
1. Le terminal est-il encore ouvert ? (Ne pas le fermer)
2. Vous voyez "Local: http://localhost:5173/" dans le terminal ?
3. L'URL dans le navigateur est bien `http://localhost:5173` (pas `https`) ?

**Solution** :
- Fermer le terminal
- Relancer `npm run dev`
- Recharger la page navigateur (F5)

---

### Page blanche ou erreur ?

**Solution 1 : Vider le cache**
- Chrome/Edge : `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)
- Firefox : `Ctrl + F5`

**Solution 2 : Mode incognito**
- Ouvrir fenêtre privée
- Aller sur `http://localhost:5173`

---

### Les onglets dashboard ne s'affichent pas ?

**Vérifier** :
- Vous êtes bien connecté avec `collectivite@demo.flooow.fr` ?
- L'URL est bien `/dashboard/collectivite` ?

**Solution** :
- Se déconnecter
- Se reconnecter avec les bons identifiants

---

## 📱 Plan B : Screenshots de secours

Si vraiment ça ne marche pas le jour J, j'ai préparé des slides avec les screenshots des dashboards dans le dossier `screenshots-backup/`.

---

## ✅ Checklist jour J

**30 minutes avant la réunion** :

- [ ] Ouvrir le terminal
- [ ] `cd /home/user/flooow-connect`
- [ ] `npm run dev`
- [ ] Ouvrir `http://localhost:5173`
- [ ] Se connecter avec compte démo
- [ ] Vérifier que les 10 onglets chargent
- [ ] Brancher ordinateur sur secteur (pas de batterie faible !)
- [ ] Désactiver notifications (mode "Ne pas déranger")
- [ ] Fermer autres apps gourmandes

**Pendant la démo** :

- [ ] NE PAS fermer le terminal
- [ ] NE PAS fermer le navigateur
- [ ] Respirer 😊

---

## 🎉 Vous êtes prêt !

Avec ce setup, votre démo sera **fluide, stable, et impressionnante**.

Bonne chance ! 🚀
