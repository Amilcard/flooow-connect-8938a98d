import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { UserCheck, PhoneCall } from "lucide-react";
import { safeErrorMessage } from '@/utils/sanitize';

/**
 * Composant pour demander un accompagnement personnalisé
 * Axe 9: Accompagnement parent
 */
export const AccompagnementRequest = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  const handleRequestAccompagnement = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour demander un accompagnement",
        variant: "destructive"
      });
      return;
    }

    setIsRequesting(true);

    try {
      // Récupérer le profile_json actuel
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_json')
        .eq('id', user.id)
        .single();

      const currentJson = profile?.profile_json as Record<string, any> || {};

      // Mettre à jour le profil avec les infos d'accompagnement dans profile_json
      const { error } = await supabase
        .from('profiles')
        .update({
          profile_json: {
            ...currentJson,
            besoin_accompagnement: true,
            accompagnement_demande_le: new Date().toISOString()
          }
        })
        .eq('id', user.id);

      if (error) throw error;

      setHasRequested(true);
      toast({
        title: "Demande envoyée",
        description: "Un conseiller va vous contacter dans les prochains jours pour vous accompagner dans vos inscriptions.",
      });
    } catch (error) {
      console.error(safeErrorMessage(error, 'AccompagnementRequest.handleRequestAccompagnement'));
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande. Réessayez plus tard.",
        variant: "destructive"
      });
    } finally {
      setIsRequesting(false);
    }
  };

  if (hasRequested) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-green-600" />
            <CardTitle className="text-lg">Demande enregistrée</CardTitle>
          </div>
          <CardDescription>
            Votre demande d'accompagnement a bien été prise en compte. Un conseiller va vous contacter prochainement.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Besoin d'aide pour inscrire votre enfant ?</CardTitle>
        </div>
        <CardDescription>
          Les démarches d'inscription vous semblent complexes ? Un conseiller peut vous accompagner gratuitement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Notre conseiller peut vous aider à :</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Trouver les activités adaptées à votre enfant</li>
            <li>Comprendre les aides financières disponibles</li>
            <li>Remplir les dossiers d'inscription</li>
            <li>Organiser le transport (covoiturage, transport en commun)</li>
          </ul>
        </div>

        <Button
          onClick={handleRequestAccompagnement}
          disabled={isRequesting}
          className="w-full"
        >
          {isRequesting ? "Envoi en cours..." : "Demander un accompagnement gratuit"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Vous serez contacté sous 48h par téléphone ou email
        </p>
      </CardContent>
    </Card>
  );
};
