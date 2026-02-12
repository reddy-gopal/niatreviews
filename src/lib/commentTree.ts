import type { Comment } from "@/types/comment";

export type CommentWithReplies = Comment & { replies: CommentWithReplies[] };

export type CommentSortOption = "best" | "newest" | "oldest";

/**
 * Build a nested tree from flat comment list (from API).
 * Preserves order; each node has a `replies` array.
 */
export function buildCommentTree(comments: Comment[]): CommentWithReplies[] {
  const byId = new Map<string, CommentWithReplies>();
  comments.forEach((c) => byId.set(c.id, { ...c, replies: [] }));
  const roots: CommentWithReplies[] = [];
  comments.forEach((c) => {
    const node = byId.get(c.id)!;
    if (!c.parent) {
      roots.push(node);
    } else {
      const parent = byId.get(c.parent.id);
      if (parent) parent.replies.push(node);
      else roots.push(node);
    }
  });
  return roots;
}

/**
 * Compare two comments for sorting (best = upvotes desc, then newest first).
 */
function compareBest(a: CommentWithReplies, b: CommentWithReplies): number {
  if (a.upvote_count !== b.upvote_count) return b.upvote_count - a.upvote_count;
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

/**
 * Compare two comments by date (newest first).
 */
function compareNewest(a: CommentWithReplies, b: CommentWithReplies): number {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

/**
 * Compare two comments by date (oldest first).
 */
function compareOldest(a: CommentWithReplies, b: CommentWithReplies): number {
  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
}

function getCompare(sortBy: CommentSortOption): (a: CommentWithReplies, b: CommentWithReplies) => number {
  switch (sortBy) {
    case "best":
      return compareBest;
    case "newest":
      return compareNewest;
    case "oldest":
      return compareOldest;
    default:
      return compareBest;
  }
}

/**
 * Recursively sort a comment tree by best / newest / oldest.
 * Mutates each node's replies array and returns the same tree.
 */
export function recursiveSort(
  tree: CommentWithReplies[],
  sortBy: CommentSortOption
): CommentWithReplies[] {
  const compare = getCompare(sortBy);
  function sortNode(nodes: CommentWithReplies[]): void {
    nodes.sort(compare);
    nodes.forEach((n) => sortNode(n.replies));
  }
  sortNode(tree);
  return tree;
}

/**
 * Find a comment by id in the tree and return it (with its subtree) as a single-root array.
 * Returns [] if not found.
 */
export function getCommentSubtree(
  tree: CommentWithReplies[],
  commentId: string
): CommentWithReplies[] {
  function find(nodes: CommentWithReplies[]): CommentWithReplies | null {
    for (const node of nodes) {
      if (node.id === commentId) return node;
      const inChild = find(node.replies);
      if (inChild) return inChild;
    }
    return null;
  }
  const node = find(tree);
  return node ? [node] : [];
}

/**
 * Count total comments in a subtree (including root).
 */
export function countReplies(node: CommentWithReplies): number {
  return 1 + node.replies.reduce((sum, r) => sum + countReplies(r as CommentWithReplies), 0);
}
