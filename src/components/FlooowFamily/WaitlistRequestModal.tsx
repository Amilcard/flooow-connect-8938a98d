import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Heart, Calendar, Users, Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
}

interface WaitlistRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityId: string;
  activityTitle: string;
  slotId?: string;
  slotLabel?: string; // Ex: "Mer 10 déc. 14h-16h"
  ageRange?: string; // Ex: "6-10 ans"
}

// Stockage localStorage en attendant backend
const WAITLIST_STORAGE_KEY = "flooow_waitlist_requests";

interface WaitlistRequest {
  id: string;
  activity_id: string;
  activity_title: string;
  slot_id?: string;
  slot_label?: string;
  child_id: string;
  child_name: string;
  user_id: string;
  notes?: string;
  status: "pending" | "contacted" | "resolved";
  created_at: string;
}

const saveWaitlistRequest = (request: WaitlistRequest) => {
  const existing = JSON.parse(localStorage.getItem(WAITLIST_STORAGE_KEY) || "[]");
  existing.push(request);
  localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(existing));
};

export const getWaitlistRequests = (): WaitlistRequest[] => {
  return JSON.parse(localStorage.getItem(WAITLIST_STORAGE_KEY) || "[]");
};

export const WaitlistRequestModal = ({
  open,
  onOpenChange,
  activityId,
  activityTitle,
  slotId,
  slotLabel,
  ageRange
}: WaitlistRequestModalProps) => {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Charger les enfants de l'utilisateur
  useEffect(() => {
    const fetchChildren = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data, error } = await supabase
        .from("children")
        .select("id, first_name, last_name, date_of_birth")
        .eq("user_id", user.id);

      if (!error && data) {
        setChildren(data);
        if (data.length === 1) {
          setSelectedChildId(data[0].id);
        }
      }
    };

    if (open) {
      fetchChildren();
      setIsSuccess(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedChildId) {
      toast.error("Veuillez sélectionner un enfant");
      return;
    }

    if (!userId) {
      toast.error("Vous devez être connecté pour faire une demande");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedChild = children.find(c => c.id === selectedChildId);

      const request: WaitlistRequest = {
        id: crypto.randomUUID(),
        activity_id: activityId,
        activity_title: activityTitle,
        slot_id: slotId,
        slot_label: slotLabel,
        child_id: selectedChildId,
        child_name: selectedChild ? `${selectedChild.first_name} ${selectedChild.last_name}` : "",
        user_id: userId,
        notes: notes.trim() || undefined,
        status: "pending",
        created_at: new Date().toISOString()
      };

      // Sauvegarder en localStorage (en attendant le backend)
      saveWaitlistRequest(request);

      // Simuler délai réseau
      await new Promise(resolve => setTimeout(resolve, 600));

      setIsSuccess(true);

      // Log pour debug
      console.log("[Flooow Family] Waitlist request:", request);

    } catch (error) {
      toast.error("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNotes("");
    setSelectedChildId(children.length === 1 ? children[0].id : "");
    setIsSuccess(false);
    onOpenChange(false);
  };

  // Écran de succès
  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md text-center">
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-xl">C'est noté !</DialogTitle>
            <DialogDescription className="text-base">
              La <strong className="text-primary">Flooow Family</strong> s'en occupe.
              <br />
              Vous serez recontacté dès qu'une place se libère.
            </DialogDescription>
            <Button onClick={handleClose} className="mt-4">
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Demander une place via la Flooow Family
          </DialogTitle>
          <DialogDescription>
            Ça se bouscule pour cet atelier... mais on a encore des cartes en main !
          </DialogDescription>
        </DialogHeader>

        {/* Rappel activité & créneau */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{activityTitle}</span>
          </div>
          {slotLabel && (
            <p className="text-sm text-muted-foreground ml-6">
              Créneau visé : {slotLabel}
            </p>
          )}
          {ageRange && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-6">
              <Users className="w-4 h-4" />
              <span>{ageRange}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection enfant */}
          <div className="space-y-2">
            <Label htmlFor="child-select">Pour quel enfant ? *</Label>
            {children.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun enfant enregistré. <a href="/profile" className="text-primary underline">Ajoutez un enfant</a> d'abord.
              </p>
            ) : (
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un enfant" />
                </SelectTrigger>
                <SelectContent>
                  {children.map(child => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.first_name} {child.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Message optionnel */}
          <div className="space-y-2">
            <Label htmlFor="notes">Un message ? (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Disponible tous les mercredis, ou préférence pour le créneau de 14h..."
              rows={3}
            />
          </div>

          {/* Info Flooow Family */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <strong className="text-primary">Flooow Family</strong> vous accompagne :
            on contacte l'organisateur pour vous et on vous tient informé par email dès qu'une place se libère.
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || children.length === 0 || !selectedChildId}
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Envoi..." : "Envoyer ma demande"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
