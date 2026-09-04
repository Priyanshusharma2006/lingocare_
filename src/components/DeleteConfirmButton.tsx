import React, { useState, useEffect } from 'react';
import { Trash2, AlertCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface DeleteConfirmButtonProps {
  onDelete: () => void;
  itemType: 'module' | 'topic' | 'lesson';
  itemTitle?: string;
  requireConfirm?: boolean;
  className?: string;
  id?: string;
}

export const DeleteConfirmButton: React.FC<DeleteConfirmButtonProps> = ({
  onDelete,
  itemType,
  requireConfirm = itemType !== 'lesson',
  className = '',
  id,
}) => {
  const [confirming, setConfirming] = useState(false);

  // Auto-reset confirmation after 3.5 seconds of inactivity
  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => {
      setConfirming(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, [confirming]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireConfirm || confirming) {
      setConfirming(false);
      onDelete();
    } else {
      setConfirming(true);
    }
  };

  if (confirming) {
    return (
      <button
        type="button"
        id={id}
        onClick={handleClick}
        title={`Click again to confirm deleting ${itemType}`}
        className="animate-fade-in inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-2.5 py-1 rounded-lg shadow-sm border border-rose-700 transition-all duration-150 shrink-0 select-none z-10"
      >
        <AlertCircle className="w-3.5 h-3.5 text-white animate-pulse shrink-0" />
        <span className="text-white font-semibold">Delete?</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      id={id}
      onClick={handleClick}
      title={`Delete ${itemType}`}
      className={twMerge(
        'p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-rose-400',
        className
      )}
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
};
