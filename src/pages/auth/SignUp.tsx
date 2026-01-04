/**
 * SignUp Page
 * LOT 3 - T3_1: Message explicatif pour orienter vers la création par le parent
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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, User, Phone, Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LogoFlooow } from '@/components/LogoFlooow';
import { authConfig, OAuthProvider } from '@/config/auth.config';
import { signInWithProvider, getEnabledProviders, providerIcons, getOAuthErrorMessage } from '@/utils/oauthUtils';
import { GoogleSignInDirect } from '@/components/auth/GoogleSignInDirect';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Providers OAuth activés
  const enabledProviders = getEnabledProviders();
  const otherProviders = enabledProviders.filter(provider => provider.id !== 'google');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation mot de passe complexe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      toast({
        title: "Renforçons votre mot de passe",
        description: "Pour votre sécurité, utilisez au moins 8 caractères avec une majuscule, une minuscule et un chiffre",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Vérification requise",
        description: "Les mots de passe saisis ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Conditions requises",
        description: "Merci d'accepter les conditions d'utilisation pour continuer",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone
          }
        }
      });

      if (error) throw error;

      // Create profile with pending status
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ account_status: 'pending' })
          .eq('id', data.user.id);
      }

      toast({
        title: "Demande envoyée !",
        description: "Votre compte sera activé après validation par notre équipe. Vous recevrez un email de confirmation.",
      });

      navigate('/home');
    } catch (error: unknown) {
      toast({
        title: "Erreur lors de l'inscription",
        description: error instanceof Error ? error.message : "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignup = async (provider: OAuthProvider) => {
    setLoadingProvider(provider);
    try {
      await signInWithProvider(provider);
      // La redirection est automatique après OAuth
    } catch (error: unknown) {
      toast({
        title: "Inscription non aboutie",
        description: getOAuthErrorMessage(error),
        variant: "destructive",
      });
      setLoadingProvider(null);
    }
  };

  const handleGoogleSuccess = () => {
    toast({
      title: "Connexion réussie",
      description: "Bienvenue dans Flooow !",
    });
    setTimeout(() => navigate('/home'), 100);
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
                Créer un compte
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Rejoignez-nous dès aujourd'hui
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* LOT 3 - T3_1: Message orientation parent/mineur */}
            <Alert className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <Users className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-sm">
                <p className="font-semibold text-orange-800 mb-1">
                  Le compte Flooow est au nom du parent
                </p>
                <p className="text-orange-700 text-xs leading-relaxed">
                  <span className="font-medium">Tu es mineur(e) ?</span> Tu peux demander à ton parent de créer le compte.
                  C'est lui qui pourra ajouter toutes les infos utiles pour tes aides.
                </p>
                <p className="text-orange-700 text-xs mt-1 leading-relaxed">
                  <span className="font-medium">Vous êtes parent ?</span> Renseignez vos informations pour bénéficier de toutes les aides possibles.
                  Vous pourrez ensuite ajouter vos enfants.
                </p>
              </AlertDescription>
            </Alert>

            {/* OAuth - Boutons de connexion sociale EN PREMIER */}
            {authConfig.ENABLE_SOCIAL_AUTH && (
              <div className="space-y-3">
                <GoogleSignInDirect
                  onSuccess={handleGoogleSuccess}
                  disabled={loadingProvider !== null || isLoading}
                />

                {otherProviders.map((provider) => (
                  <Button
                    key={provider.id}
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuthSignup(provider.id)}
                    disabled={loadingProvider !== null}
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
              {/* Prénom et Nom */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    Prénom
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Prénom"
                      className="pl-10 h-11 border-2 focus:border-[#FF8A3D] transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Nom
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Nom"
                    className="h-11 border-2 focus:border-[#FF8A3D] transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Adresse e-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="votre@email.com"
                    className="pl-10 h-11 border-2 focus:border-[#FF8A3D] transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Numéro de téléphone <span className="text-muted-foreground text-xs">(optionnel)</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className="pl-10 h-11 border-2 focus:border-[#FF8A3D] transition-colors"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 border-2 focus:border-[#FF8A3D] transition-colors"
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

              {/* Confirmation mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 border-2 focus:border-[#FF8A3D] transition-colors"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Conditions d'utilisation */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                  J'accepte les{' '}
                  <Link to="/terms" className="text-[#FF8A3D] hover:text-[#FF6B1A] underline">
                    conditions d'utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link to="/privacy" className="text-[#FF8A3D] hover:text-[#FF6B1A] underline">
                    politique de confidentialité
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#FF8A3D] hover:bg-[#FF6B1A] text-white font-semibold rounded-xl transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? 'Création du compte...' : 'Créer mon compte'}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Déjà un compte ?{' '}
                <Link
                  to="/login"
                  className="text-[#FF8A3D] hover:text-[#FF6B1A] font-semibold transition-colors"
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

export default SignUp;
