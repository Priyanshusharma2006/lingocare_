import React from 'react';
import type { Lesson } from '../types';
import { InlineText } from './InlineText';
import { DeleteConfirmButton } from './DeleteConfirmButton';
import { useCurriculum } from '../context/useCurriculum';

interface LessonItemProps {
  moduleId: string;
  topicId: string;
  lesson: Lesson;
  index: number;
  topicIndex?: string;
}

export const LessonItem: React.FC<LessonItemProps> = ({
  moduleId,
  topicId,
  lesson,
  index,
  topicIndex: _topicIndex,
}) => {
  const { updateLesson, deleteLesson } = useCurriculum();

  return (
    <div
      id={`lesson-${lesson.id}`}
      className="group/lesson group/row relative flex items-start justify-between p-2.5 sm:p-3 rounded-lg bg-white hover:bg-slate-50/80 transition-all border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs my-1.5 ml-1"
    >
      <div className="flex items-start gap-2.5 flex-1 min-w-0 pr-2">
        {/* Lesson Index Indicator */}
        <div className="flex items-center justify-center w-5 h-5 rounded bg-slate-100 text-slate-500 font-mono text-[10px] font-semibold shrink-0 mt-0.5" title={`Lesson ${index + 1}`}>
          {index + 1}
        </div>

        <div className="flex-1 min-w-0 space-y-0.5">
          {/* Lesson Title (Level 4 Typography: text-sm font-medium) */}
          <div className="flex items-center gap-1.5">
            <InlineText
              value={lesson.title}
              id={`lesson-title-${lesson.id}`}
              onChange={(newTitle) =>
                updateLesson(moduleId, topicId, lesson.id, { title: newTitle })
              }
              placeholder="Lesson Title"
              tag="h4"
              className="text-sm font-medium text-slate-800 tracking-tight block"
              inputClassName="text-sm font-medium py-1"
            />
          </div>

          {/* Lesson Description */}
          <InlineText
            value={lesson.description}
            id={`lesson-desc-${lesson.id}`}
            onChange={(newDesc) =>
              updateLesson(moduleId, topicId, lesson.id, { description: newDesc })
            }
            placeholder="Add lesson description..."
            isDescription
            multiline
            emptyPrompt="Click to Add Description ✧"
            tag="p"
            className="text-xs text-slate-500 hover:text-[#EC8601] leading-relaxed block"
            inputClassName="text-xs text-slate-600 py-1"
          />
        </div>
      </div>

      {/* Delete button (hover-revealed) */}
      <div className="opacity-0 group-hover/lesson:opacity-100 focus-within:opacity-100 transition-opacity shrink-0 pt-0.5">
        <DeleteConfirmButton
          onDelete={() => deleteLesson(moduleId, topicId, lesson.id)}
          itemType="lesson"
          id={`delete-lesson-${lesson.id}`}
          requireConfirm={false}
        />
      </div>
    </div>
  );
};
