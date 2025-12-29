import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  showStrength?: boolean;
  className?: string;
  autoComplete?: string;
}

const strengthChecks = [
  { label: "8 caractères min", test: (p: string) => p.length >= 8 },
  { label: "1 majuscule", test: (p: string) => /[A-Z]/.test(p) },
  { label: "1 minuscule", test: (p: string) => /[a-z]/.test(p) },
  { label: "1 chiffre", test: (p: string) => /[0-9]/.test(p) },
];

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder = "••••••••",
  showStrength = false,
  className,
  autoComplete = "current-password",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const passedChecks = strengthChecks.filter((c) => c.test(value)).length;
  const strengthPercent = (passedChecks / strengthChecks.length) * 100;
  const strengthColor =
    strengthPercent <= 25
      ? "bg-red-500"
      : strengthPercent <= 50
      ? "bg-orange-500"
      : strengthPercent <= 75
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn("pr-10", className)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="space-y-2">
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-300", strengthColor)}
              style={{ width: `${strengthPercent}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-1">
            {strengthChecks.map((check, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-1 text-xs",
                  check.test(value) ? "text-green-600" : "text-muted-foreground"
                )}
              >
                {check.test(value) ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3" />
                )}
                {check.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PasswordInput;
