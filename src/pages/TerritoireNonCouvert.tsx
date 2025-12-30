/**
 * Page TerritoireNonCouvert - Territoire non encore disponible
 *
 * Affichée quand le CP n'est pas dans la Loire (42).
 * Ton Citycrunch pro (courtois, léger second degré).
 */
import { useNavigate } from 'react-router-dom';
import { MapPinOff, Play, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTerritoryContext } from '@/contexts/TerritoryContext';

const TerritoireNonCouvert = () => {
  const navigate = useNavigate();
  const { postalCode, enterDemoMode, reset } = useTerritoryContext();

  const handleExploreDemo = () => {
    enterDemoMode();
    navigate('/home', { replace: true });
  };

  const handleBack = () => {
    reset();
    navigate('/ma-ville', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-amber-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <MapPinOff className="w-10 h-10 text-orange-600" />
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-foreground">
              Flooow n'est pas encore disponible dans votre ville
            </h1>
            {postalCode && (
              <p className="text-muted-foreground">
                Code postal : <span className="font-medium">{postalCode}</span>
              </p>
            )}
          </div>

          {/* Explanation */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200 space-y-3">
            <p className="text-foreground">
              Pour l'instant, Flooow est en <strong>phase pilote</strong> sur Saint-Étienne Métropole (Loire, 42).
            </p>
            <p className="text-muted-foreground text-sm">
              On déploie progressivement sur d'autres territoires. En attendant, vous pouvez explorer un catalogue de démo pour voir comment Flooow fonctionnerait chez vous.
            </p>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Button
              onClick={handleExploreDemo}
              size="lg"
              className="w-full py-6 text-base gap-2"
            >
              <Play className="w-5 h-5" />
              Voir à quoi ça ressemblerait chez vous
            </Button>
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Changer mon code postal
            </Button>
          </div>

          {/* Footer info */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            Le mode démo affiche des données du territoire pilote, uniquement pour l'exemple.
            <br />
            Votre territoire pourra être proposé dès l'ouverture locale.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TerritoireNonCouvert;
