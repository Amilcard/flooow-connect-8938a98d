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
  Calendar,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { KidQuickAddModal } from "@/components/KidQuickAddModal";
import { calculateAllEligibleAids, EligibilityParams } from "@/utils/FinancialAidEngine";
import { getTypeActivite } from "@/utils/AidCalculatorHelpers";
import { calculateAllEligibleAids, EligibilityParams } from "@/utils/FinancialAidEngine";
import { getTypeActivite } from "@/utils/AidCalculatorHelpers";

interface GeneralSimulateAidModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  activityPrice: string;
  activityCategory: string;
  durationDays: string;
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
  user_id?: string;
  isAnonymous?: boolean;
}

const TERRITORY_LABELS = {
  national: "🇫🇷 National",
  region: "🌍 Régional", 
  metropole: "🏙️ Métropole",
  commune: "🏘️ Communal"
} as const;

const SAMPLE_CITIES = [
  { code: "42000", name: "Saint-Étienne" },
  { code: "42150", name: "La Ricamarie" }
];

const ACTIVITY_CATEGORIES = [
  { value: "sport", label: "Sport", example: "Football, natation, tennis..." },
  { value: "culture", label: "Culture", example: "Théâtre, musique, art..." },
  { value: "loisirs", label: "Loisirs", example: "Centres de loisirs, clubs..." },
  { value: "vacances", label: "Vacances", example: "Colonies, séjours..." },
  { value: "innovantes", label: "Activités Innovantes", example: "Robotique, code, innovation..." }
];

const QF_BRACKETS = [
  { value: "0-300", label: "0 - 300 €" },
  { value: "301-600", label: "301 - 600 €" },
  { value: "601-900", label: "601 - 900 €" },
  { value: "901-1200", label: "901 - 1200 €" },
  { value: "1201-1500", label: "1201 - 1500 €" },
  { value: "1501+", label: "1501 € et plus" }
];

