import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { safeErrorMessage } from "@/utils/sanitize";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Copy, Check, Loader2, Share2, ArrowRight, Sparkles } from "lucide-react";

const GenererCodeEnfant = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const activityId = searchParams.get("activityId");
  const slotId = searchParams.get("slotId");

  const [code, setCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    generateCode();
  }, [user?.id, activityId]);

  const generateCode = async () => {
    if (!user?.id || !activityId) {
      setIsLoading(false);
      return;
    }

    try {
      // Call the RPC function to create temporary request and get code
      const { data, error } = await supabase.rpc("create_child_temp_request", {
        p_minor_id: user.id,
        p_activity_id: activityId,
        p_slot_id: slotId || null,
      });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setCode(data[0].linking_code);
        setRequestId(data[0].request_id);
      }
    } catch (error: unknown) {
      console.error(safeErrorMessage(error, 'GenererCodeEnfant.generateCode'));
      toast({
        title: "Oups !",
        description: "Impossible de generer le code. Reessaie dans quelques instants.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      toast({
        title: "Code copie !",
        description: "Tu peux maintenant l'envoyer a ton parent.",
      });
      setTimeout(() => setIsCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Copie impossible",
        description: "Selectionne le code manuellement pour le copier.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!code) return;

    const shareText = `Bonjour ! Je souhaite m'inscrire à une activité sur Flooow. Pour valider mon inscription, entre ce code dans ton espace Flooow : ${code}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mon code Family Flooow",
          text: shareText,
        });
      } catch (error) {
        // User cancelled or share failed
        handleCopyCode();
      }
    } else {
      handleCopyCode();
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    navigate(`/inscription/en-attente?activityId=${activityId}${slotId ? `&slotId=${slotId}` : ""}&requestId=${requestId}`);
  };

  // Format code for display (ABC DEF)
  const displayCode = code ? `${code.slice(0, 3)} ${code.slice(3)}` : "";

  return (
    <PageLayout showHeader={false}>
      <PageHeader
        title="Mon code Family Flooow"
        showBackButton={true}
        onBackClick={handleBack}
      />

      <div className="max-w-5xl mx-auto px-4 space-y-6 pb-8">
        {/* Message inspirant Family Flooow */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10 p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-base text-foreground font-medium">
                Transmets ce code a ton parent
              </p>
              <p className="text-sm text-muted-foreground italic">
                "Il pourra le saisir dans son espace Flooow pour valider ton inscription. C'est simple et rapide !"
              </p>
            </div>
          </div>
        </Card>

        {/* Code display */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground">Generation du code...</p>
          </div>
        ) : code ? (
          <div className="space-y-4">
            {/* Code card */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 p-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary">Ton code unique</span>
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="py-4">
                  <p className="text-4xl font-mono font-bold tracking-[0.3em] text-foreground">
                    {displayCode}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Valable 7 jours
                </p>
              </div>
            </Card>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleCopyCode}
                className="h-12 gap-2"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copie !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copier
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="h-12 gap-2"
              >
                <Share2 className="w-4 h-4" />
                Partager
              </Button>
            </div>
          </div>
        ) : (
          <Card className="bg-destructive/5 border-destructive/20 p-6">
            <p className="text-center text-destructive">
              Impossible de generer le code. Verifie ta connexion et reessaie.
            </p>
            <Button
              variant="outline"
              onClick={generateCode}
              className="w-full mt-4"
            >
              Reessayer
            </Button>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-muted/30 border-0 p-4">
          <h3 className="font-semibold text-foreground mb-3">Comment ca marche ?</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-xs">1</span>
              <span>Transmets ce code a ton parent (SMS, message...)</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-xs">2</span>
              <span>Il saisit le code dans "Lier un enfant" sur son Flooow</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-xs">3</span>
              <span>Il valide ton inscription en un clic</span>
            </li>
          </ol>
        </Card>

        {/* CTA Continue */}
        {code && (
          <Button
            onClick={handleContinue}
            className="w-full h-14 text-lg font-semibold"
          >
            J'ai transmis le code
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground pt-2">
          Tu recevras une notification des que ton parent aura valide.
        </p>
      </div>
    </PageLayout>
  );
};

export default GenererCodeEnfant;
