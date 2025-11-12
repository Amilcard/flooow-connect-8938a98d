import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, Database } from "lucide-react";

interface PrivacyConsentScreenProps {
  onComplete: () => void;
}

export const PrivacyConsentScreen = ({ onComplete }: PrivacyConsentScreenProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex justify-center">
          <Shield className="w-20 h-20 text-primary" />
        </div>

        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-foreground">
            Tes données, ton contrôle
          </h2>
          <p className="text-lg text-muted-foreground">
            Un mot sur la confidentialité
          </p>
        </div>

        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3 bg-background p-4 rounded-lg border">
            <Lock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-base text-foreground">
                Nous utilisons ton territoire uniquement pour adapter les activités et les aides à ta situation.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-background p-4 rounded-lg border">
            <Eye className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-base text-foreground">
                Nous ne revendons pas tes données et tu peux demander leur suppression à tout moment.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-background p-4 rounded-lg border">
            <Database className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-base text-foreground">
                Pendant la phase bêta, nous analysons uniquement des données agrégées pour comprendre ce qui fonctionne et ce qui doit être amélioré.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-primary/5 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            En continuant, tu acceptes notre{" "}
            <a href="/legal/privacy-policy" className="text-primary underline">
              politique de confidentialité
            </a>{" "}
            et nos{" "}
            <a href="/legal/cgu" className="text-primary underline">
              conditions d'utilisation
            </a>
            .
          </p>
        </div>
      </div>

      <div className="p-6 border-t">
        <Button
          onClick={onComplete}
          className="w-full h-14"
          size="lg"
        >
          C'est compris, continuons
        </Button>
      </div>
    </div>
  );
};
