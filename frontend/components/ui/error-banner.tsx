import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw, X } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  className?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, className, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-sm",
        className
      )}
    >
      <div className="mt-0.5 shrink-0 rounded-full bg-red-500/10 p-1">
        <AlertCircle className="h-3.5 w-3.5 text-red-500/70" />
      </div>
      <p className="flex-1 text-muted-foreground leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      )}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
