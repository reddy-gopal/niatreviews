"use client";

import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  upvoteCount: number;
  downvoteCount: number;
  userVote?: 1 | -1 | null;
  onUpvote: () => void;
  onDownvote: () => void;
  onRemoveUpvote: () => void;
  onRemoveDownvote: () => void;
  onLoginRequired?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function VoteButtons({
  upvoteCount,
  downvoteCount,
  userVote,
  onUpvote,
  onDownvote,
  onRemoveUpvote,
  onRemoveDownvote,
  onLoginRequired,
  disabled,
  isLoading,
  className,
}: VoteButtonsProps) {
  const upvoted = userVote === 1;
  const downvoted = userVote === -1;

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
    if (downvoted) onRemoveDownvote();
    else onDownvote();
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-niat-border bg-[var(--niat-section)] overflow-hidden",
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
          "inline-flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 text-sm transition-colors",
          upvoted
            ? "bg-primary text-primary-foreground"
            : "text-niat-text hover:border-primary/50 hover:bg-primary/10"
        )}
      >
        <ArrowBigUp className="h-5 w-5 shrink-0" aria-hidden />
        <span className="font-medium" aria-live="polite">{upvoteCount}</span>
      </button>
      <button
        type="button"
        onClick={handleDown}
        disabled={disabled || isLoading}
        aria-label="Downvote"
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 text-sm transition-colors",
          downvoted
            ? "bg-red-500/20 text-red-600"
            : "text-niat-text hover:border-red-500/50 hover:bg-red-500/10"
        )}
      >
        <ArrowBigDown className="h-5 w-5 shrink-0" aria-hidden />
        <span className="font-medium" aria-live="polite">{downvoteCount}</span>
      </button>
    </div>
  );
}
