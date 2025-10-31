import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Euro, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Info,
  MapPin,
  Users,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SimulateAidModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityPrice: number;
  activityCategories: string[];
  durationDays?: number;
  onSimulationComplete?: (finalPrice: number, aids: FinancialAid[]) => void;
}

interface FinancialAid {
  aid_name: string;
  amount: number;
  territory_level: string;
  official_link: string | null;
}

interface SimulationForm {
  quotientFamilial: string;
  selectedChildId: string;
  cityCode: string;
}

interface UserProfile {
  quotient_familial?: number;
  postal_code?: string;
  city_code?: string;
}

interface Child {
  id: string;
  first_name: string;
  dob: string;
  user_id: string;
}

const TERRITORY_LABELS = {
  national: "🇫🇷 National",
  region: "🌍 Régional", 
  metropole: "🏙️ Métropole",
  commune: "🏘️ Communal"
} as const;

const SAMPLE_CITIES = [
  { code: "42218", name: "Saint-Étienne" },
  { code: "42095", name: "Firminy" },
  { code: "42184", name: "La Ricamarie" },
  { code: "69123", name: "Lyon" },
  { code: "38185", name: "Grenoble" }
];

export const SimulateAidModal = ({
  open,
  onOpenChange,
  activityPrice,
  activityCategories,
  durationDays = 1,
  onSimulationComplete
}: SimulateAidModalProps) => {
  const { user } = useAuth();

  // Fonction pour calculer l'âge à partir de la date de naissance
  const calculateAge = (dob: string): number => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  // State pour le formulaire
  const [form, setForm] = useState<SimulationForm>({
    quotientFamilial: "",
    selectedChildId: "",
    cityCode: ""
  });
  
  // State pour les résultats
  const [aids, setAids] = useState<FinancialAid[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSimulated, setHasSimulated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [children, setChildren] = useState<Child[]>([]);

  const loadUserProfile = useCallback(async () => {
    if (!user) return;

    try {
      // Charger le profil utilisateur complet
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profileData || {});

      // Charger les enfants
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id);

      if (childrenError) throw childrenError;
      setChildren(childrenData || []);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
    }
  }, [user]);

  // Charger le profil utilisateur au montage du modal
  useEffect(() => {
    if (open && user) {
      loadUserProfile();
    }
  }, [open, user, loadUserProfile]);

  // Pré-remplir le formulaire avec les données du profil utilisateur
  useEffect(() => {
    if (userProfile) {
      setForm(prev => ({
        ...prev,
        quotientFamilial: userProfile.quotient_familial ? String(userProfile.quotient_familial) : prev.quotientFamilial,
        cityCode: userProfile.postal_code || userProfile.city_code || prev.cityCode
      }));
    }
  }, [userProfile]);

  const handleSimulate = async () => {
    if (!user) {
      setError("Vous devez être connecté pour utiliser la simulation");
      return;
    }

    const qf = parseInt(form.quotientFamilial) || 0;
    const selectedChild = children.find(child => child.id === form.selectedChildId);
    
    if (!selectedChild) {
      setError("Veuillez sélectionner un enfant");
      return;
    }

    const age = calculateAge(selectedChild.dob);

    if (age < 6 || age > 18) {
      setError("L'enfant sélectionné doit être âgé de 6 à 18 ans pour bénéficier d'aides");
      return;
    }

    if (!form.cityCode) {
      setError("Veuillez renseigner votre ville de résidence dans votre profil");
      return; 
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('calculate_eligible_aids', {
        p_age: age,
        p_qf: qf,
        p_city_code: form.cityCode,
        p_activity_price: activityPrice,
        p_duration_days: durationDays,
        p_categories: activityCategories
      });

      if (rpcError) throw rpcError;
      
      setAids(data || []);
      setHasSimulated(true);
      
      // Notify parent of simulation result
      if (onSimulationComplete && data) {
        const totalAid = data.reduce((sum: number, aid: FinancialAid) => sum + Number(aid.amount), 0);
        const calculatedFinalPrice = Math.max(0, activityPrice - totalAid);
        onSimulationComplete(calculatedFinalPrice, data);
      }
    } catch (err) {
      console.error('Erreur lors de la simulation:', err);
      setError(err instanceof Error ? err.message : "Erreur lors du calcul des aides");
    } finally {
      setIsLoading(false);
    }
  };

  const resetSimulation = () => {
    setHasSimulated(false);
    setAids([]);
    setError(null);
    // Ne pas réinitialiser le formulaire pour garder les données utilisateur
  };

  const totalAid = aids.reduce((sum, aid) => sum + Number(aid.amount), 0);
  const finalPrice = Math.max(0, activityPrice - totalAid);
  const savingsPercent = activityPrice > 0 ? Math.round((totalAid / activityPrice) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Euro className="w-5 h-5 text-primary" />
            Simulation d'aides financières
          </DialogTitle>
          <DialogDescription>
            Calculez les aides réelles auxquelles vous pouvez prétendre
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations sur l'activité */}
          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  Prix de l'activité
                </span>
                <Badge variant="outline">{activityPrice.toFixed(2)}€</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Durée
                </span>
                <Badge variant="outline">
                  {durationDays} jour{durationDays > 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Catégories</span>
                <div className="flex gap-1">
                  {activityCategories.map(cat => (
                    <Badge key={cat} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerte si pas d'enfants */}
          {children.length === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Vous devez d'abord ajouter un enfant dans votre profil pour utiliser la simulation d'aides.
              </AlertDescription>
            </Alert>
          )}

          {/* Formulaire de simulation */}
          {!hasSimulated ? (
            <div className="space-y-4">
              {/* Sélection d'enfant */}
              <div className="space-y-2">
                <Label htmlFor="child" className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Enfant concerné
                </Label>
                <Select value={form.selectedChildId} onValueChange={(value) => setForm(prev => ({ ...prev, selectedChildId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un enfant" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map(child => {
                      const age = calculateAge(child.dob);
                      return (
                        <SelectItem key={child.id} value={child.id}>
                          {child.first_name} ({age} ans)
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {children.length === 0 
                    ? "Aucun enfant enregistré. Ajoutez un enfant dans votre profil."
                    : "Seuls les enfants de 6 à 18 ans peuvent bénéficier d'aides"
                  }
                </p>
              </div>

              {/* Quotient Familial */}
              <div className="space-y-2">
                <Label htmlFor="qf" className="flex items-center gap-1">
                  <Euro className="w-4 h-4" />
                  Quotient Familial CAF
                </Label>
                <Input
                  id="qf"
                  type="number"
                  placeholder="Ex: 750"
                  value={form.quotientFamilial}
                  onChange={(e) => setForm(prev => ({ ...prev, quotientFamilial: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  {userProfile?.quotient_familial 
                    ? "✓ Pré-rempli depuis votre profil" 
                    : "Trouvez votre QF sur votre attestation CAF"
                  }
                </p>
              </div>

              {/* Ville */}
              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Ville de résidence
                </Label>
                <Select value={form.cityCode} onValueChange={(value) => setForm(prev => ({ ...prev, cityCode: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre ville" />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLE_CITIES.map(city => (
                      <SelectItem key={city.code} value={city.code}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {userProfile?.postal_code || userProfile?.city_code
                    ? "✓ Pré-rempli depuis votre profil" 
                    : "Nécessaire pour calculer les aides locales"
                  }
                </p>
              </div>

              {/* Bouton simulation */}
              <Button 
                onClick={handleSimulate} 
                className="w-full"
                disabled={!form.selectedChildId || !form.cityCode || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calcul en cours...
                  </>
                ) : (
                  "Calculer mes aides"
                )}
              </Button>
            </div>
          ) : (
            /* Résultats de la simulation */
            <div className="space-y-4">
              {aids.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Aucune aide financière n'est disponible pour ces critères.
                    Vériez votre âge, quotient familial et ville de résidence.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  {/* Liste des aides */}
                  <div className="space-y-3">
                    <h3 className="font-medium">Aides financières éligibles :</h3>
                    {aids.map((aid, index) => (
                      <Card key={index} className="bg-green-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <div>
                                <div className="font-medium">{aid.aid_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {TERRITORY_LABELS[aid.territory_level as keyof typeof TERRITORY_LABELS]}
                                </div>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-green-300">
                              -{aid.amount.toFixed(2)}€
                            </Badge>
                          </div>
                          {aid.official_link && (
                            <div className="mt-2">
                              <a 
                                href={aid.official_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                📄 Voir les détails officiels
                              </a>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Récapitulatif financier */}
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span>Prix initial</span>
                        <span>{activityPrice.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <span>Total des aides</span>
                        <span className="font-medium">-{totalAid.toFixed(2)}€</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between items-center text-lg font-bold">
                        <span>Reste à payer</span>
                        <span className="text-primary">{finalPrice.toFixed(2)}€</span>
                      </div>
                      {savingsPercent > 0 && (
                        <div className="text-center">
                          <Badge className="bg-green-100 text-green-700">
                            🎉 Économie de {savingsPercent}% !
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Bouton nouvelle simulation */}
              <Button 
                onClick={resetSimulation}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Nouvelle simulation
              </Button>
            </div>
          )}

          {/* Affichage des erreurs */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Note sur l'authentification */}
          {!user && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Connectez-vous pour accéder à une simulation personnalisée avec vos données de profil.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
