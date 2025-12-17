import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { safeErrorMessage } from '@/utils/sanitize';

interface TerritoryChoiceScreenProps {
  onNext: (territoryId: string | null, isCovered: boolean) => void;
  onSkip: () => void;
}

interface CoveredTerritory {
  value: string;
  label: string;
  postalCode: string;
}

// HELPERS: Reduce cognitive complexity

/**
 * Get postal code to check, handling territory selection
 */
const getPostalCodeToCheck = (
  postalCode: string,
  selectedTerritory: string,
  territories: CoveredTerritory[]
): string | null => {
  if (selectedTerritory) {
    const territory = territories.find(t => t.value === selectedTerritory);
    if (territory && (!postalCode || postalCode.length < 5)) {
      return territory.postalCode + "000";
    }
  }
  return postalCode || null;
};

/**
 * Save territory info to localStorage
 */
const saveTerritoryToStorage = (territoryId: string | null, postalCode: string): void => {
  if (territoryId) {
    localStorage.setItem('userTerritoryId', territoryId);
  }
  localStorage.setItem('userPostalCode', postalCode);
};

/**
 * Try to find territory by name when postal code lookup fails
 */
const findTerritoryByName = async (
  selectedTerritory: string,
  territories: CoveredTerritory[]
): Promise<{ id: string; name: string } | null> => {
  const territory = territories.find(t => t.value === selectedTerritory);
  if (!territory) return null;

  const { data: territoryData } = await supabase
    .from('territories')
    .select('id, name')
    .ilike('name', `%${territory.label}%`)
    .maybeSingle();

  return territoryData;
};

const COVERED_TERRITORIES: CoveredTerritory[] = [
  { value: "paris", label: "Paris / Île-de-France", postalCode: "75" },
  { value: "lyon", label: "Lyon Métropole", postalCode: "69" },
  { value: "grenoble", label: "Grenoble Alpes Métropole", postalCode: "38" },
  { value: "marseille", label: "Aix-Marseille-Provence", postalCode: "13" },
  { value: "saint-etienne", label: "Saint-Étienne Métropole", postalCode: "42" }
];

export const TerritoryChoiceScreen = ({ onNext, onSkip }: TerritoryChoiceScreenProps) => {
  const [postalCode, setPostalCode] = useState("");
  const [selectedTerritory, setSelectedTerritory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableTerritories, setAvailableTerritories] = useState<typeof COVERED_TERRITORIES>([]);
  const [showTerritoryList, setShowTerritoryList] = useState(false);

  // Filtrer les territoires en fonction du code postal
  const handlePostalCodeChange = (value: string) => {
    setPostalCode(value);
    setSelectedTerritory(""); // Réinitialiser la sélection

    if (value.length >= 2) {
      // Filtrer les territoires par préfixe de code postal
      const prefix = value.substring(0, 2);
      const filtered = COVERED_TERRITORIES.filter(t => 
        t.postalCode.startsWith(prefix)
      );

      setAvailableTerritories(filtered);
      setShowTerritoryList(filtered.length > 0);

      // Si un seul territoire correspond, le présélectionner
      if (filtered.length === 1) {
        setSelectedTerritory(filtered[0].value);
      }
    } else {
      setAvailableTerritories([]);
      setShowTerritoryList(false);
    }
  };

  const handleValidate = async () => {
    setIsLoading(true);

    try {
      // Get postal code to check using helper
      const codeToCheck = getPostalCodeToCheck(postalCode, selectedTerritory, COVERED_TERRITORIES);

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
        .maybeSingle();

      if (error?.code !== 'PGRST116' && error) {
        console.error(safeErrorMessage(error, 'TerritoryChoiceScreen.handleValidate.postalCodeCheck'));
      }

      // Territory found in postal_codes table
      if (data?.territory_id) {
        saveTerritoryToStorage(data.territory_id, codeToCheck);
        onNext(data.territory_id, true);
        return;
      }

      // Try to find territory by name if postal code lookup failed
      if (selectedTerritory) {
        const territoryData = await findTerritoryByName(selectedTerritory, COVERED_TERRITORIES);
        if (territoryData) {
          saveTerritoryToStorage(territoryData.id, codeToCheck);
          onNext(territoryData.id, true);
          return;
        }
      }

      // Territory not covered
      saveTerritoryToStorage(null, codeToCheck);
      onNext(null, false);
    } catch (error) {
      console.error(safeErrorMessage(error, 'TerritoryChoiceScreen.handleValidate'));
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
            Saisis ton code postal pour découvrir ton territoire
          </p>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            📍 Cette information permet d'adapter les activités et les aides à ton territoire. Tu pourras la modifier plus tard.
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
              onChange={(e) => handlePostalCodeChange(e.target.value)}
              maxLength={5}
            />
          </div>

          {showTerritoryList && availableTerritories.length > 0 && (
            <>
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">puis sélectionne</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="territory">Territoire correspondant</Label>
                <Select 
                  value={selectedTerritory} 
                  onValueChange={setSelectedTerritory}
                >
                  <SelectTrigger id="territory">
                    <SelectValue placeholder="Choisir un territoire" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTerritories.map((territory) => (
                      <SelectItem key={territory.value} value={territory.value}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{territory.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {postalCode.length >= 2 && availableTerritories.length === 0 && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                📍 Ce code postal ne correspond pas encore à un territoire de test. Vous pouvez choisir un territoire manuellement ci-dessous.
              </p>
            </div>
          )}

          {!showTerritoryList && postalCode.length < 2 && (
            <>
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">ou choisis directement</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="territory-manual">Territoire de test</Label>
                <Select 
                  value={selectedTerritory} 
                  onValueChange={setSelectedTerritory}
                >
                  <SelectTrigger id="territory-manual">
                    <SelectValue placeholder="Choisir un territoire" />
                  </SelectTrigger>
                  <SelectContent>
                    {COVERED_TERRITORIES.map((territory) => (
                      <SelectItem key={territory.value} value={territory.value}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{territory.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
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
