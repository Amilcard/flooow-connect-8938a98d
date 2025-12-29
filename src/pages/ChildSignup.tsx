import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomNavigation } from "@/components/BottomNavigation";
import { SearchBar } from "@/components/SearchBar";
import { UserPlus, Clock } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { toast } from "sonner";
import { safeErrorMessage } from "@/utils/sanitize";

const ChildSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    dob: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is authenticated
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast.error("Vous devez être connecté");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create child as inactive (pending approval)
      const { data, error } = await supabase
        .from("children")
        .insert({
          user_id: session.user.id,
          first_name: formData.firstName,
          dob: formData.dob,
          // Note: child will be inactive by default until parent approves
        })
        .select()
        .single();

      if (error) {
        console.error(safeErrorMessage(error, 'Create child'));
        throw error;
      }

      if (!data) {
        throw new Error("Aucune donnée retournée après la création");
      }

      toast.success("Profil enfant créé avec succès !");
      
      // Navigate to account page with a slight delay to ensure state updates
      setTimeout(() => {
        navigate("/mon-compte/enfants");
      }, 100);
    } catch (error: unknown) {
      console.error(safeErrorMessage(error, 'Create child'));

      // More specific error messages
      let errorMessage = "Erreur lors de la création du profil";

      // Type guard for Supabase/Postgres error codes
      const errorWithCode = error as { code?: string; message?: string };
      if (errorWithCode?.code === "23505") {
        errorMessage = "Un profil similaire existe déjà";
      } else if (errorWithCode?.code === "42501") {
        errorMessage = "Vous n'avez pas les permissions nécessaires";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking auth
  if (!session && formData.firstName === "" && formData.dob === "") {
    return (
      <div className="min-h-screen bg-background pb-20">
        <SearchBar />
        <div className="container py-6">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Vérification de votre session...</p>
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <SearchBar />
      
      <div className="container py-6 space-y-6">
        <BackButton fallback="/" positioning="relative" size="sm" showText={true} label="Retour" />

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Créer un profil enfant</h1>
          <p className="text-muted-foreground">
            Créez un profil pour votre enfant. La validation parentale sera requise.
          </p>
        </div>

        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus size={20} />
              Nouveau profil
            </CardTitle>
            <CardDescription>
              Remplissez les informations de l'enfant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  placeholder="Prénom de l'enfant"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date de naissance *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-muted">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock size={18} />
              Processus de validation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. Vous créez le profil de l'enfant</p>
            <p>2. Le parent reçoit une notification</p>
            <p>3. Le parent approuve la demande</p>
            <p>4. Le profil devient actif</p>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ChildSignup;
