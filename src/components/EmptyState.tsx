import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  /** Use inspiring gradient background style */
  variant?: "default" | "card" | "inspiring";
  /** Optional illustration URL */
  illustration?: string;
}

/**
 * Empty state component for pages with no content
 *
 * Variants:
 * - default: Simple centered layout
 * - card: With subtle card styling
 * - inspiring: With gradient background and larger visuals
 */
export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
  variant = "default",
  illustration,
}: EmptyStateProps) => {
  const baseClasses = "flex flex-col items-center justify-center text-center";

  const variantClasses = {
    default: "py-12 px-4",
    card: "py-12 px-6 bg-card border border-border rounded-2xl shadow-sm",
    inspiring: "py-16 px-6 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 rounded-3xl border border-primary/10",
  };

  const iconContainerClasses = {
    default: "w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4",
    card: "w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5",
    inspiring: "w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 shadow-lg",
  };

  const iconClasses = {
    default: "text-muted-foreground",
    card: "text-primary/70",
    inspiring: "text-primary",
  };

  const iconSize = variant === "inspiring" ? 40 : variant === "card" ? 36 : 32;

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      {illustration ? (
        <img
          src={illustration}
          alt=""
          className="w-32 h-32 object-contain mb-6"
          aria-hidden="true"
        />
      ) : (
        <div className={iconContainerClasses[variant]}>
          <Icon size={iconSize} className={iconClasses[variant]} aria-hidden="true" />
        </div>
      )}

      <h3 className={cn(
        "font-semibold mb-2",
        variant === "inspiring" ? "text-xl text-foreground" : "text-lg"
      )}>
        {title}
      </h3>

      {description && (
        <p className={cn(
          "text-muted-foreground max-w-md",
          variant === "inspiring" ? "text-base mb-8" : "text-sm mb-6"
        )}>
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size={variant === "inspiring" ? "lg" : "default"}
          className={cn(
            "rounded-full",
            variant === "inspiring" && "px-8 shadow-md hover:shadow-lg transition-shadow"
          )}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
