import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mail, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  postalCode: string;
  onCovered?: (covered: boolean) => void;
}

export const TerritoryCheck = ({ postalCode, onCovered }: Props) => {
  const navigate = useNavigate();

  const { data: territories, isLoading } = useQuery({
    queryKey: ["territory-check", postalCode],
    queryFn: async () => {
      if (!postalCode) return null;

      const { data, error } = await supabase
        .from("territories")
        .select("*")
        .contains("postal_codes", [postalCode])
        .eq("type", "commune");

      if (error) throw error;
      return data;
    },
    enabled: !!postalCode
  });

  // Notify parent of coverage status
  const isCovered = territories && territories.length > 0 && territories[0]?.covered === true;
  
  useEffect(() => {
    if (territories && onCovered) {
      onCovered(isCovered);
    }
  }, [territories, isCovered, onCovered]);

  if (isLoading || !postalCode) return null;

  // No territory found
  if (!territories || territories.length === 0) {
    return (
      <Alert className="border-yellow-500 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <p className="font-semibold mb-2">Zone non reconnue</p>
          <p className="text-sm">
            Le code postal {postalCode} n'est pas dans notre base. Vérifiez votre saisie.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  const territory = territories[0];

  // Territory not covered yet
  if (!territory.covered) {
    return (
      <Alert className="border-blue-500 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 space-y-4">
          <div>
            <p className="font-semibold text-lg mb-2">
              🚧 Inklusif arrive bientôt à {territory.name} !
            </p>
            <p className="text-sm mb-3">
              Notre service est actuellement actif à :
            </p>
            <ul className="text-sm space-y-1 ml-4 mb-3">
              <li>• Saint-Étienne (42000, 42100)</li>
              <li>• La Ricamarie (42150)</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              className="w-full"
              onClick={() => {
                window.open("mailto:contact@inklusif.fr?subject=Notification lancement", "_blank");
              }}
            >
              <Mail size={16} className="mr-2" />
              📧 Soyez informé du lancement
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                window.open("mailto:contact@inklusif.fr?subject=Invitation mairie", "_blank");
              }}
            >
              <Building2 size={16} className="mr-2" />
              🏛️ Inviter ma mairie
            </Button>

            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => navigate("/profile-edit")}
            >
              Modifier mon code postal
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Territory is covered - show success
  return (
    <Alert className="border-green-500 bg-green-50">
      <AlertCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <p className="font-semibold">✅ Zone couverte: {territory.name}</p>
        <p className="text-sm mt-1">
          Vous avez accès à toutes les activités et aides disponibles.
        </p>
      </AlertDescription>
    </Alert>
  );
};
