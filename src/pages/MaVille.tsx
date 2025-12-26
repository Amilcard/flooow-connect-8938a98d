/**
 * Page MaVille - Saisie du code postal
 *
 * Première étape du flux territoire:
 * - Si CP 42xxx → /home (territoire couvert)
 * - Sinon → /territoire-non-couvert
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTerritoryContext, COVERED_DEPARTMENT } from '@/contexts/TerritoryContext';

const MaVille = () => {
  const navigate = useNavigate();
  const { setPostalCode } = useTerritoryContext();
  const [cp, setCp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation: 5 chiffres
    if (!/^\d{5}$/.test(cp)) {
      setError('Veuillez saisir un code postal valide (5 chiffres)');
      return;
    }

    // Enregistrer le CP dans le contexte
    setPostalCode(cp);

    // Redirection selon couverture
    if (cp.startsWith(COVERED_DEPARTMENT)) {
      navigate('/home', { replace: true });
    } else {
      navigate('/territoire-non-couvert', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-50 flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Icon */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <MapPin className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Bienvenue sur Flooow
            </h1>
            <p className="text-muted-foreground text-lg">
              Indiquez votre code postal pour découvrir les activités près de chez vous
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="postal-code" className="text-base font-medium">
                Code postal
              </Label>
              <Input
                id="postal-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                placeholder="Ex: 42000"
                value={cp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setCp(value);
                  if (error) setError(null);
                }}
                className={`text-lg py-6 text-center tracking-widest ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full py-6 text-lg gap-2"
              disabled={cp.length !== 5}
            >
              Continuer
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          {/* Info */}
          <p className="text-center text-sm text-muted-foreground">
            Flooow est actuellement disponible sur le département de la Loire (42).
            <br />
            D'autres territoires arrivent bientôt !
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaVille;
