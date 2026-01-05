import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Sparkles, CheckCircle2 } from "lucide-react";
import { PricingSummary, formatPrice } from "@/utils/pricingSummary";

interface PricingSummaryCardProps {
  summary: PricingSummary;
  /** Variant for different display contexts */
  variant?: "full" | "compact" | "inline";
  /** Data tour ID for testing/onboarding */
  dataTourId?: string;
  /** Show the info alert about potential aids */
  showPotentialAidsAlert?: boolean;
  /** Callback when user wants to add QF for more aids */
  onRequestQF?: () => void;
  /** Show individual aids breakdown */
  showAidsBreakdown?: boolean;
}

/**
 * Unified pricing summary display component
 * Shows consistent pricing information across all zones (A, B, C)
 *
 * UPDATED: Now shows individual eligible aids from Supabase
 */
export function PricingSummaryCard({
  summary,
  variant = "full",
  dataTourId,
  showPotentialAidsAlert = true,
  onRequestQF,
  showAidsBreakdown = true,
}: PricingSummaryCardProps) {
  const {
    priceInitial,
    prixApplicable,
    qfReductionPercent,
    eligibleAids = [],
    confirmedAidTotal,
    resteActuel,
    potentialAidTotal,
    resteEstime,
    hasPotentialAids,
    hasConfirmedAids,
    hasQf,
  } = summary;

  // Don't show card if no aids calculated and no QF reduction
  if (!hasConfirmedAids && !hasPotentialAids && qfReductionPercent === 0) {
    return null;
  }

  if (variant === "inline") {
    return (
      <div className="space-y-2" data-tour-id={dataTourId}>
        <div className="flex justify-between text-sm">
          <span>Prix initial</span>
          <span className="font-medium">{formatPrice(priceInitial)}</span>
        </div>
        {hasConfirmedAids && (
          <div className="flex justify-between text-sm text-primary">
            <span>Aides confirmées</span>
            <span className="font-medium">- {formatPrice(confirmedAidTotal)}</span>
          </div>
        )}
        {hasPotentialAids && (
          <div className="flex justify-between text-sm text-yellow-600">
            <span>Aides potentielles</span>
            <span className="font-medium">~ {formatPrice(potentialAidTotal, false)}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between text-lg font-bold">
          <span>{hasPotentialAids ? "Reste à charge estimé" : "Reste à charge"}</span>
          <span className="text-primary">
            {hasPotentialAids ? formatPrice(resteEstime) : formatPrice(resteActuel)}
          </span>
        </div>
        {hasPotentialAids && hasConfirmedAids && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>(sans aides potentielles)</span>
            <span>{formatPrice(resteActuel)}</span>
          </div>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="space-y-2" data-tour-id={dataTourId}>
        <div className="flex justify-between text-sm">
          <span>Prix initial</span>
          <span className="font-medium">{formatPrice(priceInitial)}</span>
        </div>
        <div className="flex justify-between text-sm text-primary">
          <span>Aides {hasPotentialAids ? "estimées" : "appliquées"}</span>
          <span className="font-medium">
            - {hasPotentialAids
              ? `${formatPrice(confirmedAidTotal + potentialAidTotal, false)}`
              : formatPrice(confirmedAidTotal)
            }
          </span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Reste à charge {hasPotentialAids ? "estimé" : ""}</span>
          <span className="text-primary">
            {hasPotentialAids ? formatPrice(resteEstime) : formatPrice(resteActuel)}
          </span>
        </div>
      </div>
    );
  }

  // Full variant - most detailed
  return (
    <Card className="p-4 bg-accent/50" data-tour-id={dataTourId}>
      <div className="space-y-2">
        {/* Line 1: Prix initial */}
        <div className="flex justify-between text-sm">
          <span>Prix initial</span>
          <span className="font-medium">{formatPrice(priceInitial)}</span>
        </div>

        {/* Line 2: QF reduction (vacances only) */}
        {qfReductionPercent > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Réduction QF ({qfReductionPercent}%)</span>
            <span className="font-medium">
              → {formatPrice(prixApplicable)}
            </span>
          </div>
        )}

        {/* Line 3: Individual eligible aids breakdown */}
        {showAidsBreakdown && eligibleAids.length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {hasQf ? "Aides éligibles" : "Aides potentielles"}
            </div>
            {eligibleAids.map((aid, index) => (
              <div key={index} className={`flex justify-between text-sm ${hasQf ? 'text-primary' : 'text-yellow-600'}`}>
                <span className="flex items-center gap-1">
                  {hasQf ? <CheckCircle2 size={12} /> : <Sparkles size={12} />}
                  {aid.name}
                </span>
                <span className="font-medium">- {formatPrice(aid.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Legacy: Aides confirmées total (if no breakdown) */}
        {!showAidsBreakdown && hasConfirmedAids && (
          <div className="flex justify-between text-sm text-primary">
            <span>Aides confirmées</span>
            <span className="font-medium">- {formatPrice(confirmedAidTotal)}</span>
          </div>
        )}

        {/* Legacy: Aides potentielles total (if no breakdown) */}
        {!showAidsBreakdown && hasPotentialAids && (
          <div className="flex justify-between text-sm text-yellow-600">
            <span className="flex items-center gap-1">
              <Sparkles size={14} />
              Aides potentielles
            </span>
            <span className="font-medium">~ {formatPrice(potentialAidTotal, false)}</span>
          </div>
        )}

        <Separator />

        {/* Line 5: Reste à charge final */}
        <div className="flex justify-between text-lg font-bold">
          <span>{hasPotentialAids ? "Reste à charge estimé" : "Reste à charge"}</span>
          <span className="text-primary">
            {hasPotentialAids ? formatPrice(resteEstime) : formatPrice(resteActuel)}
          </span>
        </div>
      </div>

      {/* Optional alert about potential aids */}
      {showPotentialAidsAlert && hasPotentialAids && !hasQf && (
        <Alert className="mt-4 bg-yellow-50 border-yellow-200">
          <Info className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm text-yellow-900">
            <strong>Aides potentielles détectées !</strong> Renseignez votre Quotient Familial
            pour confirmer ces aides et réduire votre reste à charge.
            {onRequestQF && (
              <button
                onClick={onRequestQF}
                className="block mt-2 text-yellow-700 underline hover:text-yellow-800 font-medium"
              >
                Affiner ma simulation →
              </button>
            )}
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
}
