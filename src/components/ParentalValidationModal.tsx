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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, ArrowLeft, Copy, Check, Loader2, ShieldCheck } from "lucide-react";

interface ParentalValidationModalProps {
  open: boolean;
  onClose: () => void;
  onValidated: () => void;
  activityId: string;
  slotId?: string;
  activityTitle?: string;
}

type Step = "choice" | "enter_parent_code" | "generate_child_code" | "code_generated";

export const ParentalValidationModal = ({
  open,
  onClose,
  onValidated,
  activityId,
  slotId,
  activityTitle,
}: ParentalValidationModalProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("choice");
  const [parentCode, setParentCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleReset = () => {
    setStep("choice");
    setParentCode("");
    setGeneratedCode("");
    setError("");
    setCopied(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Option 1: Mineur saisit le code du parent
  const handleEnterParentCode = async () => {
    if (!parentCode || parentCode.length !== 6) {
      setError("Le code doit contenir 6 caractères");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Chercher le parent avec ce code
      const { data: parentProfile, error: searchError } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("linking_code", parentCode.toUpperCase())
        .single();

      if (searchError || !parentProfile) {
        setError("Code invalide. Vérifie le code avec ton parent.");
        return;
      }

      // Lier le mineur au parent
      const { error: linkError } = await supabase
        .from("profiles")
        .update({ parent_id: parentProfile.id })
        .eq("id", user.id);

      if (linkError) throw linkError;

      toast({
        title: "Compte lié",
        description: "Ton compte est maintenant lié à ton parent. Tu peux continuer l'inscription.",
      });

      onValidated();
      handleClose();
    } catch (err: any) {
      console.error("Link error:", err);
      setError(err.message || "Erreur lors de la liaison");
    } finally {
      setIsLoading(false);
    }
  };

  // Option 2: Mineur génère un code pour son parent
  const handleGenerateCode = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Créer une demande temporaire avec un code unique
      const { data, error: rpcError } = await supabase
        .rpc("create_child_temp_request", {
          p_minor_id: user.id,
          p_activity_id: activityId,
          p_slot_id: slotId || null,
        });

      if (rpcError) throw rpcError;

      if (data && data.length > 0) {
        setGeneratedCode(data[0].linking_code);
        setStep("code_generated");
      } else {
        throw new Error("Erreur lors de la génération du code");
      }
    } catch (err: any) {
      console.error("Generate code error:", err);
      setError(err.message || "Erreur lors de la génération du code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Code copié",
        description: "Le code a été copié dans le presse-papier",
      });
    } catch {
      toast({
        title: "Copie impossible",
        description: "Copie le code manuellement : " + generatedCode,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Validation parentale requise
          </DialogTitle>
          <DialogDescription>
            {activityTitle
              ? `Pour t'inscrire à "${activityTitle}", un parent doit valider ta demande.`
              : "Pour t'inscrire, un parent doit valider ta demande."}
          </DialogDescription>
        </DialogHeader>

        {/* Step: Choice */}
        {step === "choice" && (
          <div className="space-y-4 pt-4">
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex flex-col items-start gap-2"
              onClick={() => setStep("enter_parent_code")}
            >
              <div className="flex items-center gap-3 w-full">
                <Users className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Mon parent a déjà Flooow</p>
                  <p className="text-sm text-muted-foreground">
                    Je saisis le code de mon parent
                  </p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full h-auto py-4 flex flex-col items-start gap-2"
              onClick={() => setStep("generate_child_code")}
            >
              <div className="flex items-center gap-3 w-full">
                <UserPlus className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Mon parent n'a pas encore Flooow</p>
                  <p className="text-sm text-muted-foreground">
                    Je génère un code pour mon parent
                  </p>
                </div>
              </div>
            </Button>
          </div>
        )}

        {/* Step: Enter Parent Code */}
        {step === "enter_parent_code" && (
          <div className="space-y-4 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>

            <div className="space-y-2">
              <Label htmlFor="parentCode">Code parent (6 caractères)</Label>
              <Input
                id="parentCode"
                value={parentCode}
                onChange={(e) => setParentCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="Ex: ABC123"
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Demande le code à ton parent. Il le trouve dans son profil Flooow.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleEnterParentCode}
              disabled={isLoading || parentCode.length !== 6}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Valider le code"
              )}
            </Button>
          </div>
        )}

        {/* Step: Generate Child Code - Confirmation */}
        {step === "generate_child_code" && (
          <div className="space-y-4 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>

            <Alert>
              <AlertDescription>
                Un code va être généré. Ton parent devra :
                <ol className="list-decimal ml-4 mt-2 space-y-1">
                  <li>Créer un compte Flooow (ou se connecter)</li>
                  <li>Aller dans "Lier un enfant"</li>
                  <li>Saisir ton code</li>
                  <li>Valider ta demande d'inscription</li>
                </ol>
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGenerateCode}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                "Générer mon code"
              )}
            </Button>
          </div>
        )}

        {/* Step: Code Generated */}
        {step === "code_generated" && (
          <div className="space-y-4 pt-4">
            <Alert className="bg-primary/10 border-primary/20">
              <AlertDescription>
                <p className="font-medium text-center mb-2">Ton code est :</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-mono font-bold tracking-widest text-primary">
                    {generatedCode}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyCode}
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
              <p className="font-medium">Prochaines étapes :</p>
              <ol className="list-decimal ml-4 space-y-1 text-muted-foreground">
                <li>Donne ce code à ton parent</li>
                <li>Il crée son compte Flooow</li>
                <li>Il va dans "Mon compte" → "Lier un enfant"</li>
                <li>Il saisit ce code et valide ta demande</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2">
                Ce code est valable 7 jours.
              </p>
            </div>

            <Button onClick={handleClose} className="w-full">
              J'ai compris
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ParentalValidationModal;
