/**
 * FinancialAidHeader Component
 * Clean white header with back button, title and subtitle
 * Harmonized with all other page headers (LOT F)
 */

import { BackButton } from '@/components/BackButton';

export function FinancialAidHeader() {
  return (
    <div className="bg-background px-4 py-6">
      {/* Back Button + Title/Subtitle bloc */}
      <div className="flex items-start gap-4 mb-2">
        <BackButton
          positioning="relative"
          className="shrink-0"
        />
        <div className="flex-1">
          {/* Title */}
          <h1 className="font-poppins text-2xl font-bold text-foreground leading-tight mb-2">
            Mes aides
          </h1>

          {/* Subtitle */}
          <p className="font-poppins text-[15px] font-normal text-muted-foreground leading-relaxed">
            Réduisez le coût des activités de vos enfants grâce aux aides disponibles.
          </p>
        </div>
      </div>
    </div>
  );
}
