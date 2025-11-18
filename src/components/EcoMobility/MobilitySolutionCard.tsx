/**
 * MobilitySolutionCard Component
 * Supports two modes:
 * - Plain text mode: telephone, permanence, url_info (no click actions)
 * - Legacy mode: contacts, CTAs (with click actions)
 */

import { MobilitySolution, TransportMode } from '@/types/Mobility';
import { Globe, Phone, Mail, ExternalLink, Bus, Bike, Users, Car, Train, Smartphone, Info, Clock } from 'lucide-react';

interface MobilitySolutionCardProps {
  solution: MobilitySolution;
}

const MODE_ICONS: Record<TransportMode, any> = {
  tram: Bus,
  bus: Bus,
  trolleybus: Bus,
  velo_libre_service: Bike,
  covoiturage: Users,
  autopartage: Car,
  train: Train,
  taxi: Car,
  infos_transports: Smartphone,
  infos_ville: Smartphone,
  information_CO2: Info
};

const MODE_COLORS: Record<TransportMode, { color: string; bg: string }> = {
  tram: { color: '#4A90E2', bg: '#EFF6FF' },
  bus: { color: '#4A90E2', bg: '#EFF6FF' },
  trolleybus: { color: '#4A90E2', bg: '#EFF6FF' },
  velo_libre_service: { color: '#10B981', bg: '#DCFCE7' },
  covoiturage: { color: '#FF8C42', bg: '#FFF4E6' },
  autopartage: { color: '#A855F7', bg: '#F3E8FF' },
  train: { color: '#4A90E2', bg: '#EFF6FF' },
  taxi: { color: '#F59E0B', bg: '#FEF3E2' },
  infos_transports: { color: '#6B7280', bg: '#F3F4F6' },
  infos_ville: { color: '#6B7280', bg: '#F3F4F6' },
  information_CO2: { color: '#10B981', bg: '#DCFCE7' }
};

const MODE_LABELS: Record<TransportMode, string> = {
  tram: 'Tram',
  bus: 'Bus',
  trolleybus: 'Trolleybus',
  velo_libre_service: 'Vélo',
  covoiturage: 'Covoiturage',
  autopartage: 'Autopartage',
  train: 'Train',
  taxi: 'Taxi',
  infos_transports: 'Infos transports',
  infos_ville: 'Infos ville',
  information_CO2: 'Info CO₂'
};

