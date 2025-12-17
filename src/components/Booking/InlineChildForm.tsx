/**
 * InlineChildForm - Formulaire inline pour ajouter un enfant
 * Permet d'ajouter un enfant sans quitter la page d'inscription
 */
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, UserPlus, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { safeErrorMessage } from '@/utils/sanitize';

interface InlineChildFormProps {
  userId: string;
  ageMin?: number;
  ageMax?: number;
  onChildAdded: (childId: string) => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export const InlineChildForm = ({
  userId,
  ageMin = 0,
  ageMax,
  onChildAdded,
  onCancel,
  showCancel = true,
}: InlineChildFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [ageWarning, setAgeWarning] = useState<string | null>(null);

  // Calculer l'âge à partir de la date de naissance
  const calculateAge = (dob: string): number => {
    const birthDateObj = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  // Vérifier la compatibilité d'âge quand la date change
  const handleBirthDateChange = (value: string) => {
    setBirthDate(value);
    
    if (value) {
      const age = calculateAge(value);
      const isCompatible = age >= ageMin && (ageMax === undefined || age <= ageMax);
      
      if (!isCompatible) {
        const ageRange = ageMax ? `${ageMin}-${ageMax} ans` : `à partir de ${ageMin} ans`;
        setAgeWarning(
          `Cet enfant a ${age} ans. L'activité est réservée aux ${ageRange}. Vous pouvez quand même l'ajouter pour d'autres activités.`
        );
      } else {
        setAgeWarning(null);
      }
    } else {
      setAgeWarning(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !birthDate) {
      toast({
        title: "Informations manquantes",
        description: "Le prénom et la date de naissance sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Créer l'enfant en base de données
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- children table insert type may be out of sync
      const { data: newChild, error } = await supabase
        .from("children")
        .insert({
          user_id: userId,
          first_name: firstName.trim(),
          last_name: lastName.trim() || null,
          dob: birthDate,
          needs_json: {}
        } as { user_id: string; first_name: string; last_name: string | null; dob: string; needs_json: Record<string, unknown> })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Enfant enregistré",
        description: `${firstName} a été ajouté avec succès`,
      });

      // Reset form
      setFirstName("");
      setLastName("");
      setBirthDate("");
      setAgeWarning(null);

      onChildAdded(newChild.id);
    } catch (error: unknown) {
      console.error(safeErrorMessage(error, 'InlineChildForm.handleSubmit'));
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'ajouter l'enfant",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ageRange = ageMax ? `${ageMin}–${ageMax} ans` : `à partir de ${ageMin} ans`;

  return (
    <Card className="p-4 border-2 border-dashed border-primary/30 bg-primary/5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <UserPlus size={20} />
            <h3 className="font-semibold">Ajouter un enfant</h3>
          </div>
          {showCancel && onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X size={18} />
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Activité réservée aux <strong>{ageRange}</strong>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              Prénom <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Prénom de l'enfant"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">
              Nom <span className="text-muted-foreground text-xs">(optionnel)</span>
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nom de famille"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthDate">
            Date de naissance <span className="text-destructive">*</span>
          </Label>
          <Input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => handleBirthDateChange(e.target.value)}
            required
            disabled={isSubmitting}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Warning âge incompatible */}
        {ageWarning && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-800">
              {ageWarning}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-2">
          {showCancel && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Annuler
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !firstName.trim() || !birthDate}
            className={showCancel ? "flex-1" : "w-full"}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Enregistrer l'enfant
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default InlineChildForm;
