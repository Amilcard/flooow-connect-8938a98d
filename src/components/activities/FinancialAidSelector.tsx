import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Info } from "lucide-react";

interface Props {
  selectedAids: string[]; // slugs
  onAidsChange: (slugs: string[]) => void;
  territoryPostalCode: string;
}

const TERRITORY_LABELS: Record<string, { label: string; color: string }> = {
  national: { label: "National", color: "bg-blue-100 text-blue-800" },
  region: { label: "Région", color: "bg-green-100 text-green-800" },
  metropole: { label: "Métropole", color: "bg-purple-100 text-purple-800" },
  commune: { label: "Commune", color: "bg-orange-100 text-orange-800" }
};

export const FinancialAidSelector = ({
  selectedAids,
  onAidsChange,
  territoryPostalCode
}: Props) => {
  // Fetch all territories for this postal code
  const { data: territories } = useQuery({
    queryKey: ["territories-hierarchy", territoryPostalCode],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_territories_from_postal", {
        postal_code: territoryPostalCode
      });

      if (error) throw error;
      return data as Array<{
        territory_id: string;
        territory_name: string;
        territory_type: string;
        territory_level: number;
      }>;
    },
    enabled: !!territoryPostalCode
  });

  // Fetch suggested financial aids
  const { data: suggestedAids = [], isLoading } = useQuery({
    queryKey: ["financial-aids-suggestions", territoryPostalCode],
    queryFn: async () => {
      if (!territories || territories.length === 0) return [];

      // Get territory codes from hierarchy
      const communeTerritories = territories.filter(t => t.territory_type === "commune");
      const metropoleTerritories = territories.filter(t => t.territory_type === "metropole");

      const { data, error } = await supabase
        .from("financial_aids")
        .select("*")
        .eq("active", true)
        .or(`territory_level.eq.national,territory_level.eq.region,territory_level.eq.metropole,territory_codes.cs.{${territoryPostalCode}}`);

      if (error) throw error;
      
      // Sort by priority: commune > metropole > region > national
      const sorted = (data || []).sort((a, b) => {
        const order: Record<string, number> = {
          commune: 1,
          metropole: 2,
          region: 3,
          national: 4
        };
        return (order[a.territory_level] || 5) - (order[b.territory_level] || 5);
      });

      return sorted;
    },
    enabled: !!territories && territories.length > 0
  });

  const handleToggle = (slug: string) => {
    if (selectedAids.includes(slug)) {
      onAidsChange(selectedAids.filter(s => s !== slug));
    } else {
      onAidsChange([...selectedAids, slug]);
    }
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Aides financières acceptées
        </CardTitle>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Sélectionnez les aides que votre structure accepte. Seules ces aides seront affichées aux parents.
          </AlertDescription>
        </Alert>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestedAids.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune aide disponible pour ce territoire
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-3">
              ✅ = Suggestions automatiques basées sur votre territoire
            </p>
            
            {suggestedAids.map((aid) => (
              <div
                key={aid.slug}
                className="flex items-start space-x-3 p-3 bg-accent/30 rounded-lg border"
              >
                <Checkbox
                  id={`aid-${aid.slug}`}
                  checked={selectedAids.includes(aid.slug)}
                  onCheckedChange={() => handleToggle(aid.slug)}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={`aid-${aid.slug}`}
                    className="font-medium cursor-pointer"
                  >
                    {aid.name}
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className={TERRITORY_LABELS[aid.territory_level]?.color || ""}
                    >
                      {TERRITORY_LABELS[aid.territory_level]?.label || aid.territory_level}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {aid.amount_value}€
                      {aid.amount_type === "per_day" && "/jour"}
                    </span>
                  </div>
                  {aid.eligibility_summary && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {aid.eligibility_summary}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};
