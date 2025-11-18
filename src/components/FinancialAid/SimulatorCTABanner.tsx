/**
 * LOT 5 - SimulatorCTABanner Component
 * Prominent blue banner with Calculator icon, GRATUIT badge, and CTA button
 * CRITICAL: Must be impossible to miss - main conversion point
 * Refactored with Tailwind CSS for consistency
 */

import { Calculator, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function SimulatorCTABanner() {
  const navigate = useNavigate();

  const handleSimulate = () => {
    // Navigate to simulator page
    navigate('/aides/simulateur');
  };

  return (
    <div
      className="my-5 bg-gradient-to-br from-[#DBEAFE] to-[#E0E7FF] border-2 border-blue-500 rounded-2xl p-5 relative overflow-hidden shadow-[0_4px_16px_rgba(59,130,246,0.15)] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(59,130,246,0.25)]"
      onClick={handleSimulate}
    >
      {/* GRATUIT Badge */}
      <span className="absolute top-3 right-3 bg-blue-500 text-white px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase font-poppins">
        GRATUIT
      </span>

      {/* Large Calculator Icon */}
      <div className="flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-[0_4px_12px_rgba(59,130,246,0.2)]">
        <Calculator size={36} className="text-blue-500" />
      </div>

      {/* Title */}
      <h2 className="font-poppins text-xl font-bold text-gray-900 mb-2 leading-snug">
        Estimez vos aides en quelques clics
      </h2>

      {/* Description */}
      <p className="font-poppins text-sm font-normal text-gray-700 leading-relaxed mb-4">
        Notre simulateur identifie automatiquement les aides auxquelles vous avez droit pour chaque activité.
        Simple, rapide et confidentiel.
      </p>

      {/* CTA Button */}
      <Button
        onClick={(e) => {
          e.stopPropagation();
          handleSimulate();
        }}
        className="w-full bg-[#FF8C42] hover:bg-[#FF7A28] text-white py-3.5 px-6 rounded-xl font-poppins text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,140,66,0.3)] flex items-center justify-center gap-2"
      >
        <Calculator size={20} />
        Estimer mes aides maintenant
        <ArrowRight size={20} />
      </Button>
    </div>
  );
}
