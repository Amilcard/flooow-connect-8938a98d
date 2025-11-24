/**
 * Moteur de calcul des aides financières - FinancialAidEngine
 * 
 * Ce moteur centralise toute la logique métier pour les 13 aides supportées.
 * Il est conçu pour être pur, testable et sans dépendance UI.
 */

export interface SimulationContext {
  age: number;
  qf: number; // Quotient Familial
  cityCode: string; // Code postal (ex: 42000)
  activityPrice: number;
  activityType?: 'sport' | 'culture' | 'loisirs' | 'colo' | 'autre';
  // Données optionnelles (avec valeurs par défaut si manquantes)
  isQPV?: boolean;
  isLyceenOrApprenti?: boolean;
  nbFratrie?: number; // Nombre d'enfants inscrits (pour réduction fratrie)
  department?: string; // Ex: "42"
  hasComplementaryAid?: boolean; // ARS, AEEH, etc. (pour Pass'Sport)
}

export interface FinancialAidResult {
  id: string;
  name: string;
  amount: number;
  type: 'national' | 'regional' | 'departement' | 'metropole' | 'ville' | 'caf' | 'caf_local' | 'organisateur';
  description?: string;
  isEstimate?: boolean; // Si le montant est une estimation ou variable
}

/**
 * Calcule toutes les aides éligibles pour un contexte donné
 */
