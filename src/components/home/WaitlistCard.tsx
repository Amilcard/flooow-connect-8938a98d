import { useState } from 'react';
import { Bell, CheckCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

/**
 * Carte d'inscription à la waitlist
 * Pour les utilisateurs dont la ville n'est pas encore couverte
 */
export const WaitlistCard = () => {
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!city.trim()) {
      toast.error('Veuillez indiquer votre ville');
      return;
    }

    setIsLoading(true);
    
    // Simuler l'envoi (à brancher sur Supabase plus tard)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Log pour tracking (peut être remplacé par un vrai insert)
    console.log('[Waitlist]', { city, email, timestamp: new Date().toISOString() });
    
    setIsLoading(false);
    setIsSubmitted(true);
    toast.success('Merci ! On vous tiendra informé.');
  };

  if (isSubmitted) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="font-semibold text-green-800 mb-1">C'est noté !</h3>
          <p className="text-sm text-green-700">
            On vous préviendra quand Flooow sera disponible dans votre ville.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-muted">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">
              Votre ville n'est pas encore couverte ?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Laissez-nous votre ville, on vous prévient dès que Flooow arrive !
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="text"
                  placeholder="Votre ville ou code postal"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="flex-1"
                  required
                />
                <Input
                  type="email"
                  placeholder="Email (optionnel)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? (
                  'Envoi...'
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Me prévenir
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaitlistCard;
