"use client";

import { useRef, useCallback } from "react";
import { Bold, Italic, List, ListOrdered, Link2, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextBodyEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  maxLength?: number;
  className?: string;
  id?: string;
}

function insertAtCursor(
  el: HTMLTextAreaElement,
  before: string,
  after: string = "",
  selectLength: number = 0
): string {
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const text = el.value;
  const selected = text.slice(start, end);
  const inserted = before + selected + after;
  const newText = text.slice(0, start) + inserted + text.slice(end);
  el.value = newText;
  const newCursor = start + before.length + selected.length + (selectLength > 0 ? 0 : after.length);
  el.selectionStart = el.selectionEnd = newCursor;
  if (selectLength > 0) {
    el.selectionStart = newCursor;
    el.selectionEnd = newCursor + selectLength;
  }
  el.focus();
  return newText;
}

const EMOJIS = ["😊", "👍", "✅", "❓", "💡", "📌", "🎓", "🙏", "⭐", "🔔"];

export function RichTextBodyEditor({
  value,
  onChange,
  placeholder = "Add any context...",
  minRows = 5,
  maxLength,
  className,
  id = "ask-body",
}: RichTextBodyEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = useCallback(
    (before: string, after: string = "", selectLength: number = 0) => {
      const el = textareaRef.current;
      if (!el) return;
      const newValue = insertAtCursor(el, before, after, selectLength);
      onChange(newValue);
    },
    [onChange]
  );

  const handleBold = () => applyFormat("**", "**", 2);
  const handleItalic = () => applyFormat("*", "*", 1);
  const handleBullet = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const text = el.value;
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    const newText = text.slice(0, lineStart) + "- " + text.slice(lineStart);
    el.value = newText;
    el.selectionStart = el.selectionEnd = start + 2;
    el.focus();
    onChange(newText);
  };
  const handleNumbered = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const text = el.value;
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    const newText = text.slice(0, lineStart) + "1. " + text.slice(lineStart);
    el.value = newText;
    el.selectionStart = el.selectionEnd = start + 3;
    el.focus();
    onChange(newText);
  };
  const handleLink = () => applyFormat("[", "](url)", 3);
  const handleEmoji = (emoji: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const text = el.value;
    const newText = text.slice(0, start) + emoji + text.slice(start);
    el.value = newText;
    el.selectionStart = el.selectionEnd = start + emoji.length;
    el.focus();
    onChange(newText);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-niat-border overflow-hidden shadow-soft",
        "bg-[var(--niat-section)] focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-shadow",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-niat-border bg-[var(--niat-section)]/80">
        <button
          type="button"
          onClick={handleBold}
          className="p-2 rounded-lg text-niat-text-secondary hover:bg-niat-border/50 hover:text-niat-text transition-colors"
          title="Bold"
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="p-2 rounded-lg text-niat-text-secondary hover:bg-niat-border/50 hover:text-niat-text transition-colors"
          title="Italic"
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleBullet}
          className="p-2 rounded-lg text-niat-text-secondary hover:bg-niat-border/50 hover:text-niat-text transition-colors"
          title="Bullet list"
          aria-label="Bullet list"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleNumbered}
          className="p-2 rounded-lg text-niat-text-secondary hover:bg-niat-border/50 hover:text-niat-text transition-colors"
          title="Numbered list"
          aria-label="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleLink}
          className="p-2 rounded-lg text-niat-text-secondary hover:bg-niat-border/50 hover:text-niat-text transition-colors"
          title="Insert link"
          aria-label="Insert link"
        >
          <Link2 className="h-4 w-4" />
        </button>
        <span className="w-px h-5 bg-niat-border mx-0.5" aria-hidden />
        <span className="flex items-center gap-1 px-1 text-niat-text-secondary" title="Emojis">
          <Smile className="h-4 w-4" />
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmoji(emoji)}
              className="text-lg leading-none hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-primary rounded"
              aria-label={`Insert ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </span>
      </div>
      <textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={minRows}
        maxLength={maxLength}
        className="w-full resize-y min-h-[120px] px-4 py-3 text-sm text-niat-text placeholder-niat-text-secondary focus:outline-none bg-transparent border-0"
        style={{ minHeight: "140px" }}
      />
      {maxLength != null && (
        <div className="px-4 pb-2 text-xs text-niat-text-secondary text-right">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
}
