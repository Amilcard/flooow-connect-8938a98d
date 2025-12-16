/**
 * LOT 5 - AidCard Component (Updated with Plain Text Contacts)
 * Supports two modes:
 * - Plain text mode: telephone, permanence, url_info (no click actions)
 * - Legacy mode: contacts, CTAs (with click actions)
 */

import { Building2, Phone, Mail, ExternalLink, Globe, Clock, Info } from 'lucide-react';
import { FinancialAid } from '@/types/FinancialAid';
import { Badge } from '@/components/ui/badge';

interface AidCardProps {
  aid: FinancialAid;
}

export function AidCard({ aid }: AidCardProps) {
  const handleCTAClick = (url: string, openMode: string) => {
    // In-app webview mode (if supported by platform)
    if (openMode === 'in_app_webview') {
      // For web, open in new tab - mobile app can intercept and open webview
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePhoneClick = (telHref: string | null) => {
    if (telHref) {
      window.location.href = telHref;
    }
  };

  // Determine if we're in plain text mode (new structure) or legacy mode
  const isPlainTextMode = !!aid.telephone || !!aid.permanence || !!aid.url_info;

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-5 transition-all duration-200 hover:border-primary hover:shadow-[0_8px_24px_rgba(255,140,66,0.15)]">
      {/* Header: Title + Category Badge */}
      <div className="flex justify-between items-start mb-3">
        {/* Title */}
        <h3 className="flex-1 font-poppins text-[17px] font-semibold text-foreground leading-snug mr-2">
          {aid.name}
        </h3>

        {/* Category Badge */}
        <Badge className="bg-gradient-to-br from-[#DCFCE7] to-[#D1FAE5] text-emerald-600 px-3 py-1 rounded-lg font-poppins text-xs font-semibold border-0 shadow-sm whitespace-nowrap">
          {aid.short_label}
        </Badge>
      </div>

      {/* Territory Scope (legacy mode only) */}
      {!isPlainTextMode && aid.territory_scope && (
        <div className="font-poppins text-[13px] font-medium text-muted-foreground mb-3 flex items-center gap-1">
          <Globe size={14} />
          {aid.territory_scope}
        </div>
      )}

      {/* Category indicator for plain text mode */}
      {isPlainTextMode && (
        <div className="font-poppins text-[13px] font-medium text-muted-foreground mb-3 capitalize">
          {aid.category.replace(/_/g, ' ')}
        </div>
      )}

      {/* Description */}
      {aid.description_courte && (
        <p className="font-poppins text-sm font-normal text-foreground leading-relaxed mb-4">
          {aid.description_courte}
        </p>
      )}

      {aid.description_parent && !aid.description_courte && (
        <p className="font-poppins text-sm font-normal text-foreground leading-relaxed mb-4">
          {aid.description_parent}
        </p>
      )}

      {/* Who is eligible (legacy mode) */}
      {!isPlainTextMode && aid.who && (
        <div className="mb-3">
          <p className="font-poppins text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Pour qui ?
          </p>
          <p className="font-poppins text-sm font-normal text-foreground leading-relaxed">
            {aid.who}
          </p>
        </div>
      )}

      {/* PLAIN TEXT MODE CONTACTS */}
      {isPlainTextMode && (
        <div className="space-y-2 mb-4 pb-4 border-b border-border">
          <p className="font-poppins text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Contact
          </p>

          {/* Phone (plain text) */}
          {aid.telephone && (
            <div className="flex items-start gap-2 font-poppins text-xs text-muted-foreground leading-snug">
              <Phone size={12} className="text-muted-foreground shrink-0 mt-0.5" />
              <span>{aid.telephone}</span>
            </div>
          )}

          {/* Permanence (plain text) */}
          {aid.permanence && (
            <div className="flex items-start gap-2 font-poppins text-[11px] text-muted-foreground leading-snug">
              <Clock size={12} className="text-muted-foreground shrink-0 mt-0.5" />
              <span>{aid.permanence}</span>
            </div>
          )}

          {/* URL Info (plain text) - truncated for better readability */}
          {aid.url_info && (
            <div className="flex items-start gap-2 font-poppins text-xs text-muted-foreground">
              <Info size={12} className="text-muted-foreground shrink-0 mt-0.5" />
              <span className="truncate">
                {aid.url_info.replace(/^https?:\/\/(www\.)?/, '')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* LEGACY MODE CONTACTS */}
      {!isPlainTextMode && aid.contacts && (aid.contacts.phone || aid.contacts.email) && (
        <div className="mb-4 pb-4 border-b border-border">
          <p className="font-poppins text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Contact
          </p>

          <div className="space-y-2">
            {/* Phone */}
            {aid.contacts.phone && (
              <div>
                {aid.contacts.phone.tel_href ? (
                  <button
                    onClick={() => handlePhoneClick(aid.contacts.phone?.tel_href ?? '')}
                    className="flex items-center gap-2 font-poppins text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <Phone size={14} />
                    {aid.contacts.phone.display}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 font-poppins text-sm font-medium text-muted-foreground">
                    <Phone size={14} />
                    {aid.contacts.phone.display}
                  </div>
                )}
                {aid.contacts.phone.note && (
                  <p className="font-poppins text-xs text-muted-foreground mt-1 ml-5">
                    {aid.contacts.phone.note}
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            {aid.contacts.email && (
              <a
                href={`mailto:${aid.contacts.email}`}
                className="flex items-center gap-2 font-poppins text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Mail size={14} />
                {aid.contacts.email}
              </a>
            )}
          </div>
        </div>
      )}

      {/* CTAs Section (legacy mode only) */}
      {!isPlainTextMode && aid.primary_cta && (
        <div className="space-y-2">
          {/* Primary CTA */}
          <button
            onClick={() => handleCTAClick(aid.primary_cta?.url ?? '', aid.primary_cta?.open_mode)}
            className="w-full bg-primary hover:bg-primary/90 text-white font-poppins text-sm font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {aid.primary_cta.label}
            <ExternalLink size={16} />
          </button>

          {/* Secondary CTAs */}
          {aid.secondary_ctas && aid.secondary_ctas.map((cta, index) => (
            <button
              key={index}
              onClick={() => handleCTAClick(cta.url, cta.open_mode)}
              className="w-full bg-muted hover:bg-muted/80 text-foreground font-poppins text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {cta.label}
              <ExternalLink size={14} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