export const MobilitySolutionCard = ({ solution }: MobilitySolutionCardProps) => {
  const handleCTAClick = (url: string, openMode: 'in_app_webview' | 'external_tab') => {
    if (openMode === 'external_tab') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // in_app_webview: ouvre dans la même fenêtre pour simuler une webview
      window.location.href = url;
    }
  };

  const handlePhoneClick = (telHref: string | null) => {
    if (telHref) {
      window.location.href = telHref;
    }
  };

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  // Determine if we're in plain text mode (new structure) or legacy mode
  const isPlainTextMode = !!solution.telephone || !!solution.permanence || !!solution.url_info;

  // Mode principal (le premier dans la liste)
  const primaryMode = solution.modes[0];
  const modeStyle = MODE_COLORS[primaryMode] || MODE_COLORS.infos_transports;
  const ModeIcon = MODE_ICONS[primaryMode] || Smartphone;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header with mode badge */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start gap-4">
          {/* Mode Icon */}
          <div
            className="p-3 rounded-xl shrink-0"
            style={{ backgroundColor: modeStyle.bg }}
          >
            <ModeIcon size={24} style={{ color: modeStyle.color }} />
          </div>

          {/* Title and label */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 font-poppins mb-1">
              {solution.name}
            </h3>
            <p className="text-sm font-semibold text-gray-600 font-poppins">
              {solution.short_label}
            </p>
          </div>
        </div>

        {/* Mode badges */}
        <div className="flex gap-2 flex-wrap mt-4">
          {solution.modes.map((mode) => {
            const style = MODE_COLORS[mode] || MODE_COLORS.infos_transports;
            return (
              <div
                key={mode}
                className="px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: style.bg }}
              >
                <span
                  className="text-xs font-bold uppercase font-poppins"
                  style={{ color: style.color }}
                >
                  {MODE_LABELS[mode]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Territory Scope (legacy mode only) */}
        {!isPlainTextMode && solution.territory_scope && (
          <div className="flex items-start gap-2">
            <Globe size={18} className="text-gray-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide font-poppins">
                Périmètre
              </p>
              <p className="text-sm font-medium text-gray-700 font-poppins">
                {solution.territory_scope}
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        {solution.description_courte && (
          <p className="text-sm leading-relaxed text-gray-700 font-poppins">
            {solution.description_courte}
          </p>
        )}

        {solution.description_parent && !solution.description_courte && (
          <p className="text-sm leading-relaxed text-gray-700 font-poppins">
            {solution.description_parent}
          </p>
        )}

        {/* PLAIN TEXT MODE CONTACTS */}
        {isPlainTextMode && (
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide font-poppins">
              Contact
            </p>

            {/* Phone (plain text) */}
            {solution.telephone && (
              <div className="flex items-start gap-2 font-poppins text-xs text-gray-600 leading-snug">
                <Phone size={12} className="text-gray-400 shrink-0 mt-0.5" />
                <span>{solution.telephone}</span>
              </div>
            )}

            {/* Permanence (plain text) */}
            {solution.permanence && (
              <div className="flex items-start gap-2 font-poppins text-[11px] text-gray-500 leading-snug">
                <Clock size={12} className="text-gray-400 shrink-0 mt-0.5" />
                <span>{solution.permanence}</span>
              </div>
            )}

            {/* URL Info (plain text) - truncated for better readability */}
            {solution.url_info && (
              <div className="flex items-start gap-2 font-poppins text-xs text-gray-600">
                <Info size={12} className="text-gray-400 shrink-0 mt-0.5" />
                <span className="truncate">
                  {solution.url_info.replace(/^https?:\/\/(www\.)?/, '')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* LEGACY MODE CONTACTS */}
        {!isPlainTextMode && solution.contacts && (solution.contacts.phone || solution.contacts.email || solution.contacts.website) && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 font-poppins">
              Contact
            </p>
            <div className="space-y-2">
              {/* Phone */}
              {solution.contacts.phone && (
                <div>
                  {solution.contacts.phone.tel_href ? (
                    <button
                      onClick={() => handlePhoneClick(solution.contacts!.phone!.tel_href)}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium font-poppins transition-colors"
                    >
                      <Phone size={14} className="shrink-0" />
                      <span>{solution.contacts.phone.display}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-poppins">
                      <Phone size={14} className="text-gray-400 shrink-0" />
                      <span>{solution.contacts.phone.display}</span>
                    </div>
                  )}
                  {solution.contacts.phone.note && (
                    <p className="text-xs text-gray-500 ml-6 mt-0.5 font-poppins">
                      {solution.contacts.phone.note}
                    </p>
                  )}
                </div>
              )}

              {/* Email */}
              {solution.contacts.email && (
                <button
                  onClick={() => handleEmailClick(solution.contacts!.email!)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium font-poppins transition-colors"
                >
                  <Mail size={14} className="shrink-0" />
                  <span>{solution.contacts.email}</span>
                </button>
              )}

              {/* Website */}
              {solution.contacts.website && (
                <a
                  href={solution.contacts.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium font-poppins transition-colors"
                >
                  <ExternalLink size={14} className="shrink-0" />
                  <span>Site web</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Primary CTA (legacy mode only) */}
        {!isPlainTextMode && solution.primary_cta && (
          <button
            onClick={() => handleCTAClick(solution.primary_cta!.url, solution.primary_cta!.open_mode)}
            className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 font-poppins text-sm shadow-md"
          >
            {solution.primary_cta.label}
          </button>
        )}

        {/* Secondary CTAs (legacy mode only) */}
        {!isPlainTextMode && solution.secondary_ctas && solution.secondary_ctas.length > 0 && (
          <div className="space-y-2">
            {solution.secondary_ctas.map((cta, index) => (
              <button
                key={index}
                onClick={() => handleCTAClick(cta.url, cta.open_mode)}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all font-poppins text-sm"
              >
                {cta.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
