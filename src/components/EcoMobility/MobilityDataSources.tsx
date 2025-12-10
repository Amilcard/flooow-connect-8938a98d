/**
 * MobilityDataSources Component
 * Info box styled like FinancialAid's AidsInfoBox
 * Shows data sources with Lightbulb icon
 */

import { Lightbulb } from 'lucide-react';

interface DataSource {
  code: string;
  label: string;
  description_parent: string;
  website: string;
}

interface MobilityDataSourcesProps {
  sources: DataSource[];
}

export function MobilityDataSources({ sources }: MobilityDataSourcesProps) {
  return (
    <div className="my-8 bg-gradient-to-br from-[#FEF3E2] to-[#FFE8CC] border-l-4 border-amber-500 rounded-xl p-5 shadow-[0_4px_12px_rgba(245,158,11,0.1)]">
      {/* Icon + Title Row */}
      <div className="flex items-center gap-2.5 mb-3">
        <Lightbulb size={24} className="text-amber-500" />
        <h3 className="font-poppins text-base font-bold text-foreground">
          Sources des données CO₂
        </h3>
      </div>

      {/* Sources List */}
      <div className="space-y-3">
        {sources.map((source) => (
          <div key={source.code} className="space-y-1">
            <p className="font-poppins text-sm font-semibold text-foreground">
              {source.label}
            </p>
            <p className="font-poppins text-xs text-muted-foreground leading-relaxed">
              {source.description_parent}
            </p>
            <p className="font-poppins text-xs text-muted-foreground">
              {source.website.replace(/^https?:\/\/(www\.)?/, '')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
