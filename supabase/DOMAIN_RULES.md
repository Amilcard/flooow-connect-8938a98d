# DOMAIN_RULES.md - Règles Métier des Aides Financières Flooow

**Date d'audit** : 2025-12-12
**Source principale** : `src/utils/FinancialAidEngine.ts`
**Version moteur** : Multi-critères (pas uniquement QF)

---

## Vue d'ensemble

Le moteur d'aides Flooow intègre **12 dispositifs** répartis en 6 niveaux :

| Niveau | Nombre | Dispositifs |
|--------|--------|-------------|
| National | 3 | Pass'Sport, Pass Culture, Pass Colo |
| CAF | 3 | VACAF AVE, VACAF AVF, CAF Loire Temps Libre |
| Régional | 1 | Pass'Région |
| Départemental | 1 | Chèques Loisirs 42 |
| Communal | 3 | Tarifs sociaux STE, Carte BÔGE, Bonus QPV |
| Organisateur | 1 | Réduction fratrie |

---

## RÈGLE CRITIQUE : Filtrage par Période

Le moteur applique un **filtrage strict** selon la période d'activité :

### Période `saison_scolaire`
Aides autorisées :
- PASS_SPORT
- PASS_CULTURE
- PASS_REGION
- TARIFS_SOCIAUX_STE
- CARTE_BOGE
- BONUS_QPV_SEM
- REDUCTION_FRATRIE
- CHEQUES_LOISIRS_42

### Période `vacances`
Aides autorisées :
- PASS_COLO
- VACAF_AVE
- VACAF_AVF
- CAF_LOIRE_TEMPS_LIBRE
- CHEQUES_LOISIRS_42
- CARTE_BOGE
- BONUS_QPV_SEM
- REDUCTION_FRATRIE

---

## 1. PASS_SPORT

