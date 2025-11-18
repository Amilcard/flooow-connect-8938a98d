/**
 * LOT 5 - SimulatorCTABanner Component
 * Prominent blue banner with Calculator icon, GRATUIT badge, and CTA button
 * CRITICAL: Must be impossible to miss - main conversion point
 */

import { Calculator, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SimulatorCTABanner() {
  const navigate = useNavigate();

  const handleSimulate = () => {
    // Navigate to simulator page
    navigate('/simulator');
  };

  return (
    <div style={{
      margin: '20px 16px',
      background: 'linear-gradient(135deg, #DBEAFE 0%, #E0E7FF 100%)',
      border: '2px solid #3B82F6',
      borderRadius: '16px',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0px 4px 16px rgba(59, 130, 246, 0.15)',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }}
    onClick={handleSimulate}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0px 6px 20px rgba(59, 130, 246, 0.25)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0px 4px 16px rgba(59, 130, 246, 0.15)';
    }}>
      {/* GRATUIT Badge */}
      <span style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: '#3B82F6',
        color: '#FFFFFF',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        fontFamily: 'Poppins, sans-serif'
      }}>
        GRATUIT
      </span>

      {/* Large Calculator Icon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '64px',
        height: '64px',
        background: '#FFFFFF',
        borderRadius: '16px',
        marginBottom: '16px',
        boxShadow: '0px 4px 12px rgba(59, 130, 246, 0.2)'
      }}>
        <Calculator size={36} color="#3B82F6" />
      </div>

      {/* Title */}
      <h2 style={{
        fontFamily: 'Poppins, sans-serif',
        fontSize: '20px',
        fontWeight: 700,
        color: '#111827',
        marginBottom: '8px',
        lineHeight: 1.3,
        margin: '0 0 8px 0'
      }}>
        Estimez vos aides en quelques clics
      </h2>

      {/* Description */}
      <p style={{
        fontFamily: 'Poppins, sans-serif',
        fontSize: '14px',
        fontWeight: 400,
        color: '#374151',
        lineHeight: 1.6,
        marginBottom: '16px',
        margin: '0 0 16px 0'
      }}>
        Notre simulateur identifie automatiquement les aides auxquelles vous avez droit pour chaque activité.
        Simple, rapide et confidentiel.
      </p>

      {/* CTA Button */}
      <button
        style={{
          background: '#FF8C42',
          color: '#FFFFFF',
          padding: '14px 24px',
          borderRadius: '12px',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '16px',
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#FF7A28';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0px 6px 20px rgba(255, 140, 66, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#FF8C42';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleSimulate();
        }}
      >
        <Calculator size={20} />
        Estimer mes aides maintenant
        <ArrowRight size={20} />
      </button>
    </div>
  );
}
