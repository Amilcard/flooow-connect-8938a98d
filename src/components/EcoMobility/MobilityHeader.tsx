/**
 * MobilityHeader Component
 * Clean white header aligned with FinancialAidHeader style
 * Harmonized with all other page headers (LOT F)
 */

import { BackButton } from '@/components/BackButton';

export function MobilityHeader() {
  return (
    <div className="bg-white px-4 py-6">
      {/* Back Button + Title/Subtitle bloc */}
      <div className="flex items-start gap-4 mb-2">
        <BackButton
          positioning="relative"
          className="shrink-0"
        />
        <div className="flex-1">
          {/* Title */}
          <h1 className="font-poppins text-2xl font-bold text-gray-900 leading-tight mb-2">
            Mes trajets
          </h1>

          {/* Subtitle */}
          <p className="font-poppins text-[15px] font-normal text-gray-600 leading-relaxed">
            Préparez vos trajets pour rejoindre vos activités sans voiture.
          </p>
        </div>
      </div>
    </div>
  );
}
