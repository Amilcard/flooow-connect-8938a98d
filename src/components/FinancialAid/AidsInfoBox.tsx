/**
 * LOT 5 - AidsInfoBox Component
 * Enhanced "Bon à savoir" info box with Lightbulb icon
 * Educates users about aid estimation
 * Refactored with Tailwind CSS for consistency
 */
import { Lightbulb } from 'lucide-react';

export function AidsInfoBox() {
  return (
    <div className="my-8 bg-gradient-to-br from-[#FEF3E2] to-[#FFE8CC] border-l-4 border-amber-500 rounded-xl p-5 shadow-[0_4px_12px_rgba(245,158,11,0.1)]">
      {/* Icon + Title Row */}
      <div className="flex items-center gap-2.5 mb-3">
        <Lightbulb size={24} className="text-amber-500" />
        <h3 className="font-poppins text-base font-bold text-foreground">
          Bon à savoir
        </h3>
      </div>
      {/* Content */}
      <p className="font-poppins text-sm font-normal text-muted-foreground leading-relaxed">
        Les aides sont souvent cumulables. Ces montants sont des estimations basées sur vos informations. Ils seront confirmés par les organismes concernés lors de votre inscription.
      </p>
    </div>
  );
}
