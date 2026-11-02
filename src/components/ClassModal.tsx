import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { LearningClass } from '../types';

interface ClassModalProps {
  existingClass?: LearningClass;
  onSave: (cls: Omit<LearningClass, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

const PRESET_SUBJECTS = [
  'Microsoft Excel',
  'Copywriting',
  'Content Strategy',
  'Human Resources',
  'Data Analysis',
  'Product Management',
  'UI/UX Design',
  'Finance & Accounting',
  'Other',
];

const PRESET_COLORS = [
  '#d97706', // amber
  '#2563eb', // blue
  '#059669', // emerald
  '#7c3aed', // violet
  '#db2777', // pink
  '#475569', // slate
];

export const ClassModal: React.FC<ClassModalProps> = ({ existingClass, onSave, onClose }) => {
  const [title, setTitle] = useState(existingClass?.title || '');
  const [subject, setSubject] = useState(existingClass?.subject || PRESET_SUBJECTS[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [description, setDescription] = useState(existingClass?.description || '');
  const [tagsInput, setTagsInput] = useState(existingClass?.tags?.join(', ') || '');
  const [color, setColor] = useState(existingClass?.color || PRESET_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a class title.');
      return;
    }

    const finalSubject = subject === 'Other' && customSubject.trim() ? customSubject.trim() : subject;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSave({
      title: title.trim(),
      description: description.trim(),
      subject: finalSubject,
      tags,
      color,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50">
          <h2 className="text-lg font-bold text-stone-900">
            {existingClass ? 'Edit Learning Class' : 'Create New Learning Class'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
              Class Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced Financial Modeling in Excel"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
              Subject Area
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-amber-500 focus:outline-none bg-white"
            >
              {PRESET_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {subject === 'Other' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                Custom Subject Name
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="e.g. Behavioral Psychology"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
              Description / Objectives
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What are the goals of this learning track?"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Formulas, PivotTables, Shortcuts"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-110 ring-2 ring-stone-900 ring-offset-2' : 'opacity-80'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition cursor-pointer shadow-xs"
            >
              <Plus size={16} />
              <span>{existingClass ? 'Save Changes' : 'Create Class'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
