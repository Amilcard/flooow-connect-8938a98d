import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar, AlertCircle } from "lucide-react";
import { SlotPicker } from "@/components/SlotPicker";
import { FinancialAidBadges } from "@/components/activities/FinancialAidBadges";
import { FinancialAidsCalculator } from "@/components/activities/FinancialAidsCalculator";

interface Slot {
  id: string;
  start: string;
  end: string;
  seats_remaining: number;
  seats_total: number;
}

interface Child {
  id: string;
  first_name: string;
  dob: string;
}

interface UserProfile {
  quotient_familial?: number;
  postal_code?: string;
}

interface BookingCardProps {
  activity: any;
  slots: Slot[];
  children: Child[];
  userProfile: UserProfile | null;
  selectedSlotId?: string;
  selectedChildId?: string;
  onSelectSlot: (slotId: string) => void;
  onSelectChild: (childId: string) => void;
  onBooking: () => void;
  calculateAge: (dob: string) => number;
  calculateDurationDays: (slot: any) => number;
}

export const BookingCard = ({
  activity,
  slots,
  children,
  userProfile,
  selectedSlotId,
  selectedChildId,
  onSelectSlot,
  onSelectChild,
  onBooking,
  calculateAge,
  calculateDurationDays,
}: BookingCardProps) => {
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);
  const selectedChild = children.find((c) => c.id === selectedChildId);

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
              <span className="text-3xl font-bold text-foreground">
                {activity.price_base === 0 ? "Gratuit" : `${activity.price_base}€`}
              </span>
              {activity.price_base > 0 && (
                <span className="text-sm text-muted-foreground">par enfant</span>
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
                {activity.payment_plans.map((plan: any, idx: number) => (
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
                    +{slots.length - 6} autres créneaux disponibles
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

          {/* Child Selection */}
          {children.length > 0 && upcomingSlots.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-base text-foreground">
                  Sélectionner un enfant
                </h3>
                <RadioGroup value={selectedChildId} onValueChange={onSelectChild}>
                  <div className="space-y-2">
                    {children.map((child) => {
                      const age = calculateAge(child.dob);
                      const isEligible = age >= activity.age_min && age <= activity.age_max;

                      return (
                        <div
                          key={child.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                            isEligible
                              ? "border-border hover:bg-muted/50 cursor-pointer"
                              : "border-destructive/30 bg-destructive/5 opacity-60"
                          }`}
                        >
                          <RadioGroupItem
                            value={child.id}
                            id={child.id}
                            disabled={!isEligible}
                          />
                          <Label
                            htmlFor={child.id}
                            className={`flex-1 cursor-pointer ${
                              !isEligible && "cursor-not-allowed"
                            }`}
                          >
                            <div className="font-medium text-sm">{child.first_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {age} ans{" "}
                              {!isEligible &&
                                `(requis: ${activity.age_min}-${activity.age_max} ans)`}
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          {/* Financial Aid Badges */}
          {userProfile && selectedChild && upcomingSlots.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-base text-foreground">Aides éligibles</h3>
                <FinancialAidBadges
                  activityCategories={[activity.category]}
                  activityAcceptedAidSlugs={
                    Array.isArray(activity.accepts_aid_types)
                      ? activity.accepts_aid_types
                      : []
                  }
                  childAge={calculateAge(selectedChild.dob)}
                  quotientFamilial={
                    userProfile.quotient_familial
                      ? Number(userProfile.quotient_familial)
                      : 0
                  }
                  cityCode={userProfile.postal_code || ""}
                />
              </div>
            </>
          )}

          {/* Financial Calculator */}
          {userProfile &&
            selectedChild &&
            selectedSlot &&
            activity.price_base > 0 &&
            upcomingSlots.length > 0 && (
              <>
                <Separator />
                <FinancialAidsCalculator
                  activityPrice={activity.price_base}
                  activityCategories={[activity.category]}
                  childAge={calculateAge(selectedChild.dob)}
                  quotientFamilial={
                    userProfile.quotient_familial
                      ? Number(userProfile.quotient_familial)
                      : 0
                  }
                  cityCode={userProfile.postal_code || ""}
                  durationDays={calculateDurationDays(selectedSlot)}
                />
              </>
            )}

          {/* Booking CTA */}
          {upcomingSlots.length > 0 && (
            <>
              <Separator />
              <Button
                onClick={onBooking}
                disabled={!selectedSlotId || !selectedChildId}
                className="w-full h-12 text-base font-semibold shadow-md"
                size="lg"
              >
                {!selectedChildId
                  ? "Sélectionnez un enfant"
                  : !selectedSlotId
                  ? "Sélectionnez un créneau"
                  : "Réserver ce créneau"}
              </Button>

              {(!selectedSlotId || !selectedChildId) && (
                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Veuillez sélectionner un créneau et un enfant pour continuer la
                    réservation
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
