import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    postalCode: "",
    quotientFamilial: "",
    maritalStatus: ""
  });

  // Fetch current profile
  const { data: profile } = useQuery({
    queryKey: ["current-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Load existing data
  useEffect(() => {
    if (profile) {
      setFormData({
        postalCode: profile.postal_code || "",
        quotientFamilial: profile.quotient_familial ? String(profile.quotient_familial) : "",
        maritalStatus: profile.marital_status || ""
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase
        .from("profiles")
        .update({
          postal_code: formData.postalCode,
          quotient_familial: formData.quotientFamilial ? parseFloat(formData.quotientFamilial) : null,
          marital_status: formData.maritalStatus || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées"
      });

      navigate(-1);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container flex items-center gap-3 py-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Retour"
          >
            <ArrowLeft />
          </Button>
          <h1 className="font-semibold text-lg">Modifier mon profil</h1>
        </div>
      </div>

      <div className="container px-4 py-6 max-w-2xl mx-auto">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal *</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="42000"
                required
              />
              <p className="text-xs text-muted-foreground">
                Pour déterminer les aides locales disponibles
              </p>
            </div>

            {/* Quotient Familial */}
            <div className="space-y-2">
              <Label htmlFor="quotientFamilial">Quotient familial CAF (€)</Label>
              <Input
                id="quotientFamilial"
                type="number"
                value={formData.quotientFamilial}
                onChange={(e) => setFormData({ ...formData, quotientFamilial: e.target.value })}
                placeholder="850"
              />
              <p className="text-xs text-muted-foreground">
                Voir votre attestation CAF pour optimiser vos aides
              </p>
            </div>

            {/* Marital Status */}
            <div className="space-y-2">
              <Label htmlFor="maritalStatus">Situation familiale</Label>
              <Select value={formData.maritalStatus} onValueChange={(value) => setFormData({ ...formData, maritalStatus: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Célibataire</SelectItem>
                  <SelectItem value="couple">En couple</SelectItem>
                  <SelectItem value="divorced">Divorcé(e)</SelectItem>
                  <SelectItem value="widowed">Veuf/Veuve</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={!formData.postalCode || isLoading}
            >
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProfileEdit;
