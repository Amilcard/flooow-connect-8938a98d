# 🎬 GUIDE DÉMO JURY - Parcours Mme LEMOINE (READY TO USE)

## ⚡ Checklist Avant Démo
- [ ] Ouvrir l'application en mode **navigation privée** (pas de cache)
- [ ] Avoir sous les yeux : Email `lemoine.demo@inklusif.fr` + Mot de passe
- [ ] Timer : Prévoir **3-4 minutes** pour le parcours complet
- [ ] Tester 1 fois AVANT le jury (dry run)

---

## 👤 PERSONA : Mme Sophie LEMOINE

### Profil famille
- **Prénom/Nom** : Sophie LEMOINE
- **Email** : `lemoine.demo@inklusif.fr`
- **Mot de passe** : *(à définir lors de la création du compte)*
- **Ville** : Saint-Étienne (42000)
- **Quotient Familial** : 800€
- **Situation** : En couple
- **Problématique** : Cherche un séjour de vacances pour ses deux enfants pendant les vacances de printemps 2026

### Enfants
1. **Emma** - Fille, 9 ans (née le 15/06/2016)
2. **Lucas** - Fils, 7 ans (né le 20/03/2018)

---

## 🎯 PARCOURS DÉMO COMPLET (3-4 min)

### ⏱️ ÉTAPE 1 : Création du compte (30 sec)
**Action** : Aller sur `/auth`

1. Cliquer sur **"Créer un compte"**
2. Remplir le formulaire :
   - Prénom : `Sophie`
   - Nom : `LEMOINE`
   - Email : `lemoine.demo@inklusif.fr`
   - Mot de passe : *(Choisir un mot de passe fort : 8 car. + majuscule + chiffre + spécial)*
3. Cliquer sur **"Créer mon compte"**

💬 **Narration jury** :
> "Mme LEMOINE crée son compte en quelques secondes. L'inscription est simple et rapide."

---

### ⏱️ ÉTAPE 2 : Compléter le profil (45 sec)
**Action** : Redirection automatique vers `/profile-completion`

1. Remplir les informations :
   - **Code postal** : `42000` (Saint-Étienne)
   - **Quotient Familial** : `800`
   - **Situation familiale** : `En couple`
2. Ajouter les enfants :
   - **Enfant 1** : `Emma`, Date de naissance : `15/06/2016` (9 ans)
   - **Enfant 2** : `Lucas`, Date de naissance : `20/03/2018` (7 ans)
3. Valider

💬 **Narration jury** :
> "Mme LEMOINE renseigne son quotient familial de 800€ et ajoute ses deux enfants. La plateforme va maintenant calculer automatiquement les aides auxquelles elle a droit."

✅ **Résultat** : Territoire validé, profil complet, accès aux aides débloqué

---

### ⏱️ ÉTAPE 3 : Recherche de séjours vacances (20 sec)
**Action** : Depuis la page d'accueil `/`

1. Scroller jusqu'à la section **"Explorer par univers"**
2. Cliquer sur la carte **"Vacances"** (icône ☀️)
3. **OU** utiliser le filtre période en haut : **"Vacances Printemps 2026"**

💬 **Narration jury** :
> "Mme LEMOINE recherche des séjours pour les vacances de printemps. La plateforme lui propose des activités adaptées à sa zone géographique."

✅ **Résultat** : Arrivée sur `/activities?category=Vacances`

---

### ⏱️ ÉTAPE 4 : Sélection du séjour (30 sec)
**Action** : Parcourir les résultats

**Séjours disponibles pour Emma (9 ans) et Lucas (7 ans)** :

| Séjour | Âge | Lieu | Prix | Dates Printemps 2026 | Places |
|--------|-----|------|------|----------------------|--------|
| 🏕️ **Colonie Multi-activités** | 6-9 ans | Saint-Étienne | 150€ | 6-18 avril (12j) | 25 |
| 🌲 **Séjour Nature & Survie** ⭐ | 6-9 ans | Saint-Étienne | 120€ | 13-17 avril (5j) | 16 |
| 🎪 **Stage Cirque** | 6-9 ans | Saint-Étienne | 150€ | 6-10 avril (5j) | 20 |

**Recommandé pour la démo** : **🌲 Séjour Nature & Survie**
- Prix abordable (120€)
- Durée courte (5 jours)
- Thématique attractive (aventure, camping)

1. Cliquer sur **"Séjour Nature & Survie - Vacances"**

💬 **Narration jury** :
> "Mme LEMOINE choisit le Séjour Nature & Survie, idéal pour les deux enfants. Elle va maintenant voir les aides disponibles."

---

### ⏱️ ÉTAPE 5 : Simulation des aides (45 sec) ⭐ MOMENT CLÉ

**Action** : Sur la fiche détaillée du séjour

1. Cliquer sur le bouton **"Simuler les aides"** ou **"Voir les aides financières"**
2. La modale s'ouvre avec :
   - QF pré-rempli : **800€** ✓
   - Ville pré-remplie : **Saint-Étienne** ✓
   - Prix activité : **120€** ✓
   - Durée : **5 jours** ✓

3. Sélectionner **Emma (9 ans)** dans la liste déroulante
4. Cliquer sur **"Calculer mes aides"**

**Résultats affichés** :

| Aide | Niveau | Montant | Lien |
|------|--------|---------|------|
| 🇫🇷 **Chèques Vacances** | National | 50€ | [Voir] |
| 🇫🇷 **Bons Vacances CAF** | National | 10€ (2€/jour × 5j) | [Voir] |

