/**
 * LOT 5 - AidCard Component (Updated with Contacts & CTAs)
 * Redesigned aid card with:
 * - Clickable phone numbers
 * - In-app webview links
 * - Primary and secondary CTAs
 * - Contact information (phone, email, website)
 */

import { Building2, Phone, Mail, ExternalLink, Globe } from 'lucide-react';
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

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 transition-all duration-200 hover:border-[#FF8C42] hover:shadow-[0_8px_24px_rgba(255,140,66,0.15)]">
      {/* Header: Title + Category Badge */}
      <div className="flex justify-between items-start mb-3">
        {/* Title */}
        <h3 className="flex-1 font-poppins text-[17px] font-semibold text-gray-900 leading-snug mr-2">
          {aid.name}
        </h3>

        {/* Category Badge */}
        <Badge className="bg-gradient-to-br from-[#DCFCE7] to-[#D1FAE5] text-emerald-600 px-3 py-1 rounded-lg font-poppins text-xs font-semibold border-0 shadow-sm whitespace-nowrap">
          {aid.short_label}
        </Badge>
      </div>

      {/* Territory Scope */}
      <div className="font-poppins text-[13px] font-medium text-gray-400 mb-3 flex items-center gap-1">
        <Globe size={14} />
        {aid.territory_scope}
      </div>

      {/* Who is eligible */}
      <div className="mb-3">
        <p className="font-poppins text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Pour qui ?
        </p>
        <p className="font-poppins text-sm font-normal text-gray-700 leading-relaxed">
          {aid.who}
        </p>
      </div>

      {/* Description */}
      <p className="font-poppins text-sm font-normal text-gray-500 leading-relaxed mb-4">
        {aid.description_parent}
      </p>

      {/* Contacts Section */}
      {(aid.contacts.phone || aid.contacts.email) && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="font-poppins text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Contact
          </p>

          <div className="space-y-2">
            {/* Phone */}
            {aid.contacts.phone && (
              <div>
                {aid.contacts.phone.tel_href ? (
                  <button
                    onClick={() => handlePhoneClick(aid.contacts.phone!.tel_href)}
                    className="flex items-center gap-2 font-poppins text-sm font-medium text-[#4A90E2] hover:text-[#3A7BC2] transition-colors"
                  >
                    <Phone size={14} />
                    {aid.contacts.phone.display}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 font-poppins text-sm font-medium text-gray-600">
                    <Phone size={14} />
                    {aid.contacts.phone.display}
                  </div>
                )}
                {aid.contacts.phone.note && (
                  <p className="font-poppins text-xs text-gray-400 mt-1 ml-5">
                    {aid.contacts.phone.note}
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            {aid.contacts.email && (
              <a
                href={`mailto:${aid.contacts.email}`}
                className="flex items-center gap-2 font-poppins text-sm font-medium text-[#4A90E2] hover:text-[#3A7BC2] transition-colors"
              >
                <Mail size={14} />
                {aid.contacts.email}
              </a>
            )}
          </div>
        </div>
      )}

      {/* CTAs Section */}
      <div className="space-y-2">
        {/* Primary CTA */}
        <button
          onClick={() => handleCTAClick(aid.primary_cta.url, aid.primary_cta.open_mode)}
          className="w-full bg-[#FF8C42] hover:bg-[#FF7A28] text-white font-poppins text-sm font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          {aid.primary_cta.label}
          <ExternalLink size={16} />
        </button>

        {/* Secondary CTAs */}
        {aid.secondary_ctas.map((cta, index) => (
          <button
            key={index}
            onClick={() => handleCTAClick(cta.url, cta.open_mode)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-poppins text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {cta.label}
            <ExternalLink size={14} />
          </button>
        ))}
      </div>
    </div>
  );
}
