import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AdvancedFiltersFooterProps {
  onClear: () => void;
  onApply: () => void;
  resultsCount: number;
  isCountLoading: boolean;
}

export const AdvancedFiltersFooter = ({
  onClear,
  onApply,
  resultsCount,
  isCountLoading
}: AdvancedFiltersFooterProps) => {
  return (
    <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex gap-3 z-20">
      <Button
        variant="outline"
        onClick={onClear}
        className="flex-1 h-12 text-base font-medium font-poppins border-2 hover:bg-gray-50"
      >
        Réinitialiser
      </Button>
      <Button
        onClick={onApply}
        className="flex-[2] h-12 text-base font-medium font-poppins bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
      >
        {isCountLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          `Voir ${resultsCount} résultats`
        )}
      </Button>
    </div>
  );
};
