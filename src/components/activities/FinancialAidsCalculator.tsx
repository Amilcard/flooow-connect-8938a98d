import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { calculateAllEligibleAids, EligibilityParams } from "@/utils/FinancialAidEngine";
import { getTypeActivite } from "@/utils/AidCalculatorHelpers";
import { safeErrorMessage } from '@/utils/sanitize';

interface Props {
  activityPrice: number;
  activityCategories: string[];
  childAge: number;
  quotientFamilial: number;
  cityCode: string;
  durationDays?: number;
  periodType?: string;
}

interface FinancialAid {
  aid_name: string;
  amount: number;
  territory_level: string;
  official_link: string | null;
  is_informational: boolean;
}

const TERRITORY_ICONS = {
  national: "🇫🇷",
  region: "🌍",
  metropole: "🏙️",
  commune: "🏘️",
  caf: "🏦",
  organisateur: "🤝"
} as const;

// Aides uniquement disponibles en période vacances
const VACATION_ONLY_AIDS = ['Pass Colo', 'VACAF AVE', 'VACAF AVF', 'CAF Loire', 'ANCV'];

/**
 * Map period type to engine format
 */
const mapPeriodType = (periodType: string | undefined): 'vacances' | 'saison_scolaire' => {
  if (!periodType) return 'saison_scolaire';
  const p = periodType.toLowerCase();
  if (p === 'vacances' || p === 'school_holidays' || p.includes('vacances')) {
    return 'vacances';
  }
  return 'saison_scolaire';
};

/**
 * Determine school status based on age
 */
const getStatutScolaire = (age: number): 'lycee' | 'college' | 'primaire' => {
  if (age >= 15) return 'lycee';
  if (age >= 11) return 'college';
  return 'primaire';
};

/**
 * Build eligibility params for the engine
 */
const buildEligibilityParams = (
  childAge: number,
  quotientFamilial: number,
  cityCode: string,
  activityPrice: number,
  activityCategories: string[],
  mappedPeriod: 'vacances' | 'saison_scolaire'
): EligibilityParams => ({
  age: childAge,
  quotient_familial: quotientFamilial,
  code_postal: cityCode,
  ville: "",
  departement: cityCode ? Number.parseInt(cityCode.substring(0, 2)) : 0,
  prix_activite: activityPrice,
  type_activite: getTypeActivite(activityCategories),
  periode: mappedPeriod,
  nb_fratrie: 0,
  allocataire_caf: !!quotientFamilial,
  statut_scolaire: getStatutScolaire(childAge),
  est_qpv: false,
  conditions_sociales: {
    beneficie_ARS: false,
    beneficie_AEEH: false,
    beneficie_AESH: false,
    beneficie_bourse: false,
    beneficie_ASE: false
  }
});

/**
 * Filter vacation-only aids when in school period
 */
const filterVacationAids = <T extends { name: string }>(
  aids: T[],
  mappedPeriod: 'vacances' | 'saison_scolaire'
): T[] => {
  if (mappedPeriod !== 'saison_scolaire') return aids;
  return aids.filter(aid => !VACATION_ONLY_AIDS.some(vacAid => aid.name.includes(vacAid)));
};

/**
 * Map engine result to display format
 */
const mapToDisplayFormat = (res: { name: string; montant: number; niveau: string; official_link?: string }): FinancialAid => ({
  aid_name: res.name,
  amount: res.montant,
  territory_level: res.niveau === 'departemental' ? 'departement' : res.niveau === 'communal' ? 'commune' : res.niveau,
  official_link: res.official_link || null,
  is_informational: false
});

export const FinancialAidsCalculator = ({
  activityPrice,
  activityCategories,
  childAge,
  quotientFamilial,
  cityCode,
  durationDays = 1,
  periodType = "toute_annee"
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [aids, setAids] = useState<FinancialAid[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip calculation if activity price is invalid
    if (activityPrice <= 0) return;

    const calculateAids = async () => {
      setLoading(true);
      setError(null);

      try {
        // UX delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 300));

        const mappedPeriod = mapPeriodType(periodType);
        const params = buildEligibilityParams(
          childAge, quotientFamilial, cityCode, activityPrice, activityCategories, mappedPeriod
        );

        const engineResults = calculateAllEligibleAids(params);
        const contextualResults = filterVacationAids(engineResults, mappedPeriod);
        const mappedAids = contextualResults.map(mapToDisplayFormat);

        setAids(mappedAids);
      } catch (err) {
        console.error(safeErrorMessage(err, 'FinancialAidsCalculator.calculateAids'));
        setError("Impossible de calculer les aides disponibles");
      } finally {
        setLoading(false);
      }
    };

    calculateAids();
  }, [activityPrice, activityCategories, childAge, quotientFamilial, cityCode, durationDays, periodType]);

  // Calculate totals - exclude informational aids
  const calculableAids = aids.filter(aid => !aid.is_informational);
  const totalAids = calculableAids.reduce((sum, aid) => sum + Number(aid.amount), 0);
  const remainingPrice = Math.max(0, activityPrice - totalAids);
  const savingsPercent = activityPrice > 0 ? Math.round((totalAids / activityPrice) * 100) : 0;

  // CRITICAL: If activity price <= 0, don't render anything (moved after hooks)
  if (activityPrice <= 0) {
    return null;
  }

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">💰 Aides Financières Disponibles</h3>
        {loading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-6 text-muted-foreground">
          Calcul des aides en cours...
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-6 text-destructive">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && aids.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          Aucune aide disponible pour cette activité
        </div>
      )}

      {/* Calculable Aids list */}
      {!loading && calculableAids.length > 0 && (
        <>
          <div className="space-y-2">
            {calculableAids.map((aid, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
              >
              <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{aid.aid_name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {TERRITORY_ICONS[aid.territory_level as keyof typeof TERRITORY_ICONS] || "🔹"}{" "}
                      {aid.territory_level}
                    </Badge>
                  </div>
                  {aid.official_link && (
                    <a
                      href={aid.official_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      En savoir plus →
                    </a>
                  )}
                </div>
                <div className="text-lg font-bold text-primary">
                  {Number(aid.amount).toFixed(2)}€
                </div>
              </div>
            ))}
          </div>

          {/* Summary block */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Prix initial</span>
              <span className="font-medium">{activityPrice.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-sm text-primary">
              <span>Total aides</span>
              <span className="font-medium">- {totalAids.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Reste à charge</span>
              <span>{remainingPrice.toFixed(2)}€</span>
            </div>

            {/* Savings badge if > 30% */}
            {savingsPercent >= 30 && (
              <div className="flex justify-center pt-2">
                <Badge variant="default" className="text-sm">
                  🎉 Économie de {savingsPercent}% !
                </Badge>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};
