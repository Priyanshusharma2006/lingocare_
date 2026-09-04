import React, { useState, useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface InlineTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  isDescription?: boolean;
  multiline?: boolean;
  emptyPrompt?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  id?: string;
}

export const InlineText: React.FC<InlineTextProps> = ({
  value,
  onChange,
  placeholder = 'Type here...',
  className = '',
  inputClassName = '',
  isDescription = false,
  multiline = false,
  emptyPrompt = 'Click to Add Description ⟠',
  tag: Tag = 'div',
  id,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Sync draft when external value changes
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(value);
  }

  // Focus and select input on entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // For textarea, set height according to scroll height
      if (multiline && inputRef.current instanceof HTMLTextAreaElement) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
      }
    }
  }, [isEditing, multiline]);

  const commitChange = () => {
    setIsEditing(false);
    if (draft.trim() !== value) {
      onChange(draft.trim());
    }
  };

  const cancelChange = () => {
    setIsEditing(false);
    setDraft(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      cancelChange();
    } else if (e.key === 'Enter' && (!multiline || e.ctrlKey || e.metaKey)) {
      if (!multiline) {
        e.preventDefault();
        commitChange();
      }
    }
  };

  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  // If in edit mode, render actual input or textarea
  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={draft}
          id={id}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitChange}
          onKeyDown={handleKeyDown}
          onInput={handleTextareaInput}
          rows={1}
          className={twMerge(
            'w-full bg-white text-slate-800 rounded-md border border-[#EC8601] px-2.5 py-1.5 outline-none ring-2 ring-[#EC8601]/20 shadow-xs resize-none transition-all duration-150',
            inputClassName
          )}
          placeholder={placeholder}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={draft}
        id={id}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitChange}
        onKeyDown={handleKeyDown}
        className={twMerge(
          'w-full bg-white text-slate-900 rounded-md border border-[#EC8601] px-2.5 py-1 outline-none ring-2 ring-[#EC8601]/20 shadow-xs transition-all duration-150',
          inputClassName
        )}
        placeholder={placeholder}
      />
    );
  }

  // If description is empty, show the subtle Notion-style ghost prompt
  const hasContent = value && value.trim().length > 0;

  if (isDescription && !hasContent) {
    return (
      <button
        type="button"
        id={id}
        onClick={() => setIsEditing(true)}
        className={twMerge(
          'group inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#EC8601] transition-colors py-1 px-1.5 -ml-1 rounded hover:bg-[#FFF8EE] cursor-text select-none text-left',
          className
        )}
      >
        <span className="text-[11px] font-medium tracking-wide flex items-center gap-1">
          {emptyPrompt}
        </span>
      </button>
    );
  }

  // Render view mode with subtle hover affordance
  return (
    <Tag
      id={id}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
      className={twMerge(
        'group cursor-text rounded px-1.5 py-0.5 -mx-1.5 transition-colors duration-100 hover:bg-slate-100/80 focus:outline-none relative inline-block max-w-full break-words',
        !hasContent && 'text-slate-400 italic',
        className
      )}
    >
      <span>{hasContent ? value : placeholder}</span>
    </Tag>
  );
};
