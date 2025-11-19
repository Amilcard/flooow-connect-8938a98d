import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
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
  Users,
  Calendar,
  UserPlus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { QF_BRACKETS } from "@/lib/qfBrackets";

interface FinancialAid {
  aid_name: string;
  amount: number;
  territory_level: string;
  official_link: string | null;
}

interface SimulationForm {
  quotientFamilialBracket: string;
  selectedChildId: string;
  anonymousAge: string;
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

// Générer les options d'âge pour les utilisateurs anonymes (6-18 ans)
const AGE_OPTIONS = Array.from({ length: 13 }, (_, i) => i + 6);

const Simulateur = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Récupérer les paramètres depuis l'URL
  const activityPrice = parseFloat(searchParams.get("price") || "0");
  const activityCategories = searchParams.get("categories")?.split(",") || [];
  const durationDays = parseInt(searchParams.get("duration") || "1");
  const activityId = searchParams.get("activityId");

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
    quotientFamilialBracket: "",
    selectedChildId: "",
    anonymousAge: ""
  });

  // State pour les résultats
  const [aids, setAids] = useState<FinancialAid[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSimulated, setHasSimulated] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);

  const loadChildren = useCallback(async () => {
    if (!user) return;

    try {
      // Charger les enfants
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id);

      if (childrenError) throw childrenError;
      setChildren(childrenData || []);
    } catch (err) {
      console.error('Erreur lors du chargement des enfants:', err);
    }
  }, [user]);

  // Charger les enfants au montage si connecté
  useEffect(() => {
    if (user) {
      loadChildren();
    }
  }, [user, loadChildren]);

  const handleSimulate = async () => {
    // Déterminer l'âge : soit depuis l'enfant sélectionné, soit depuis l'âge anonyme
    let age: number;

    if (user && form.selectedChildId) {
      const selectedChild = children.find(child => child.id === form.selectedChildId);
      if (!selectedChild) {
        setError("Veuillez sélectionner un enfant");
        return;
      }
      age = calculateAge(selectedChild.dob);
    } else if (form.anonymousAge) {
      age = parseInt(form.anonymousAge);
    } else {
      setError("Veuillez sélectionner l'âge de l'enfant");
      return;
    }

    if (age < 6 || age > 18) {
      setError("L'enfant doit être âgé de 6 à 18 ans pour bénéficier d'aides");
      return;
    }

    if (!form.quotientFamilialBracket) {
      setError("Veuillez sélectionner votre tranche de quotient familial");
      return;
    }

    const qf = parseInt(form.quotientFamilialBracket);

    setIsLoading(true);
    setError(null);

    try {
      // Appeler le RPC sans city_code (aides nationales et régionales uniquement)
      const { data, error: rpcError } = await supabase.rpc('calculate_eligible_aids', {
        p_age: age,
        p_qf: qf,
        p_city_code: "42000", // Code par défaut pour la zone pilote Saint-Étienne
        p_activity_price: activityPrice,
        p_duration_days: durationDays,
        p_categories: activityCategories
      });

      if (rpcError) throw rpcError;

      setAids(data || []);
      setHasSimulated(true);
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
  };

  const handleContinue = () => {
    if (activityId) {
      // Retour vers la fiche activité avec les résultats
      navigate(`/activity/${activityId}?simulationDone=true`);
    } else {
      // Retour simple
      navigate(-1);
    }
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const totalAid = aids.reduce((sum, aid) => sum + Number(aid.amount), 0);
  const finalPrice = Math.max(0, activityPrice - totalAid);
  const savingsPercent = activityPrice > 0 ? Math.round((totalAid / activityPrice) * 100) : 0;

  return (
    <PageLayout>
      <div className="container max-w-2xl px-4 py-6 space-y-6">
        <BackButton positioning="relative" size="sm" fallback="/aides" />

        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-display text-4xl flex items-center gap-3">
            <Euro className="w-8 h-8 text-primary" />
            Simulation d'aides financières
          </h1>
          <p className="text-muted-foreground">
            Calculez les aides réelles auxquelles vous pouvez prétendre
          </p>
        </div>

        {/* Informations sur l'activité */}
        {activityPrice > 0 && (
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
              {activityCategories.length > 0 && (
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
              )}
            </CardContent>
          </Card>
        )}

        {/* Formulaire de simulation */}
        {!hasSimulated ? (
          <div className="space-y-4">
            {/* Sélection d'âge - conditionnel selon authentification */}
            <div className="space-y-2">
              <Label htmlFor="age" className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {user ? "Enfant concerné" : "Âge de l'enfant"}
              </Label>

              {user && children.length > 0 ? (
                // Utilisateur connecté avec enfants : afficher le sélecteur d'enfant
                <>
                  <Select
                    value={form.selectedChildId}
                    onValueChange={(value) => setForm(prev => ({ ...prev, selectedChildId: value }))}
                  >
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
                    Seuls les enfants de 6 à 18 ans peuvent bénéficier d'aides
                  </p>
                </>
              ) : (
                // Utilisateur anonyme ou sans enfants : afficher le sélecteur d'âge
                <>
                  <Select
                    value={form.anonymousAge}
                    onValueChange={(value) => setForm(prev => ({ ...prev, anonymousAge: value }))}
                  >
                    <SelectTrigger id="age">
                      <SelectValue placeholder="Sélectionnez l'âge de l'enfant" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGE_OPTIONS.map(age => (
                        <SelectItem key={age} value={String(age)}>
                          {age} ans
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Âge de l'enfant qui participera à l'activité (6-18 ans)
                  </p>
                </>
              )}
            </div>

            {/* Quotient Familial - Tranches */}
            <div className="space-y-2">
              <Label htmlFor="qf" className="flex items-center gap-1">
                <Euro className="w-4 h-4" />
                Quotient Familial CAF
              </Label>
              <Select
                value={form.quotientFamilialBracket}
                onValueChange={(value) => setForm(prev => ({ ...prev, quotientFamilialBracket: value }))}
              >
                <SelectTrigger id="qf">
                  <SelectValue placeholder="Sélectionnez votre tranche" />
                </SelectTrigger>
                <SelectContent>
                  {QF_BRACKETS.map(bracket => (
                    <SelectItem key={bracket.id} value={String(bracket.value)}>
                      {bracket.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Trouvez votre QF sur votre attestation CAF
              </p>
            </div>

            {/* Info sur les aides disponibles */}
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900">
                Cette simulation calcule les aides financières disponibles en fonction de l'âge et du quotient familial.
                Les aides locales peuvent varier selon votre territoire.
              </AlertDescription>
            </Alert>

            {/* Bouton simulation */}
            <Button
              onClick={handleSimulate}
              className="w-full h-14"
              disabled={
                isLoading ||
                !form.quotientFamilialBracket ||
                (user ? !form.selectedChildId : !form.anonymousAge)
              }
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
                  Vérifiez l'âge et le quotient familial sélectionnés.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Liste des aides */}
                <div className="space-y-3">
                  <h3 className="font-medium text-lg">Aides financières éligibles :</h3>
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

            {/* CTA Inscription pour utilisateurs anonymes */}
            {!user && (
              <Card className="bg-gradient-to-br from-[#FF8A3D] to-[#FF6B1A] border-0 text-white">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-6 h-6" />
                    <h3 className="font-semibold text-lg">Créer mon compte pour garder ces infos</h3>
                  </div>
                  <p className="text-sm text-white/90">
                    Inscrivez-vous pour sauvegarder vos simulations, gérer vos enfants et réserver des activités en toute simplicité.
                  </p>
                  <Button
                    onClick={handleSignup}
                    className="w-full bg-white text-[#FF8A3D] hover:bg-white/90 font-semibold"
                  >
                    Créer mon compte gratuitement
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <Button
                onClick={resetSimulation}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Nouvelle simulation
              </Button>
              {activityId && (
                <Button
                  onClick={handleContinue}
                  className="flex-1"
                >
                  Continuer la réservation
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Affichage des erreurs */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </PageLayout>
  );
};

export default Simulateur;
