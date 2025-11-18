/**
 * LOT 5 - AidCard Component
 * Redesigned aid card with:
 * - Hover effects
 * - Amount badge (prominent green gradient)
 * - Age/Type chips
 * - Eligibility indicators
 * - Organizer info
 * - CTA link
 * Refactored with Tailwind CSS for consistency
 */

import { Baby, Building2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { FinancialAid } from '@/types/FinancialAid';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface AidCardProps {
  aid: FinancialAid;
}

export function AidCard({ aid }: AidCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to aid detail page
    navigate(`/aide/${aid.id}`);
  };

  return (
    <div
      className="bg-white border-2 border-gray-200 rounded-2xl p-5 transition-all duration-200 cursor-pointer hover:border-[#FF8C42] hover:shadow-[0_8px_24px_rgba(255,140,66,0.15)] hover:-translate-y-1 group"
      onClick={handleClick}
    >
      {/* Header: Title + Amount Badge */}
      <div className="flex justify-between items-start mb-3">
        {/* Title */}
        <h3 className="flex-1 font-poppins text-[17px] font-semibold text-gray-900 leading-snug mr-2">
          {aid.title}
        </h3>

        {/* Amount Badge */}
        <div className="bg-gradient-to-br from-[#DCFCE7] to-[#D1FAE5] text-emerald-500 px-3 py-1.5 rounded-lg font-poppins text-[15px] font-bold whitespace-nowrap shadow-[0_2px_6px_rgba(16,185,129,0.2)]">
          {aid.amount}
        </div>
      </div>

      {/* Meta Chips Row: Age + Type */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {/* Age Chip */}
        <Badge variant="secondary" className="inline-flex items-center gap-1 bg-blue-50 text-[#4A90E2] px-2.5 py-1 rounded-md font-poppins text-[13px] font-semibold border-0">
          <Baby size={14} />
          {aid.age_range}
        </Badge>

        {/* Type Chip */}
        <Badge variant="secondary" className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-poppins text-xs font-medium border-0">
          {aid.type}
        </Badge>
      </div>

      {/* Description */}
      <p className="font-poppins text-sm font-normal text-gray-500 leading-relaxed mb-3 line-clamp-3">
        {aid.description}
      </p>

      {/* Organizer */}
      <div className="font-poppins text-[13px] font-medium text-gray-400 mb-4 flex items-center gap-1">
        <Building2 size={14} />
        {aid.organizer}
      </div>

      {/* Footer: Eligibility + CTA */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        {/* Eligibility Indicator */}
        {aid.is_eligible && (
          <div className="flex items-center gap-1 font-poppins text-[13px] font-semibold text-emerald-500">
            <CheckCircle size={16} className="text-emerald-500" />
            Éligible
          </div>
        )}

        {aid.check_eligibility_needed && !aid.is_eligible && (
          <div className="flex items-center gap-1 font-poppins text-[13px] font-semibold text-amber-500">
            <AlertCircle size={16} className="text-amber-500" />
            Vérifier
          </div>
        )}

        {!aid.is_eligible && !aid.check_eligibility_needed && (
          <div className="w-20"></div>
        )}

        {/* CTA Link */}
        <div className="text-[#FF8C42] font-poppins text-sm font-semibold flex items-center gap-1 transition-all duration-200 group-hover:gap-2">
          En savoir plus
          <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
}
