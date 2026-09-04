import React, { useState } from 'react';
import { useCurriculum } from '../context/useCurriculum';
import { InlineText } from './InlineText';
import {
  Sparkles,
  Plus,
  MoreVertical,
  Clock,
  Copy,
  Download,
  BookOpen,
  ChevronsUpDown,
  ChevronsDownUp,
  RotateCcw,
} from 'lucide-react';

interface CurriculumHeaderProps {
  onOpenUpload: () => void;
  onOpenApiKey?: () => void;
}

export const CurriculumHeader: React.FC<CurriculumHeaderProps> = ({
  onOpenUpload,
}) => {
  const {
    curriculum,
    updateCurriculumHeader,
    addModule,
    collapseAll,
    expandAll,
    collapsedIds,
    stats,
    resetToBlank,
    loadSample,
    exportJson,
    addToast,
  } = useCurriculum();

  const [showMenu, setShowMenu] = useState(false);
  const areAllCollapsed = collapsedIds.size > 0;

  const handleCopyJson = () => {
    const json = exportJson();
    navigator.clipboard.writeText(json);
    addToast('Curriculum JSON copied to clipboard', 'info');
    setShowMenu(false);
  };

  const handleDownloadJson = () => {
    const json = exportJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${curriculum.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'curriculum'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Curriculum downloaded as JSON file', 'success');
    setShowMenu(false);
  };

  return (
    <div className="w-full space-y-4 select-none font-sans pb-2 border-b border-slate-200/80">
      {/* Program Title, Description & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Program / Curriculum Title */}
            <InlineText
              value={curriculum.title}
              id="program-title"
              onChange={(newTitle) => updateCurriculumHeader(newTitle, undefined)}
              placeholder="Program Title"
              tag="h1"
              className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight"
              inputClassName="text-xl sm:text-2xl font-bold py-1"
            />
          </div>

          {/* Ghost Description with ✧ prompt */}
          <div>
            <InlineText
              value={curriculum.description}
              id="program-desc"
              onChange={(newDesc) => updateCurriculumHeader(undefined, newDesc)}
              placeholder="Add description..."
              isDescription
              multiline
              emptyPrompt="Click to Add Description ✧"
              tag="p"
              className="text-xs text-slate-500 hover:text-[#EC8601]"
              inputClassName="text-xs text-slate-700 py-1.5"
            />
          </div>

          {/* Status Badges Under Title */}
          <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
            <span className="text-slate-600 flex items-center gap-1.5 text-[11px] bg-slate-100 font-medium px-2.5 py-0.5 rounded-full">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{stats.moduleCount} Modules · {stats.topicCount} Topics · {stats.lessonCount} Lessons</span>
            </span>
          </div>
        </div>

        {/* Right Top Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Collapse / Expand Toggle */}
          <button
            type="button"
            onClick={areAllCollapsed ? expandAll : collapseAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors shadow-2xs"
            title={areAllCollapsed ? 'Expand all modules' : 'Collapse all modules'}
          >
            {areAllCollapsed ? (
              <>
                <ChevronsUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Expand All</span>
              </>
            ) : (
              <>
                <ChevronsDownUp className="w-3.5 h-3.5 text-slate-500" />
                <span>Collapse All</span>
              </>
            )}
          </button>

          {/* Upload PDF CTA */}
          <button
            type="button"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EC8601] hover:bg-[#D97706] text-white font-semibold text-xs shadow-xs transition-all hover:shadow-md transform active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upload PDF</span>
          </button>

          {/* + Add Module Button */}
          <button
            type="button"
            id="header-add-module-btn"
            onClick={() => addModule()}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-slate-300 text-slate-800 hover:bg-slate-100 font-semibold text-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#EC8601]" />
            <span>+ Add Module</span>
          </button>

          {/* More Actions Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-1.5 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 p-1 z-30 animate-fade-in text-xs">
                <button
                  type="button"
                  onClick={() => {
                    loadSample();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg text-left"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#EC8601]" />
                  <span>Load Sample Preset</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetToBlank();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg text-left"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reset to Blank</span>
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg text-left"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy JSON</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg text-left"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download .json</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
