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
    postalCode: ""
  });

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
          navigate("/structure-dashboard");
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
          postalCode: userStructure.territory_id ? "" : "" // Will be fetched from territory
        });

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

      const activityData = {
        structure_id: userStructure.id,
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        price_base: formData.priceBase ? parseFloat(formData.priceBase) : 0,
        age_min: formData.ageMin ? parseInt(formData.ageMin) : null,
        age_max: formData.ageMax ? parseInt(formData.ageMax) : null,
        accepts_aid_types: JSON.stringify(selectedAids),
        published: true
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

      navigate("/structure-dashboard");
    } catch (error: any) {
      console.error("Activity save error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer l'activité",
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
          <BackButton fallback="/structure-dashboard" positioning="relative" size="sm" />
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
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
              onClick={() => navigate("/structure-dashboard")}
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
