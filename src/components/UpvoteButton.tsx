"use client";

import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpvoteButtonProps {
  /** Display count (for posts use score = upvote_count - downvote_count; for comments use upvote_count) */
  count: number;
  upvoted?: boolean;
  downvoted?: boolean;
  onUpvote: () => void;
  onDownvote?: () => void;
  onRemoveUpvote: () => void;
  onLoginRequired?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  /** post = accent-1 (amber), comment = accent-2 (orange) */
  variant?: "post" | "comment";
  /** Show text labels beside icons on larger screens */
  showLabels?: boolean;
}

export function UpvoteButton({
  count,
  upvoted,
  downvoted,
  onUpvote,
  onDownvote,
  onRemoveUpvote,
  onLoginRequired,
  disabled,
  isLoading,
  className,
  variant = "post",
  showLabels = false,
}: UpvoteButtonProps) {
  const handleUp = () => {
    if (isLoading) return;
    if (disabled) {
      onLoginRequired?.();
      return;
    }
    if (upvoted) onRemoveUpvote();
    else onUpvote();
  };

  const handleDown = () => {
    if (isLoading) return;
    if (disabled) {
      onLoginRequired?.();
      return;
    }
    if (downvoted) onRemoveUpvote();
    else if (onDownvote) onDownvote();
    else if (upvoted) onRemoveUpvote();
  };

  const hover = variant === "post" ? "hover:border-accent-1 hover:bg-accent-1/10" : "hover:border-accent-2 hover:bg-accent-2/10";
  const downHover = variant === "post" ? "hover:border-red-500/50 hover:bg-red-500/10" : "hover:border-accent-2 hover:bg-accent-2/10";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0 rounded-xl border border-niat-border bg-[var(--niat-section)] shadow-soft overflow-hidden min-h-[44px] sm:min-h-0",
        (disabled || isLoading) && "opacity-60",
        className
      )}
    >
      <button
        type="button"
        onClick={handleUp}
        disabled={disabled || isLoading}
        aria-label="Upvote"
        className={cn(
          "inline-flex items-center gap-1.5 p-1.5 sm:p-2 transition-colors",
          upvoted
            ? "border-primary bg-primary text-primary-foreground"
            : cn("text-niat-text", hover)
        )}
      >
        <ArrowBigUp className="h-5 w-5 shrink-0" aria-hidden />
        {showLabels && <span className="hidden sm:inline text-sm font-medium">Upvote</span>}
      </button>
      <span className="min-w-[2ch] text-center text-sm font-semibold text-niat-text px-1.5 py-1.5 sm:px-2" aria-live="polite">
        {count}
      </span>
      <button
        type="button"
        onClick={handleDown}
        disabled={disabled || isLoading}
        aria-label="Downvote"
        className={cn(
          "inline-flex items-center gap-1.5 p-1.5 sm:p-2 transition-colors",
          downvoted ? "border-red-500/70 bg-red-500/20 text-red-600 dark:text-red-400" : cn("text-niat-text", downHover)
        )}
      >
        <ArrowBigDown className="h-5 w-5 shrink-0" aria-hidden />
        {showLabels && <span className="hidden sm:inline text-sm font-medium">Downvote</span>}
      </button>
    </div>
  );
}
