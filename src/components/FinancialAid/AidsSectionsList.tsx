/**
 * LOT 5 - AidsSectionsList Component
 * Organizes aids into sections (School Year / Vacations)
 * With section headers (icon + title) and responsive grid
 * Refactored with Tailwind CSS for consistency
 */

import { GraduationCap, Palmtree } from 'lucide-react';
import { AidCard } from './AidCard';
import { FinancialAid } from '@/types/FinancialAid';

interface AidsSectionsListProps {
  schoolYearAids: FinancialAid[];
  vacationsAids: FinancialAid[];
}

export function AidsSectionsList({ schoolYearAids, vacationsAids }: AidsSectionsListProps) {
  const sections = [
    {
      id: 'school_year',
      title: 'Pendant l\'année scolaire',
      icon: GraduationCap,
      color: '#4A90E2',
      bgLight: 'bg-blue-50',
      iconColor: 'text-[#4A90E2]',
      aids: schoolYearAids
    },
    {
      id: 'vacations',
      title: 'Vacances & séjours',
      icon: Palmtree,
      color: '#10B981',
      bgLight: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      aids: vacationsAids
    }
  ];

  return (
    <div>
      {sections.map((section) => (
        <div key={section.id} className="mb-10">
          {/* Section Header */}
          <div className="mt-8 mb-4 flex items-center gap-3">
            {/* Icon Container */}
            <div className={`w-10 h-10 ${section.bgLight} rounded-[10px] flex items-center justify-center`}>
              <section.icon size={24} className={section.iconColor} />
            </div>

            {/* Title */}
            <h2 className="font-poppins text-xl font-bold text-foreground">
              {section.title}
            </h2>
          </div>

          {/* Aids Grid - Responsive: 2 cols mobile, 3 cols desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {section.aids.map((aid) => (
              <AidCard key={aid.id} aid={aid} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
