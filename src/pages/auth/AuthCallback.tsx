/**
 * AuthCallback - Gère le retour OAuth
 *
 * Cette page est appelée après authentification OAuth réussie.
 * Elle gère l'échange du code/token et redirige vers /home.
 *
 * NOTE: Pourquoi Google/Facebook affichent "kbrgwezkjaakoecispom.supabase.co" ?
 * ────────────────────────────────────────────────────────────────────────────
 * Avec Supabase-hosted OAuth, l'origin qui initie la demande OAuth est
 * https://<project-ref>.supabase.co. C'est ce domaine que Google/Facebook
 * affichent dans leur écran de consentement.
 *
 * Options pour améliorer le branding :
 * 1. Renommer l'app dans Google Console/Meta for Developers (améliore le nom affiché)
 * 2. Utiliser un domaine custom pour Supabase Auth (nécessite plan Pro)
 * 3. Implémenter un proxy OAuth sur le domaine Flooow (complexe)
 *
 * Pour l'instant, le nom de l'app ("Flooow Connect" / "Inklusif Flooow")
 * s'affiche correctement, seul l'origin technique reste visible.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase gère automatiquement l'échange du code PKCE
        // via onAuthStateChange dans useAuth.tsx
        // Ici on vérifie simplement que la session existe

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[AuthCallback] Session error:', sessionError);
          setError('Erreur lors de la récupération de la session');
          return;
        }

        if (session) {
          console.log('[AuthCallback] Session OK, redirecting to /home');
          navigate('/home', { replace: true });
        } else {
          // Attendre un peu que onAuthStateChange traite le hash
          // Si pas de session après 3s, afficher erreur
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              navigate('/home', { replace: true });
            } else {
              setError('Session non établie. Veuillez réessayer.');
            }
          }, 3000);
        }
      } catch (err) {
        console.error('[AuthCallback] Error:', err);
        setError('Une erreur est survenue');
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-semibold text-destructive mb-2">Erreur de connexion</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
        <p className="text-muted-foreground">Connexion en cours...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
