import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface KidQuickAddModalProps {
  open: boolean;
  onClose: () => void;
  onChildAdded: (childId?: string) => void;
  allowAnonymous?: boolean;
}

export const KidQuickAddModal = ({ open, onClose, onChildAdded, allowAnonymous = false }: KidQuickAddModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [birthDate, setBirthDate] = useState("");

  // Réinitialiser le formulaire quand la modale se ferme
  useEffect(() => {
    if (!open) {
      setFirstName("");
      setBirthDate("");
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !birthDate) {
      toast({
        title: "Informations manquantes",
        description: "Merci de renseigner le prénom et la date de naissance",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Si pas d'utilisateur connecté et mode anonyme autorisé
      if (!user && allowAnonymous) {
        // Créer un enfant anonyme en localStorage
        const anonymousChild = {
          id: `anonymous-${Date.now()}`,
          first_name: firstName.trim(),
          dob: birthDate,
          isAnonymous: true
        };
        
        // Récupérer les enfants anonymes existants
        const existingChildren = localStorage.getItem('anonymous_children');
        const children = existingChildren ? JSON.parse(existingChildren) : [];
        children.push(anonymousChild);
        localStorage.setItem('anonymous_children', JSON.stringify(children));

        toast({
          title: "Enfant ajouté",
          description: `${firstName} a été ajouté pour cette simulation`,
        });

        onChildAdded(anonymousChild.id);
        onClose();
        return;
      }
      
      if (!user) {
        throw new Error("Veuillez vous connecter pour enregistrer un enfant");
      }

      // Créer l'enfant en base de données
      const { data: newChild, error } = await supabase
        .from("children")
        .insert({
          user_id: user.id,
          first_name: firstName.trim(),
          dob: birthDate,
          needs_json: {}
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Enfant enregistré",
        description: `${firstName} a été ajouté avec succès`,
      });

      onChildAdded(newChild?.id);
      onClose();
    } catch (error: any) {
      console.error("Error adding child:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter l'enfant",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un enfant</DialogTitle>
          <DialogDescription>
            Renseignez les informations de l'enfant pour continuer l'inscription
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              Prénom de l'enfant <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Prénom"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">
              Date de naissance <span className="text-destructive">*</span>
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              disabled={isSubmitting}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer l'enfant"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
