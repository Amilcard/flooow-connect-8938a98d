/**
 * MobilityHeader Component
 * Clean white header aligned with FinancialAidHeader style
 * Harmonized with all other page headers (LOT F)
 *
 * LOT 2 - T2_3: BackButton uniforme avec label "Retour"
 */

import { BackButton } from '@/components/BackButton';

export function MobilityHeader() {
  return (
    <div className="bg-background px-4 py-6">
      {/* Back Button + Title/Subtitle bloc */}
      <div className="flex items-start gap-5 mb-2">
        {/* LOT 2 - T2_3: BackButton uniforme avec showText et label "Retour" */}
        <BackButton
          positioning="relative"
          showText={true}
          label="Retour"
          className="shrink-0"
        />
        <div className="flex-1">
          {/* Title */}
          <h1 className="font-poppins text-2xl font-bold text-foreground leading-tight mb-2">
            Mes trajets
          </h1>

          {/* Subtitle */}
          <p className="font-poppins text-[15px] font-normal text-muted-foreground leading-relaxed">
            Préparez vos trajets pour rejoindre vos activités sans voiture.
          </p>
        </div>
      </div>
    </div>
  );
}
