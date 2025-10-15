import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Euro, CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface Props {
  activityCategories: string[];
  childAge: number;
  quotientFamilial: number;
  cityCode: string;
}

interface FinancialAid {
  id: string;
  name: string;
  slug: string;
  territory_level: string;
  age_min: number;
  age_max: number;
  qf_max: number | null;
  amount_type: string;
  amount_value: number;
  official_link: string | null;
}

const TERRITORY_ICONS = {
  national: "🇫🇷",
  region: "🌍",
  metropole: "🏙️",
  commune: "🏘️"
} as const;

export const FinancialAidBadges = ({
  activityCategories,
  childAge,
  quotientFamilial,
  cityCode
}: Props) => {
  const navigate = useNavigate();
  // Fetch all relevant financial aids
  const { data: aids = [], isLoading } = useQuery({
    queryKey: ["financial-aids-eligibility", activityCategories, childAge, quotientFamilial, cityCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_aids")
        .select("*")
        .eq("active", true)
        .overlaps("categories", activityCategories);

      if (error) throw error;
      return data as FinancialAid[];
    },
    enabled: !!cityCode && childAge > 0
  });

  // Calculate eligibility for each aid
  const getEligibilityStatus = (aid: FinancialAid): {
    status: "eligible" | "verify" | "not_eligible";
    reason?: string;
    badge: "success" | "warning" | "secondary";
    icon: React.ReactNode;
  } => {
    // Age check
    if (childAge < aid.age_min) {
      return {
        status: "not_eligible",
        reason: `Âge minimum: ${aid.age_min} ans`,
        badge: "secondary",
        icon: <XCircle size={14} />
      };
    }
    if (childAge > aid.age_max) {
      return {
        status: "not_eligible",
        reason: `Âge maximum: ${aid.age_max} ans`,
        badge: "secondary",
        icon: <XCircle size={14} />
      };
    }

    // QF check
    if (aid.qf_max !== null) {
      if (quotientFamilial === 0) {
        return {
          status: "verify",
          reason: "Renseignez votre QF pour vérifier",
          badge: "warning",
          icon: <AlertCircle size={14} />
        };
      }
      if (quotientFamilial > aid.qf_max) {
        return {
          status: "not_eligible",
          reason: `Non éligible - QF max: ${aid.qf_max}€`,
          badge: "secondary",
          icon: <XCircle size={14} />
        };
      }
    }

    // If all checks pass
    return {
      status: "eligible",
      badge: "success",
      icon: <CheckCircle size={14} />
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (aids.length === 0) {
    return null;
  }

  // Group aids by eligibility status
  const eligibleAids = aids.map(aid => ({
    ...aid,
    eligibility: getEligibilityStatus(aid)
  })).sort((a, b) => {
    const order = { eligible: 0, verify: 1, not_eligible: 2 };
    return order[a.eligibility.status] - order[b.eligibility.status];
  });

  // Check if QF is missing
  const hasVerifyStatus = eligibleAids.some(aid => aid.eligibility.status === "verify");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Euro size={18} />
          Aides financières disponibles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasVerifyStatus && quotientFamilial === 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 mb-2">
              💡 Certaines aides nécessitent votre quotient familial
            </p>
            <Button
              size="sm"
              variant="default"
              onClick={() => navigate("/profile-edit")}
              className="w-full"
            >
              Compléter mon profil
            </Button>
          </div>
        )}
        {eligibleAids.map((aid) => (
          <div
            key={aid.id}
            className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{aid.name}</span>
                <Badge
                  variant="outline"
                  className="text-xs"
                >
                  {TERRITORY_ICONS[aid.territory_level as keyof typeof TERRITORY_ICONS]}{" "}
                  {aid.territory_level}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {aid.eligibility.icon}
                <span className={`text-xs ${
                  aid.eligibility.status === "eligible" ? "text-green-600 font-medium" :
                  aid.eligibility.status === "verify" ? "text-yellow-600" :
                  "text-muted-foreground"
                }`}>
                  {aid.eligibility.status === "eligible" && "Éligible"}
                  {aid.eligibility.status === "verify" && "À vérifier"}
                  {aid.eligibility.status === "not_eligible" && aid.eligibility.reason}
                </span>
              </div>

              {aid.official_link && aid.eligibility.status !== "not_eligible" && (
                <a
                  href={aid.official_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-1 inline-block"
                >
                  En savoir plus →
                </a>
              )}
            </div>

            {aid.eligibility.status === "eligible" && (
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {aid.amount_value}€
                </div>
                <div className="text-xs text-muted-foreground">
                  {aid.amount_type === "per_day" ? "/jour" : ""}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
