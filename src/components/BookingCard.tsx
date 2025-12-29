import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, AlertCircle } from "lucide-react";
import { SlotPicker } from "@/components/SlotPicker";
import type { Activity } from "@/types/domain";
import type { CalculatedAid } from "@/utils/FinancialAidEngine";

// ============================================
// INTERFACES TYPÉES
// ============================================

interface BookingSlot {
  id: string;
  start: string;
  end: string;
  seats_remaining: number;
  seats_total: number;
}

interface BookingChild {
  id: string;
  first_name: string;
  dob: string;
}

interface BookingUserProfile {
  quotient_familial?: number;
  postal_code?: string;
}

interface BookingCardProps {
  activity: Activity;
  slots: BookingSlot[];
  children: BookingChild[];
  userProfile: BookingUserProfile | null;
  selectedSlotId?: string;
  selectedChildId?: string;
  onSelectSlot: (slotId: string) => void;
  onSelectChild: (childId: string) => void;
  onBooking: () => void;
  calculateAge: (dob: string) => number;
  calculateDurationDays: (slot: BookingSlot) => number;
  adjustedPrice?: number | null;
  calculatedAids?: CalculatedAid[];
}

export const BookingCard = ({
  activity,
  slots,
  children,
  userProfile: _userProfile, // Reserved for future aid calculation display
  selectedSlotId,
  selectedChildId,
  onSelectSlot,
  onSelectChild: _onSelectChild, // Reserved for future child selection UI
  onBooking,
  calculateAge: _calculateAge, // Reserved for age-based pricing
  calculateDurationDays: _calculateDurationDays, // Reserved for multi-day pricing
  adjustedPrice,
  calculatedAids: _calculatedAids = [], // Reserved for displaying calculated aids
}: BookingCardProps) => {
  const _selectedSlot = slots.find((s) => s.id === selectedSlotId); // Reserved for slot details display
  const _selectedChild = children.find((c) => c.id === selectedChildId); // Reserved for child info display

  // Filter slots to show only upcoming ones (max 6)
  const upcomingSlots = slots
    .filter((slot) => new Date(slot.start) >= new Date())
    .slice(0, 6);

  return (
    <div className="sticky top-20 space-y-4">
      {/* Price Card */}
      <Card className="shadow-lg border-2">
        <CardContent className="p-6 space-y-4">
          {/* Price */}
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              {adjustedPrice !== null && adjustedPrice !== undefined ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    {/* TECH-009: Protection reste à charge ≥ 0 */}
                    <span className="text-3xl font-bold text-primary">
                      {Math.max(0, adjustedPrice) === 0 ? "Gratuit" : `${Math.max(0, adjustedPrice)}€`}
                    </span>
                    {Math.max(0, adjustedPrice) > 0 && (
                      <span className="text-sm text-muted-foreground">par enfant</span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      {activity.price_base}€
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {/* TECH-009: Protection économie ≥ 0 */}
                      Avec aides: -{Math.max(0, activity.price_base - Math.max(0, adjustedPrice))}€
                    </Badge>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-3xl font-bold text-foreground">
                    {activity.price_base === 0 ? "Gratuit" : `${activity.price_base}€`}
                  </span>
                  {activity.price_base > 0 && (
                    <span className="text-sm text-muted-foreground">par enfant</span>
                  )}
                </>
              )}
            </div>
            {activity.price_note && (
              <p className="text-xs text-muted-foreground">{activity.price_note}</p>
            )}
          </div>

          {/* Payment Plans */}
          {Array.isArray(activity.payment_plans) && activity.payment_plans.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Options tarifaires</p>
                {activity.payment_plans.map((plan: { label: string; price: number }, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-muted-foreground">{plan.label}</span>
                    <span className="font-medium text-foreground">{plan.price}€</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <Separator />

          {/* Available Slots */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base text-foreground">
              Créneaux disponibles
            </h3>
            
            {upcomingSlots.length > 0 ? (
              <>
                <SlotPicker
                  slots={upcomingSlots}
                  onSelectSlot={onSelectSlot}
                  selectedSlotId={selectedSlotId}
                />
                {slots.length > 6 && (
                  <p className="text-xs text-center text-muted-foreground">
                    +{slots.length - 6} autre{slots.length - 6 > 1 ? 's' : ''} créneau{slots.length - 6 > 1 ? 'x' : ''} disponible{slots.length - 6 > 1 ? 's' : ''}
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-8 space-y-3 bg-muted/30 rounded-lg">
                <Calendar className="w-10 h-10 mx-auto text-muted-foreground/40" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Aucun créneau disponible
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Période de prestation: 01/11/2025 - 30/08/2026
                  </p>
                </div>
                <div className="pt-2 space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Voir activités similaires
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full">
                    Être alerté(e) des prochaines ouvertures
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Booking CTA */}
          {upcomingSlots.length > 0 && (
            <>
              <Separator />
              <Button
                onClick={onBooking}
                disabled={!selectedSlotId}
                className="w-full h-12 text-base font-semibold shadow-md"
                size="lg"
              >
                {!selectedSlotId ? "Sélectionnez un créneau" : "S'inscrire"}
              </Button>

              {!selectedSlotId ? (
                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Veuillez sélectionner un créneau pour continuer
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Inscription rapide.</strong> Vous pourrez vérifier vos aides financières et compléter les informations nécessaires lors de la réservation.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Important Info */}
      {upcomingSlots.length > 0 && (
        <Card className="border border-muted">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Période de prestation:</strong> Du 1er
              Novembre 2025 au 30 Août 2026
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
