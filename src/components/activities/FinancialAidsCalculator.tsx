import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Props {
  activityPrice: number;
  activityCategories: string[];
  childAge: number;
  quotientFamilial: number;
  cityCode: string;
  durationDays?: number;
}

interface FinancialAid {
  aid_name: string;
  amount: number;
  territory_level: string;
  official_link: string | null;
}

const TERRITORY_ICONS = {
  national: "🇫🇷",
  region: "🌍",
  metropole: "🏙️",
  commune: "🏘️"
} as const;

export const FinancialAidsCalculator = ({
  activityPrice,
  activityCategories,
  childAge,
  quotientFamilial,
  cityCode,
  durationDays = 1
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [aids, setAids] = useState<FinancialAid[]>([]);
  const [error, setError] = useState<string | null>(null);

  // CRITICAL: If activity price <= 0, don't render anything
  if (activityPrice <= 0) {
    return null;
  }

  useEffect(() => {
    const fetchEligibleAids = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: rpcError } = await supabase.rpc('calculate_eligible_aids', {
          p_age: childAge,
          p_qf: quotientFamilial,
          p_city_code: cityCode,
          p_activity_price: activityPrice,
          p_duration_days: durationDays,
          p_categories: activityCategories
        });

        if (rpcError) throw rpcError;
        setAids(data || []);
      } catch (err) {
        console.error("Error fetching financial aids:", err);
        setError("Impossible de calculer les aides disponibles");
      } finally {
        setLoading(false);
      }
    };

    fetchEligibleAids();
  }, [activityPrice, activityCategories, childAge, quotientFamilial, cityCode, durationDays]);

  // Calculate totals
  const totalAids = aids.reduce((sum, aid) => sum + Number(aid.amount), 0);
  const remainingPrice = Math.max(0, activityPrice - totalAids);
  const savingsPercent = activityPrice > 0 ? Math.round((totalAids / activityPrice) * 100) : 0;

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

      {/* Aids list */}
      {!loading && aids.length > 0 && (
        <>
          <div className="space-y-2">
            {aids.map((aid, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{aid.aid_name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {TERRITORY_ICONS[aid.territory_level as keyof typeof TERRITORY_ICONS]}{" "}
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
