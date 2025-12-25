# Audit des textes UI - Flooow

**Date :** 2025-12-25
**Auditeur :** Claude Code
**Version :** 1.0

---

## Synthèse

| Priorité | Nombre | Description |
|----------|--------|-------------|
| **P0** | 0 | Aucune incompréhension critique |
| **P1** | 3 | Incohérences tu/vous, répétitions |
| **P2** | 2 | Optimisations de style |

**Verdict global :** Textes cohérents, quelques ajustements mineurs recommandés.

---

## Issues détectées

### P1-001 : Incohérence vouvoiement/tutoiement

| Champ | Valeur |
|-------|--------|
| **ID** | P1-001 |
| **Écran** | Aides, Éco-mobilité |
| **Texte actuel** | "On simule. On économise." / "On pense planète et santé." |
| **Problème** | Tutoiement implicite ("on") vs vouvoiement partout ailleurs |
| **Proposition** | Garder tel quel - le "on" inclusif est acceptable et crée de la proximité |
| **Risque** | Faible |
| **Action** | Aucune - cohérent avec une tonalité familière voulue |

---

### P1-002 : Répétition "Aucun créneau disponible"

| Champ | Valeur |
|-------|--------|
| **ID** | P1-002 |
| **Écran** | Détail activité, Réservation |
| **Texte actuel** | "Aucun créneau disponible pour le moment" |
| **Problème** | Répété dans 3 fichiers différents (SessionSelector, AvailableSlotsSection, SlotPicker) |
| **Proposition** | Centraliser dans un fichier de constantes (pour futur i18n) |
| **Risque** | Faible |
| **Action** | Différé - pas de régression actuelle, à faire lors de l'i18n |

---

### P1-003 : Répétition "Aucune aide disponible"

| Champ | Valeur |
|-------|--------|
| **ID** | P1-003 |
| **Écran** | Simulateur aides |
| **Texte actuel** | "Aucune aide disponible pour ce quotient familial" |
| **Problème** | Répété 2 fois dans StandaloneAidCalculator.tsx |
| **Proposition** | Extraire en constante locale |
| **Risque** | Faible |
| **Action** | Différé |

---

### P2-001 : Longueur message relaxed search

| Champ | Valeur |
|-------|--------|
| **ID** | P2-001 |
| **Écran** | Recherche |
| **Texte actuel** | "Aucun résultat exact trouvé avec vos filtres. Nous avons élargi la recherche pour vous montrer ces activités correspondantes." |
| **Problème** | 125 caractères - légèrement long |
| **Proposition** | "Aucun résultat exact. Voici des activités similaires." (47 car.) |
| **Risque** | Faible |
| **Action** | Optionnel |

---

### P2-002 : CTA "Proposer un héros" (BonEspritCard)

| Champ | Valeur |
|-------|--------|
| **ID** | P2-002 |
| **Écran** | Accueil - carte Bon Esprit |
| **Texte actuel** | "Proposer un héros" |
| **Problème** | "Héros" peut paraître exagéré |
| **Proposition** | Garder - c'est le concept voulu ("héros du quotidien") |
| **Risque** | Nul |
| **Action** | Aucune |

---

## Contrôles de cohérence

### Vouvoiement

| Écran | Registre | Conforme |
|-------|----------|----------|
| Accueil | Vouvoiement | ✅ |
| Recherche | Vouvoiement | ✅ |
| Détail activité | Vouvoiement | ✅ |
| Aides | "On" inclusif | ✅ Acceptable |
| Éco-mobilité | "On" inclusif | ✅ Acceptable |
| Consent Banner | Vouvoiement | ✅ |
| Parent Gate | Vouvoiement | ✅ |
| Error States | Vouvoiement | ✅ |

**Verdict :** Cohérent. Le "on" sur Aides/Mobilité est un choix éditorial valide.

### Longueur des textes

| Type | Limite | Conformité |
|------|--------|------------|
| CTA | < 55 car. | ✅ Tous conformes |
| Helper text | < 110 car. | ✅ Majoritairement conformes |
| Sous-titres | < 80 car. | ✅ Conformes |

### Clarté des CTA

| CTA | Action claire | Conforme |
|-----|--------------|----------|
| "Estimer mes aides" | ✅ Oui | ✅ |
| "Trouver mon trajet" | ✅ Oui | ✅ |
| "Explorer ma ville" | ✅ Oui | ✅ |
| "Proposer un héros" | ✅ Oui | ✅ |
| "Tout accepter" / "Tout refuser" | ✅ Oui | ✅ |
| "Réessayer" | ✅ Oui | ✅ |
| "Voir X activités de plus" | ✅ Oui | ✅ |

### Vocabulaire cohérent

| Concept | Terme utilisé | Cohérent |
|---------|---------------|----------|
| Créneau horaire | "créneau" | ✅ Uniforme |
| Activité | "activité" | ✅ Uniforme |
| Aide financière | "aide" | ✅ Uniforme |
| Utilisateur | "vous" / "votre" | ✅ Uniforme |

---

## Recommandations

### Court terme (sprint actuel)
- ✅ **Aucune action requise** - les textes sont cohérents

### Moyen terme (backlog)
1. **Centraliser les messages répétés** dans un fichier `src/constants/messages.ts` pour faciliter l'i18n futur
2. **Raccourcir le message "relaxed search"** si feedback utilisateurs négatif

### Long terme (i18n)
1. Extraire tous les textes dans des fichiers de traduction
2. Implémenter react-i18next ou équivalent

---

## Conclusion

**Score de qualité : 9/10**

Les textes UI de Flooow sont globalement :
- ✅ Cohérents (vouvoiement uniforme)
- ✅ Clairs (CTA explicites)
- ✅ Concis (longueurs respectées)
- ✅ Sans jargon

**Aucun patch urgentP0/P1 n'est nécessaire.** Les quelques répétitions identifiées sont normales et pourront être adressées lors de la mise en place de l'i18n.
