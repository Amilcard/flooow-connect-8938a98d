# 📋 AUDIT COMPLET : CONFORMITÉ RGPD & CADRE CONTRACTUEL

## 🎯 OBJECTIF DU DOCUMENT

Ce document fait le point complet sur **ce qui existe déjà** dans votre plateforme InKlusif Flooow concernant :
- Le cadre contractuel et les achats publics
- La conformité RGPD (données personnelles, mineurs)

---

## ✅ CE QUI EXISTE DÉJÀ

### 1️⃣ PAGES LÉGALES (Front-end)

#### ✔️ **RGPD.tsx** - `/legal/rgpd`
**Statut** : ⚠️ **BASIQUE - À COMPLÉTER**

**Contenu actuel** :
```
- Responsable de traitement : InKlusif Flooow
- Base légale : exécution du contrat, consentement, obligations légales
- Durées de conservation : mentionnées génériquement
- Contact : via page contact
```

**❌ Ce qui MANQUE** :
- Nom précis du responsable de traitement (collectivité)
- Statut de Flooow comme sous-traitant (art. 28 RGPD)
- Détail des bases légales par type de données
- Durées de conservation précises par catégorie
- Coordonnées du DPO (Délégué à la Protection des Données)
- Mention DPIA/PIA réalisée
- Liste des sous-traitants ultérieurs

---

#### ✔️ **PrivacyPolicy.tsx** - `/legal/privacy-policy`
**Statut** : ⚠️ **BASIQUE - À COMPLÉTER**

**Contenu actuel** :
```
1. Données collectées : nom, email, téléphone, infos enfants
2. Finalités : service, réservations, communication
3. Partage : pas de tiers sans consentement
4. Droits : accès, rectification, suppression, export
5. Sécurité : mesures techniques et organisationnelles
```

**❌ Ce qui MANQUE** :
- Catégories détaillées de données (profil adulte, enfant, santé, handicap, etc.)
- Base légale pour chaque catégorie
- Durée précise de conservation par type de données
- Procédure détaillée pour exercer les droits (SLA 30 jours)
- Détail des mesures de sécurité (chiffrement, pseudonymisation, etc.)
- Droit d'introduire une réclamation auprès de la CNIL
- Transferts de données hors UE (si applicable)

---

#### ✔️ **CGU.tsx** - `/legal/cgu`
**Statut** : ⚠️ **TRÈS BASIQUE - À DÉVELOPPER**

**Contenu actuel** :
```
- Accès au service soumis aux conditions
- Décharge de responsabilité pour infos externes
```

**❌ Ce qui MANQUE** :
- Identification précise de l'éditeur (collectivité)
- Conditions d'inscription et d'utilisation
- Propriété intellectuelle (code, marque Flooow)
- Responsabilités respectives (collectivité / Flooow / organismes)
- Conditions de résiliation
- Loi applicable et juridiction compétente
- Clauses de force majeure
- Modification des CGU

---

#### ✔️ **Cookies.tsx** - `/legal/cookies`
**Statut** : ⚠️ **TRÈS BASIQUE - NON CONFORME CNIL**

**Contenu actuel** :
```
- Types de cookies : essentiels, analytiques, performance
- Gestion : via paramètres navigateur
```

**❌ Ce qui MANQUE** :
- **CMP (Consent Management Platform)** conforme CNIL
- Liste détaillée de chaque cookie avec finalité, durée, tiers
- Distinction cookies essentiels vs non-essentiels
- Possibilité de refuser les cookies non-essentiels
- Mention exemption CNIL pour mesure d'audience (si applicable)
- Recueil du consentement explicite AVANT dépôt de cookies (sauf essentiels)

---

#### ✔️ **MentionsLegales.tsx** - `/legal/mentions-legales`
**Statut** : ⚠️ **INCOMPLET**

**Contenu actuel** :
```
- Éditeur : InKlusif Flooow - SIRET: 000 000 000
- Hébergement : prestataire tiers
- Contact : support@flooow.fr
```

**❌ Ce qui MANQUE** :
- Adresse complète de l'éditeur
- Directeur de publication
- SIRET réel (actuellement placeholder)
- Nom et coordonnées de l'hébergeur
- Numéro de déclaration CNIL (si applicable)
- Coordonnées du DPO

---

### 2️⃣ COMPOSANTS DE CONFIDENTIALITÉ (Front-end)

