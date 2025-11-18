/**
 * LOT 5 - AidCard Component
 * Redesigned aid card with:
 * - Hover effects
 * - Amount badge (prominent green gradient)
 * - Age/Type chips
 * - Eligibility indicators
 * - Organizer info
 * - CTA link
 */

import { Baby, Building2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { FinancialAid } from '@/types/FinancialAid';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface AidCardProps {
  aid: FinancialAid;
}

export function AidCard({ aid }: AidCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    // Navigate to aid detail page
    navigate(`/aide/${aid.id}`);
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: `2px solid ${isHovered ? '#FF8C42' : '#E5E7EB'}`,
        borderRadius: '16px',
        padding: '20px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        boxShadow: isHovered ? '0px 8px 24px rgba(255, 140, 66, 0.15)' : 'none',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Header: Title + Amount Badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        {/* Title */}
        <h3 style={{
          flex: 1,
          fontFamily: 'Poppins, sans-serif',
          fontSize: '17px',
          fontWeight: 600,
          color: '#111827',
          lineHeight: 1.3,
          marginRight: '8px',
          margin: 0
        }}>
          {aid.title}
        </h3>

        {/* Amount Badge */}
        <div style={{
          background: 'linear-gradient(135deg, #DCFCE7 0%, #D1FAE5 100%)',
          color: '#10B981',
          padding: '6px 12px',
          borderRadius: '8px',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '15px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          boxShadow: '0px 2px 6px rgba(16, 185, 129, 0.2)'
        }}>
          {aid.amount}
        </div>
      </div>

      {/* Meta Chips Row: Age + Type */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
        flexWrap: 'wrap'
      }}>
        {/* Age Chip */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: '#EFF6FF',
          color: '#4A90E2',
          padding: '4px 10px',
          borderRadius: '6px',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '13px',
          fontWeight: 600
        }}>
          <Baby size={14} />
          {aid.age_range}
        </span>

        {/* Type Chip */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: '#F3F4F6',
          color: '#6B7280',
          padding: '4px 10px',
          borderRadius: '6px',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '12px',
          fontWeight: 500
        }}>
          {aid.type}
        </span>
      </div>

      {/* Description */}
      <p style={{
        fontFamily: 'Poppins, sans-serif',
        fontSize: '14px',
        fontWeight: 400,
        color: '#6B7280',
        lineHeight: 1.6,
        marginBottom: '12px',
        margin: '0 0 12px 0',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {aid.description}
      </p>

      {/* Organizer */}
      <div style={{
        fontFamily: 'Poppins, sans-serif',
        fontSize: '13px',
        fontWeight: 500,
        color: '#9CA3AF',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <Building2 size={14} />
        {aid.organizer}
      </div>

      {/* Footer: Eligibility + CTA */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '16px',
        borderTop: '1px solid #E5E7EB'
      }}>
        {/* Eligibility Indicator */}
        {aid.is_eligible && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            color: '#10B981'
          }}>
            <CheckCircle size={16} color="#10B981" />
            Éligible
          </div>
        )}

        {aid.check_eligibility_needed && !aid.is_eligible && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            color: '#F59E0B'
          }}>
            <AlertCircle size={16} color="#F59E0B" />
            Vérifier
          </div>
        )}

        {!aid.is_eligible && !aid.check_eligibility_needed && (
          <div style={{ width: '80px' }}></div>
        )}

        {/* CTA Link */}
        <div style={{
          color: '#FF8C42',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: isHovered ? '8px' : '4px',
          transition: 'all 0.2s ease'
        }}>
          En savoir plus
          <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
}
