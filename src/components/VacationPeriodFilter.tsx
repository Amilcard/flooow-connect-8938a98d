import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface VacationPeriodFilterProps {
  selectedPeriod?: string;
  onPeriodChange: (period?: string) => void;
}

const VACATION_PERIODS = [
  { value: "printemps_2026", label: "Vacances Printemps 2026", emoji: "🌸" },
  { value: "été_2026", label: "Été 2026", emoji: "☀️" },
];

// Dates de référence pour les périodes
export const VACATION_PERIOD_DATES = {
  printemps_2026: {
    start: "2026-04-04",
    end: "2026-04-20",
  },
  été_2026: {
    start: "2026-07-04",
    end: "2026-08-31",
  },
} as const;

export const VacationPeriodFilter = ({
  selectedPeriod,
  onPeriodChange,
}: VacationPeriodFilterProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handlePeriodChange = (period?: string) => {
    onPeriodChange(period);
    
    // Update URL to preserve period selection when navigating
    const newParams = new URLSearchParams(searchParams);
    if (period) {
      newParams.set('period', period);
    } else {
      newParams.delete('period');
    }
    navigate(`?${newParams.toString()}`, { replace: true });
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4 justify-center">
      <Button
        variant={!selectedPeriod ? "default" : "outline"}
        size="sm"
        onClick={() => handlePeriodChange(undefined)}
        className="flex items-center gap-2"
      >
        <Calendar size={16} />
        Toutes périodes
      </Button>
      {VACATION_PERIODS.map((period) => (
        <Button
          key={period.value}
          variant={selectedPeriod === period.value ? "default" : "outline"}
          size="sm"
          onClick={() => handlePeriodChange(period.value)}
          className="flex items-center gap-2"
        >
          <span>{period.emoji}</span>
          {period.label}
        </Button>
      ))}
    </div>
  );
};
