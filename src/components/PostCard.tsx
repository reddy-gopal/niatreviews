"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Post } from "@/types/post";
import { UpvoteButton } from "./UpvoteButton";
import { usePostUpvote } from "@/hooks/useUpvote";
import { useToast } from "./Toast";
import { fetchProfile } from "@/lib/api";
import { deletePost } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { API_BASE } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { User, MessageCircle, Share2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface PostCardProps {
  post: Post;
  showUpvote?: boolean;
}

export function PostCard({ post, showUpvote = true }: PostCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { upvote, downvote, removeVote, isLoading } = usePostUpvote(post.slug);
  const { showLoginRequired } = useToast();
  const auth = isAuthenticated();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: auth,
  });
  const isAuthor = !!profile?.id && !!post.author && (post.author as { id: string }).id === profile.id;

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);
  const upvoteCount = post.upvote_count ?? 0;
  const downvoteCount = post.downvote_count ?? 0;
  const score = upvoteCount - downvoteCount;
  const upvoted = post.user_vote === 1;
  const downvoted = post.user_vote === -1;

  const imageUrl = post.image
    ? post.image.startsWith("http")
      ? post.image
      : `${API_BASE}${post.image}`
    : null;

  const postUrl = `/posts/${post.slug}`;
  const profileUrl = `/users/${post.author.username}`;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = typeof window !== "undefined" ? `${window.location.origin}${postUrl}` : postUrl;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: post.title, url }).catch(() => copyToClipboard(url));
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (url: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border border-niat-border shadow-card transition-shadow",
        "hover:shadow-soft focus-within:shadow-soft",
        "bg-[var(--niat-section)]"
      )}
    >
      {/* Profile row at top — links to user profile; author menu */}
      <div className="px-4 pt-3 pb-1 sm:px-5 flex items-center justify-between gap-2">
        <Link
          href={profileUrl}
          className="inline-flex items-center gap-2 rounded-lg py-1 pr-2 -ml-1 text-sm text-niat-text-secondary hover:text-primary hover:bg-niat-border/30 transition-colors"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-niat-border bg-[var(--niat-section)]">
            <User className="h-4 w-4 text-niat-text-secondary" />
          </span>
          <span className="font-medium text-niat-text">u/{post.author.username}</span>
          <span className="text-xs">
            <time dateTime={post.created_at}>
              {new Date(post.created_at).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </time>
          </span>
        </Link>
        {isAuthor && (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen((o) => !o); }}
              className="p-2 rounded-lg text-niat-text-secondary hover:bg-niat-border/50 hover:text-niat-text transition-colors"
              aria-label="Post options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-niat-border py-1 shadow-card z-10"
                style={{ backgroundColor: "var(--niat-section)" }}
              >
                <Link
                  href={`/posts/${post.slug}/edit`}
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-niat-text hover:bg-niat-border/50"
                >
                  <Pencil className="h-4 w-4" /> Edit
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    if (typeof window !== "undefined" && window.confirm("Delete this post? This cannot be undone.")) {
                      deletePost(post.slug).then(() => router.refresh());
                    }
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-niat-border/50 text-left"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main body: clickable to post */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Link
          href={postUrl}
          className="block flex-1 py-2 pr-4 pl-4 sm:pl-5 sm:pt-1 group outline-none"
        >
          <h2 className="font-semibold text-lg text-niat-text group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>
          <p className="text-sm text-niat-text-secondary line-clamp-2 mt-1.5">
            {post.description}
          </p>
          {imageUrl && (
            <div className="mt-3 relative aspect-video rounded-xl overflow-hidden border border-niat-border max-w-md">
              <Image
                src={imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 448px"
              />
            </div>
          )}
        </Link>

        {/* Meta: category, tags */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 pb-2 sm:px-5 text-xs text-niat-text-secondary">
          {post.category && (
            <Link
              href={`/categories/${post.category.slug}`}
              className="text-niat-text-secondary hover:text-primary hover:underline"
            >
              {post.category.name}
            </Link>
          )}
          {post.category && post.tags.length > 0 && <span aria-hidden>·</span>}
          {post.tags.length > 0 && (
            <span className="flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="text-secondary hover:text-secondary-dark hover:underline"
                >
                  #{tag.name}
                </Link>
              ))}
            </span>
          )}
        </div>

        {/* Footer: upvote, downvote, comments, share, save — icons on mobile, icon+text on sm+ */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-4 pb-3 sm:px-5 border-t border-niat-border/80 pt-2">
          {showUpvote && (
            <UpvoteButton
              count={score}
              upvoted={upvoted}
              downvoted={downvoted}
              onUpvote={() => upvote()}
              onDownvote={() => downvote()}
              onRemoveUpvote={() => removeVote()}
              onLoginRequired={showLoginRequired}
              disabled={!auth}
              isLoading={isLoading}
              variant="post"
            />
          )}
          <Link
            href={`${postUrl}#comments`}
            className="inline-flex items-center gap-1.5 rounded-lg p-2 sm:px-3 sm:py-1.5 text-sm font-medium text-niat-text-secondary hover:bg-niat-border/50 hover:text-niat-text transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 justify-center sm:justify-start"
            aria-label={`${post.comment_count} comments`}
          >
            <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
            <span className="hidden sm:inline">{post.comment_count} Comments</span>
          </Link>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-lg p-2 sm:px-3 sm:py-1.5 text-sm font-medium text-niat-text-secondary hover:bg-niat-border/50 hover:text-niat-text transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 justify-center sm:justify-start"
            aria-label="Share"
          >
            <Share2 className="h-5 w-5 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>
    </article>
  );
}
