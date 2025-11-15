import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Header from '@/components/Header';

type ValidationStatus = 'loading' | 'success' | 'error';

export default function ValidateChildSignup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<ValidationStatus>('loading');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');
  const action = searchParams.get('action');

  useEffect(() => {
    async function validateSignup() {
      // Validation des paramètres
      if (!token || !action || !['approve', 'reject'].includes(action)) {
        setStatus('error');
        setMessage('Lien invalide ou incomplet');
        return;
      }

      try {
        console.log('Validating child signup:', { token, action });

        const { data, error } = await supabase.functions.invoke(
          'validate-child-signup-token',
          {
            body: { token, action }
          }
        );

        if (error) {
          console.error('Validation error:', error);
          throw error;
        }

        setStatus('success');
        setMessage(data.message || 'Opération réussie');

        toast({
          title: action === 'approve' ? 'Enfant inscrit !' : 'Demande rejetée',
          description: data.message
        });

        // Rediriger après 3 secondes
        if (action === 'approve') {
          setTimeout(() => {
            navigate('/mon-compte/mes-enfants');
          }, 3000);
        }

      } catch (err: any) {
        console.error('Unexpected error:', err);
        setStatus('error');
        setMessage(err.message || 'Une erreur est survenue');

        toast({
          title: 'Erreur',
          description: err.message || 'Lien invalide ou expiré',
          variant: 'destructive'
        });
      }
    }

    validateSignup();
  }, [token, action, navigate, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                {status === 'loading' && 'Validation en cours...'}
                {status === 'success' && (action === 'approve' ? 'Inscription validée' : 'Demande rejetée')}
                {status === 'error' && 'Erreur de validation'}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col items-center space-y-6 py-8">
              {status === 'loading' && (
                <>
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                  <p className="text-center text-muted-foreground">
                    Vérification de votre demande...
                  </p>
                </>
              )}

              {status === 'success' && (
                <>
                  {action === 'approve' ? (
                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                  ) : (
                    <XCircle className="h-16 w-16 text-orange-600" />
                  )}
                  <div className="text-center space-y-2">
                    <p className="text-lg font-medium">{message}</p>
                    {action === 'approve' && (
                      <p className="text-sm text-muted-foreground">
                        Redirection vers votre compte dans quelques secondes...
                      </p>
                    )}
                  </div>
                </>
              )}

              {status === 'error' && (
                <>
                  <XCircle className="h-16 w-16 text-red-600" />
                  <div className="text-center space-y-2">
                    <p className="text-lg font-medium">{message}</p>
                    <p className="text-sm text-muted-foreground">
                      Ce lien de validation a expiré ou est invalide.
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate('/home')}
                    className="mt-4"
                  >
                    Retour à l'accueil
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
