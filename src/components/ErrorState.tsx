import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState = ({
  title = "Une erreur est survenue",
  message,
  onRetry,
  retryLabel = "Réessayer",
  className,
}: ErrorStateProps) => {
  return (
    <div className={cn("py-8 px-4", className)}>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              {retryLabel}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};