**Calcul automatique** :
```
Prix de base :        120€
Total aides :         -60€
━━━━━━━━━━━━━━━━━━━━━━━━━
Reste à charge :      60€ ⭐
```

5. Répéter pour **Lucas (7 ans)** :
   - Même résultat : **60€ de reste à charge**

**Synthèse famille** :
```
Prix total (2 enfants) :  240€
Aides mobilisées :       -120€
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COÛT FINAL FAMILLE :      120€
ÉCONOMIE RÉALISÉE :       50% 💰
```

💬 **Narration jury** :
> "La plateforme calcule instantanément les aides disponibles. Mme LEMOINE économise 120€ grâce aux deux dispositifs nationaux (Chèques Vacances + CAF). Le coût final pour ses deux enfants n'est que de 120€ au lieu de 240€."

---

### ⏱️ ÉTAPE 6 : Réservation (30 sec)

**Action** : Valider l'inscription

1. Cliquer sur **"Réserver cette activité"**
2. Sélectionner les enfants :
   - ☑️ **Emma** (9 ans) - Reste à charge : 60€
   - ☑️ **Lucas** (7 ans) - Reste à charge : 60€
3. Choisir le créneau :
   - **📅 13-17 avril 2026** (lundi au vendredi)
4. Valider la réservation

💬 **Narration jury** :
> "Mme LEMOINE valide l'inscription de ses deux enfants en un clic. Elle recevra une confirmation par email et pourra suivre le statut de sa réservation dans son espace personnel."

✅ **Résultat** : Redirection vers `/booking-status` avec confirmation

---

## 🎯 MESSAGES CLÉS POUR LE JURY

### 1. **Simplicité d'usage**
- ✅ Compte créé en 30 secondes
- ✅ Aides calculées automatiquement
- ✅ Parcours fluide sans friction

### 2. **Impact financier**
- 💰 **50% d'économie** pour cette famille (120€ sur 240€)
- 📊 **2 aides mobilisées** sans démarches complexes
- 🎯 **Transparence totale** sur le reste à charge

### 3. **Accessibilité territoriale**
- 📍 **Saint-Étienne** : Ville pilote
- 🏘️ **La Ricamarie** : Commune voisine couverte
- 🚀 **Extension future** : Autres communes de la métropole

### 4. **Non-recours résolu**
- ❌ **Avant** : Familles ne connaissent pas les aides → renoncent
- ✅ **Après** : Calcul automatique → inscription facilitée
- 📈 **Impact** : Augmentation du taux de participation

---

## 📊 DONNÉES TECHNIQUES (Pour référence)

### Séjours disponibles dans la base
```sql
-- Séjours 6-9 ans (éligibles Emma + Lucas)
1. Colonie Multi-activités (150€) - 6-9 ans - 25 places
2. Séjour Nature & Survie (120€) - 6-9 ans - 16 places ⭐ RECOMMANDÉ
3. Stage Cirque (150€) - 6-9 ans - 20 places
4. Stage Foot Juniors (10€) - 6-9 ans - 24 places
```

### Aides financières actives
```sql
-- Aides nationales (tous éligibles)
1. Pass'Sport (50€) - Sport - 6-17 ans
2. Chèques Vacances (50€) - Vacances/Loisirs - 6-17 ans ⭐
3. Pass Culture (40€) - Culture/Loisirs - 6-17 ans
4. Bons Vacances CAF (2€/jour) - Vacances - 6-17 ans ⭐
```

### Territoires couverts
```sql
-- Communes actives dans la base
1. Saint-Étienne (42000, 42100) ✅
2. La Ricamarie (42150) ✅
```

---

## ⚠️ TROUBLESHOOTING

### Problème : Compte déjà existant
**Solution** : Utiliser "Se connecter" au lieu de "Créer un compte"

### Problème : Pas d'aides affichées
**Vérifier** :
- Code postal = 42000 ✓
- Quotient Familial = 800 ✓
- Âge enfants = 7 et 9 ans ✓

### Problème : Pas de séjours dans les résultats
**Vérifier** :
- Filtre "Vacances" activé ✓
- Période "Printemps 2026" sélectionnée ✓
- Onglet "Toutes" ou "Vacances" ✓

### Problème : Erreur lors de la réservation
**Fallback** : Utiliser "Stage Foot Juniors" (10€, moins de contraintes)

---

## 🎬 SCRIPT ALTERNATIF (Plan B)

### Si problème technique sur Mme LEMOINE
1. Utiliser un compte démo existant créé avant la présentation
2. Ou démontrer avec un autre profil famille déjà configuré
3. L'essentiel : Montrer le **calcul automatique des aides** et la **réduction du reste à charge**

---

## 📞 CONTACT SUPPORT DÉMO

**Avant le jury** :
- Tester le parcours complet en **mode navigation privée**
- Vérifier que les séjours s'affichent bien
- Confirmer le calcul des aides (doit afficher 60€ de reste à charge)

**Durée totale** : 3-4 minutes chrono
**Moment fort** : Étape 5 (Simulation des aides) - **INSISTER sur l'économie de 50%**

---

## 🏆 OBJECTIF JURY

**Démontrer que la plateforme** :
1. ✅ Simplifie l'accès aux activités
2. ✅ Calcule automatiquement les aides financières
3. ✅ Réduit le non-recours aux droits
4. ✅ Favorise l'inclusion par l'accessibilité financière

**Phrase d'accroche finale** :
> "Grâce à Inklusif, Mme LEMOINE a inscrit ses deux enfants à un séjour de vacances pour 120€ au lieu de 240€, sans aucune démarche administrative complexe. C'est ça, réduire le non-recours aux droits."
