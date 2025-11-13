import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type IconSize = "xs" | "sm" | "md" | "lg";
type IconColor = "default" | "primary" | "muted" | "success" | "accent";

interface AppIconProps {
  Icon: LucideIcon;
  size?: IconSize;
  color?: IconColor;
  title?: string;
  className?: string;
  "data-testid"?: string;
}

const SIZE_MAP: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
};

const COLOR_MAP: Record<IconColor, string> = {
  default: "currentColor",
  primary: "hsl(var(--primary))",
  muted: "hsl(var(--text-muted))",
  success: "hsl(var(--success-green))",
  accent: "hsl(var(--accent))",
};

export const AppIcon = ({
  Icon,
  size = "md",
  color = "default",
  title,
  className,
  "data-testid": testId,
}: AppIconProps) => {
  const pixelSize = SIZE_MAP[size];
  const strokeColor = COLOR_MAP[color];

  return (
    <Icon
      size={pixelSize}
      strokeWidth={1.75}
      style={{ color: strokeColor }}
      className={cn(className)}
      aria-hidden={!title}
      aria-label={title}
      data-testid={testId}
    />
  );
};
