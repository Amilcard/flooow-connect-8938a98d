import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2 } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { safeErrorMessage } from "@/utils/sanitize";

const StructureAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    structureName: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    postalCode: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            user_type: "structure",
            structure_name: formData.structureName
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erreur lors de la création du compte");

      // 2. Get territory from postal code
      const { data: territories } = await supabase
        .from("territories")
        .select("id")
        .contains("postal_codes", [formData.postalCode])
        .eq("type", "commune")
        .single();

      const territoryId = territories?.id || null;

      // 3. Update profile with postal code
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          postal_code: formData.postalCode,
          territory_id: territoryId
        })
        .eq("id", authData.user.id);

      if (profileError) throw profileError;

      // 4. Create structure
      const { data: structureData, error: structureError } = await supabase
        .from("structures")
        .insert({
          name: formData.structureName,
          address: formData.address,
          territory_id: territoryId,
          contact_json: { email: formData.email }
        })
        .select()
        .single();

      if (structureError) throw structureError;

      // 5. Assign structure role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: "structure",
          territory_id: territoryId
        });

      if (roleError) throw roleError;

      toast({
        title: "Compte créé",
        description: "Bienvenue ! Vous pouvez maintenant créer vos activités."
      });

      navigate("/dashboard/structure");
    } catch (error: unknown) {
      console.error(safeErrorMessage(error, 'Structure signup'));
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer le compte",
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
          <BackButton fallback="/" positioning="relative" size="sm" showText={true} label="Retour" />
          <h1 className="font-semibold text-lg">Inscription Structure</h1>
        </div>
      </div>

      <div className="container px-4 py-6 max-w-md mx-auto">
        <Alert className="mb-6">
          <Building2 className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-1">Compte structure</p>
            <p className="text-sm">
              Ce formulaire est réservé aux associations et clubs souhaitant proposer des activités.
            </p>
          </AlertDescription>
        </Alert>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="structureName">Nom de la structure *</Label>
              <Input
                id="structureName"
                value={formData.structureName}
                onChange={(e) => setFormData({ ...formData, structureName: e.target.value })}
                placeholder="Judo Club Saint-Étienne"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@judo-saintetienne.fr"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="15 avenue de la République"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal *</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="42000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={isLoading}
            >
              {isLoading ? "Création..." : "Créer mon compte structure"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Déjà un compte ? <button type="button" onClick={() => navigate("/auth")} className="text-primary hover:underline">Se connecter</button>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default StructureAuth;
