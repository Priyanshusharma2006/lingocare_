import React from 'react';
import { useCurriculum } from '../context/useCurriculum';
import { ModuleItem } from './ModuleItem';
import { Plus, FolderPlus, Sparkles } from 'lucide-react';

interface CurriculumViewProps {
  onOpenUpload: () => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({ onOpenUpload }) => {
  const { curriculum, addModule } = useCurriculum();

  return (
    <div className="w-full space-y-4 pb-24">
      {curriculum.modules.length === 0 ? (
        /* Empty Curriculum State */
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center space-y-4 my-6">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF8EE] text-[#EC8601] flex items-center justify-center mx-auto shadow-xs">
            <FolderPlus className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-800">
              No Modules in Curriculum Yet
            </h3>
            <p className="text-xs text-slate-500">
              Start structuring your curriculum manually by adding modules, or upload a course PDF syllabus to extract the full hierarchy automatically.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              id="empty-add-module-btn"
              onClick={() => addModule()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#EC8601]" />
              <span>Add First Module</span>
            </button>
            <button
              type="button"
              id="empty-upload-btn"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#EC8601] hover:bg-[#D97706] text-white rounded-lg transition-colors shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upload PDF Syllabus</span>
            </button>
          </div>
        </div>
      ) : (
        /* Render All Modules */
        <div className="space-y-4">
          {curriculum.modules.map((module, mIdx) => (
            <ModuleItem key={module.id} module={module} index={mIdx} />
          ))}

          {/* Bottom Add Module Button */}
          <div className="pt-4 flex items-center justify-center">
            <button
              type="button"
              id="bottom-add-module-btn"
              onClick={() => addModule()}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-800 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/90 rounded-full shadow-2xs transition-all"
            >
              <Plus className="w-4 h-4 text-[#EC8601]" />
              <span>+ Add Module</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
