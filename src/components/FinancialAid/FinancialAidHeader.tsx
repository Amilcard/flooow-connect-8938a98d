/**
 * FinancialAidHeader Component
 * Clean white header with back button, title and subtitle
 * Aligned with onboarding flow
 */

import { BackButton } from '@/components/BackButton';

export function FinancialAidHeader() {
  return (
    <div className="bg-white px-4 py-6">
      {/* Back Button */}
      <div className="mb-6">
        <BackButton />
      </div>

      {/* Title */}
      <h1 className="font-poppins text-2xl font-bold text-gray-900 leading-tight mb-2">
        Mes aides
      </h1>

      {/* Subtitle */}
      <p className="font-poppins text-[15px] font-normal text-gray-600 leading-relaxed">
        Réduisez le coût des activités de vos enfants grâce aux aides disponibles.
      </p>
    </div>
  );
}
