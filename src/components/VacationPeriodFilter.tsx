import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface VacationPeriodFilterProps {
  selectedPeriod?: string;
  onPeriodChange: (period?: string) => void;
}

const VACATION_PERIODS = [
  { value: "février_2025", label: "Vacances Février 2025", emoji: "❄️" },
  { value: "printemps_2025", label: "Vacances Printemps 2025", emoji: "🌸" },
  { value: "été_2025", label: "Vacances Été 2025", emoji: "☀️" },
];

export const VacationPeriodFilter = ({
  selectedPeriod,
  onPeriodChange,
}: VacationPeriodFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        variant={!selectedPeriod ? "default" : "outline"}
        size="sm"
        onClick={() => onPeriodChange(undefined)}
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
          onClick={() => onPeriodChange(period.value)}
          className="flex items-center gap-2"
        >
          <span>{period.emoji}</span>
          {period.label}
        </Button>
      ))}
    </div>
  );
};