**Code** : `PASS_SPORT`
**ID** : `pass_sport`
**Niveau** : National
**Montant** : **50€** (plafonné au prix de l'activité)
**Lien officiel** : https://www.sports.gouv.fr/pass-sport

### Critères d'éligibilité

| Critère | Condition |
|---------|-----------|
| Âge | 6-17 ans |
| Type activité | `sport` uniquement |
| Condition sociale | AU MOINS UNE parmi : |
| | - beneficie_ARS (Allocation Rentrée Scolaire) |
| | - beneficie_AEEH (Allocation Éducation Enfant Handicapé) |
| | - beneficie_AESH (Accompagnement Élèves en Situation de Handicap) |
| | - beneficie_bourse (Bourse scolaire) |
| | - beneficie_ASE (Aide Sociale à l'Enfance) |

### Critères manquants retournés
- `Âge 6-17 ans requis`
- `Condition sociale requise (ARS, AEEH, AESH, Bourse, ASE)`

### Fichiers référençant cette aide
```
src/utils/FinancialAidEngine.ts (définition principale)
src/components/aids/* (affichage)
```

---

## 2. PASS_CULTURE

**Code** : `PASS_CULTURE`
**ID** : `pass_culture`
**Niveau** : National
**Montant** : Variable selon l'âge
**Lien officiel** : https://pass.culture.fr

### Barème des montants

| Âge | Montant |
|-----|---------|
| 15 ans | 20€ |
| 16 ans | 30€ |
| 17 ans | 30€ |

### Critères d'éligibilité

| Critère | Condition |
|---------|-----------|
| Âge | 15-17 ans |
| Type activité | `culture` uniquement |

### Comportement
- Retourne `null` si âge hors plage ou type ≠ culture (aide non applicable)
- Montant plafonné au prix de l'activité

---

## 3. PASS_COLO

**Code** : `PASS_COLO`
**ID** : `pass_colo`
**Niveau** : National
**Montant** : 200-350€ selon QF
**Lien officiel** : https://www.jeunes.gouv.fr/pass-colo

### Barème des montants

| QF (€) | Montant |
|--------|---------|
| ≤ 200 | 350€ |
| 201-500 | 300€ |
| 501-700 | 250€ |
| > 700 | 200€ |

### Critères d'éligibilité

| Critère | Condition |
|---------|-----------|
| Âge | **Exactement 11 ans** |
| Type activité | `vacances` uniquement |
| QF | Requis (toute tranche) |

### Comportement
- Retourne `null` si âge ≠ 11 ou type ≠ vacances

---

## 4. VACAF_AVE (Aide Vacances Enfants)

**Code** : `VACAF_AVE`
**ID** : `vacaf_ave`
**Niveau** : CAF
**Montant** : 100-200€ selon QF
**Lien officiel** : https://www.vacaf.org

### Barème des montants

| QF (€) | Montant |
|--------|---------|
| ≤ 450 | 200€ |
| 451-700 | 150€ |
| 701-900 | 100€ |

### Critères d'éligibilité

| Critère | Condition |
|---------|-----------|
| Allocataire CAF | Obligatoire |
| Âge | 3-17 ans |
| Type activité | `vacances` uniquement |
| Séjour labellisé | Obligatoire |
| QF maximum | ≤ 900€ |

### Critères manquants retournés
- `Séjour labellisé VACAF requis`
- `QF maximum 900€`

---

## 5. VACAF_AVF (Aide Vacances Familles)

**Code** : `VACAF_AVF`
**ID** : `vacaf_avf`
**Niveau** : CAF
**Montant** : 200-400€ selon QF
**Lien officiel** : https://www.vacaf.org

### Barème des montants

| QF (€) | Montant |
|--------|---------|
| ≤ 400 | 400€ |
| 401-600 | 300€ |
| 601-800 | 200€ |

### Critères d'éligibilité

| Critère | Condition |
|---------|-----------|
| Allocataire CAF | Obligatoire |
| Type activité | `vacances` uniquement |
| QF maximum | ≤ 800€ |

### Comportement
- Retourne `null` si non allocataire CAF ou type ≠ vacances ou QF > 800

---

## 6. PASS_REGION

**Code** : `PASS_REGION`
**ID** : `pass_region`
**Niveau** : Régional (Auvergne-Rhône-Alpes)
**Montant** : **30€**
**Lien officiel** : https://www.auvergnerhonealpes.fr/pass-region

### Critères d'éligibilité

| Critère | Condition |
|---------|-----------|
| Statut scolaire | `lycee` uniquement |

### Comportement
- Retourne `null` si statut ≠ lycée
- Pas de restriction sur le type d'activité

---

## 7. CAF_LOIRE_TEMPS_LIBRE

**Code** : `CAF_LOIRE_TEMPS_LIBRE`
**ID** : `caf_loire_temps_libre`
**Niveau** : CAF (spécifique Loire)
**Montant** : 20-80€ selon QF
**Lien officiel** : https://www.caf.fr/allocataires/caf-de-la-loire

### Barème des montants

| QF (€) | Montant |
|--------|---------|
| ≤ 350 | 80€ |
| 351-550 | 60€ |
| 551-700 | 40€ |
| 701-850 | 20€ |

### Critères d'éligibilité

| Critère | Condition |
|---------|-----------|
| Allocataire CAF | Obligatoire |
| Âge | 3-17 ans |
| QF maximum | ≤ 850€ |
| Période | **`vacances` UNIQUEMENT** |

### ATTENTION
Cette aide est **exclusivement** pour les vacances scolaires. Ne s'applique PAS aux activités de saison scolaire.

---

## 8. CHEQUES_LOISIRS_42

**Code** : `CHEQUES_LOISIRS_42`
**ID** : `cheques_loisirs_42`
**Niveau** : Départemental (Loire - 42)
**Montant** : **30€**
**Lien officiel** : https://www.loire.fr

### Critères d'éligibilité

| Critère | Condition |
|---------|-----------|
| Département | 42 (Loire) |
| QF maximum | ≤ 900€ |

### Particularité
- S'applique aux DEUX périodes (vacances ET saison scolaire)
- Pas de restriction sur le type d'activité

---

## 9. TARIFS_SOCIAUX_STE (Saint-Étienne)

**Code** : `TARIFS_SOCIAUX_STE`
**ID** : `tarifs_sociaux_st_etienne`
**Niveau** : Communal
**Montant** : 15-70€ selon QF et type
**Lien officiel** : https://www.saint-etienne.fr

### Barème des réductions

| Tranche QF | Sport | Culture | Autres |
|------------|-------|---------|--------|
| A (≤400€) | 60€ | 70€ | 50€ |
| B (401-700€) | 40€ | 50€ | 30€ |
| C (701-1000€) | 20€ | 30€ | 15€ |

### Critères d'éligibilité

| Critère | Condition |
|---------|-----------|
| Ville | Saint-Étienne (détection flexible) |
| QF maximum | ≤ 1000€ |

### Détection de la ville
```typescript
const villeLower = ville.toLowerCase()
  .replace(/[éè]/g, 'e')
  .replace(/[àâ]/g, 'a');
if (villeLower.includes('saint') && villeLower.includes('etienne')) {
  // Éligible
}
```

Accepte : `Saint-Étienne`, `Saint-Etienne`, `SAINT-ÉTIENNE`, etc.

---

## 10. CARTE_BOGE

**Code** : `CARTE_BOGE`
**ID** : `carte_boge`
**Niveau** : Communal (Saint-Étienne Métropole)
**Montant** : **10€**
**Lien officiel** : https://www.saint-etienne-metropole.fr

### Critères d'éligibilité

| Critère | Condition |
|---------|-----------|
| Âge | 13-29 ans |

### Particularité
- Pas de condition de ressources
- S'applique aux DEUX périodes
- Plage d'âge étendue (jusqu'à 29 ans)

---

## 11. BONUS_QPV_SEM

**Code** : `BONUS_QPV_SEM`
**ID** : `bonus_qpv_sem`
**Niveau** : Communal (Saint-Étienne Métropole)
**Montant** : **20€**
**Lien officiel** : https://www.saint-etienne-metropole.fr

### Critères d'éligibilité

| Critère | Condition |
|---------|-----------|
| Résidence QPV | `est_qpv = true` |

### Définition QPV
Quartier Prioritaire de la politique de la Ville. L'éligibilité est déterminée par l'adresse de résidence.

---

## 12. REDUCTION_FRATRIE

**Code** : `REDUCTION_FRATRIE`
**ID** : `reduction_fratrie`
**Niveau** : Organisateur
**Montant** : **10%** du prix de l'activité
**Type montant** : `pourcentage`

### Critères d'éligibilité

| Critère | Condition |
|---------|-----------|
| Nombre d'enfants | ≥ 2 dans la fratrie |

### Calcul
```typescript
const reduction = prix_activite * 0.1;
```

---

## Paramètres d'entrée du moteur

### Interface `EligibilityParams`

```typescript
interface EligibilityParams {
  // Enfant
  age: number;

  // Situation sociale (critères sociaux)
  conditions_sociales: {
    beneficie_ARS: boolean;
    beneficie_AEEH: boolean;
    beneficie_AESH: boolean;
    beneficie_bourse: boolean;
    beneficie_ASE: boolean;
  };

  // Scolarité
  statut_scolaire: 'primaire' | 'college' | 'lycee';

  // Contexte familial
  quotient_familial: number;
  nb_fratrie: number;
  allocataire_caf: boolean;

  // Géographique
  code_postal: string;
  ville: string;
  departement: number;
  est_qpv: boolean;

  // Activité
  type_activite: 'sport' | 'culture' | 'vacances' | 'loisirs';
  prix_activite: number;
  periode: 'vacances' | 'saison_scolaire';
  duree_jours?: number;
  sejour_labellise?: boolean;
}
```

---

## Modes d'estimation

### Mode 1 : Ultra-rapide (30 secondes)
**Fonction** : `calculateQuickEstimate()`
**Champs requis** : âge, type_activite, prix_activite, ville?, code_postal?, periode?

Retourne :
- Aides certaines (Pass Culture si 15-17 + culture, Carte BÔGE si 13-29)
- Aides potentielles avec critères à renseigner

### Mode 2 : Rapide (2 minutes)
**Fonction** : `calculateFastEstimate()`
**Champs supplémentaires** : quotient_familial?, allocataire_caf?, a_condition_sociale?, statut_scolaire?, nb_enfants?

Calcule plus d'aides avec meilleure précision.

### Mode 3 : Complet
**Fonction** : `calculateAllEligibleAids()`
**Tous les champs** : Calcul exhaustif des 12 aides

---

## Cumul des aides

Les aides sont **cumulables** entre elles, sous réserve de :
1. Respecter le filtrage par période
2. Ne pas dépasser le prix total de l'activité

Le montant de chaque aide est plafonné :
```typescript
montant: Math.min(montant_aide, params.prix_activite)
```

---

## Fichiers de référence dans le code

| Fichier | Rôle |
|---------|------|
| `src/utils/FinancialAidEngine.ts` | Moteur de calcul principal |
| `src/components/aids/AidCard.tsx` | Affichage d'une aide |
| `src/components/aids/AidEstimator.tsx` | Simulateur d'éligibilité |
| `src/pages/aides/Simulateur.tsx` | Page simulateur |
| `src/pages/Aides.tsx` | Page liste des aides |
| `src/hooks/useFinancialAids.ts` | Hook React Query |

---

## Correspondance Base de données

La table `financial_aids` Supabase peut contenir les enregistrements suivants :

| code | name | niveau | montant_type |
|------|------|--------|--------------|
| PASS_SPORT | Pass'Sport | national | fixe |
| PASS_CULTURE | Pass Culture | national | variable |
| PASS_COLO | Pass Colo | national | variable |
| VACAF_AVE | VACAF AVE | caf | variable |
| VACAF_AVF | VACAF AVF | caf | variable |
| PASS_REGION | Pass'Région | regional | fixe |
| CAF_LOIRE_TEMPS_LIBRE | CAF Loire Temps Libre | caf | variable |
| CHEQUES_LOISIRS_42 | Chèques Loisirs Loire | departemental | fixe |
| TARIFS_SOCIAUX_STE | Tarifs sociaux STE | communal | variable |
| CARTE_BOGE | Carte BÔGE | communal | fixe |
| BONUS_QPV_SEM | Bonus QPV SEM | communal | fixe |
| REDUCTION_FRATRIE | Réduction fratrie | organisateur | pourcentage |

---

## Changelog

| Date | Modification |
|------|--------------|
| 2025-12-12 | Documentation initiale des 12 aides |
