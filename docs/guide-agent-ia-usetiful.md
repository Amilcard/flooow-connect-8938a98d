# 🤖 GUIDE POUR L'AGENT IA - INTÉGRATION USETIFUL

**Date** : 22 novembre 2025  
**Mission** : Créer les nouveaux tours Usetiful avec ton CityCrunch  
**Durée estimée** : 30-45 minutes

---

## 🎯 VOTRE MISSION

Vous devez créer **2 nouveaux tours** dans le dashboard Usetiful pour l'application Flooow :

1. **Tour GUIDE Principal** : "Découverte de Flooow" (6 bulles)
2. **TIPS Contextuels** : "Astuces Flooow" (6 tips)

---

## ⛔️ CONTRAINTES DE NAVIGATION STRICTES

**RÈGLE ABSOLUE** : 
- **Restez UNIQUEMENT sur l'onglet du Dashboard Usetiful.**
- **INTERDICTION** d'ouvrir de nouveaux onglets pour chercher de l'aide.
- **INTERDICTION** de quitter l'interface d'édition pour aller sur la documentation.
- Toutes les informations dont vous avez besoin (textes, sélecteurs, configurations) sont **DANS CE DOCUMENT**.
- Si vous avez un doute, relisez ce guide, ne cherchez pas sur Google.

---

## ⚠️ TOURS EXISTANTS À NE PAS TOUCHER

**IMPORTANT** : Ces 3 tours sont actuellement **LIVE en production**. **NE PAS les modifier, dépublier ou supprimer** :

- ❌ **Tour Accueil** (Live) → NE PAS TOUCHER
- ❌ **Tour Recherche** (Live) → NE PAS TOUCHER
- ❌ **Tour Détail** (Live) → NE PAS TOUCHER

> **Règle d'or** : Si vous voyez un tour avec le statut "Live", **ne le touchez pas**.

---

## 📋 TOURS EN DRAFT À IGNORER

Ces tours sont en Draft et ne sont pas utilisés. Vous pouvez les **ignorer complètement** :

- ⏸️ Tour Détail (Draft) → Ignorer
- ⏸️ Tour Recherche (Draft) → Ignorer
- ⏸️ Tour Accueil (Draft) → Ignorer
- ⏸️ Découverte InKlusif Flooow (Draft) → Ignorer
- ⏸️ Smart tips (Draft) → Ignorer
- ⏸️ Essentiel accueil – Trouver activité et aides (Draft) → Garder en backup (ne pas supprimer)

> **Note** : Ne perdez pas de temps avec ces tours. Concentrez-vous uniquement sur la création des 2 nouveaux tours.

---

## 📦 FICHIER DE CONFIGURATION À UTILISER

Utilisez le fichier suivant comme référence :

**Chemin** : `/Users/laidhamoudi/flooow-connect-8938a98d/flooow-connect-8938a98d/docs/usetiful-config.json`

Ce fichier contient :
- ✅ Tous les textes des bulles (titre + description)
- ✅ Les `data-tour-id` à cibler
- ✅ Le placement des bulles (top/bottom)
- ✅ Les routes à utiliser

---

## 🚀 ÉTAPE 1 : CRÉER LE TOUR GUIDE PRINCIPAL

### Informations du tour

