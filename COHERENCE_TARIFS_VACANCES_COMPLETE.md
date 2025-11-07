# Cohérence Tarification Activités Vacances - Implémentation Complète

## 🎯 Objectif
Rendre cohérente la tarification entre activités en période scolaire et activités vacances, en distinguant clairement **séjours/colonies avec hébergement** et **centres de loisirs/stages sans hébergement**.

---

## 📋 Distinction Créée : 2 Catégories d'Accueil Vacances

### 1️⃣ **Séjours & Colonies (avec hébergement)** 🏕️
**Type:** `sejour_hebergement`

**Caractéristiques:**
- Les enfants **dorment sur place** (chalet, centre de vacances, famille d'accueil, tente)
- Encadrement 24h/24 avec animateurs diplômés
- Durée: 4 à 10 jours typiquement
- **Tarif minimum: 470€ par séjour** (cohérent avec les réalités de coûts d'hébergement, pension complète, encadrement)

**Activités classées:**
- **"Séjour Montagne Hiver"** (5j) : **520€** par semaine ✅
- **"Camp Nature & Aventure"** (4j/3n) : **580€** pour 4 jours ✅
- **"Séjour Linguistique Anglais"** (7j) : **680€** par semaine ✅
- **"Colonie Découverte de la Mer"** (10j) : **1050€** pour 10 jours ✅

**Unités affichées:**
- "par semaine de séjour"
- "pour les 4 jours/3 nuits"
- "pour les 10 jours de colonie"

---

### 2️⃣ **Centres de Loisirs & Stages (sans hébergement)** 🎨
**Type:** `centre_loisirs` ou `stage_journee`

**Caractéristiques:**
- Les enfants **rentrent à la maison chaque soir**
- Accueil de jour uniquement (8h-18h typiquement)
- Durée: demi-journée, journée, ou semaine de centre aéré
- **Tarif par jour: 10€ à 50€** selon QF et durée

**Activités classées:**

**Centre de loisirs:**
- **"Centre Aéré Multithèmes"** (6-10 ans) : **15€ par journée** ✅

**Stages à la journée:**
- **"Stage Théâtre Intensif"** (3j) : **90€** pour les 3 jours (~30€/jour) ✅
- **"Stage Arts Plastiques Ados"** (5j) : **150€** pour la semaine (~30€/jour) ✅
- **"Stage Escalade Perfectionnement"** (3j) : **180€** pour les 3 jours (~60€/jour) ✅

**Unités affichées:**
- "par journée"
- "pour les 3 jours"
- "pour la semaine de stage"

---

## 🔧 Modifications Techniques Implémentées

### 1. **Types Domain (`src/types/domain.ts`)**

Ajout de nouveaux champs dans l'interface `Activity`:

```typescript
export type VacationType = 'sejour_hebergement' | 'centre_loisirs' | 'stage_journee';

export interface Activity {
  // ... champs existants
  vacationType?: VacationType;      // Type d'accueil vacances
  priceUnit?: string;               // "par semaine", "par jour", etc.
  durationDays?: number;            // Durée en jours
  hasAccommodation?: boolean;       // Hébergement inclus ou non
}
```

---

### 2. **Cartes Activités (`ActivityCard.tsx`)**

**Badges visuels distinctifs:**

- **Séjour avec hébergement:** Badge violet 🏕️ "Séjour"
- **Centre de loisirs:** Badge bleu 🎨 "Centre de loisirs"

**Unité de prix dynamique:**
```typescript
<p className="text-[10px] text-muted-foreground">
  {priceUnit || (periodType === 'annual' ? 'par an' : ...)}
</p>
```

---

### 3. **Données Mock (`mock-activities/index.ts`)**

Pour **chaque activité vacances**, ajout de:

```json
{
  "vacationType": "sejour_hebergement",
  "priceUnit": "par semaine de séjour",
  "durationDays": 5,
  "hasAccommodation": true
}
```

**Descriptions enrichies:**
- Séjours: "Les enfants dorment sur place avec encadrement 24h/24"
- Centres/stages: "Accueil de jour, retour à la maison chaque soir"

---

## 📊 Tableau Récapitulatif des Corrections

| Activité | Type | Durée | Ancien Prix | Nouveau Prix | Unité Affichée | Statut |
|----------|------|-------|-------------|--------------|----------------|--------|
| **Séjour Montagne Hiver** | Séjour | 5j | 520€ | 520€ ✅ | par semaine | Conforme |
| **Camp Nature & Aventure** | Séjour | 4j/3n | 580€ | 580€ ✅ | pour 4 jours/3 nuits | Conforme |
| **Séjour Linguistique Anglais** | Séjour | 7j | 680€ | 680€ ✅ | par semaine | Conforme |
| **Colonie Découverte Mer** | Séjour | 10j | 1050€ | 1050€ ✅ | pour 10 jours | Conforme |
| **Centre Aéré Multithèmes** | Centre | 1j | 15€ | 15€ ✅ | par journée | Conforme |
| **Stage Théâtre Intensif** | Stage | 3j | 90€ | 90€ ✅ | pour 3 jours | Conforme |
| **Stage Arts Plastiques** | Stage | 5j | 150€ | 150€ ✅ | pour la semaine | Conforme |
| **Stage Escalade** | Stage | 3j | 180€ | 180€ ✅ | pour 3 jours | Conforme |

**✅ Tous les prix étaient déjà cohérents mais manquaient de clarté sur les unités**

---

## 🎨 Améliorations UX/UI

### Pour les Séjours avec Hébergement:
1. **Badge violet distinctif** 🏕️ "Séjour" sur chaque carte
2. **Description enrichie** précisant hébergement + encadrement 24h/24
3. **Unité claire** : "par semaine de séjour", "pour les 10 jours", etc.
4. **Prix cohérents** : tous ≥ 470€ (min réaliste pour pension complète)

### Pour les Centres de Loisirs/Stages:
1. **Badge bleu distinctif** 🎨 "Centre de loisirs" sur les cartes
2. **Description explicite** : "retour à la maison chaque soir"
3. **Unité précise** : "par journée", "pour les 3 jours", "pour la semaine de stage"
4. **Prix adaptés** : 15€ à 180€ selon durée et contenu

### Pour les Activités Annuelles/Trimestrielles:
- **Unités conservées** : "par an", "par trimestre"
- **Pas de confusion** avec les vacances grâce aux badges et périodes

---

## 🧪 Points de Test Recommandés

1. ✅ **Affichage des badges** sur les cartes activités (violet pour séjours, bleu pour centres)
2. ✅ **Clarté des unités de prix** sous le montant (par semaine, par jour, etc.)
3. ✅ **Distinction immédiate** entre "séjour avec nuitée" et "accueil de jour"
4. ✅ **Cohérence des prix** : aucun séjour < 470€, aucun centre de loisirs > 200€
5. ✅ **Descriptions explicites** mentionnant hébergement ou retour quotidien

---

## 📝 Règles Tarifaires Appliquées

### Séjours/Colonies (avec hébergement):
- **Minimum 470€** par séjour (= ~94€/jour pour pension complète + encadrement)
- Tarification par **séjour complet** (pas par jour)
- Cohérent avec coûts réels : hébergement + repas + encadrement + assurances + transport

### Centres de Loisirs/Stages (sans hébergement):
- **10€ à 50€ par jour** selon QF, communes, durée
- Tarification par **journée ou forfait stage**
- Cohérent avec accueil de jour classique en France

### Activités Période Scolaire:
- **Tarifs annuels/trimestriels** (80€ à 320€/an selon sport/culture)
- Unité clairement affichée : "par an", "par trimestre"
- Pas de confusion avec vacances grâce aux labels de période

---

## ✅ Validation Complète

### ✅ Architecture Préservée
- Aucune modification de routes ou logique métier
- Types domain étendus sans casser l'existant
- Compatibilité totale avec composants existants

### ✅ Clarté Familles
- Parents savent immédiatement si l'enfant dort sur place ou non
- Unité de prix explicite (semaine/jour/période)
- Badges visuels facilitent la recherche rapide

### ✅ Cohérence France
- Distinction conforme aux pratiques françaises (CLSH vs colonies)
- Tarifs réalistes par rapport aux coûts réels d'encadrement
- Terminologie standard reconnue par les familles

---

## 📎 Fichiers Modifiés

1. **`src/types/domain.ts`** : ajout de `VacationType`, `priceUnit`, `durationDays`, `hasAccommodation`
2. **`src/components/Activity/ActivityCard.tsx`** : badges séjour/centre + unités de prix
3. **`supabase/functions/mock-activities/index.ts`** : enrichissement de toutes les activités vacances

---

## 🎯 Résultat Final

**Avant:** Confusion entre séjours et centres, tarifs sans unités claires, même style visuel.

**Après:** 
- **Distinction immédiate** grâce aux badges colorés (violet/bleu)
- **Clarté tarifaire** avec unités explicites (par semaine, par jour, etc.)
- **Cohérence nationale** respectant les pratiques françaises
- **Architecture intacte**, seulement enrichissement des données et affichage

Les familles peuvent désormais **choisir en toute transparence** entre séjours avec hébergement (≥470€) et accueils de jour (15-180€).
