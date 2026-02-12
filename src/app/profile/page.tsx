"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { isAuthenticated } from "@/lib/auth";
import { fetchProfile } from "@/lib/api";
import {
  ProfileCard,
  TabNavigation,
  EmptyState,
} from "@/components/profile";
import type { ProfileTabId, TabItem } from "@/components/profile";
import { usePosts } from "@/hooks/usePosts";
import { useCommentsList } from "@/hooks/useProfileData";
import { PostCard } from "@/components/PostCard";
import { cn } from "@/lib/utils";

const PROFILE_TABS: TabItem[] = [
  { id: "overview", label: "Overview" },
  { id: "posts", label: "Posts" },
  { id: "comments", label: "Comments" },
  { id: "saved", label: "Saved" },
  { id: "upvoted", label: "Upvoted" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTabId>("overview");

  const { data: profile, status, error } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: typeof window !== "undefined" && isAuthenticated(),
  });

  const authorId = profile?.id ?? null;
  const postsQuery = usePosts({ author: authorId });
  const upvotedPostsQuery = usePosts({ upvotedBy: authorId ? "me" : null });
  const commentsQuery = useCommentsList({ author: authorId });
  const upvotedCommentsQuery = useCommentsList({ upvotedBy: authorId ? "me" : null });

  const posts = postsQuery.data?.pages.flatMap((p) => p.results) ?? [];
  const upvotedPosts = upvotedPostsQuery.data?.pages.flatMap((p) => p.results) ?? [];
  const comments = commentsQuery.data?.pages.flatMap((p) => p.results) ?? [];
  const upvotedComments = upvotedCommentsQuery.data?.pages.flatMap((p) => p.results) ?? [];

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  const handleEditProfile = () => router.push("/profile/settings");

  if (typeof window !== "undefined" && !isAuthenticated()) {
    return null;
  }

  if (status === "pending" || !profile) {
    return (
      <div className="flex min-h-[60vh] flex-col gap-6 lg:flex-row">
        <div className="w-full shrink-0 lg:w-[300px]">
          <div className="h-48 animate-pulse rounded-lg border border-niat-border bg-[var(--niat-section)]" />
        </div>
        <div className="flex-1 rounded-lg border border-niat-border bg-[var(--niat-section)] p-8">
          <p className="text-niat-text-secondary">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-niat-border p-6 shadow-soft bg-[var(--niat-section)]">
        <h1 className="text-2xl font-bold text-niat-text">Profile</h1>
        <p className="mt-2 text-primary">
          Failed to load profile. {(error as Error)?.message ?? "Please try again."}
        </p>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview": {
        const hasPosts = posts.length > 0;
        const hasComments = comments.length > 0;
        if (!hasPosts && !hasComments) {
          return (
            <EmptyState
              title="You don't have any posts yet"
              description="Share your first post with the community to get started."
              actionLabel="Create Post"
              onAction={() => router.push("/create-post")}
              secondaryActionLabel="Edit profile"
              onSecondaryAction={handleEditProfile}
            />
          );
        }
        return (
          <div className="space-y-6">
            {hasPosts && (
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-niat-text-secondary mb-3">
                  Recent posts
                </h3>
                <div className="space-y-3">
                  {posts.slice(0, 5).map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  {posts.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("posts")}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View all posts →
                    </button>
                  )}
                </div>
              </section>
            )}
            {hasComments && (
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-niat-text-secondary mb-3">
                  Recent comments
                </h3>
                <ul className="space-y-2">
                  {comments.slice(0, 5).map((c) => (
                    <li key={c.id} className="rounded-lg border border-niat-border bg-[var(--niat-section)] p-3">
                      <p className="text-sm text-niat-text line-clamp-2">{c.body}</p>
                      <Link
                        href={c.post_slug ? `/posts/${c.post_slug}` : "#"}
                        className="mt-1 text-xs font-medium text-primary hover:underline"
                      >
                        {c.post_title ? `On: ${c.post_title}` : "View post"}
                      </Link>
                    </li>
                  ))}
                </ul>
                {comments.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("comments")}
                    className="mt-2 text-sm font-medium text-primary hover:underline"
                  >
                    View all comments →
                  </button>
                )}
              </section>
            )}
          </div>
        );
      }
      case "posts": {
        if (postsQuery.isLoading) {
          return <p className="py-8 text-niat-text-secondary">Loading posts…</p>;
        }
        if (posts.length === 0) {
          return (
            <EmptyState
              title="You don't have any posts yet"
              description="Share your first post with the community."
              actionLabel="Create Post"
              onAction={() => router.push("/create-post")}
            />
          );
        }
        return (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {postsQuery.hasNextPage && (
              <button
                type="button"
                onClick={() => postsQuery.fetchNextPage()}
                disabled={postsQuery.isFetchingNextPage}
                className="w-full rounded-xl border border-niat-border py-2.5 text-sm font-medium text-niat-text hover:bg-niat-border/30 disabled:opacity-50"
              >
                {postsQuery.isFetchingNextPage ? "Loading…" : "Load more"}
              </button>
            )}
          </div>
        );
      }
      case "comments": {
        if (commentsQuery.isLoading) {
          return <p className="py-8 text-niat-text-secondary">Loading comments…</p>;
        }
        if (comments.length === 0) {
          return (
            <EmptyState
              title="No comments yet"
              description="Your replies will appear here."
              actionLabel="Browse posts"
              onAction={() => router.push("/")}
            />
          );
        }
        return (
          <div className="space-y-3">
            {comments.map((c) => (
              <article
                key={c.id}
                className="rounded-lg border border-niat-border bg-[var(--niat-section)] p-4"
              >
                <p className="text-sm text-niat-text whitespace-pre-wrap">{c.body}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-niat-text-secondary">
                  <span>{c.upvote_count} upvotes</span>
                  <span>·</span>
                  <time dateTime={c.created_at}>
                    {new Date(c.created_at).toLocaleString()}
                  </time>
                  {c.post_slug && (
                    <>
                      <span>·</span>
                      <Link
                        href={`/posts/${c.post_slug}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {c.post_title ?? "View post"}
                      </Link>
                    </>
                  )}
                </div>
              </article>
            ))}
            {commentsQuery.hasNextPage && (
              <button
                type="button"
                onClick={() => commentsQuery.fetchNextPage()}
                disabled={commentsQuery.isFetchingNextPage}
                className="w-full rounded-xl border border-niat-border py-2.5 text-sm font-medium text-niat-text hover:bg-niat-border/30 disabled:opacity-50"
              >
                {commentsQuery.isFetchingNextPage ? "Loading…" : "Load more"}
              </button>
            )}
          </div>
        );
      }
      case "saved":
        return (
          <EmptyState
            title="No saved posts"
            description="Save posts to find them here later. Coming soon."
          />
        );
      case "upvoted": {
        const hasPosts = upvotedPosts.length > 0;
        const hasComments = upvotedComments.length > 0;
        if (upvotedPostsQuery.isLoading && upvotedCommentsQuery.isLoading) {
          return <p className="py-8 text-niat-text-secondary">Loading…</p>;
        }
        if (!hasPosts && !hasComments) {
          return (
            <EmptyState
              title="No upvotes yet"
              description="Posts and comments you upvote will appear here."
              actionLabel="Browse posts"
              onAction={() => router.push("/")}
            />
          );
        }
        return (
          <div className="space-y-6">
            {hasPosts && (
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-niat-text-secondary mb-3">
                  Upvoted posts
                </h3>
                <div className="space-y-4">
                  {upvotedPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  {upvotedPostsQuery.hasNextPage && (
                    <button
                      type="button"
                      onClick={() => upvotedPostsQuery.fetchNextPage()}
                      disabled={upvotedPostsQuery.isFetchingNextPage}
                      className="w-full rounded-xl border border-niat-border py-2.5 text-sm font-medium text-niat-text hover:bg-niat-border/30 disabled:opacity-50"
                    >
                      {upvotedPostsQuery.isFetchingNextPage ? "Loading…" : "Load more"}
                    </button>
                  )}
                </div>
              </section>
            )}
            {hasComments && (
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-niat-text-secondary mb-3">
                  Upvoted comments
                </h3>
                <ul className="space-y-3">
                  {upvotedComments.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-lg border border-niat-border bg-[var(--niat-section)] p-4"
                    >
                      <p className="text-sm text-niat-text line-clamp-3">{c.body}</p>
                      {c.post_slug && (
                        <Link
                          href={`/posts/${c.post_slug}`}
                          className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                        >
                          {c.post_title ?? "View post"}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
                {upvotedCommentsQuery.hasNextPage && (
                  <button
                    type="button"
                    onClick={() => upvotedCommentsQuery.fetchNextPage()}
                    disabled={upvotedCommentsQuery.isFetchingNextPage}
                    className="mt-2 w-full rounded-xl border border-niat-border py-2.5 text-sm font-medium text-niat-text hover:bg-niat-border/30 disabled:opacity-50"
                  >
                    {upvotedCommentsQuery.isFetchingNextPage ? "Loading…" : "Load more"}
                  </button>
                )}
              </section>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col gap-4 sm:gap-6 lg:flex-row">
      {/* Profile card — left */}
      <div className="w-full shrink-0 lg:w-[300px] order-2 lg:order-1">
        <div className="lg:sticky lg:top-24">
          <ProfileCard
            username={profile.username}
            avatarUrl={null}
            onEdit={handleEditProfile}
          />
        </div>
      </div>

      {/* Main content — right */}
      <div className="min-w-0 flex-1 order-1 lg:order-2">
        <div className="rounded-lg border border-niat-border bg-[var(--niat-section)] shadow-soft transition-colors duration-200 overflow-hidden">
          <TabNavigation
            tabs={PROFILE_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          <div className="p-3 sm:p-4">
            <div
              id={`panel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeTab}`}
              className="min-h-[200px]"
            >
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
