/**
 * Google Sign-In Direct Component
 *
 * Utilise Google Identity Services (GIS) directement au lieu de passer par Supabase OAuth.
 * Cela permet d'afficher le nom de l'app "Inklusif Flooow" sur l'écran de consentement Google
 * au lieu du domaine Supabase.
 *
 * Flow:
 * 1. User clique sur le bouton
 * 2. Google affiche le popup avec "Inklusif Flooow" (car l'origin est flooowtest.netlify.app)
 * 3. On récupère le credential (ID token JWT)
 * 4. On l'échange avec Supabase via signInWithIdToken
 */

import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface GoogleSignInDirectProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  buttonText?: string;
  mode?: 'signup' | 'signin';
}

export function GoogleSignInDirect({
  onSuccess,
  onError,
  buttonText = 'Continuer avec Google',
  mode = 'signin'
}: GoogleSignInDirectProps) {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      // Échanger l'ID token Google avec Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credentialResponse.credential,
      });

      if (error) {
        console.error('Supabase signInWithIdToken error:', error);
        throw error;
      }

      if (data.session) {
        toast.success(mode === 'signup' ? 'Compte créé avec succès !' : 'Connexion réussie !');
        onSuccess?.();
        navigate('/home');
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      toast.error('Erreur lors de la connexion Google');
      onError?.(err instanceof Error ? err : new Error('Unknown error'));
    }
  };

  const handleError = () => {
    toast.error('La connexion Google a échoué');
    onError?.(new Error('Google login failed'));
  };

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text={mode === 'signup' ? 'signup_with' : 'signin_with'}
        shape="rectangular"
        size="large"
        width="100%"
        locale="fr"
        useOneTap={false}
      />
    </div>
  );
}

export default GoogleSignInDirect;
