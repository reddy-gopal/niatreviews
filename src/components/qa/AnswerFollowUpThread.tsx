"use client";

import { useRef, useState } from "react";
import type { FollowUp } from "@/lib/api";
import { FollowUpCard } from "./FollowUpCard";
import { useCreateFollowUp } from "@/hooks/useFollowUps";
import { isAuthenticated } from "@/lib/auth";
import { fetchProfile } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export interface FollowUpTreeItem extends FollowUp {
  replies: FollowUpTreeItem[];
}

function buildTree(followups: FollowUp[]): FollowUpTreeItem[] {
  const byId = new Map<string, FollowUpTreeItem>();
  followups.forEach((fu) => byId.set(fu.id, { ...fu, replies: [] }));
  const roots: FollowUpTreeItem[] = [];
  followups.forEach((fu) => {
    const item = byId.get(fu.id)!;
    if (!fu.parent_id) {
      roots.push(item);
    } else {
      const parent = byId.get(fu.parent_id);
      if (parent) parent.replies.push(item);
      else roots.push(item);
    }
  });
  roots.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  byId.forEach((item) => item.replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
  return roots;
}

interface AnswerFollowUpThreadProps {
  questionSlug: string;
  answerId: string;
  followups: FollowUp[];
  isQuestionAuthor: boolean;
  seniorHasAnswered: boolean;
}

export function AnswerFollowUpThread({
  questionSlug,
  answerId,
  followups,
  isQuestionAuthor,
  seniorHasAnswered,
}: AnswerFollowUpThreadProps) {
  const [body, setBody] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [showTopForm, setShowTopForm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const auth = isAuthenticated();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: auth,
  });
  const createMutation = useCreateFollowUp(questionSlug);

  const canAddTopLevel = !!(auth && profile && isQuestionAuthor);
  const canReply = !!(auth && profile && seniorHasAnswered);
  const tree = buildTree(followups);

  const handleSubmit = (e: React.FormEvent, parentId?: string | null) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || createMutation.isPending) return;
    createMutation.mutate(
      { body: trimmed, answerId, parentId: parentId ?? null },
      {
        onSuccess: () => {
          setBody("");
          setReplyToId(null);
          setShowTopForm(false);
        },
      }
    );
  };

  const showSection = canAddTopLevel || canReply || tree.length > 0;
  if (!showSection) return null;

  return (
    <div className="mt-6 pt-6 border-t border-niat-border/80">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-xs font-medium text-niat-text-secondary uppercase tracking-wide">
          Follow-ups
        </h3>
        {canAddTopLevel && !showTopForm && (
          <button
            type="button"
            onClick={() => {
              setShowTopForm(true);
              setReplyToId(null);
              setTimeout(() => textareaRef.current?.focus(), 100);
            }}
            className="text-sm font-medium text-primary hover:underline"
          >
            + Add follow-up
          </button>
        )}
      </div>

      {canAddTopLevel && showTopForm && (
        <form
          onSubmit={(e) => handleSubmit(e)}
          className="mb-4 rounded-xl border border-niat-border/80 p-3"
          style={{ backgroundColor: "var(--niat-section)" }}
        >
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Ask a follow-up question about this answer…"
            rows={3}
            className="w-full rounded-lg border border-niat-border bg-transparent px-3 py-2 text-sm text-niat-text placeholder-niat-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={createMutation.isPending || !body.trim()}
              className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {createMutation.isPending ? "Posting…" : "Post"}
            </button>
            <button
              type="button"
              onClick={() => { setShowTopForm(false); setBody(""); }}
              className="rounded-lg border border-niat-border px-3 py-1.5 text-sm font-medium text-niat-text-secondary hover:bg-niat-border/30"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {tree.map((root) => (
          <ThreadBranch
            key={root.id}
            item={root}
            questionSlug={questionSlug}
            depth={0}
            canReply={canReply}
            replyToId={replyToId}
            setReplyToId={setReplyToId}
            body={body}
            setBody={setBody}
            onSubmit={handleSubmit}
            createMutation={createMutation}
          />
        ))}
      </div>
    </div>
  );
}

interface ThreadBranchProps {
  item: FollowUpTreeItem;
  questionSlug: string;
  depth: number;
  canReply: boolean;
  replyToId: string | null;
  setReplyToId: (id: string | null) => void;
  body: string;
  setBody: (s: string) => void;
  onSubmit: (e: React.FormEvent, parentId?: string | null) => void;
  createMutation: { isPending: boolean };
}

function ThreadBranch({
  item,
  questionSlug,
  depth,
  canReply,
  replyToId,
  setReplyToId,
  body,
  setBody,
  onSubmit,
  createMutation,
}: ThreadBranchProps) {
  const isReply = depth > 0;
  return (
    <div
      className={isReply ? "ml-4 sm:ml-6 pl-3 sm:pl-4 border-l-2 border-niat-border/60" : ""}
      style={isReply ? { borderColor: "var(--niat-border)" } : undefined}
    >
      <FollowUpCard followUp={item} questionSlug={questionSlug} />

      {canReply && (
        <div className="mt-1 mb-2">
          {replyToId === item.id ? (
            <form
              onSubmit={(e) => onSubmit(e, item.id)}
              className="mt-2 rounded-lg border border-niat-border/80 p-2"
              style={{ backgroundColor: "var(--niat-section)" }}
            >
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Reply…"
                rows={2}
                className="w-full rounded border border-niat-border/80 bg-transparent px-2 py-1.5 text-sm text-niat-text placeholder-niat-text-secondary focus:ring-2 focus:ring-primary/50"
              />
              <div className="flex gap-2 mt-1.5">
                <button
                  type="submit"
                  disabled={createMutation.isPending || !body.trim()}
                  className="rounded bg-primary text-primary-foreground px-2.5 py-1 text-xs font-medium hover:opacity-90 disabled:opacity-50"
                >
                  Reply
                </button>
                <button
                  type="button"
                  onClick={() => { setReplyToId(null); setBody(""); }}
                  className="rounded border border-niat-border px-2.5 py-1 text-xs font-medium text-niat-text-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setReplyToId(item.id)}
              className="text-xs font-medium text-niat-text-secondary hover:text-primary mt-0.5"
            >
              Reply
            </button>
          )}
        </div>
      )}

      {item.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {item.replies.map((reply) => (
            <ThreadBranch
              key={reply.id}
              item={reply}
              questionSlug={questionSlug}
              depth={depth + 1}
              canReply={canReply}
              replyToId={replyToId}
              setReplyToId={setReplyToId}
              body={body}
              setBody={setBody}
              onSubmit={onSubmit}
              createMutation={createMutation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
