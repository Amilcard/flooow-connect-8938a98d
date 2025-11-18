/**
 * LOT 5 - FinancialAidHeader Component
 * Enhanced header with gradient background, Coins icon, and proper typography
 */

import { Coins } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

export function FinancialAidHeader() {
  return (
    <div className="financial-aid-header" style={{
      position: 'relative',
      background: 'linear-gradient(135deg, #FEF3E2 0%, #FFE8CC 100%)',
      padding: '24px 16px',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        transform: 'rotate(15deg)',
        opacity: 0.08,
        zIndex: 1
      }}>
        <Coins size={120} color="#F59E0B" />
      </div>

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 2
      }}>
        {/* Back Button */}
        <div style={{ marginBottom: '16px' }}>
          <BackButton />
        </div>

        {/* Icon + Title Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          {/* Icon Container */}
          <div style={{
            width: '48px',
            height: '48px',
            background: '#FFFFFF',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0px 2px 8px rgba(245, 158, 11, 0.2)'
          }}>
            <Coins size={28} color="#F59E0B" />
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '24px',
            fontWeight: 700,
            color: '#111827',
            lineHeight: 1.2,
            margin: 0
          }}>
            Aides financières
          </h1>
        </div>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: '15px',
          fontWeight: 400,
          color: '#6B7280',
          lineHeight: 1.5,
          marginTop: '8px',
          marginBottom: 0
        }}>
          Réduisez le coût des activités pour vos enfants grâce aux aides disponibles
        </p>
      </div>
    </div>
  );
}