export function calculateAllAids(ctx: SimulationContext): FinancialAidResult[] {
  const aids: FinancialAidResult[] = [];
  const department = ctx.department || ctx.cityCode.substring(0, 2);
  const isStEtienne = ctx.cityCode === '42000' || ctx.cityCode === '42100' || ctx.cityCode === '42230';

  // 1. Pass'Sport (National)
  // 50€ pour 6-17 ans, QF <= 800 (simplification, normalement ARS/AEEH)
  // On assume ici que QF <= 800 est un bon proxy pour l'éligibilité ARS/AEEH dans un simulateur simplifié
  if (
    ctx.age >= 6 && 
    ctx.age <= 17 && 
    (ctx.qf <= 800 || ctx.hasComplementaryAid) &&
    ctx.activityType === 'sport'
  ) {
    aids.push({
      id: 'pass_sport',
      name: "Pass'Sport",
      amount: 50,
      type: 'national',
      description: "Aide de l'État pour la pratique sportive"
    });
  }

  // 2. Pass Culture (National)
  // Crédit selon l'âge (15-17 ans)
  if (ctx.age >= 15 && ctx.age <= 17 && ctx.activityType === 'culture') {
    let amount = 0;
    if (ctx.age === 15) amount = 20;
    if (ctx.age === 16) amount = 30;
    if (ctx.age === 17) amount = 30;
    
    if (amount > 0) {
      aids.push({
        id: 'pass_culture',
        name: "Pass Culture",
        amount,
        type: 'national',
        description: "Crédit culture via l'application Pass Culture"
      });
    }
  }

  // 3. Pass Colo (National)
  // Uniquement pour les 11 ans (année des 11 ans)
  if (ctx.age === 11 && ctx.activityType === 'colo') {
    let amount = 0;
    if (ctx.qf <= 200) amount = 350;
    else if (ctx.qf <= 500) amount = 300;
    else if (ctx.qf <= 700) amount = 250;
    else if (ctx.qf <= 1200) amount = 200; // "701_plus" souvent plafonné à 1200 ou 1500 selon décrets, ici on met 1200 par prudence
    
    if (amount > 0) {
      aids.push({
        id: 'pass_colo',
        name: "Pass Colo",
        amount,
        type: 'national',
        description: "Aide pour les départs en colonie de vacances (11 ans)"
      });
    }
  }

  // 4. VACAF AVE (CAF National/Local)
  // Aide aux Vacances Enfants
  if (ctx.activityType === 'colo' && ctx.age >= 3 && ctx.age <= 17 && ctx.qf <= 900) {
    // Calcul complexe en %, on fait une estimation basée sur le prix
    // qf_0_350: 70%, qf_351_550: 50%, qf_551_750: 30%, qf_751_900: 20%
    let percent = 0;
    if (ctx.qf <= 350) percent = 0.7;
    else if (ctx.qf <= 550) percent = 0.5;
    else if (ctx.qf <= 750) percent = 0.3;
    else if (ctx.qf <= 900) percent = 0.2;

    if (percent > 0) {
      // Plafond théorique souvent appliqué (ex: 400€ ou 600€), ici on applique au prix réel
      // On pourrait ajouter un plafond par défaut si connu (ex: 500€)
      const estimatedAmount = Math.round(ctx.activityPrice * percent);
      aids.push({
        id: 'vacaf_ave',
        name: "VACAF AVE",
        amount: estimatedAmount,
        type: 'caf',
        description: `Prise en charge d'environ ${percent * 100}% du séjour`,
        isEstimate: true
      });
    }
  }

  // 5. VACAF AVF (Aide Vacances Famille)
  // Souvent forfaitaire ou %
  if (ctx.activityType === 'colo' && ctx.qf <= 800) {
    // Montant max 400€ indiqué dans les règles
    // On met une estimation conservatrice ou le max si le prix est élevé
    const amount = Math.min(400, ctx.activityPrice * 0.5); // Hypothèse 50% max 400€
    aids.push({
      id: 'vacaf_avf',
      name: "VACAF AVF",
      amount,
      type: 'caf',
      description: "Aide aux vacances familles (estimation)",
      isEstimate: true
    });
  }

  // 6. Pass'Région (Auvergne-Rhône-Alpes)
  // Lycéen/Apprenti, Culture/Sport
  // On assume que 15-18 ans = Lycéen si info manquante
  const isLyceen = ctx.isLyceenOrApprenti ?? (ctx.age >= 15 && ctx.age <= 18);
  if (isLyceen && (ctx.activityType === 'culture' || ctx.activityType === 'sport')) {
    // Avantage Sport: 30€ (si licence UNSS/UGSEL) ou réduction licence
    // Avantage Culture: crédits livres/cinéma/spectacle
    // Règle simplifiée: 30€
    aids.push({
      id: 'pass_region',
      name: "Pass'Région",
      amount: 30,
      type: 'regional',
      description: "Avantage Pass'Région (Lycéens/Apprentis)"
    });
  }

  // 7. CAF Loire – Temps Libre (Local)
  if (department === '42' && ctx.age >= 3 && ctx.age <= 17 && ctx.qf <= 850) {
    let amount = 0;
    if (ctx.qf <= 350) amount = 80;
    else if (ctx.qf <= 550) amount = 60;
    else if (ctx.qf <= 700) amount = 40;
    else if (ctx.qf <= 850) amount = 20;

    if (amount > 0) {
      aids.push({
        id: 'caf_loire_temps_libre',
        name: "CAF Loire - Temps Libre",
        amount,
        type: 'caf_local',
        description: "Aide aux loisirs CAF Loire"
      });
    }
  }

  // 8. Chèques Loisirs 42 (Département)
  if (department === '42' && ctx.qf <= 900) {
    aids.push({
      id: 'cheques_loisirs_42',
      name: "Chèques Loisirs 42",
      amount: 30,
      type: 'departement',
      description: "Chéquiers loisirs du département de la Loire"
    });
  }

  // 9. Tarifs sociaux – Ville de Saint-Étienne
  if (isStEtienne && (ctx.activityType === 'sport' || ctx.activityType === 'culture')) {
    // Tranches: A (0-400), B (401-700), C (701-1000)
    let tranche = '';
    if (ctx.qf <= 400) tranche = 'A';
    else if (ctx.qf <= 700) tranche = 'B';
    else if (ctx.qf <= 1000) tranche = 'C';

    if (tranche) {
      let amount = 0;
      if (ctx.activityType === 'sport') {
        if (tranche === 'A') amount = 60;
        if (tranche === 'B') amount = 40;
        if (tranche === 'C') amount = 20;
      } else { // Culture
        if (tranche === 'A') amount = 70;
        if (tranche === 'B') amount = 50;
        if (tranche === 'C') amount = 30;
      }

      if (amount > 0) {
        aids.push({
          id: 'tarifs_sociaux_st_etienne',
          name: `Tarif Social St-Étienne (Tranche ${tranche})`,
          amount,
          type: 'ville',
          description: "Réduction municipale sous conditions de ressources"
        });
      }
    }
  }

  // 10. Carte BÔGE (Saint-Étienne)
  if (isStEtienne && ctx.age >= 13 && ctx.age <= 29) {
    aids.push({
      id: 'carte_boge',
      name: "Carte BÔGE",
      amount: 10,
      type: 'ville',
      description: "Réduction jeunes Saint-Étienne (13-29 ans)"
    });
  }

  // 11. Bonus QPV – Saint-Étienne Métropole
  // Nécessite isQPV. Si non fourni, on considère false par sécurité.
  if (isStEtienne && ctx.isQPV) {
    // Montant fixe 20€ pour sport/loisirs/culture
    if (['sport', 'culture', 'loisirs'].includes(ctx.activityType || '')) {
      aids.push({
        id: 'bonus_qpv_sem',
        name: "Bonus QPV Métropole",
        amount: 20,
        type: 'metropole',
        description: "Aide supplémentaire pour les résidents QPV"
      });
    }
  }

  // 12. Réduction fratrie (Organisateur)
  if (ctx.nbFratrie && ctx.nbFratrie >= 2) {
    // 10% du prix
    const amount = Math.round(ctx.activityPrice * 0.10);
    if (amount > 0) {
      aids.push({
        id: 'reduction_fratrie',
        name: "Réduction Fratrie",
        amount,
        type: 'organisateur',
        description: "Réduction 10% pour inscription multiple",
        isEstimate: true
      });
    }
  }

  // 13. Tarif social interne (Club)
  // Variable selon QF <= 900
  if (ctx.qf <= 900 && ctx.activityType === 'sport') {
    // "Variable" -> On met une valeur symbolique ou une estimation basse (ex: 15€)
    // ou on ne l'affiche pas dans le total mais comme info
    aids.push({
      id: 'tarif_social_interne',
      name: "Tarif Social Club",
      amount: 15, // Estimation arbitraire pour l'exemple
      type: 'organisateur',
      description: "Réduction interne au club (montant variable)",
      isEstimate: true
    });
  }

  return aids;
}
