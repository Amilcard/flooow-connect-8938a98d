/**
 * DemoBanner - Bannière honnête pour le mode test
 *
 * Affichée en haut de l'écran quand isDemoFlow=true.
 * Message clair: "Mode test - Catalogue d'exemple (territoire pilote)"
 */

import { useNavigate } from 'react-router-dom';
import { X, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTerritoryContext } from '@/contexts/TerritoryContext';

const DEMO_BANNER_TITLE = 'Mode test';
const DEMO_BANNER_SUBTITLE = "Catalogue d'exemple (territoire pilote)";

export function DemoBanner() {
  const navigate = useNavigate();
  const { exitDemoMode } = useTerritoryContext();

  const handleExit = () => {
    exitDemoMode();
    navigate('/ma-ville', { replace: true });
  };

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-5 h-5 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-semibold">{DEMO_BANNER_TITLE}</span>
            <span className="hidden sm:inline"> - {DEMO_BANNER_SUBTITLE}</span>
            <span className="sm:hidden text-white/80"> - Exemple</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExit}
          className="text-white hover:bg-white/20 hover:text-white gap-1.5 px-2 sm:px-3"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Quitter le mode test</span>
          <span className="sm:hidden">Quitter</span>
        </Button>
      </div>
    </div>
  );
}

export default DemoBanner;
