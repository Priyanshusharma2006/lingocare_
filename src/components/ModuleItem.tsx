import React from 'react';
import type { Module } from '../types';
import { TopicItem } from './TopicItem';
import { InlineText } from './InlineText';
import { DeleteConfirmButton } from './DeleteConfirmButton';
import { useCurriculum } from '../context/useCurriculum';
import { ChevronRight, ChevronDown, Plus } from 'lucide-react';

interface ModuleItemProps {
  module: Module;
  index: number;
}

export const ModuleItem: React.FC<ModuleItemProps> = ({ module, index }) => {
  const {
    updateModule,
    deleteModule,
    addTopic,
    isCollapsed,
    toggleCollapse,
  } = useCurriculum();

  const collapsed = isCollapsed(module.id);

  return (
    <div
      id={`module-${module.id}`}
      className="group/module relative bg-white rounded-2xl border-l-2 border-l-[#EC8601] border-y border-r border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-150 overflow-hidden mb-6"
    >
      {/* Module Header Bar */}
      <div className="p-4 sm:p-5 bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Collapse/Expand button */}
            <button
              type="button"
              id={`toggle-module-${module.id}`}
              onClick={() => toggleCollapse(module.id)}
              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors mt-1 shrink-0"
              title={collapsed ? 'Expand module' : 'Collapse module'}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-baseline gap-2 min-w-0">
                {/* Module Title: MODULE {n} — Title */}
                <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight shrink-0 whitespace-nowrap">
                  MODULE {index + 1} —
                </span>
                <div className="flex-1 min-w-0">
                  <InlineText
                    value={module.title.replace(/^Module \d+[:\s—-]*/i, '')}
                    id={`module-title-${module.id}`}
                    onChange={(newTitle) => updateModule(module.id, { title: newTitle })}
                    placeholder="Module Title"
                    tag="h2"
                    className="text-sm sm:text-base font-bold text-slate-900 tracking-tight"
                    inputClassName="text-sm sm:text-base font-bold py-1"
                  />
                </div>
              </div>

              {/* Module Description with ✧ icon prompt */}
              <InlineText
                value={module.description}
                id={`module-desc-${module.id}`}
                onChange={(newDesc) => updateModule(module.id, { description: newDesc })}
                placeholder="Add module description..."
                isDescription
                multiline
                emptyPrompt="Click to Add Description ✧"
                tag="p"
                className="text-xs text-slate-500 hover:text-[#EC8601] leading-relaxed block"
                inputClassName="text-xs text-slate-700 py-1"
              />
            </div>
          </div>

          {/* Right Action: Delete Button */}
          <div className="flex items-center gap-2 shrink-0 pt-0.5">
            <DeleteConfirmButton
              onDelete={() => deleteModule(module.id)}
              itemType="module"
              id={`delete-module-${module.id}`}
              requireConfirm={true}
              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 p-1.5"
            />
          </div>
        </div>
      </div>

      {/* Collapsible Topics Container */}
      {!collapsed && (
        <div className="px-4 sm:px-6 pb-5 pt-1 space-y-4 animate-fade-in">
          {module.topics.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              No topics in this module yet. Click below to add a topic.
            </div>
          ) : (
            module.topics.map((topic, tIdx) => (
              <TopicItem
                key={topic.id}
                moduleId={module.id}
                topic={topic}
                index={tIdx}
              />
            ))
          )}

          {/* Add Topic Pill Button */}
          <div className="pt-1">
            <button
              type="button"
              id={`add-topic-to-module-${module.id}`}
              onClick={() => addTopic(module.id)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#EC8601]" />
              <span>+ Add Topic</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
