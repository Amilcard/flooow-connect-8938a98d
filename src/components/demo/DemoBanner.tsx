import { FlaskConical, RefreshCw, X } from 'lucide-react';

interface DemoBannerProps {
  /** Ville réelle de l'utilisateur */
  realCity: string;
  /** Ville de démo choisie */
  demoCity: string;
  /** Callback pour changer la ville de démo */
  onChangeDemo: () => void;
  /** Callback pour quitter le mode démo */
  onExitDemo: () => void;
  /** Variante compacte (pour mobile) */
  compact?: boolean;
}

/**
 * Bandeau affiché en haut de l'écran quand l'utilisateur est en mode démo
 * Indique clairement le contexte pour éviter toute confusion
 */
export const DemoBanner = ({ 
  realCity, 
  demoCity, 
  onChangeDemo, 
  onExitDemo,
  compact = false
}: DemoBannerProps) => {
  if (compact) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-3 py-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-amber-800">
            <FlaskConical className="h-3.5 w-3.5" />
            <span className="font-medium">Test</span>
            <span className="hidden xs:inline">– Démo {demoCity}</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={onChangeDemo}
              className="p-1 text-amber-700 hover:bg-amber-100 rounded"
              title="Changer de ville"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={onExitDemo}
              className="p-1 text-amber-700 hover:bg-amber-100 rounded"
              title="Quitter la démo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        {/* Info */}
        <div className="flex items-center gap-2 text-sm text-amber-800">
          <FlaskConical className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">Mode test</span>
          <span className="hidden sm:inline text-amber-700">
            – Vous êtes à <strong>{realCity}</strong>, 
            vous testez à <strong>{demoCity}</strong>
          </span>
          <span className="sm:hidden text-amber-700">
            – Démo {demoCity}
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onChangeDemo}
            className="text-xs text-amber-700 hover:text-amber-900 hover:underline transition-colors"
          >
            Changer
          </button>
          <span className="text-amber-300">|</span>
          <button 
            onClick={onExitDemo}
            className="text-xs text-amber-700 hover:text-amber-900 hover:underline transition-colors"
          >
            Quitter
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Version inline du banner pour les pages spécifiques
 * (aides, éco-mobilité, etc.)
 */
interface DemoDisclaimerProps {
  /** Type de contenu */
  type: 'aids' | 'mobility' | 'activities';
  /** Ville de démo */
  demoCity?: string;
}

export const DemoDisclaimer = ({ type, demoCity }: DemoDisclaimerProps) => {
  const messages = {
    aids: 'Estimation de test – montants indicatifs selon votre situation et territoire.',
    mobility: 'Suggestions indicatives – selon la ville de démo sélectionnée.',
    activities: 'Catalogue d\'exemples – les activités affichées sont des démonstrations.',
  };

  return (
    <div className="bg-amber-50/50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
      <p className="text-xs text-amber-700 flex items-center gap-1.5">
        <FlaskConical className="h-3.5 w-3.5 flex-shrink-0" />
        <span>
          {messages[type]}
          {demoCity && ` (${demoCity})`}
        </span>
      </p>
    </div>
  );
};

export default DemoBanner;
