"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, TrendingUp, Tag as TagIcon, Folder, FileText } from "lucide-react";
import { useSearchSuggestions, useTrendingSearches } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
}

export function SearchBar({
  className,
  placeholder = "Search posts...",
  autoFocus = false,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce query for suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: suggestions } = useSearchSuggestions(
    debouncedQuery,
    showSuggestions && debouncedQuery.length >= 2
  );
  const { data: trending } = useTrendingSearches();

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      if (onSearch) {
        onSearch(query.trim());
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const handleSuggestionClick = (value: string, type: "tag" | "category" | "post", slug?: string) => {
    setQuery(value);
    setShowSuggestions(false);
    if (type === "tag") {
      router.push(`/?tag=${slug || value}`);
    } else if (type === "category") {
      router.push(`/categories/${slug || value}`);
    } else if (type === "post" && slug) {
      router.push(`/posts/${slug}`);
    }
  };

  const handleTrendingClick = (value: string) => {
    setQuery(value);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const showDropdown =
    showSuggestions &&
    (debouncedQuery.length >= 2 || (trending && trending.length > 0));

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-niat-text-secondary" />
        <input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          autoFocus={autoFocus}
          className="w-full rounded-xl border border-niat-border bg-niat-section pl-10 pr-10 py-2.5 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-niat-text-secondary hover:text-niat-text"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div
          className="absolute top-full mt-2 w-full rounded-xl border border-niat-border shadow-card z-50 max-h-96 overflow-y-auto"
          style={{ backgroundColor: "var(--niat-section)" }}
        >
          {/* Suggestions from query */}
          {debouncedQuery.length >= 2 && suggestions && (
            <>
              {/* Posts */}
              {suggestions.posts.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-niat-text-secondary uppercase">
                    Posts
                  </div>
                  {suggestions.posts.map((post) => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => handleSuggestionClick(post.title, "post", post.slug)}
                      className="w-full flex items-start gap-2 px-3 py-2 text-sm text-niat-text hover:bg-niat-border/50 rounded-lg text-left"
                    >
                      <FileText className="h-4 w-4 text-niat-text-secondary shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{post.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Categories */}
              {suggestions.categories.length > 0 && (
                <div className={cn("p-2", suggestions.posts.length > 0 && "border-t border-niat-border")}>
                  <div className="px-3 py-2 text-xs font-semibold text-niat-text-secondary uppercase">
                    Categories
                  </div>
                  {suggestions.categories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => handleSuggestionClick(cat.name, "category", cat.slug)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-niat-text hover:bg-niat-border/50 rounded-lg"
                    >
                      <Folder className="h-4 w-4 text-niat-text-secondary" />
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Tags */}
              {suggestions.tags.length > 0 && (
                <div className={cn("p-2", (suggestions.posts.length > 0 || suggestions.categories.length > 0) && "border-t border-niat-border")}>
                  <div className="px-3 py-2 text-xs font-semibold text-niat-text-secondary uppercase">
                    Tags
                  </div>
                  {suggestions.tags.map((tag) => (
                    <button
                      key={tag.slug}
                      type="button"
                      onClick={() => handleSuggestionClick(tag.name, "tag", tag.slug)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-niat-text hover:bg-niat-border/50 rounded-lg"
                    >
                      <TagIcon className="h-4 w-4 text-niat-text-secondary" />
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Trending searches */}
          {debouncedQuery.length < 2 && trending && trending.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-niat-text-secondary uppercase flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Trending Topics
              </div>
              {trending.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => handleTrendingClick(item.name)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-niat-text hover:bg-niat-border/50 rounded-lg"
                >
                  <span>{item.name}</span>
                  <span className="text-xs text-niat-text-secondary">
                    {item.post_count} posts
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {debouncedQuery.length >= 2 &&
            suggestions &&
            suggestions.posts.length === 0 &&
            suggestions.tags.length === 0 &&
            suggestions.categories.length === 0 && (
              <div className="p-4 text-center text-sm text-niat-text-secondary">
                No suggestions found. Press Enter to search.
              </div>
            )}
        </div>
      )}
    </div>
  );
}
