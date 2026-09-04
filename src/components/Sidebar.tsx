import React from 'react';
import { useCurriculum } from '../context/useCurriculum';
import {
  Sparkles,
  Plus,
  PanelLeftClose,
  PanelLeft,
  ChevronsUpDown,
  ChevronsDownUp,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { DeleteConfirmButton } from './DeleteConfirmButton';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenUpload: () => void;
  onOpenApiKey?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  onOpenUpload,
}) => {
  const {
    curriculum,
    addModule,
    deleteModule,
    collapseAll,
    expandAll,
    collapsedIds,
    resetToBlank,
    loadSample,
    stats,
  } = useCurriculum();

  const scrollToModule = (moduleId: string) => {
    const el = document.getElementById(`module-${moduleId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const areAllCollapsed = collapsedIds.size > 0;

  if (!isOpen) {
    return (
      <div className="fixed top-4 left-4 z-40">
        <button
          type="button"
          onClick={onToggle}
          title="Open sidebar"
          className="p-2.5 bg-[#191512] text-white hover:text-[#EC8601] rounded-xl shadow-lg border border-stone-800 transition-all hover:scale-105"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop overlay for smaller/narrow viewports */}
      <div
        className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        onClick={onToggle}
        aria-hidden="true"
      />

      <aside className="fixed lg:relative inset-y-0 left-0 w-64 sm:w-72 shrink-0 h-screen bg-[#191512] text-stone-300 flex flex-col justify-between z-40 select-none border-r border-stone-800/80 font-sans shadow-2xl lg:shadow-none transition-all duration-200">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className="p-4 px-5 border-b border-stone-800/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-[#EC8601]">
                Língo
              </span>
              <span className="text-xl font-light tracking-tight text-stone-200">
                care
              </span>
            </div>

            <button
              type="button"
              onClick={onToggle}
              title="Collapse sidebar"
              className="p-1 text-stone-400 hover:text-white rounded transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

        {/* Primary Action: Upload Curriculum (PDF) */}
        <div className="p-3 border-b border-stone-800/60">
          <button
            type="button"
            id="sidebar-upload-btn"
            onClick={onOpenUpload}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold text-white bg-[#EC8601] hover:bg-[#D97706] rounded-xl shadow-xs transition-all hover:shadow-md transform active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upload Curriculum (PDF)</span>
          </button>
        </div>

        {/* Real Functional Outline & Tools */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-xs">
          {/* Curriculum Outline */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
              <span>Curriculum Outline</span>
              <button
                type="button"
                onClick={() => addModule()}
                title="Add module"
                className="text-stone-400 hover:text-[#EC8601] p-0.5 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
              {curriculum.modules.length === 0 ? (
                <p className="text-xs text-stone-500 px-2 py-1 italic">
                  No modules yet
                </p>
              ) : (
                curriculum.modules.map((m, idx) => (
                  <div
                    key={m.id}
                    className="w-full flex items-center justify-between gap-1.5 px-2 py-1 rounded-lg text-xs text-stone-400 hover:bg-stone-800/70 hover:text-stone-100 transition-colors group"
                  >
                    <button
                      type="button"
                      onClick={() => scrollToModule(m.id)}
                      className="flex items-center gap-2 min-w-0 flex-1 text-left py-0.5"
                      title={`Scroll to ${m.title || 'Module'}`}
                    >
                      <span className="font-mono font-bold text-[10px] text-stone-500 group-hover:text-[#EC8601] shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="truncate font-medium text-stone-300 group-hover:text-white">
                        {m.title || 'Untitled Module'}
                      </span>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-mono text-stone-500 group-hover:text-stone-400">
                        {m.topics.length}t
                      </span>
                      <DeleteConfirmButton
                        onDelete={() => deleteModule(m.id)}
                        itemType="module"
                        id={`sidebar-delete-module-${m.id}`}
                        requireConfirm={true}
                        className="opacity-0 group-hover:opacity-100 p-1 text-stone-500 hover:text-rose-400 hover:bg-stone-800/80 rounded transition-all"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Templates & Presets */}
          <div className="space-y-1.5 pt-2 border-t border-stone-800/60">
            <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Templates
            </span>

            <div className="grid grid-cols-2 gap-1.5 px-1">
              <button
                type="button"
                id="sidebar-sample-btn"
                onClick={loadSample}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-300 bg-stone-900 hover:bg-stone-800 border border-stone-850 rounded-lg transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#EC8601]" />
                <span>Sample</span>
              </button>
              <button
                type="button"
                id="sidebar-blank-btn"
                onClick={resetToBlank}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-300 bg-stone-900 hover:bg-stone-800 border border-stone-850 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                <span>Blank</span>
              </button>
            </div>
          </div>

          {/* View & Toggle Tools */}
          <div className="space-y-1 pt-2 border-t border-stone-800/60">
            <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Actions
            </span>

            <button
              type="button"
              onClick={areAllCollapsed ? expandAll : collapseAll}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-850 transition-colors"
            >
              {areAllCollapsed ? (
                <>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-stone-500" />
                  <span>Expand All Modules</span>
                </>
              ) : (
                <>
                  <ChevronsDownUp className="w-3.5 h-3.5 text-stone-500" />
                  <span>Collapse All Modules</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer: Stats & Save Indicator */}
        <div className="p-3 border-t border-stone-800/80 bg-[#14110F]">
          <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Auto-saved
            </span>
            <span className="font-mono text-stone-500">
              {stats.moduleCount}m · {stats.topicCount}t · {stats.lessonCount}l
            </span>
          </div>
        </div>
      </div>
    </aside>
  </>
);
};
