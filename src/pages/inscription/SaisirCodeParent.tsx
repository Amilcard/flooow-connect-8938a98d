import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Heart, Users, Loader2, ArrowRight } from "lucide-react";

const SaisirCodeParent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const activityId = searchParams.get("activityId");
  const slotId = searchParams.get("slotId");

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formatCode = (value: string) => {
    // Remove all non-alphanumeric characters and uppercase
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    // Limit to 6 characters (no dash in DB)
    return cleaned.slice(0, 6);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(formatCode(e.target.value));
  };

  const handleValidate = async () => {
    if (!code || code.length < 6) {
      toast({
        title: "Code incomplet",
        description: "Le code doit contenir 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id || !activityId) {
      toast({
        title: "Information manquante",
        description: "Veuillez vous reconnecter et reessayer.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the RPC function to link parent to minor
      const { data, error } = await supabase.rpc("link_parent_to_minor", {
        p_parent_id: code, // Actually this is the parent's linking code
        p_linking_code: code,
      });

      if (error) {
        throw error;
      }

      const result = data as { success: boolean; error?: string; type?: string };

      if (result.success) {
        toast({
          title: "Compte lie avec succes !",
          description: "Ton parent peut maintenant valider ton inscription.",
        });

        // Navigate to waiting confirmation screen
        navigate(`/inscription/en-attente?activityId=${activityId}${slotId ? `&slotId=${slotId}` : ""}`);
      } else {
        toast({
          title: "Code non reconnu",
          description: result.error || "Verifie le code aupres de ton parent.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error linking parent:", error);
      toast({
        title: "Oups, quelque chose s'est mal passe",
        description: "Reessaie dans quelques instants ou demande a ton parent.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <PageLayout showHeader={false}>
      <PageHeader
        title="Saisir le code parent"
        showBackButton={true}
        onBackClick={handleBack}
      />

      <div className="max-w-[1200px] mx-auto px-4 space-y-6 pb-8">
        {/* Message inspirant Family Flooow */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10 p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-base text-foreground font-medium">
                Ton parent a un code dans son espace Flooow
              </p>
              <p className="text-sm text-muted-foreground italic">
                "Demande-lui son code Family Flooow. Une fois saisi, il pourra valider ton inscription en quelques clics."
              </p>
            </div>
          </div>
        </Card>

        {/* Illustration */}
        <div className="flex justify-center py-4">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
            <Users className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* Input code */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Code parent (6 caracteres)
          </label>
          <Input
            type="text"
            value={code}
            onChange={handleCodeChange}
            placeholder="Ex : A4C9Z7"
            className="text-center text-2xl font-mono tracking-widest h-14 uppercase"
            maxLength={6}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground text-center">
            Le code se trouve dans l'espace "Mon compte" de ton parent
          </p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleValidate}
          disabled={isLoading || code.length < 6}
          className="w-full h-14 text-lg font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Verification...
            </>
          ) : (
            <>
              Valider le code
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        {/* Alternative link */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground mb-2">
            Ton parent n'a pas encore Flooow ?
          </p>
          <Button
            variant="link"
            onClick={() => navigate(`/inscription/generer-code-enfant?activityId=${activityId}${slotId ? `&slotId=${slotId}` : ""}`)}
            className="text-primary"
          >
            Genere un code pour lui
          </Button>
        </div>

        {/* Footer inspirant */}
        <Card className="bg-muted/30 border-0 p-4 mt-6">
          <p className="text-xs text-center text-muted-foreground">
            La Family Flooow t'accompagne a chaque etape.
            Ton parent recevra une notification des que tu auras saisi le code.
          </p>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SaisirCodeParent;
