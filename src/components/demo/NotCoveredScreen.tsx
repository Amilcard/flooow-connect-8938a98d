import { MapPin, Navigation, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DemoCityKey, 
  DEMO_CITIES, 
  DEMO_CITY_KEYS 
} from './DemoCityConfig';

interface NotCoveredScreenProps {
  /** Ville réelle saisie par l'utilisateur */
  realCity: string;
  /** Code postal réel */
  realPostalCode: string;
  /** Ville démo suggérée (la plus proche), null si non déterminable */
  suggestedDemoCity: DemoCityKey | null;
  /** Callback quand l'utilisateur choisit une ville démo */
  onSelectDemo: (cityKey: DemoCityKey) => void;
  /** Callback optionnel pour "me notifier" */
  onNotifyMe?: () => void;
  /** Callback pour modifier la ville */
  onChangeCity?: () => void;
}

/**
 * Écran affiché quand la ville de l'utilisateur n'est pas couverte
 * Propose de tester l'app sur une ville pilote
 */
export const NotCoveredScreen = ({ 
  realCity, 
  realPostalCode,
  suggestedDemoCity, 
  onSelectDemo,
  onNotifyMe,
  onChangeCity
}: NotCoveredScreenProps) => {
  // Villes autres que celle suggérée
  const otherCities = DEMO_CITY_KEYS.filter(key => key !== suggestedDemoCity);

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center min-h-[60vh]">
      {/* Icône */}
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <MapPin className="w-10 h-10 text-primary" />
      </div>
      
      {/* Titre */}
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Flooow arrive bientôt à {realCity || `CP ${realPostalCode}`}
      </h1>
      
      {/* Sous-titre */}
      <p className="text-muted-foreground mb-8 max-w-md">
        En attendant, testez le parcours complet sur une de nos villes pilotes.
        Découvrez les activités, les aides et l'éco-mobilité comme si vous y étiez !
      </p>
      
      {/* Bouton suggéré (si disponible) */}
      {suggestedDemoCity && (
        <Button 
          onClick={() => onSelectDemo(suggestedDemoCity)}
          size="lg"
          className="mb-4 w-full max-w-xs h-14 text-base"
        >
          <Navigation className="mr-2 h-5 w-5" />
          Tester à {DEMO_CITIES[suggestedDemoCity].shortLabel}
          <span className="ml-2 text-xs opacity-75 bg-white/20 px-2 py-0.5 rounded">
            recommandé
          </span>
        </Button>
      )}
      
      {/* Séparateur si suggestion */}
      {suggestedDemoCity && otherCities.length > 0 && (
        <div className="flex items-center gap-3 w-full max-w-xs mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">ou choisissez</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}
      
      {/* Autres villes (ou toutes si pas de suggestion) */}
      <div className="flex flex-wrap gap-2 justify-center mb-8 max-w-sm">
        {(suggestedDemoCity ? otherCities : DEMO_CITY_KEYS).map((key) => (
          <Button 
            key={key}
            variant="outline"
            onClick={() => onSelectDemo(key)}
            className="flex-1 min-w-[120px]"
          >
            <MapPin className="mr-1.5 h-4 w-4" />
            {DEMO_CITIES[key].shortLabel}
          </Button>
        ))}
      </div>
      
      {/* Actions secondaires */}
      <div className="flex flex-col gap-2 items-center">
        {onNotifyMe && (
          <button 
            onClick={onNotifyMe}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="h-4 w-4" />
            Me prévenir quand ma ville sera disponible
          </button>
        )}
        
        {onChangeCity && (
          <button 
            onClick={onChangeCity}
            className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
          >
            Modifier ma ville
          </button>
        )}
      </div>
    </div>
  );
};

export default NotCoveredScreen;