export const GeneralSimulateAidModal = ({
  open,
  onOpenChange
}: GeneralSimulateAidModalProps) => {
  const { user } = useAuth();

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
  
  const [form, setForm] = useState<SimulationForm>({
    quotientFamilial: "",
    selectedChildId: "",
    cityCode: "",
    activityPrice: "150",
    activityCategory: "sport",
    durationDays: "1"
  });
  
  const [aids, setAids] = useState<FinancialAid[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSimulated, setHasSimulated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [anonymousChildren, setAnonymousChildren] = useState<Child[]>([]);
  const [showAddChildModal, setShowAddChildModal] = useState(false);

  const loadUserProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setUserProfile(profileData);
      setForm(prev => ({
        ...prev,
        quotientFamilial: profileData.quotient_familial?.toString() || "",
        cityCode: profileData.postal_code || ""
      }));

      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id);

      if (childrenError) throw childrenError;

      setChildren(childrenData || []);

      if (childrenData && childrenData.length > 0) {
        setForm(prev => ({ ...prev, selectedChildId: childrenData[0].id }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [user]);

  const loadAnonymousChildren = useCallback(() => {
    try {
      const stored = localStorage.getItem('anonymous_children');
      if (stored) {
        const anonChildren = JSON.parse(stored);
        setAnonymousChildren(anonChildren);
      }
    } catch (error) {
      console.error('Error loading anonymous children:', error);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadUserProfile();
      loadAnonymousChildren();
    }
  }, [open, loadUserProfile, loadAnonymousChildren]);

  const updateForm = (field: keyof SimulationForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setHasSimulated(false);
    setError(null);
  };

  const handleSimulate = async () => {
    setIsLoading(true);
    setError(null);
    setHasSimulated(false);

    try {
      if (!form.quotientFamilial) {
        throw new Error("Veuillez sélectionner votre tranche de quotient familial");
      }

      if (!form.activityCategory) {
        throw new Error("Veuillez sélectionner une catégorie d'activité");
      }

      let childAge: number | undefined;
      
      const selectedChild = children.find(c => c.id === form.selectedChildId);
      if (selectedChild) {
        childAge = calculateAge(selectedChild.dob);
      } else {
        const selectedAnonymous = anonymousChildren.find(c => c.id === form.selectedChildId);
        if (selectedAnonymous) {
          childAge = calculateAge(selectedAnonymous.dob);
        }
      }

      if (!childAge) {
        throw new Error("Veuillez sélectionner un enfant ou ajouter un enfant");
      }

      let qfValue = 0;
      if (form.quotientFamilial.includes('-')) {
        const [min, max] = form.quotientFamilial.split('-').map(Number);
        qfValue = (min + max) / 2;
      } else if (form.quotientFamilial.includes('+')) {
        qfValue = parseInt(form.quotientFamilial.replace('+', ''));
      } else {
        qfValue = parseInt(form.quotientFamilial);
      }

      // Simulation d'un délai pour l'UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Préparation des paramètres pour le moteur TypeScript
      const params: EligibilityParams = {
        age: childAge,
        quotient_familial: qfValue,
        code_postal: form.cityCode || "",
        ville: "", // Non disponible, impact mineur
        departement: form.cityCode ? parseInt(form.cityCode.substring(0, 2)) : 0,
        prix_activite: parseFloat(form.activityPrice),
        type_activite: getTypeActivite([form.activityCategory]), // Utilisation du helper
        periode: 'saison_scolaire', // Par défaut pour le simulateur général
        nb_fratrie: 0,
        allocataire_caf: !!qfValue,
        statut_scolaire: childAge >= 15 ? 'lycee' : childAge >= 11 ? 'college' : 'primaire',
        est_qpv: false,
        conditions_sociales: {
          beneficie_ARS: false,
          beneficie_AEEH: false,
          beneficie_AESH: false,
          beneficie_bourse: false,
          beneficie_ASE: false
        }
      };

      // Exécution du moteur de calcul unifié
      const engineResults = calculateAllEligibleAids(params);

      if (engineResults.length === 0) {
        setAids([]);
        setError("Aucune aide disponible pour ces critères");
      } else {
        // Mapping vers le format d'affichage local
        const mappedAids: FinancialAid[] = engineResults.map(res => ({
          aid_name: res.name,
          amount: res.montant,
          territory_level: res.niveau === 'departemental' ? 'departement' : res.niveau === 'communal' ? 'commune' : res.niveau,
          official_link: res.official_link || null
        }));
        setAids(mappedAids);
      }

      setHasSimulated(true);
    } catch (err: any) {
      console.error('Erreur simulation:', err);
      setError(err.message || "Erreur lors de la simulation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      quotientFamilial: userProfile?.quotient_familial?.toString() || "",
      selectedChildId: children.length > 0 ? children[0].id : "",
      cityCode: userProfile?.postal_code || "",
      activityPrice: "150",
      activityCategory: "sport",
      durationDays: "1"
    });
    setAids([]);
    setError(null);
    setHasSimulated(false);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const totalAids = aids.reduce((sum, aid) => sum + aid.amount, 0);
  const priceNumeric = parseFloat(form.activityPrice) || 0;
  const remainingCost = Math.max(0, priceNumeric - totalAids);

  const allChildren = [...children, ...anonymousChildren];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              Simulateur d'aides financières
            </DialogTitle>
            <DialogDescription className="text-sm">
              Notre simulateur vous aide à identifier automatiquement les aides auxquelles vous avez droit.
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Vous pouvez estimer vos aides sans créer de compte. L'inscription vous sera proposée ensuite si vous le souhaitez.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {/* Sélection enfant */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Enfant concerné
              </Label>
              
              {allChildren.length > 0 ? (
                <>
                  <Select 
                    value={form.selectedChildId} 
                    onValueChange={(value) => updateForm('selectedChildId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un enfant" />
                    </SelectTrigger>
                    <SelectContent>
                      {allChildren.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.first_name} ({calculateAge(child.dob)} ans)
                          {child.isAnonymous && " - Non enregistré"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddChildModal(true)}
                    className="w-full"
                  >
                    Ajouter un autre enfant
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddChildModal(true)}
                  className="w-full"
                >
                  Ajouter un enfant
                </Button>
              )}
            </div>

            {/* Quotient familial */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Votre tranche de quotient familial (QF)
              </Label>
              <Select 
                value={form.quotientFamilial} 
                onValueChange={(value) => updateForm('quotientFamilial', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisissez votre tranche de QF" />
                </SelectTrigger>
                <SelectContent>
                  {QF_BRACKETS.map((bracket) => (
                    <SelectItem key={bracket.value} value={bracket.value}>
                      {bracket.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choisissez la tranche qui correspond à votre situation.
              </p>
            </div>

            {/* Ville (optionnel) */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Ville de résidence (optionnel)
              </Label>
              <Select 
                value={form.cityCode} 
                onValueChange={(value) => updateForm('cityCode', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre ville" />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_CITIES.map((city) => (
                    <SelectItem key={city.code} value={city.code}>
                      {city.name} ({city.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Catégorie d'activité */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Catégorie d'activité
              </Label>
              <Select 
                value={form.activityCategory} 
                onValueChange={(value) => updateForm('activityCategory', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div>
                        <div className="font-medium">{cat.label}</div>
                        <div className="text-xs text-muted-foreground">{cat.example}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prix de l'activité */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Prix de l'activité (€)
              </Label>
              <Input
                type="number"
                min="0"
                step="10"
                value={form.activityPrice}
                onChange={(e) => updateForm('activityPrice', e.target.value)}
                placeholder="150"
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSimulate}
                disabled={isLoading || !form.quotientFamilial || allChildren.length === 0}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calcul en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Calculer mes aides
                  </>
                )}
              </Button>
              {hasSimulated && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Réinitialiser
                </Button>
              )}
            </div>

            {/* Résultats */}
            {hasSimulated && !error && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6 space-y-4">
                  {aids.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Aucune aide disponible pour ces critères.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          Aides disponibles ({aids.length})
                        </h3>
                        
                        {aids.map((aid, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 space-y-1">
                                  <div className="font-medium">{aid.aid_name}</div>
                                  <Badge variant="secondary" className="text-xs">
                                    {TERRITORY_LABELS[aid.territory_level as keyof typeof TERRITORY_LABELS] || aid.territory_level}
                                  </Badge>
                                  {aid.official_link && (
                                    <a
                                      href={aid.official_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline block"
                                    >
                                      En savoir plus →
                                    </a>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-bold text-green-600">
                                    {aid.amount.toFixed(2)} €
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Prix de l'activité</span>
                          <span className="font-medium">{priceNumeric.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Total des aides</span>
                          <span className="font-semibold">- {totalAids.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span>Reste à charge</span>
                          <span className={remainingCost === 0 ? "text-green-600" : ""}>
                            {remainingCost.toFixed(2)} €
                          </span>
                        </div>
                      </div>

                      {!user && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <Button
                              variant="link"
                              className="p-0 h-auto font-normal"
                              onClick={() => {
                                handleClose();
                                window.location.href = '/signup';
                              }}
                            >
                              Créer mon compte pour enregistrer ces informations →
                            </Button>
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <KidQuickAddModal
        open={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
        onChildAdded={(childId) => {
          if (childId) {
            if (user) {
              loadUserProfile();
            }
            loadAnonymousChildren();
            setForm(prev => ({ ...prev, selectedChildId: childId }));
          }
        }}
        allowAnonymous={true}
      />
    </>
  );
};
