import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle } from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Utiliser Supabase pour envoyer le lien de réinitialisation
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      toast({
        title: "E-mail envoyé",
        description: "Vérifiez votre boîte de réception",
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        title: "Envoi non abouti",
        description: "Nous n'avons pas pu envoyer l'email. Vérifiez l'adresse et réessayez.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 flex flex-col">
        <div className="flex items-center justify-between p-4">
          <BackButton fallback="/login" positioning="relative" size="sm" showText={true} label="Retour" />
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  E-mail envoyé !
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Nous avons envoyé un lien de réinitialisation à votre adresse e-mail
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-800">
                    <strong>Vérifiez votre boîte de réception</strong><br />
                    Un e-mail avec les instructions de réinitialisation a été envoyé à <strong>{email}</strong>
                  </p>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Vous ne voyez pas l'e-mail ? Vérifiez votre dossier spam ou</p>
                  <Button
                    variant="link"
                    onClick={() => setEmailSent(false)}
                    className="p-0 h-auto text-primary font-semibold"
                  >
                    essayez avec une autre adresse e-mail
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => navigate('/login')}
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                Retour à la connexion
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <BackButton fallback="/login" positioning="relative" size="sm" showText={true} label="Retour" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary via-primary/90 to-accent rounded-3xl flex items-center justify-center shadow-xl">
              <Mail className="h-10 w-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Mot de passe oublié ?
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Adresse e-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="pl-10 h-12 border-2 focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Vous vous souvenez de votre mot de passe ?{' '}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;