import { useAnalytics } from '@/contexts/AnalyticsContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

export const ConsentBanner = () => {
  const { consent, userType, grantConsent, denyConsent } = useAnalytics();

  // Ne pas afficher si déjà un choix fait
  if (consent !== 'unknown') return null;

  // Ne pas afficher aux mineurs (pas de tracking de toute façon)
  if (userType === 'minor') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-sm border-t">
      <Card className="max-w-2xl mx-auto p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-foreground">Flooow est en phase de test</h3>
            <p className="text-sm text-muted-foreground">
              Pour améliorer votre appli, nous pouvons analyser votre navigation. C'est optionnel.
            </p>
          </div>
          <button onClick={denyConsent} className="text-muted-foreground hover:text-foreground" aria-label="Fermer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-3 mt-4">
          <Button onClick={grantConsent} className="flex-1">Oui, j'accepte</Button>
          <Button onClick={denyConsent} variant="outline" className="flex-1">Non, merci</Button>
        </div>
      </Card>
    </div>
  );
};
