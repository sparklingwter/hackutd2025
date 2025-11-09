import { Sparkles } from "lucide-react";
import { DISCLAIMERS } from "~/config/disclaimers";

interface AiBadgeProps {
  variant?: "inline" | "tooltip" | "banner";
  showDisclosure?: boolean;
}

export function AiBadge({ variant = "inline", showDisclosure = false }: AiBadgeProps) {
  if (variant === "banner" && showDisclosure) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-100">
              AI-Powered Recommendations
            </p>
            <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
              {DISCLAIMERS.aiDisclosure}
            </p>
            <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
              Powered by Google Gemini
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "tooltip") {
    return (
      <div
        className="group relative inline-flex cursor-help items-center gap-1.5 text-sm text-muted-foreground"
        title={DISCLAIMERS.aiDisclosure}
      >
        <Sparkles className="h-4 w-4" />
        <span>AI-Powered</span>
        {showDisclosure && (
          <div className="invisible absolute bottom-full left-0 z-10 mb-2 w-64 rounded-lg border bg-popover p-3 text-xs text-popover-foreground shadow-lg group-hover:visible">
            {DISCLAIMERS.aiDisclosure}
          </div>
        )}
      </div>
    );
  }

  // Default inline variant
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
      <Sparkles className="h-3.5 w-3.5" />
      <span>Powered by Gemini</span>
    </div>
  );
}
