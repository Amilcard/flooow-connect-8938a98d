/**
 * ChildCard - Carte enfant pour la sélection dans le flux d'inscription
 * 
 * Features:
 * - Affichage nom + prénom + âge + DDN
 * - État sélectionné / non sélectionné
 * - Grisé si âge incompatible avec tooltip explicatif
 */
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, User, AlertCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChildCardProps {
  id: string;
  firstName: string;
  lastName?: string;
  age: number;
  birthDate: string;
  isSelected: boolean;
  isEligible: boolean;
  eligibilityReason?: string | null;
  onClick: () => void;
}

export const ChildCard = ({
  id,
  firstName,
  lastName,
  age,
  birthDate,
  isSelected,
  isEligible,
  eligibilityReason,
  onClick,
}: ChildCardProps) => {
  const formattedBirthDate = new Date(birthDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const cardContent = (
    <Card
      className={cn(
        "p-4 transition-all border-2 cursor-pointer",
        !isEligible
          ? "opacity-60 bg-muted/50 cursor-not-allowed border-transparent"
          : isSelected
            ? "ring-2 ring-primary ring-offset-2 bg-primary/5 border-primary shadow-md"
            : "hover:bg-accent/50 hover:border-primary/30 border-transparent"
      )}
      onClick={() => isEligible && onClick()}
      role="button"
      tabIndex={isEligible ? 0 : -1}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && isEligible) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-selected={isSelected}
      aria-disabled={!isEligible}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          <User size={24} className={isSelected ? "" : "text-muted-foreground"} />
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn(
              "font-semibold truncate",
              isSelected ? "text-primary" : ""
            )}>
              {firstName} {lastName || ""}
            </p>
            {isSelected && <CheckCircle2 size={18} className="text-primary flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
            <span className="font-medium">{age} ans</span>
            <span className="text-muted-foreground/50">•</span>
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span className="text-xs">{formattedBirthDate}</span>
            </div>
          </div>
        </div>

        {/* Badge incompatibilité */}
        {!isEligible && (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex-shrink-0">
            <AlertCircle size={12} className="mr-1" />
            Âge non éligible
          </Badge>
        )}
      </div>
    </Card>
  );

  if (!isEligible && eligibilityReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {cardContent}
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-sm">{eligibilityReason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return cardContent;
};

export default ChildCard;
