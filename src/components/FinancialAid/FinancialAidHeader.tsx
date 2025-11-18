/**
 * LOT 5 - FinancialAidHeader Component
 * Enhanced header with gradient background, Coins icon, and proper typography
 * Refactored with Tailwind CSS for consistency
 */

import { Coins } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

export function FinancialAidHeader() {
  return (
    <div className="relative bg-gradient-to-br from-[#FEF3E2] to-[#FFE8CC] px-4 py-6 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute -top-5 -right-5 rotate-[15deg] opacity-[0.08] z-[1]">
        <Coins size={120} className="text-amber-500" />
      </div>

      {/* Content */}
      <div className="relative z-[2]">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton />
        </div>

        {/* Icon + Title Row */}
        <div className="flex items-center gap-3 mb-2">
          {/* Icon Container */}
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgba(245,158,11,0.2)]">
            <Coins size={28} className="text-amber-500" />
          </div>

          {/* Title */}
          <h1 className="font-poppins text-2xl font-bold text-gray-900 leading-tight">
            Aides financières
          </h1>
        </div>

        {/* Subtitle */}
        <p className="font-poppins text-[15px] font-normal text-gray-500 leading-relaxed mt-2">
          Réduisez le coût des activités pour vos enfants grâce aux aides disponibles
        </p>
      </div>
    </div>
  );
}
