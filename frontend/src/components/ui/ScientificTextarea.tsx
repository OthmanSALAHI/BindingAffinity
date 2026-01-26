import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

interface ScientificTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const ScientificTextarea = forwardRef<HTMLTextAreaElement, ScientificTextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-foreground/80">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "input-scientific w-full min-h-[120px] resize-none font-mono text-sm",
            error && "border-destructive focus:ring-destructive/50",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

ScientificTextarea.displayName = "ScientificTextarea";

export { ScientificTextarea };
