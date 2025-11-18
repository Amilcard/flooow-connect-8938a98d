/**
 * LOT 5 - AidsInfoBox Component
 * Enhanced "Bon à savoir" info box with Lightbulb icon
 * Educates users about aid cumulation
 */

import { Lightbulb } from 'lucide-react';

export function AidsInfoBox() {
  return (
    <div style={{
      margin: '32px 16px',
      background: 'linear-gradient(135deg, #FEF3E2 0%, #FFE8CC 100%)',
      borderLeft: '4px solid #F59E0B',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0px 4px 12px rgba(245, 158, 11, 0.1)'
    }}>
      {/* Icon + Title Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px'
      }}>
        <Lightbulb size={24} color="#F59E0B" />
        <h3 style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: '16px',
          fontWeight: 700,
          color: '#111827',
          margin: 0
        }}>
          Bon à savoir
        </h3>
      </div>

      {/* Content */}
      <p style={{
        fontFamily: 'Poppins, sans-serif',
        fontSize: '14px',
        fontWeight: 400,
        color: '#374151',
        lineHeight: 1.6,
        margin: 0
      }}>
        Les aides sont cumulables dans la plupart des cas. Utilisez notre simulateur
        pour connaître le montant total d'aides auquel vous avez droit pour chaque activité.
      </p>
    </div>
  );
}
