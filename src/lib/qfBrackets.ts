/**
 * Configuration centralisée des tranches de Quotient Familial (QF)
 * Utilisée pour tous les simulateurs d'aides financières
 */

export const QF_BRACKETS = [
  {
    id: "0-450",
    label: "0 - 450 €",
    value: 300,
    description: "Tranche la plus basse"
  },
  {
    id: "451-700",
    label: "451 - 700 €",
    value: 575,
    description: "Tranche intermédiaire basse"
  },
  {
    id: "701-1000",
    label: "701 - 1000 €",
    value: 850,
    description: "Tranche intermédiaire haute"
  },
  {
    id: "1001+",
    label: "1001 € et plus",
    value: 1200,
    description: "Tranche haute"
  }
] as const;

/**
 * Mapper un QF exact vers la tranche appropriée
 */
export const mapQFToBracket = (qf: number): number => {
  if (qf <= 450) return QF_BRACKETS[0].value;
  if (qf <= 700) return QF_BRACKETS[1].value;
  if (qf <= 1000) return QF_BRACKETS[2].value;
  return QF_BRACKETS[3].value;
};

/**
 * Obtenir le label de la tranche depuis une valeur
 */
export const getBracketLabel = (value: number): string => {
  const bracket = QF_BRACKETS.find(b => b.value === value);
  return bracket?.label || "Non défini";
};
