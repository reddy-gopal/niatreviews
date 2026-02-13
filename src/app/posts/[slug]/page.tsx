"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePostDetail } from "@/hooks/usePostDetail";
import { UpvoteButton } from "@/components/UpvoteButton";
import { usePostUpvote } from "@/hooks/useUpvote";
import { CommentSection } from "@/components/CommentSection";
import { useToast } from "@/components/Toast";
import { fetchProfile } from "@/lib/api";
import { deletePost } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { API_BASE } from "@/lib/utils";
import { User, MessageCircle, Share2, Pencil, Trash2, MoreHorizontal, ArrowLeft } from "lucide-react";
import { LoadingBlock } from "@/components/LoadingSpinner";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const postQuery = usePostDetail(slug);
  const { upvote, downvote, removeVote, isLoading } = usePostUpvote(slug);
  const { showLoginRequired } = useToast();
  const auth = isAuthenticated();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: auth,
  });
  const post = postQuery.data;
  const isAuthor = !!profile?.id && !!post?.author && (post.author as { id: string }).id === profile.id;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);

  if (postQuery.isLoading || postQuery.error || !post) {
    return (
      <div className="py-12 text-center">
        {postQuery.error ? (
          <p className="text-primary">Failed to load post.</p>
        ) : (
          <LoadingBlock />
        )}
      </div>
    );
  }
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
  const profileUrl = `/users/${post.author.username}`;
  const postUrl = `/posts/${post.slug}`;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
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
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg p-2 text-niat-text-secondary hover:bg-niat-border/50 hover:text-niat-text transition-colors touch-manipulation"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <article
        className="rounded-2xl border border-niat-border p-4 sm:p-6 shadow-card overflow-visible"
        style={{ backgroundColor: "var(--niat-section)" }}
      >
        {/* Profile row at top — links to user profile; author options menu */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Link
            href={profileUrl}
            className="inline-flex items-center gap-2 rounded-lg py-1 pr-2 -ml-1 text-sm text-niat-text-secondary hover:text-primary hover:bg-niat-border/30 transition-colors"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-niat-border bg-[var(--niat-section)]">
              <User className="h-4 w-4 text-niat-text-secondary" />
            </span>
            <span className="font-medium text-niat-text">u/{post.author.username}</span>
            <span className="text-xs">
              <time dateTime={post.created_at}>
                {new Date(post.created_at).toLocaleDateString()}
              </time>
            </span>
          </Link>
          {isAuthor && (
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="p-2 rounded-lg text-niat-text-secondary hover:bg-niat-border/50 hover:text-niat-text transition-colors"
                aria-label="Post options"
                aria-expanded={menuOpen}
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-niat-border py-1 shadow-card z-50"
                  style={{ backgroundColor: "var(--niat-section)" }}
                  role="menu"
                >
                  <Link
                    href={`/posts/${slug}/edit`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-niat-text hover:bg-niat-border/50 rounded-t-xl"
                    role="menuitem"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      if (typeof window !== "undefined" && window.confirm("Delete this post? This cannot be undone.")) {
                        deletePost(slug).then(() => {
                          router.push("/");
                          router.refresh();
                        });
                      }
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-niat-border/50 text-left rounded-b-xl"
                    role="menuitem"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-niat-text">{post.title}</h1>
        <div className="flex flex-wrap gap-2 mt-2">
          {post.category && (
            <Link
              href={`/categories/${post.category.slug}`}
              className="text-sm rounded-full border border-niat-border px-2.5 py-0.5 text-niat-text hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
            >
              {post.category.name}
            </Link>
          )}
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="text-sm rounded-full border border-niat-border px-2.5 py-0.5 text-niat-text hover:bg-secondary hover:text-white hover:border-secondary transition-colors"
            >
              {tag.name}
            </Link>
          ))}
        </div>
        <div className="mt-4 prose prose-sm max-w-none text-niat-text">
          <p className="whitespace-pre-wrap">{post.description}</p>
        </div>
        {imageUrl && (
          <div className="mt-4 relative aspect-video rounded-xl overflow-hidden border border-niat-border">
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>
        )}

        {/* Upvote, downvote, comments, share, save — icons on mobile, icon+text on sm+ */}
        <div className="mt-4 pt-4 border-t border-niat-border flex flex-wrap items-center gap-2 sm:gap-3">
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
          <Link
            href="#comments"
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
      </article>

      <CommentSection
        postId={post.id}
        postSlug={post.slug}
        commentCount={post.comment_count}
      />
    </div>
  );
}
