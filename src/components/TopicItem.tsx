import React from 'react';
import type { Topic } from '../types';
import { LessonItem } from './LessonItem';
import { InlineText } from './InlineText';
import { DeleteConfirmButton } from './DeleteConfirmButton';
import { useCurriculum } from '../context/useCurriculum';
import { ChevronRight, ChevronDown, Plus } from 'lucide-react';

interface TopicItemProps {
  moduleId: string;
  topic: Topic;
  index: number;
}

export const TopicItem: React.FC<TopicItemProps> = ({
  moduleId,
  topic,
  index,
}) => {
  const {
    updateTopic,
    deleteTopic,
    addLesson,
    isCollapsed,
    toggleCollapse,
  } = useCurriculum();

  const collapsed = isCollapsed(topic.id);

  return (
    <div
      id={`topic-${topic.id}`}
      className="group/topic relative bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs my-3 transition-all"
    >
      {/* Topic Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          {/* Collapse/Expand button */}
          <button
            type="button"
            onClick={() => toggleCollapse(topic.id)}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors mt-0.5 shrink-0"
            title={collapsed ? 'Expand topic' : 'Collapse topic'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-baseline gap-2 min-w-0">
              {/* Topic Title: Topic {n} — Title */}
              <span className="font-bold text-slate-800 text-sm tracking-tight shrink-0 whitespace-nowrap">
                Topic {index + 1} —
              </span>
              <div className="flex-1 min-w-0">
                <InlineText
                  value={topic.title.replace(/^Topic \d+[:\s—-]*/i, '')}
                  id={`topic-title-${topic.id}`}
                  onChange={(newTitle) =>
                    updateTopic(moduleId, topic.id, { title: newTitle })
                  }
                  placeholder="Topic Title"
                  tag="h3"
                  className="text-sm font-bold text-slate-800 tracking-tight"
                  inputClassName="text-sm font-bold py-1"
                />
              </div>
            </div>

            {/* Topic Description with ✧ icon prompt */}
            <InlineText
              value={topic.description}
              id={`topic-desc-${topic.id}`}
              onChange={(newDesc) =>
                updateTopic(moduleId, topic.id, { description: newDesc })
              }
              placeholder="Add topic description..."
              isDescription
              multiline
              emptyPrompt="Click to Add Description ✧"
              tag="p"
              className="text-xs text-slate-500 hover:text-[#EC8601] leading-relaxed block"
              inputClassName="text-xs text-slate-600 py-1"
            />
          </div>
        </div>

        {/* Right Action: Delete Button */}
        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          <DeleteConfirmButton
            onDelete={() => deleteTopic(moduleId, topic.id)}
            itemType="topic"
            id={`delete-topic-${topic.id}`}
            requireConfirm={true}
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 p-1.5"
          />
        </div>
      </div>

      {/* Child Lessons List & Add Lesson Button */}
      {!collapsed && (
        <div className="mt-3 pl-6 space-y-3 animate-fade-in">
          {/* Lessons List */}
          <div className="space-y-1.5">
            {topic.lessons.map((lesson, lIdx) => (
              <LessonItem
                key={lesson.id}
                moduleId={moduleId}
                topicId={topic.id}
                lesson={lesson}
                index={lIdx}
              />
            ))}
          </div>

          {/* Add Lesson Pill Button */}
          <div className="pt-1">
            <button
              type="button"
              id={`add-lesson-to-topic-${topic.id}`}
              onClick={() => addLesson(moduleId, topic.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-200/80 hover:bg-slate-300/80 text-slate-800 text-xs font-semibold transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#EC8601]" />
              <span>+ Add Lesson</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
