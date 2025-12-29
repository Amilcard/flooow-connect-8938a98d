/**
 * Login Page
 * OAuth: Connexion sociale pour les parents (Google, Apple, Facebook, LinkedIn, Microsoft)
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { LogoFlooow } from '@/components/LogoFlooow';
import { authConfig, OAuthProvider } from '@/config/auth.config';
import { signInWithProvider, getEnabledProviders, providerIcons, getOAuthErrorMessage } from '@/utils/oauthUtils';
import { safeErrorMessage } from '@/utils/sanitize';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isLoading } = useAuth();

  // Providers OAuth activés
  const enabledProviders = getEnabledProviders();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);

      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans Flooow !",
      });

      // Petit délai pour laisser la session se stabiliser
      setTimeout(() => navigate('/home'), 100);
    } catch (error: any) {
      console.error(safeErrorMessage(error, 'Login'));

      // Message d'erreur plus explicite selon le type d'erreur
      let errorMessage = "Vérifiez votre email et mot de passe";
      
      if (error?.message?.includes("Invalid login credentials")) {
        errorMessage = "Email ou mot de passe incorrect. Si vous vous êtes inscrit via Google/Apple, utilisez ce même bouton pour vous connecter.";
      } else if (error?.message?.includes("Email not confirmed")) {
        errorMessage = "Veuillez confirmer votre email avant de vous connecter.";
      } else if (error?.message?.includes("User not found")) {
        errorMessage = "Aucun compte trouvé avec cet email. Créez un compte ou utilisez la connexion sociale.";
      }
      
      toast({
        title: "Connexion impossible",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setLoadingProvider(provider);
    try {
      await signInWithProvider(provider);
      // La redirection est automatique après OAuth
    } catch (error: any) {
      toast({
        title: "Connexion non aboutie",
        description: getOAuthErrorMessage(error),
        variant: "destructive",
      });
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header avec BackButton */}
      <div className="flex items-center p-4">
        <BackButton positioning="relative" size="sm" showText={true} label="Retour" fallback="/home" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <Card className="w-full max-w-[480px] shadow-md border rounded-2xl bg-card">
          <CardHeader className="text-center space-y-4 pb-6">
            {/* Logo Flooow Connect */}
            <div className="mx-auto">
              <LogoFlooow />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Bon retour !
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Connectez-vous à votre compte
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* OAuth - Boutons de connexion sociale EN PREMIER */}
            {authConfig.ENABLE_SOCIAL_AUTH && (
              <div className="space-y-3">
                {enabledProviders.map((provider) => (
                  <Button
                    key={provider.id}
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuthLogin(provider.id)}
                    disabled={loadingProvider !== null || isLoading}
                    className="w-full h-12 border-2 hover:border-[#FF8A3D]/30 hover:bg-[#FF8A3D]/5 transition-all flex items-center justify-center gap-3"
                  >
                    {loadingProvider === provider.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      providerIcons[provider.id]
                    )}
                    <span className="font-medium">{provider.label}</span>
                  </Button>
                ))}

                <div className="relative py-4">
                  <Separator />
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-sm text-muted-foreground">
                    ou avec votre email
                  </span>
                </div>
              </div>
            )}

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
                    className="pl-10 h-12 border-2 focus:border-[#FF8A3D] transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12 border-2 focus:border-[#FF8A3D] transition-colors"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#FF8A3D] hover:text-[#FF6B1A] font-medium transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#FF8A3D] hover:bg-[#FF6B1A] text-white font-semibold rounded-xl transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Pas encore de compte ?{' '}
                <Link
                  to="/signup"
                  className="text-[#FF8A3D] hover:text-[#FF6B1A] font-semibold transition-colors"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