#### ✔️ **PrivacySettings.tsx** - `/mon-compte/parametres`
**Statut** : ✅ **FONCTIONNEL MAIS PARTIEL**

**Fonctionnalités actuelles** :
```
✓ Visibilité du profil (Public / Amis / Privé)
✓ Partage de données anonymes (switch)
✓ Analyses d'usage (switch)
```

**❌ Ce qui MANQUE** :
- Consentement parental pour les mineurs (photos, santé, handicap)
- Gestion fine des consentements par finalité
- Export des données (portabilité RGPD)
- Suppression du compte (droit à l'effacement)
- Historique des consentements

---

### 3️⃣ BASE DE DONNÉES (Back-end)

#### ✔️ **Table `audit_logs`**
**Statut** : ✅ **CONFORME**

**Structure** :
```sql
- id (UUID)
- user_id (UUID) - utilisateur concerné
- action (text) - type d'action
- resource_type (text) - type de ressource
- resource_id (text) - ID de la ressource
- metadata (jsonb) - détails de l'action
- ip_address (inet) - IP de l'utilisateur
- user_agent (text) - navigateur/appareil
- created_at (timestamp) - horodatage
```

**✓ Points conformes** :
- Journalisation horodatée
- Conservation de l'IP et user-agent
- Métadonnées extensibles

**❌ Ce qui MANQUE** :
- **Politique de rétention définie** (ex: 12 mois)
- **Logs d'accès admin** spécifiques
- **Notification sous 72h** en cas d'incident (process à définir)

---

#### ✔️ **Table `profiles`**
**Statut** : ⚠️ **DONNÉES SENSIBLES - ATTENTION**

**Données collectées** :
```
- email ✓
- street_address ✓
- postal_code ✓
- city_insee ✓
- quotient_familial ⚠️ (données économiques)
- marital_status ⚠️ (vie privée)
- profile_json ⚠️ (contenu à vérifier)
- territory_id ✓
```

**✓ Base légale** : Mission d'intérêt public (collectivité)

**❌ Risques identifiés** :
- `quotient_familial` = donnée sensible économique
- `profile_json` = peut contenir n'importe quoi (à contrôler)
- **Minimisation** : vérifier stricte nécessité de chaque champ

---

#### ✔️ **Table `children`**
**Statut** : 🔴 **MINEURS - HAUTE SENSIBILITÉ**

**Données collectées** :
```
- first_name ✓
- dob (date de naissance) 🔴 SENSIBLE
- education_level ⚠️
- school_postal_code ⚠️
- needs_json 🔴 TRÈS SENSIBLE (handicap ?)
- accessibility_flags 🔴 DONNÉES DE SANTÉ
- is_student ✓
```

**🚨 ALERTES RGPD** :
1. **Données de santé** (needs_json, accessibility_flags) = catégorie spéciale RGPD
2. **Base légale requise** : Consentement parental **explicite** + Mission d'intérêt public
3. **DPIA OBLIGATOIRE** (mineurs + données de santé)
4. **Chiffrement recommandé** pour needs_json et accessibility_flags

**❌ Ce qui MANQUE** :
- **Consentement parental traçable** (table dédiée ?)
- **Chiffrement** des données de santé
- **Accès restreint** (logs spécifiques)

---

#### ✔️ **Table `bookings`**
**Statut** : ✅ **CORRECT**

**Champs pertinents** :
```
- requires_parent_validation ✓ (bon mécanisme)
- parent_notified_at ✓ (traçabilité)
- history (jsonb) ✓ (audit trail)
```

**✓ Points conformes** :
- Validation parentale traçable
- Historique des modifications

---

#### ✔️ **Politiques RLS (Row Level Security)**
**Statut** : ✅ **BIEN CONFIGURÉES**

**Exemples** :
```sql
profiles: 
  - Users can view/update their own profile ✓
  - Superadmins can view all profiles ✓

children:
  - Users can manage their own children ✓
  - Structures can view children for active bookings only ✓

audit_logs:
  - Users can view their own logs ✓
  - Admins can view all logs ✓
```

**✓ Sécurité** : Accès contrôlé par rôle

---

### 4️⃣ AUTHENTIFICATION & SESSIONS

#### ✔️ **Table `active_sessions`**
**Statut** : ✅ **CONFORME**

**Fonctionnalités** :
```
✓ Gestion multi-sessions
✓ Révocation possible
✓ Device info + IP
✓ Expiration automatique
```

#### ✔️ **Edge Functions `auth-session`, `sessions-management`**
**Statut** : ✅ **FONCTIONNELLES**

**Endpoints** :
```
✓ Login/logout
✓ Refresh token
✓ Liste des sessions actives
✓ Révocation de sessions
✓ Logs d'audit
```

---

## ❌ CE QUI N'EXISTE PAS (ET DEVRAIT)

### 🔴 1. CADRE CONTRACTUEL & ACHATS PUBLICS

#### **Aucun document contractuel** :
```
❌ Pas de CCTP (Cahier des Clauses Techniques Particulières)
❌ Pas de CCAP (Cahier des Clauses Administratives Particulières)
❌ Pas de BPU/DQE (Bordereau de Prix Unitaires)
❌ Pas de contrat de sous-traitance art. 28 RGPD
❌ Pas de clauses de réversibilité
❌ Pas de SLA (Service Level Agreement)
❌ Pas de plan de sécurité
```

#### **Pièces administratives manquantes** :
```
❌ Kbis/SIREN Flooow
❌ Attestations fiscales/URSSAF
❌ RC pro & cyber
❌ RIB
❌ Déclaration de non-condamnation
❌ Attestation d'assurance
```

---

### 🔴 2. DPIA/PIA (Analyse d'Impact)

**Statut** : ❌ **NON RÉALISÉE**

**Raisons obligatoires** :
```
🔴 Traitement de données de mineurs
🔴 Données de santé (needs_json, accessibility_flags)
🔴 Profilage (quotient familial, critères d'éligibilité)
🔴 Croisement mobilité + aides sociales
```

**Contenu requis** :
```
- Description du traitement
- Nécessité et proportionnalité
- Risques pour les personnes
- Mesures de sécurité
- Validation DPO
- Avis de la CNIL (si risques élevés)
```

---

### 🔴 3. REGISTRE DES TRAITEMENTS

**Statut** : ❌ **ABSENT**

**Obligation RGPD art. 30** :
```
- Liste de tous les traitements
- Finalités
- Catégories de données
- Destinataires
- Durées de conservation
- Mesures de sécurité
```

---

### 🔴 4. PROCÉDURE DE GESTION DES DROITS

**Statut** : ❌ **NON DOCUMENTÉE**

**Droits RGPD à implémenter** :
```
✓ Accès : consultation des données (partiellement via profil)
❌ Rectification : modification (existe mais non documentée)
❌ Effacement : suppression du compte (n'existe pas)
❌ Portabilité : export des données (n'existe pas)
❌ Opposition : refus de traitement (n'existe pas)
❌ Limitation : gel temporaire (n'existe pas)
```

**SLA requis** : Réponse sous 30 jours (à documenter)

---

### 🔴 5. NOTIFICATION D'INCIDENT (Violation de données)

**Statut** : ❌ **AUCUNE PROCÉDURE**

**Obligation RGPD** :
```
❌ Processus de détection
❌ Notification CNIL < 72h
❌ Information des personnes concernées (si risque élevé)
❌ Registre des violations
```

---

### 🔴 6. CONSENTEMENT PARENTAL EXPLICITE

**Statut** : ⚠️ **PARTIEL**

**Existant** :
```
✓ requires_parent_validation (bookings)
✓ parent_notified_at (bookings)
```

**Manquant** :
```
❌ Consentement pour photos/vidéos
❌ Consentement pour données de santé (needs_json)
❌ Consentement pour partage avec organismes
❌ Traçabilité du consentement (table dédiée ?)
❌ Révocation du consentement
```

---

### 🔴 7. CMP (Consent Management Platform) COOKIES

**Statut** : ❌ **NON CONFORME CNIL**

**Problèmes** :
```
❌ Pas de bandeau de consentement
❌ Cookies analytiques déposés sans consentement
❌ Pas de distinction essentiels/non-essentiels
❌ Pas de refus possible
```

**Solutions recommandées** :
```
→ Intégrer Axeptio, Didomi, Onetrust, ou Tarteaucitron
→ Bloquer les cookies tiers avant consentement
→ Conserver la preuve du consentement (6 mois min)
```

---

### 🔴 8. CHIFFREMENT DES DONNÉES SENSIBLES

**Statut** : ⚠️ **PARTIEL**

**Données en clair (non chiffrées)** :
```
🔴 needs_json (handicap) → À CHIFFRER
🔴 accessibility_flags → À CHIFFRER
🔴 quotient_familial → À PSEUDONYMISER
⚠️ profile_json → À VÉRIFIER
```

**Recommandations** :
```
→ Chiffrement au repos (AES-256)
→ Chiffrement en transit (HTTPS uniquement - déjà fait)
→ Pseudonymisation des données économiques
→ Clés de chiffrement gérées séparément (Vault)
```

---

## 📊 RÉCAPITULATIF : SCORE DE CONFORMITÉ

### 🟢 POINTS FORTS (40%)
```
✅ Architecture RLS robuste
✅ Journalisation (audit_logs)
✅ Gestion des sessions
✅ Validation parentale (réservations)
✅ Authentification sécurisée
✅ Séparation des rôles
```

### 🟠 À AMÉLIORER (30%)
```
⚠️ Pages légales (squelettes à compléter)
⚠️ Paramètres de confidentialité (trop basiques)
⚠️ Politique de cookies (non conforme)
⚠️ Minimisation des données (à vérifier)
```

### 🔴 MANQUANT CRITIQUE (30%)
```
❌ DPIA/PIA (obligatoire)
❌ Contrat de sous-traitance art. 28
❌ CMP cookies conforme CNIL
❌ Chiffrement données de santé
❌ Procédure violation de données
❌ Registre des traitements
❌ Export/suppression compte
❌ Consentement parental explicite (santé/photos)
```

**SCORE GLOBAL** : **40/100** 🔴

---

## 🚀 PLAN D'ACTION PRIORITAIRE

### 🔥 **URGENCE 1 (Légal bloquant)**
1. **Rédiger DPIA/PIA** (mineurs + santé)
2. **Contrat de sous-traitance art. 28** (collectivité ↔ Flooow)
3. **Chiffrer needs_json et accessibility_flags**
4. **Compléter mentions légales** (SIRET, DPO, hébergeur)

### 🔥 **URGENCE 2 (Conformité RGPD)**
5. **CMP cookies** conforme CNIL (Axeptio ou Tarteaucitron)
6. **Consentement parental explicite** (santé, photos)
7. **Export des données** (portabilité)
8. **Suppression du compte** (droit à l'effacement)
9. **Registre des traitements** (art. 30)

### 🔥 **URGENCE 3 (Documentation)**
10. **Compléter Politique de confidentialité** (détails par catégorie)
11. **Compléter CGU** (responsabilités, propriété intellectuelle)
12. **Procédure de notification d'incident** (< 72h CNIL)
13. **Politique de rétention** (durées de conservation précises)

### 🔥 **URGENCE 4 (Contractuel marchés publics)**
14. **CCTP** (fonctions, sécurité, interopérabilité)
15. **CCAP** (SLA, pénalités, réversibilité)
16. **BPU/DQE** (prix détaillé)
17. **Pièces administratives** (Kbis, assurances, attestations)

---

## 📝 CONCLUSION

### ✅ **CE QUI EST BON**
Votre architecture technique est **solide** :
- Base de données bien structurée
- RLS correctement configurées
- Journalisation en place
- Gestion des sessions robuste

### ⚠️ **CE QUI DOIT ÊTRE AMÉLIORÉ**
Votre **conformité légale** est **lacunaire** :
- Documents juridiques incomplets
- RGPD partiellement respecté
- Aucun contrat de sous-traitance
- Cookies non conformes CNIL

### 🚨 **RISQUES ENCOURUS**
```
🔴 Sanctions CNIL : jusqu'à 20M€ ou 4% CA mondial
🔴 Responsabilité pénale : données de mineurs mal protégées
🔴 Blocage marchés publics : documents manquants
🔴 Perte de confiance : collectivités et familles
```

### 💡 **PROCHAINES ÉTAPES RECOMMANDÉES**
1. **Prioriser DPIA + Contrat art. 28** (bloquants légaux)
2. **Sécuriser données de santé** (chiffrement immédiat)
3. **Compléter pages légales** (conformité basique)
4. **Intégrer CMP cookies** (conformité CNIL)
5. **Préparer dossier marchés publics** (CCTP/CCAP)

---

**📧 Besoin d'aide pour la suite ?**
Je peux vous aider à :
- Rédiger les documents contractuels (CCTP, CCAP)
- Compléter les pages légales (politique de confidentialité, CGU)
- Intégrer une CMP cookies
- Créer les fonctionnalités RGPD manquantes (export, suppression compte)

**Quelle priorité souhaitez-vous traiter en premier ?** 🎯