import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Euro, CheckCircle2 } from "lucide-react";

interface SimulateAidModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityPrice: number;
  acceptedAids: string[];
}

interface AidResult {
  name: string;
  amount: number;
  eligible: boolean;
}

export const SimulateAidModal = ({
  open,
  onOpenChange,
  activityPrice,
  acceptedAids
}: SimulateAidModalProps) => {
  const [quotientFamilial, setQuotientFamilial] = useState("");
  const [results, setResults] = useState<AidResult[]>([]);
  const [simulated, setSimulated] = useState(false);

  const handleSimulate = () => {
    const qf = parseInt(quotientFamilial) || 0;
    
    // Simulation simple basée sur le quotient familial
    const simulatedResults: AidResult[] = [];
    
    if (acceptedAids.includes("CAF") && qf < 800) {
      simulatedResults.push({
        name: "Aide CAF",
        amount: Math.min(activityPrice * 0.5, 100),
        eligible: true
      });
    }
    
    if (acceptedAids.includes("PassSport") && qf < 1200) {
      simulatedResults.push({
        name: "Pass'Sport",
        amount: 50,
        eligible: true
      });
    }
    
    if (acceptedAids.includes("ANCV")) {
      simulatedResults.push({
        name: "Chèques Vacances ANCV",
        amount: activityPrice * 0.3,
        eligible: true
      });
    }

    if (acceptedAids.includes("AideLocale") && qf < 1000) {
      simulatedResults.push({
        name: "Aide Locale",
        amount: Math.min(activityPrice * 0.4, 80),
        eligible: true
      });
    }

    setResults(simulatedResults);
    setSimulated(true);
  };

  const totalAid = results.reduce((sum, aid) => sum + (aid.eligible ? aid.amount : 0), 0);
  const finalPrice = Math.max(0, activityPrice - totalAid);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Simuler vos aides financières</DialogTitle>
          <DialogDescription>
            Calculez le montant des aides auxquelles vous pouvez prétendre
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="qf">Quotient Familial CAF</Label>
            <Input
              id="qf"
              type="number"
              placeholder="Ex: 750"
              value={quotientFamilial}
              onChange={(e) => setQuotientFamilial(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Trouvez votre QF sur votre attestation CAF
            </p>
          </div>

          {!simulated ? (
            <Button 
              onClick={handleSimulate} 
              className="w-full"
              disabled={!quotientFamilial}
            >
              Simuler
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {results.map((aid, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-medium">{aid.name}</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      -{aid.amount.toFixed(2)}€
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Prix initial</span>
                  <span>{activityPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Total des aides</span>
                  <span>-{totalAid.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Reste à payer</span>
                  <span className="text-primary">{finalPrice.toFixed(2)}€</span>
                </div>
              </div>

              <Button 
                onClick={() => {
                  setSimulated(false);
                  setQuotientFamilial("");
                  setResults([]);
                }}
                variant="outline"
                className="w-full"
              >
                Nouvelle simulation
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
