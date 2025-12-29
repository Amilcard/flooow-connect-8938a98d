import { MapPin, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CityGateBannerProps {
  onSetCity: () => void;
}

/**
 * Bandeau sticky incitant l'utilisateur à définir sa ville
 * Affiché quand aucune ville n'est définie (ni réelle ni démo)
 */
export const CityGateBanner = ({ onSetCity }: CityGateBannerProps) => {
  return (
    <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-accent/10 border-primary/20 p-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-6 h-6 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">Ma ville</h3>
          <p className="text-sm text-muted-foreground">
            Pour afficher les activités près de chez vous
          </p>
        </div>
        
        <Button 
          onClick={onSetCity}
          className="flex-shrink-0"
          size="sm"
        >
          Renseigner
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default CityGateBanner;
