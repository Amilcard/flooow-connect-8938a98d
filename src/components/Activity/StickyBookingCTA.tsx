import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Share2, CalendarCheck } from "lucide-react";

interface StickyBookingCTAProps {
  /**
   * Prix de base de l'activité
   */
  price: number;

  /**
   * Prix après aides (optionnel)
   */
  discountedPrice?: number;

  /**
   * Unité de prix (ex: "par stage", "par mois")
   */
  priceUnit?: string;

  /**
   * Callback pour la réservation
   */
  onBook: () => void;

  /**
   * Callback pour le partage
   */
  onShare?: () => void;

  /**
   * Callback pour les favoris
   */
  onToggleFavorite?: () => void;

  /**
   * État initial des favoris
   */
  isFavorite?: boolean;

  /**
   * CTA désactivé (ex: pas de créneau sélectionné)
   */
  disabled?: boolean;

  /**
   * Texte du bouton (par défaut: "Réserver")
   */
  buttonText?: string;

  /**
   * Afficher uniquement sur mobile (< 768px)
   */
  mobileOnly?: boolean;
}

/**
 * CTA de réservation sticky en bas pour mobile
 *
 * Features:
 * - Sticky bottom bar avec prix et CTA
 * - Boutons favoris/partage flottants au-dessus
 * - Affichage du prix réduit si aides appliquées
 * - Touch-friendly (44px min height)
 * - Mobile-only par défaut
 *
 * @example
 * ```tsx
 * <StickyBookingCTA
 *   price={120}
 *   discountedPrice={80}
 *   priceUnit="par stage"
 *   onBook={handleBooking}
 *   onShare={handleShare}
 *   onToggleFavorite={toggleFavorite}
 *   disabled={!selectedSlot}
 * />
 * ```
 */
export function StickyBookingCTA({
  price,
  discountedPrice,
  priceUnit = "par activité",
  onBook,
  onShare,
  onToggleFavorite,
  isFavorite: initialFavorite = false,
  disabled = false,
  buttonText = "Réserver",
  mobileOnly = true
}: StickyBookingCTAProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    onToggleFavorite?.();
  };

  // TECH-009: Protection reste à charge ≥ 0 (jamais de prix négatif affiché)
  const safeDiscountedPrice = discountedPrice !== undefined ? Math.max(0, discountedPrice) : undefined;
  const displayPrice = safeDiscountedPrice ?? price;
  const hasDiscount = safeDiscountedPrice !== undefined && safeDiscountedPrice < price;

  return (
    <>
      {/* Floating Action Buttons - Au-dessus de la CTA bar */}
      <div
        className={`fixed right-4 z-40 flex flex-col gap-2 ${mobileOnly ? "md:hidden" : ""}`}
        style={{ bottom: "88px" }} // Au-dessus de la CTA bar (60px) + gap
      >
        {/* Bouton Favoris */}
        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="w-11 h-11 bg-background border-2 border-border rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart
              size={20}
              fill={isFavorite ? "#EF4444" : "none"}
              className={isFavorite ? "text-red-500" : "text-muted-foreground"}
              strokeWidth={2}
            />
          </button>
        )}

        {/* Bouton Partage */}
        {onShare && (
          <button
            onClick={onShare}
            className="w-11 h-11 bg-background border-2 border-border rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            aria-label="Partager l'activité"
          >
            <Share2 size={20} className="text-muted-foreground" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Sticky CTA Bar - Bottom */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-2xl ${
          mobileOnly ? "md:hidden" : ""
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Prix */}
          <div className="flex-1">
            {price === 0 ? (
              <p className="text-xl font-bold text-foreground">GRATUIT</p>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through">
                      {price}€
                    </span>
                  )}
                  <span className="text-xl font-bold text-foreground">
                    {displayPrice}€
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{priceUnit}</p>
              </>
            )}
          </div>

          {/* CTA Button */}
          <Button
            onClick={onBook}
            disabled={disabled}
            size="lg"
            className="flex-[2] h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <CalendarCheck size={20} className="mr-2" />
            {buttonText}
          </Button>
        </div>
      </div>
    </>
  );
}
