import React, { useState } from 'react';
import {
  Plus,
  ArrowRight,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { LearningPath, LearningClass, Lesson } from '../types';

interface LearningPathsViewProps {
  paths: LearningPath[];
  classes: LearningClass[];
  lessons: Lesson[];
  onSavePath: (path: LearningPath) => Promise<void>;
  onDeletePath: (pathId: string) => Promise<void>;
  onOpenClass: (classId: string) => void;
}

export const LearningPathsView: React.FC<LearningPathsViewProps> = ({
  paths,
  classes,
  lessons,
  onSavePath,
  onDeletePath,
  onOpenClass,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Career Track');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  const handleCreatePath = async () => {
    if (!title.trim() || selectedClassIds.length === 0) return;

    const steps = selectedClassIds.map((cId, idx) => ({
      classId: cId,
      order: idx + 1,
      prerequisites: idx > 0 ? [selectedClassIds[idx - 1]] : undefined,
    }));

    const newPath: LearningPath = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'General',
      objectives: ['Complete all course milestones in sequence.'],
      steps,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await onSavePath(newPath);
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setSelectedClassIds([]);
  };

  const toggleClassSelection = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Structured Learning Pathways
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Sequenced multi-course tracks combining foundational prerequisites with applied projects.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition cursor-pointer shadow-xs"
        >
          <Plus size={15} />
          <span>New Learning Path</span>
        </button>
      </div>

      {/* Pathways List */}
      {paths.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-stone-300 text-center text-xs text-stone-500 max-w-lg mx-auto">
          No learning paths created yet. Chain your courses together into structured sequential curricula.
        </div>
      ) : (
        <div className="space-y-6">
          {paths.map((p) => {
            // Calculate pathway progress
            let totalLessonsInPath = 0;
            let completedLessonsInPath = 0;

            const pathClasses = p.steps
              .map((s) => {
                const target = classes.find((c) => c.id === s.classId);
                if (!target) return null;
                const cLessons = lessons.filter((l) => l.classId === target.id);
                totalLessonsInPath += cLessons.length;
                completedLessonsInPath += cLessons.filter((l) => l.isCompleted).length;
                return {
                  cls: target,
                  order: s.order,
                  lessonCount: cLessons.length,
                  completedCount: cLessons.filter((l) => l.isCompleted).length,
                };
              })
              .filter(Boolean);

            const pathProgress =
              totalLessonsInPath > 0
                ? Math.round((completedLessonsInPath / totalLessonsInPath) * 100)
                : 0;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded uppercase tracking-wider">
                        {p.category}
                      </span>
                      <span className="text-xs font-semibold text-stone-500">
                        {pathProgress}% Pathway Completed
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-stone-900 mt-1">{p.title}</h2>
                    <p className="text-xs text-stone-500">{p.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete this learning path?')) onDeletePath(p.id);
                    }}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${pathProgress}%` }}
                  />
                </div>

                {/* Steps Sequence */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Sequenced Courses in Pathway
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pathClasses.map((item, idx) => {
                      if (!item) return null;
                      const isComplete = item.lessonCount > 0 && item.lessonCount === item.completedCount;
                      return (
                        <div
                          key={item.cls.id}
                          className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="text-[10px] font-bold text-stone-400 uppercase">
                                Step {idx + 1}
                              </span>
                              {isComplete ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                  <CheckCircle2 size={11} /> Completed
                                </span>
                              ) : (
                                <span className="text-[11px] font-medium text-stone-500">
                                  {item.completedCount}/{item.lessonCount} lessons
                                </span>
                              )}
                            </div>
                            <div className="font-bold text-xs text-stone-900 line-clamp-1 mb-1">
                              {item.cls.title}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onOpenClass(item.cls.id)}
                            className="mt-3 text-[11px] font-semibold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open Course</span>
                            <ArrowRight size={11} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Learning Path */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900">Create Structured Learning Path</h3>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Path Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete Financial & Business Analytics Track"
                className="w-full p-2 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Data Modeling, Career Path..."
                className="w-full p-2 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="From spreadsheet basics to executive business reporting dashboards..."
                rows={2}
                className="w-full p-2 text-xs rounded-xl border border-stone-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Select Courses to Include (in Sequence)
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto border border-stone-200 rounded-xl p-2">
                {classes.map((cls) => (
                  <label
                    key={cls.id}
                    className="flex items-center gap-2 text-xs text-stone-700 hover:bg-stone-50 p-1.5 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClassIds.includes(cls.id)}
                      onChange={() => toggleClassSelection(cls.id)}
                      className="rounded text-amber-600"
                    />
                    <span className="truncate">{cls.title}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreatePath}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
              >
                Create Pathway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
