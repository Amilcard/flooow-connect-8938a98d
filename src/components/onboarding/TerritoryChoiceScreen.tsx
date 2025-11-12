import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TerritoryChoiceScreenProps {
  onNext: (territoryId: string | null, isCovered: boolean) => void;
  onSkip: () => void;
}

const COVERED_TERRITORIES = [
  { value: "paris", label: "Paris / Île-de-France", postalCode: "75001" },
  { value: "lyon", label: "Lyon Métropole", postalCode: "69001" },
  { value: "grenoble", label: "Grenoble Alpes Métropole", postalCode: "38000" },
  { value: "marseille", label: "Aix-Marseille-Provence", postalCode: "13001" },
  { value: "saint-etienne", label: "Saint-Étienne Métropole", postalCode: "42000" }
];

export const TerritoryChoiceScreen = ({ onNext, onSkip }: TerritoryChoiceScreenProps) => {
  const [postalCode, setPostalCode] = useState("");
  const [selectedTerritory, setSelectedTerritory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleValidate = async () => {
    setIsLoading(true);
    
    try {
      let codeToCheck = postalCode;
      
      // Si un territoire est sélectionné dans la liste, utiliser son code postal
      if (selectedTerritory) {
        const territory = COVERED_TERRITORIES.find(t => t.value === selectedTerritory);
        if (territory) {
          codeToCheck = territory.postalCode;
        }
      }

      if (!codeToCheck) {
        toast.error("Veuillez saisir un code postal ou sélectionner un territoire");
        setIsLoading(false);
        return;
      }

      // Vérifier le territoire via la table postal_codes
      const { data, error } = await supabase
        .from('postal_codes')
        .select('territory_id, code, city, territories(name)')
        .eq('code', codeToCheck)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Erreur lors de la vérification du territoire:", error);
      }

      if (data && data.territory_id) {
        // Territoire trouvé et couvert
        localStorage.setItem('userTerritoryId', data.territory_id);
        localStorage.setItem('userPostalCode', codeToCheck);
        onNext(data.territory_id, true);
      } else {
        // Territoire non couvert
        localStorage.setItem('userPostalCode', codeToCheck);
        onNext(null, false);
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
      onNext(null, false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-foreground">
            Où habites-tu ou où tu souhaites tester Flooow ?
          </h2>
          <p className="text-sm text-muted-foreground">
            Tu peux saisir ton code postal ou choisir dans la liste
          </p>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Nous utilisons cette information uniquement pour adapter les activités et les aides à ton territoire de test. Tu pourras la modifier plus tard.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="postalCode">Code postal</Label>
            <Input
              id="postalCode"
              type="text"
              placeholder="Exemple : 42000"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              disabled={!!selectedTerritory}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                ou
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="territory">Sélectionne ton territoire de test</Label>
            <Select 
              value={selectedTerritory} 
              onValueChange={(value) => {
                setSelectedTerritory(value);
                setPostalCode("");
              }}
            >
              <SelectTrigger id="territory">
                <SelectValue placeholder="Choisir un territoire..." />
              </SelectTrigger>
              <SelectContent>
                {COVERED_TERRITORIES.map((territory) => (
                  <SelectItem key={territory.value} value={territory.value}>
                    {territory.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-3 border-t">
        <Button
          onClick={handleValidate}
          className="w-full h-14"
          size="lg"
          disabled={isLoading || (!postalCode && !selectedTerritory)}
        >
          {isLoading ? "Vérification..." : "Valider mon territoire"}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
        
        <Button
          onClick={onSkip}
          variant="ghost"
          className="w-full"
          disabled={isLoading}
        >
          Passer pour l'instant (mode découverte)
        </Button>
      </div>
    </div>
  );
};
