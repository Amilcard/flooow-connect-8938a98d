/**
 * LOT 5 - AidsSectionsList Component
 * Organizes aids into sections (School Year / Vacations)
 * With section headers (icon + title) and grid layout
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
      bg_light: '#EFF6FF',
      aids: schoolYearAids
    },
    {
      id: 'vacations',
      title: 'Vacances & séjours',
      icon: Palmtree,
      color: '#10B981',
      bg_light: '#DCFCE7',
      aids: vacationsAids
    }
  ];

  return (
    <div>
      {sections.map((section) => (
        <div key={section.id} style={{ marginBottom: '40px' }}>
          {/* Section Header */}
          <div style={{
            margin: '32px 16px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Icon Container */}
            <div style={{
              width: '40px',
              height: '40px',
              background: section.bg_light,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <section.icon size={24} color={section.color} />
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '20px',
              fontWeight: 700,
              color: '#111827',
              margin: 0
            }}>
              {section.title}
            </h2>
          </div>

          {/* Aids Grid */}
          <div style={{
            padding: '0 16px',
            display: 'grid',
            gap: '12px',
            gridTemplateColumns: '1fr'
          }}
          className="aids-grid">
            {section.aids.map((aid) => (
              <AidCard key={aid.id} aid={aid} />
            ))}
          </div>
        </div>
      ))}

      {/* Responsive Grid Styles */}
      <style>{`
        @media (min-width: 641px) {
          .aids-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (min-width: 1025px) {
          .aids-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
