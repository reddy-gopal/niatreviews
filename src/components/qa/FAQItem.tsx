"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, User, CheckCircle } from "lucide-react";
import type { Question } from "@/types/question";
import { VoteButtons } from "./VoteButtons";
import { useAnswerVote } from "@/hooks/useAnswerVote";
import { useToast } from "@/components/Toast";
import { isAuthenticated } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { MarkdownBody } from "@/components/MarkdownBody";

interface FAQItemProps {
  question: Question;
}

export function FAQItem({ question }: FAQItemProps) {
  const [isOpen, setOpen] = useState(false);
  const auth = isAuthenticated();
  const answer = question.answers?.[0] ?? question.answer;
  const { upvote, downvote, removeUpvote, removeDownvote } = useAnswerVote(question.slug, answer?.id ?? null);
  const { showLoginRequired } = useToast();

  return (
    <li className="py-3 first:pt-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 text-left rounded-lg hover:bg-niat-border/30 transition-colors py-2 -mx-2 px-2"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-niat-text line-clamp-2">{question.title}</span>
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 text-niat-text-secondary transition-transform", isOpen && "rotate-180")}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {isOpen && answer && (
          <div className="pt-2 pl-2 space-y-2">
            <MarkdownBody content={answer.body} className="text-sm" />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-niat-text-secondary">
              <Link
                href={`/users/${answer.author?.username ?? ""}`}
                className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
              >
                <User className="h-4 w-4 shrink-0" />
                @{answer.author?.username ?? "unknown"}
                {answer.author?.is_verified_senior && (
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0"
                    style={{ color: "var(--primary)", backgroundColor: "rgba(153, 27, 27, 0.12)" }}
                    title="Verified Senior"
                    aria-label="Verified Senior"
                  >
                    <CheckCircle className="h-3 w-3" />
                  </span>
                )}
              </Link>
              <VoteButtons
                upvoteCount={answer.upvote_count ?? 0}
                downvoteCount={answer.downvote_count ?? 0}
                userVote={(answer.user_vote as 1 | -1 | null) ?? null}
                onUpvote={upvote}
                onDownvote={downvote}
                onRemoveUpvote={removeUpvote}
                onRemoveDownvote={removeDownvote}
                onLoginRequired={showLoginRequired}
                disabled={!auth}
              />
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
