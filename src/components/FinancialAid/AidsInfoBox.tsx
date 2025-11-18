/**
 * LOT 5 - AidsInfoBox Component
 * Enhanced "Bon à savoir" info box with Lightbulb icon
 * Educates users about aid cumulation
 * Refactored with Tailwind CSS for consistency
 */

import { Lightbulb } from 'lucide-react';

export function AidsInfoBox() {
  return (
    <div className="my-8 bg-gradient-to-br from-[#FEF3E2] to-[#FFE8CC] border-l-4 border-amber-500 rounded-xl p-5 shadow-[0_4px_12px_rgba(245,158,11,0.1)]">
      {/* Icon + Title Row */}
      <div className="flex items-center gap-2.5 mb-3">
        <Lightbulb size={24} className="text-amber-500" />
        <h3 className="font-poppins text-base font-bold text-gray-900">
          Bon à savoir
        </h3>
      </div>

      {/* Content */}
      <p className="font-poppins text-sm font-normal text-gray-700 leading-relaxed">
        Les aides sont cumulables dans la plupart des cas. Utilisez notre simulateur
        pour connaître le montant total d'aides auquel vous avez droit pour chaque activité.
      </p>
    </div>
  );
}