| Propriété | Valeur |
|-----------|--------|
| **Nom du tour** | "Découverte de Flooow" |
| **ID** | `flooow-main-tour` |
| **Type** | Guide (tour principal) |
| **Nombre d'étapes** | 6 |
| **Route principale** | `/home` |
| **Trigger** | Manuel (ou après onboarding) |
| **ShowOnce** | ✅ Oui (ne montrer qu'une fois) |
| **Audience** | 100% (tous les utilisateurs) |

### Les 6 bulles à créer

#### Bulle 1 : Barre de recherche
- **Target** : `global-search-bar`
- **Titre** : "Trouvez l'activité parfaite (sans lancer une expédition)"
- **Description** : "Saisissez ce que vous cherchez : sport, ateliers, sorties, soutien scolaire… Nous vous évitons le marathon des onglets : les activités adaptées arrivent directement ici, calmement."
- **Placement** : Bottom
- **Route** : `/home`

#### Bulle 2 : Carte Aides Financières
- **Target** : `home-aids-card`
- **Titre** : "Votre reste à charge… sans la prise de tête"
- **Description** : "Ici, vous obtenez une estimation de vos aides et du reste à charge probable. Ce n'est pas un devis officiel, mais cela vous donne une idée claire avant de contacter l'organisme."
- **Placement** : Top
- **Route** : `/home`
- **⚠️ Note importante** : Ajouter un disclaimer visible : "⚠️ Estimation uniquement - À confirmer avec l'organisme"

#### Bulle 3 : Carte Mobilité
- **Target** : `home-mobility-card`
- **Titre** : "S'y rendre sans stress (et sans ruiner la planète)"
- **Description** : "Bus, marche, vélo, covoiturage : nous vous suggérons le trajet le plus simple. Souvent le plus économique… et le plus doux pour la planète."
- **Placement** : Top
- **Route** : `/home`

#### Bulle 4 : Première carte d'activité
- **Target** : `activity-card-first`
- **Titre** : "Tout ce qu'il faut savoir, d'un seul regard"
- **Description** : "Horaires, âge, prix, aides et reste à charge : tout est visible en un coup d'œil. Touchez la carte pour accéder aux détails."
- **Placement** : Top
- **Route** : `/home`
- **⚠️ Attention** : Cet élément n'apparaît que s'il y a au moins 1 activité affichée. Vérifiez qu'il est bien visible avant de créer la bulle.

#### Bulle 5 : Mon compte (navigation)
- **Target** : `nav-item-account`
- **Titre** : "Votre espace rien qu'à vous"
- **Description** : "Informations, enfants, inscriptions, favoris : tout est regroupé ici pour simplifier vos démarches."
- **Placement** : Top
- **Route** : `/home`

#### Bulle 6 : Accueil (navigation)
- **Target** : `nav-item-home`
- **Titre** : "Revenir au point de départ"
- **Description** : "Vous êtes un peu perdu(e) ? Ce bouton vous ramène en terrain connu."
- **Placement** : Top
- **Route** : `/home`

### 🆘 EN CAS DE BLOCAGE SUR LES BULLES 3 ET 4

**Pourquoi ces étapes sont plus complexes ?**
- **Bulle 3 (`home-mobility-card`)** : Elle est située dans une grille responsive. Si l'écran est petit, elle peut être "sous la ligne de flottaison".
- **Bulle 4 (`activity-card-first`)** : C'est l'élément le plus difficile car il est **DYNAMIQUE**. Il n'existe PAS tant que les activités ne sont pas chargées depuis la base de données.

**SOLUTIONS PRATIQUES :**

**Pour la Bulle 3 (`home-mobility-card`) :**
1. **Scroll** : Assurez-vous de scroller légèrement vers le bas pour que la carte soit visible.
2. **Sélecteur CSS manuel** : Si le clic ne marche pas, entrez manuellement : `[data-tour-id="home-mobility-card"]`
3. **Vérification** : C'est la carte avec l'image de train/vélo et le titre "Nos trajets".

**Pour la Bulle 4 (`activity-card-first`) :**
1. **Attente** : Attendez 5-10 secondes que les activités chargent.
2. **Sélecteur CSS manuel** : C'est souvent la seule façon de le cibler si le mode "point & click" échoue. Entrez : `[data-tour-id="activity-card-first"]`
3. **Plan B (Si aucune activité)** : Si la page affiche "Aucune activité trouvée", **vous ne pouvez pas créer cette étape**. Passez à l'étape 5 et notez-le.
4. **Astuce** : Essayez de rafraîchir la page `/home` pour relancer le chargement des activités.

---

## 💡 ÉTAPE 2 : CRÉER LES TIPS CONTEXTUELS

### Informations du tour

| Propriété | Valeur |
|-----------|--------|
| **Nom du tour** | "Astuces Flooow" |
| **ID** | `flooow-tips` |
| **Type** | Tips (astuces contextuelles) |
| **Nombre de tips** | 6 |
| **Trigger** | Contextuel (focus, scroll, hover) |
| **ShowOnce** | ✅ Oui (ne montrer qu'une fois) |
| **Dismissible** | ✅ Oui (croix pour fermer) |
| **Audience** | 100% (tous les utilisateurs) |

### Les 6 tips à créer

#### TIP 1 : Simulation reste à charge
- **Target** : `reste-charge-title`
- **Titre** : "💡 Astuce : Simulation personnalisée"
- **Description** : "Indiquez quelques informations familiales pour obtenir un reste à charge plus réaliste. La simulation s'actualise automatiquement."
- **Route** : `/activity/:id`
- **Trigger** : Au focus sur l'input de quotient familial
- **⚠️ Attention** : Cet élément n'apparaît que si l'utilisateur a calculé ses aides. Configurer comme optionnel.

#### TIP 2 : Trajet simplifié
- **Target** : `mobilite-section`
- **Titre** : "💡 Astuce : Trajet simplifié"
- **Description** : "Besoin d'un repère pour le trajet ? Les options de mobilité vous montrent le chemin le plus simple, même si vous n'aimez pas improviser."
- **Route** : `/activity/:id`
- **Trigger** : Au scroll sur la section mobilité

#### TIP 3 : Actualités locales
- **Target** : `nav-item-maville`
- **Titre** : "💡 Astuce : Actualités locales"
- **Description** : "Ici, vous retrouvez les actualités de votre commune : événements, activités et infos utiles."
- **Route** : `/home`
- **Trigger** : Au hover sur l'icône "Ma ville"

#### TIP 4 : Recherche complète
- **Target** : `nav-item-search`
- **Titre** : "💡 Astuce : Recherche complète"
- **Description** : "Envie d'explorer davantage ? La recherche complète vous permet de parcourir toutes les activités disponibles, sans limite."
- **Route** : `/home`
- **Trigger** : Au hover sur l'icône "Recherche"

#### TIP 5 : Connexion simplifiée
- **Target** : `nav-item-account`
- **Titre** : "💡 Astuce : Connexion simplifiée"
- **Description** : "En vous connectant, tout devient plus simple : vos favoris, vos inscriptions et vos informations sont accessibles plus rapidement."
- **Route** : `/home`
- **Trigger** : Au hover sur l'icône "Mon compte" (uniquement si déconnecté)

#### TIP 6 : Navigation principale
- **Target** : `nav-item-home`
- **Titre** : "💡 Astuce : Navigation principale"
- **Description** : "Un doute ? Ce bouton vous ramène toujours à l'écran principal, en un instant."
- **Route** : `*` (toutes les pages)
- **Trigger** : Au hover sur l'icône "Accueil"

---

## ⚠️ PIÈGES À ÉVITER

### 🔴 Piège 1 : Éléments conditionnels

Certains `data-tour-id` ne sont présents dans le DOM que sous certaines conditions :

| data-tour-id | Condition | Solution |
|--------------|-----------|----------|
| `activity-card-first` | Uniquement si ≥ 1 activité affichée | Vérifier qu'il y a des activités avant de créer la bulle |
| `reste-charge-title` | Uniquement si aides calculées | Configurer le TIP comme optionnel |

**Action** : Avant de créer une bulle, vérifiez que l'élément est bien visible dans le DOM.

### 🔴 Piège 2 : Mauvais `data-tour-id`

**Erreur fréquente** : Taper `data-tour-id` avec des fautes de frappe.

**Solution** : Copiez-collez les `data-tour-id` depuis le fichier JSON pour éviter les erreurs.

### 🔴 Piège 3 : Placement incorrect

**Erreur fréquente** : Mettre toutes les bulles en "top" ou "bottom" sans réfléchir.

**Solution** : Suivez le placement indiqué dans le JSON :
- `global-search-bar` → **Bottom** (bulle en dessous de la barre)
- Toutes les autres → **Top** (bulle au-dessus de l'élément)

### 🔴 Piège 4 : Oublier les disclaimers

**Erreur critique** : Ne pas mettre le disclaimer sur la bulle des aides financières.

**Solution** : Sur la bulle 2 (`home-aids-card`), ajoutez **obligatoirement** le disclaimer :
> "⚠️ Estimation uniquement - À confirmer avec l'organisme"

### 🔴 Piège 5 : Modifier les tours Live

**Erreur critique** : Modifier ou dépublier les tours actuellement Live.

**Solution** : **NE TOUCHEZ PAS** aux tours "Tour Accueil", "Tour Recherche", "Tour Détail" qui sont Live.

---

## ✅ CHECKLIST DE VÉRIFICATION

Avant de publier les tours, vérifiez :

### Tour GUIDE Principal

- [ ] Le tour s'appelle bien "Découverte de Flooow"
- [ ] Il contient exactement 6 bulles
- [ ] Toutes les bulles ciblent la route `/home`
- [ ] Les `data-tour-id` sont corrects (pas de fautes de frappe)
- [ ] Le placement est correct (bottom pour bulle 1, top pour les autres)
- [ ] Le disclaimer est présent sur la bulle 2 (aides)
- [ ] ShowOnce est activé
- [ ] Le tour est en mode "Draft" (pas encore publié)

### TIPS Contextuels

- [ ] Le tour s'appelle bien "Astuces Flooow"
- [ ] Il contient exactement 6 tips
- [ ] Les triggers sont configurés (focus, scroll, hover)
- [ ] ShowOnce est activé
- [ ] Dismissible est activé (croix pour fermer)
- [ ] Le tour est en mode "Draft" (pas encore publié)

### Vérification DOM

- [ ] Ouvrir le site en mode preview
- [ ] Aller sur `/home`
- [ ] Vérifier que tous les éléments ciblés sont visibles :
  - [ ] `global-search-bar` (barre de recherche)
  - [ ] `home-aids-card` (carte aides)
  - [ ] `home-mobility-card` (carte mobilité)
  - [ ] `activity-card-first` (première carte activité)
  - [ ] `nav-item-account` (icône compte)
  - [ ] `nav-item-home` (icône accueil)

### Test du parcours

- [ ] Lancer le tour GUIDE en mode preview
- [ ] Vérifier que les 6 bulles s'affichent correctement
- [ ] Vérifier que la navigation Suivant/Précédent fonctionne
- [ ] Vérifier que le bouton "Terminer" ferme le tour
- [ ] Vérifier que les textes sont complets (pas de coupure)

---

## 🚀 ÉTAPES D'EXÉCUTION

### 1. Connexion au dashboard Usetiful

1. Ouvrir le dashboard Usetiful
2. Se connecter avec les identifiants fournis
3. Vérifier que vous êtes bien sur le projet "Flooow - InKlusif"

### 2. Création du tour GUIDE

1. Cliquer sur "Create new tour"
2. Sélectionner "Guide tour"
3. Nommer le tour "Découverte de Flooow"
4. Créer les 6 bulles une par une (voir détails ci-dessus)
5. Configurer ShowOnce = true
6. Sauvegarder en mode "Draft"

### 3. Création des TIPS

1. Cliquer sur "Create new tour"
2. Sélectionner "Tips"
3. Nommer le tour "Astuces Flooow"
4. Créer les 6 tips un par un (voir détails ci-dessus)
5. Configurer les triggers (focus, scroll, hover)
6. Configurer ShowOnce = true et Dismissible = true
7. Sauvegarder en mode "Draft"

### 4. Tests en mode preview

1. Activer le mode preview pour le tour GUIDE
2. Ouvrir le site sur `/home`
3. Vérifier que le tour se déclenche
4. Tester le parcours complet
5. Répéter pour les TIPS

### 5. Validation finale

1. Vérifier la checklist ci-dessus
2. Prendre des screenshots des tours créés
3. Informer l'équipe que les tours sont prêts en Draft
4. Attendre validation avant de publier

---

## 📊 MÉTRIQUES À CONFIGURER (OPTIONNEL)

Si vous avez accès aux analytics Usetiful, configurez :

- **Completion rate** : Taux de complétion du tour
- **Skip rate** : Taux d'abandon
- **Time to complete** : Temps moyen de complétion
- **Step dropout** : Taux d'abandon par étape

---

## 🆘 EN CAS DE PROBLÈME

### Problème 1 : Élément non trouvé

**Symptôme** : Usetiful ne trouve pas le `data-tour-id`

**Solution** :
1. Ouvrir le site
2. Inspecter l'élément (clic droit → Inspecter)
3. Vérifier que l'attribut `data-tour-id` existe bien
4. Vérifier l'orthographe exacte

### Problème 2 : Bulle mal positionnée

**Symptôme** : La bulle est hors écran ou mal placée

**Solution** :
1. Changer le placement (top ↔ bottom)
2. Ajuster l'offset si nécessaire
3. Tester sur mobile et desktop

### Problème 3 : Texte coupé

**Symptôme** : Le texte de la bulle est tronqué

**Solution** :
1. Réduire la longueur du texte
2. Ou ajuster la largeur de la bulle dans les paramètres

---

## 📞 CONTACT

En cas de blocage, contacter :
- **Responsable projet** : [À définir]
- **Support Usetiful** : support@usetiful.com

---

## 🎉 APRÈS LA CRÉATION

Une fois les 2 tours créés et testés :

1. ✅ Informer l'équipe que les tours sont prêts
2. ✅ Fournir les screenshots
3. ✅ Attendre validation avant publication
4. ✅ Une fois validés, passer les tours de "Draft" à "Live"

---

**Bonne chance ! 🚀**

**Temps estimé** : 30-45 minutes  
**Difficulté** : Moyenne  
**Importance** : Haute (amélioration UX)
