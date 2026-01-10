import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, UserPlus, Heart } from "lucide-react";

interface ParentalValidationModalProps {
  open: boolean;
  onClose: () => void;
  onValidated: () => void;
  activityId: string;
  slotId?: string;
  activityTitle?: string;
}

export const ParentalValidationModal = ({
  open,
  onClose,
  activityId,
  slotId,
  activityTitle,
}: ParentalValidationModalProps) => {
  const navigate = useNavigate();

  const handleParentHasFlooow = () => {
    onClose();
    navigate(`/inscription/saisir-code-parent?activityId=${activityId}${slotId ? `&slotId=${slotId}` : ""}`);
  };

  const handleParentNoFlooow = () => {
    onClose();
    navigate(`/inscription/generer-code-enfant?activityId=${activityId}${slotId ? `&slotId=${slotId}` : ""}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Un parent doit valider ton inscription
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {activityTitle
              ? `Pour finaliser ton inscription à "${activityTitle}", un parent doit valider ta demande.`
              : "Pour finaliser cette activité, un parent doit valider ta demande."
            }
          </DialogDescription>
        </DialogHeader>

        {/* Message inspirant Family Flooow */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10 p-4 mt-2">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground italic">
              "Pas d'inquietude : la Family Flooow t'accompagne. Tu choisis, ton parent valide, et Flooow s'occupe du reste."
            </p>
          </div>
        </Card>

        <div className="space-y-3 pt-4">
          <Button
            onClick={handleParentHasFlooow}
            className="w-full h-auto py-4 flex items-center gap-4"
            variant="default"
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Mon parent a deja Flooow</p>
              <p className="text-sm opacity-90">Je saisis son code</p>
            </div>
          </Button>

          <Button
            onClick={handleParentNoFlooow}
            variant="outline"
            className="w-full h-auto py-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Mon parent n'a pas encore Flooow</p>
              <p className="text-sm text-muted-foreground">Je genere un code pour lui</p>
            </div>
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground pt-2">
          Une idée d'activité ? On t'aide à aller jusqu'au bout.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ParentalValidationModal;
