import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { TerritoryCheck } from "@/components/TerritoryCheck";
import { Checkbox } from "@/components/ui/checkbox";

interface Child {
  firstName: string;
  birthDate: string;
  isStudent: boolean;
}

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    postalCode: "",
    quotientFamilial: "",
    maritalStatus: ""
  });

  const [children, setChildren] = useState<Child[]>([
    { firstName: "", birthDate: "", isStudent: false }
  ]);
  const [isCovered, setIsCovered] = useState(true);

  const addChild = () => {
    setChildren([...children, { firstName: "", birthDate: "", isStudent: false }]);
  };

  const removeChild = (index: number) => {
    if (children.length > 1) {
      setChildren(children.filter((_, i) => i !== index));
    }
  };

  const updateChild = (index: number, field: keyof Child, value: string | boolean) => {
    const updated = [...children];
    updated[index][field] = value as never;
    setChildren(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          postal_code: formData.postalCode,
          quotient_familial: formData.quotientFamilial ? parseFloat(formData.quotientFamilial) : null,
          marital_status: formData.maritalStatus || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Insert children
      for (const child of children) {
        if (child.firstName && child.birthDate) {
          const { error: childError } = await supabase
            .from("children")
            .insert({
              user_id: user.id,
              first_name: child.firstName,
              dob: child.birthDate,
              is_student: child.isStudent
            });

          if (childError) throw childError;
        }
      }

      toast({
        title: "Profil complété",
        description: "Vous pouvez maintenant accéder aux aides financières"
      });

      navigate("/home");
    } catch (error: unknown) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de sauvegarder le profil",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = formData.postalCode && children.some(c => c.firstName && c.birthDate) && isCovered;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container flex items-center gap-3 py-3 px-4">
          <BackButton fallback="/" positioning="relative" size="sm" showText={true} label="Retour" />
          <h1 className="font-semibold text-lg">Complétez votre profil</h1>
        </div>
      </div>

      <div className="container px-4 py-6 max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Informations pour les aides</h2>
            <p className="text-sm text-muted-foreground">
              Ces informations nous permettent de calculer automatiquement vos aides financières
            </p>
          </div>

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

            {/* Territory Coverage Check */}
            {formData.postalCode && (
              <TerritoryCheck 
                postalCode={formData.postalCode}
                onCovered={setIsCovered}
              />
            )}

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
                Optionnel mais recommandé pour optimiser vos aides (voir votre attestation CAF)
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

            {/* Children */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enfants *</Label>
                <Badge variant="outline">{children.length}</Badge>
              </div>

              {children.map((child, index) => (
                <Card key={index} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Enfant {index + 1}</span>
                    {children.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChild(index)}
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`child-${index}-firstName`}>Prénom</Label>
                      <Input
                        id={`child-${index}-firstName`}
                        value={child.firstName}
                        onChange={(e) => updateChild(index, "firstName", e.target.value)}
                        placeholder="Léa"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`child-${index}-birthDate`}>Date de naissance</Label>
                      <Input
                        id={`child-${index}-birthDate`}
                        type="date"
                        value={child.birthDate}
                        onChange={(e) => updateChild(index, "birthDate", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Student checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`child-${index}-isStudent`}
                      checked={child.isStudent}
                      onCheckedChange={(checked) => updateChild(index, "isStudent", !!checked)}
                    />
                    <Label
                      htmlFor={`child-${index}-isStudent`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      Lycéen / Étudiant
                    </Label>
                  </div>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={addChild}
              >
                <Plus size={16} className="mr-2" />
                Ajouter un enfant
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={!canSubmit || isLoading}
            >
              {isLoading ? "Enregistrement..." : "Terminer"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Vous pourrez modifier ces informations à tout moment dans votre profil
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProfileCompletion;
