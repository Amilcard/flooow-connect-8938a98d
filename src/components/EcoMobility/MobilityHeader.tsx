/**
 * MobilityHeader Component
 * Clean white header aligned with FinancialAidHeader style
 */

import { BackButton } from '@/components/BackButton';

export function MobilityHeader() {
  return (
    <div className="bg-white px-4 py-6">
      {/* Back Button */}
      <div className="mb-6">
        <BackButton />
      </div>

      {/* Title */}
      <h1 className="font-poppins text-2xl font-bold text-gray-900 leading-tight mb-2">
        Mes trajets
      </h1>

      {/* Subtitle */}
      <p className="font-poppins text-[15px] font-normal text-gray-600 leading-relaxed">
        Préparez vos trajets pour rejoindre vos activités sans voiture.
      </p>
    </div>
  );
}
