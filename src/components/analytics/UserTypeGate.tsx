import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { User, Users } from 'lucide-react';

const getAgeFromDob = (dob: string | null) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return null;
  const diffMs = Date.now() - birthDate.getTime();
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(years);
};

export const UserTypeGate = () => {
  const { user, isAuthenticated } = useAuth();
  const { userType, setUserType } = useAnalytics();

  // Auto-détection pour utilisateurs authentifiés
  useEffect(() => {
    let isActive = true;

    const determineUserType = async () => {
      if (!isAuthenticated || !user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('parent_id, dob')
        .eq('id', user.id)
        .maybeSingle();

      if (!isActive) return;
      if (error) {
        console.error('[Analytics] Impossible de déterminer le type utilisateur', error);
        return;
      }

      const age = getAgeFromDob(data?.dob ?? null);
      const isMinor = Boolean(data?.parent_id) || (age !== null && age < 18);
      const nextType = isMinor ? 'minor' : 'adult';

      if (nextType !== userType) {
        setUserType(nextType);
      }
    };

    determineUserType();
    return () => { isActive = false; };
  }, [isAuthenticated, setUserType, user, userType]);

  // Si authentifié, pas de modal (auto-détection)
  if (isAuthenticated) return null;

  // Si déjà un choix fait, pas de modal
  if (userType !== 'unknown') return null;

  const handleSelectAdult = () => setUserType('adult');
  const handleSelectMinor = () => setUserType('minor');

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">Qui utilise Flooow ?</h2>
          <p className="text-sm text-muted-foreground">
            On fait simple : qui utilise Flooow aujourd'hui ?
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={handleSelectAdult}
            className="w-full p-4 rounded-lg border-2 border-muted hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Je suis parent ou responsable légal</p>
              <p className="text-sm text-muted-foreground">J'ai 18 ans ou plus</p>
            </div>
          </button>

          <button
            onClick={handleSelectMinor}
            className="w-full p-4 rounded-lg border-2 border-muted hover:border-orange-500 hover:bg-orange-50 transition-all text-left flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <User className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Je suis un enfant ou un adolescent</p>
              <p className="text-sm text-muted-foreground">J'ai moins de 18 ans</p>
            </div>
          </button>
        </div>

        <p className="mt-6 text-xs text-center text-muted-foreground">
          Ça nous aide à adapter Flooow et à respecter la réglementation.
        </p>
      </Card>
    </div>
  );
};
