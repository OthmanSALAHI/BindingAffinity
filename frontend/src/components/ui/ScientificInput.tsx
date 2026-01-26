import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface ScientificInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const ScientificInput = forwardRef<HTMLInputElement, ScientificInputProps>(
  ({ className, label, error, icon, type = "text", ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-foreground/80">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              "input-scientific w-full",
              icon && "pl-12",
              error && "border-destructive focus:ring-destructive/50",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

ScientificInput.displayName = "ScientificInput";

export { ScientificInput };
