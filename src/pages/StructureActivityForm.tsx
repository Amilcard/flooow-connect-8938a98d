import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { safeErrorMessage } from "@/utils/sanitize";
import { BackButton } from "@/components/BackButton";
import { FinancialAidSelector } from "@/components/activities/FinancialAidSelector";
import { LoadingState } from "@/components/LoadingState";

const StructureActivityForm = () => {
  const { id } = useParams(); // If editing
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priceBase: "",
    ageMin: "",
    ageMax: "",
    address: "",
    postalCode: "",
    vacationType: "",
    dateDebut: "",
    dateFin: "",
    durationDays: "",
    departureTime: "",
    returnTime: "",
    meetingPoint: ""
  });

  // Séjours avec hébergement (colonies, camps) nécessitent dates et durée obligatoires
  const isSejourAvecHebergement = formData.category === "Vacances" && formData.vacationType === "sejour_hebergement";
  const requiresDates = isSejourAvecHebergement;

  const [selectedAids, setSelectedAids] = useState<string[]>([]);

  // Fetch user's structure
  const { data: userStructure, isLoading: loadingStructure } = useQuery({
    queryKey: ["user-structure"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data: userRoleData } = await supabase
        .from("user_roles")
        .select("territory_id")
        .eq("user_id", user.id)
        .eq("role", "structure")
        .maybeSingle();

      if (!userRoleData) throw new Error("Structure introuvable");

      const { data: structureData, error } = await supabase
        .from("structures")
        .select("*")
        .eq("territory_id", userRoleData.territory_id)
        .maybeSingle();

      if (error || !structureData) throw error;
      return structureData;
    }
  });

  // Load existing activity if editing
  useEffect(() => {
    if (id && userStructure) {
      const loadActivity = async () => {
        const { data, error } = await supabase
          .from("activities")
          .select("*")
          .eq("id", id)
          .eq("structure_id", userStructure.id)
          .maybeSingle();

        if (error || !data) {
          toast({
            title: "Erreur",
            description: "Activité introuvable",
            variant: "destructive"
          });
          navigate("/dashboard/structure");
          return;
        }

        setFormData({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          priceBase: data.price_base ? String(data.price_base) : "",
          ageMin: data.age_min ? String(data.age_min) : "",
          ageMax: data.age_max ? String(data.age_max) : "",
          address: userStructure.address || "",
          postalCode: "", // Will be fetched from territory via useEffect
          vacationType: data.vacation_type || "",
          dateDebut: data.date_debut || "",
          dateFin: data.date_fin || "",
          durationDays: data.duration_days ? String(data.duration_days) : "",
          // Parse jours_horaires for departure/return/meeting info
          departureTime: "",
          returnTime: "",
          meetingPoint: data.lieu_nom || ""
        });

        // Parse jours_horaires if it contains structured info
        if (data.jours_horaires) {
          const match = data.jours_horaires.match(/Départ[:\s]*(\d{1,2}[h:]\d{2})/i);
          const matchReturn = data.jours_horaires.match(/Retour[:\s]*(\d{1,2}[h:]\d{2})/i);
          if (match) setFormData(prev => ({ ...prev, departureTime: match[1].replace('h', ':') }));
          if (matchReturn) setFormData(prev => ({ ...prev, returnTime: matchReturn[1].replace('h', ':') }));
        }

        // Parse accepts_aid_types (it's jsonb, could be array or string array)
        if (data.accepts_aid_types) {
          try {
            const aids = typeof data.accepts_aid_types === 'string' 
              ? JSON.parse(data.accepts_aid_types)
              : data.accepts_aid_types;
            setSelectedAids(Array.isArray(aids) ? aids : []);
          } catch {
            setSelectedAids([]);
          }
        }
      };

      loadActivity();
    }
  }, [id, userStructure]);

  // Set postal code from structure
  useEffect(() => {
    if (userStructure) {
      // Extract postal code from address if not set
      const match = userStructure.address?.match(/\b(\d{5})\b/);
      if (match) {
        setFormData(prev => ({ ...prev, postalCode: match[1] }));
      }
    }
  }, [userStructure]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!userStructure) throw new Error("Structure introuvable");

      // Validation pour séjours avec hébergement
      if (requiresDates && (!formData.dateDebut || !formData.dateFin)) {
        toast({
          title: "Dates requises",
          description: "Les séjours avec hébergement nécessitent une date de début et de fin",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const activityData = {
        structure_id: userStructure.id,
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        price_base: formData.priceBase ? Number.parseFloat(formData.priceBase) : 0,
        age_min: formData.ageMin ? Number.parseInt(formData.ageMin, 10) : null,
        age_max: formData.ageMax ? Number.parseInt(formData.ageMax, 10) : null,
        accepts_aid_types: JSON.stringify(selectedAids),
        published: true,
        // Champs vacances/séjours
        vacation_type: formData.category === "Vacances" ? formData.vacationType || null : null,
        date_debut: formData.dateDebut || null,
        date_fin: formData.dateFin || null,
        duration_days: formData.durationDays ? Number.parseInt(formData.durationDays, 10) : null,
        is_overnight: formData.vacationType === "sejour_hebergement",
        has_accommodation: formData.vacationType === "sejour_hebergement",
        // Horaires et lieu RDV pour séjours
        jours_horaires: isSejourAvecHebergement && (formData.departureTime || formData.returnTime)
          ? `Départ: ${formData.departureTime || 'À définir'} | Retour: ${formData.returnTime || 'À définir'}`
          : null,
        lieu_nom: formData.meetingPoint || null
      };

      if (id) {
        // Update
        const { error } = await supabase
          .from("activities")
          .update(activityData)
          .eq("id", id)
          .eq("structure_id", userStructure.id);

        if (error) throw error;

        toast({
          title: "Activité mise à jour",
          description: "Les modifications ont été enregistrées"
        });
      } else {
        // Create
        const { error } = await supabase
          .from("activities")
          .insert(activityData);

        if (error) throw error;

        toast({
          title: "Activité créée",
          description: "Votre activité est maintenant visible"
        });
      }

      navigate("/dashboard/structure");
    } catch (error: unknown) {
      console.error(safeErrorMessage(error, 'StructureActivityForm.handleSubmit'));
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'enregistrer l'activité",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingStructure) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container flex items-center gap-3 py-3 px-4">
          <BackButton fallback="/dashboard/structure" positioning="relative" size="sm" showText={true} label="Retour" />
          <h1 className="font-semibold text-lg">
            {id ? "Modifier l'activité" : "Nouvelle activité"}
          </h1>
        </div>
      </div>

      <div className="container px-4 py-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">Informations générales</h2>

            <div className="space-y-2">
              <Label htmlFor="title">Nom de l'activité *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Judo Kids 6-10 ans"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value, vacationType: value !== "Vacances" ? "" : formData.vacationType })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sport">Sport</SelectItem>
                  <SelectItem value="Loisirs">Loisirs</SelectItem>
                  <SelectItem value="Culture">Culture</SelectItem>
                  <SelectItem value="Vacances">Vacances</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Champs spécifiques Vacances/Séjours */}
            {formData.category === "Vacances" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="vacationType">Type de séjour *</Label>
                  <Select value={formData.vacationType} onValueChange={(value) => setFormData({ ...formData, vacationType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sejour_hebergement">Séjour avec hébergement (colonie, camp)</SelectItem>
                      <SelectItem value="centre_loisirs">Centre de loisirs (sans nuitée)</SelectItem>
                      <SelectItem value="stage_journee">Stage à la journée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateDebut">
                      Date de début {requiresDates && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      id="dateDebut"
                      type="date"
                      value={formData.dateDebut}
                      onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                      required={requiresDates}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFin">
                      Date de fin {requiresDates && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      id="dateFin"
                      type="date"
                      value={formData.dateFin}
                      onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                      required={requiresDates}
                      min={formData.dateDebut}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="durationDays">Nombre de jours</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    min="1"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                    placeholder="7"
                  />
                </div>

                {/* Horaires et lieu de RDV pour séjours */}
                {isSejourAvecHebergement && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="departureTime">Heure de départ</Label>
                        <Input
                          id="departureTime"
                          type="time"
                          value={formData.departureTime}
                          onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                          placeholder="09:00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="returnTime">Heure de retour</Label>
                        <Input
                          id="returnTime"
                          type="time"
                          value={formData.returnTime}
                          onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                          placeholder="17:00"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meetingPoint">Lieu de rendez-vous</Label>
                      <Input
                        id="meetingPoint"
                        value={formData.meetingPoint}
                        onChange={(e) => setFormData({ ...formData, meetingPoint: e.target.value })}
                        placeholder="Parvis de la gare, devant l'entrée principale"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Cours de judo pour débutants et confirmés..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceBase">Tarif (€) *</Label>
                <Input
                  id="priceBase"
                  type="number"
                  step="0.01"
                  value={formData.priceBase}
                  onChange={(e) => setFormData({ ...formData, priceBase: e.target.value })}
                  placeholder="180"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Période</Label>
                <Input
                  value="/an"
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ageMin">Âge minimum</Label>
                <Input
                  id="ageMin"
                  type="number"
                  value={formData.ageMin}
                  onChange={(e) => setFormData({ ...formData, ageMin: e.target.value })}
                  placeholder="6"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ageMax">Âge maximum</Label>
                <Input
                  id="ageMax"
                  type="number"
                  value={formData.ageMax}
                  onChange={(e) => setFormData({ ...formData, ageMax: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>
          </Card>

          {/* Financial Aids Selector */}
          {formData.postalCode && (
            <FinancialAidSelector
              selectedAids={selectedAids}
              onAidsChange={setSelectedAids}
              territoryPostalCode={formData.postalCode}
            />
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/dashboard/structure")}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || !formData.title || !formData.category || !formData.priceBase}
            >
              {isLoading ? "Enregistrement..." : id ? "Mettre à jour" : "Créer l'activité"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StructureActivityForm;
