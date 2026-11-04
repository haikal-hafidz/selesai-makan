import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { PortfolioProject, LearningClass, ResourceItem } from '../types';

interface PortfolioViewProps {
  projects: PortfolioProject[];
  classes: LearningClass[];
  resources?: ResourceItem[];
  onSaveProject: (project: PortfolioProject) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  projects,
  classes,
  onSaveProject,
  onDeleteProject,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Data Analysis');
  const [classId, setClassId] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [outcomesInput, setOutcomesInput] = useState('');
  const [reflection, setReflection] = useState('');

  const handleCreateProject = async () => {
    if (!title.trim()) return;

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const outcomes = outcomesInput
      .split('\n')
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    const newProject: PortfolioProject = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'General',
      classId: classId || undefined,
      skillsDemonstrated: skills,
      status: 'completed',
      keyOutcomes: outcomes.length > 0 ? outcomes : ['Delivered structured project artifacts'],
      reflection: reflection.trim() || undefined,
      completedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await onSaveProject(newProject);
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setSkillsInput('');
    setOutcomesInput('');
    setReflection('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Personal Work Portfolio
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Turn completed practical assignments, workbooks, and capstone models into demonstrable proof of capability.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition cursor-pointer shadow-xs"
        >
          <Plus size={15} />
          <span>Add Portfolio Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-stone-300 text-center text-xs text-stone-500 max-w-lg mx-auto">
          No portfolio projects added yet. Showcase your completed assignments, Excel models, and case studies here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => {
            const parentClass = classes.find((c) => c.id === proj.classId);
            return (
              <div
                key={proj.id}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded uppercase tracking-wider">
                      {proj.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                        {proj.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Delete this portfolio project?')) onDeleteProject(proj.id);
                        }}
                        className="text-stone-300 hover:text-red-600 cursor-pointer p-0.5"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-stone-900 text-lg">{proj.title}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{proj.description}</p>

                  {/* Skills Demonstrated */}
                  {proj.skillsDemonstrated.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {proj.skillsDemonstrated.map((sk) => (
                        <span
                          key={sk}
                          className="text-[10px] font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Outcomes */}
                  {proj.keyOutcomes.length > 0 && (
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-[11px] text-stone-700 space-y-1">
                      <div className="font-bold text-[10px] uppercase text-stone-400">
                        Key Deliverables & Outcomes
                      </div>
                      {proj.keyOutcomes.map((out, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 size={12} className="text-amber-600 shrink-0 mt-0.5" />
                          <span>{out}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reflection */}
                  {proj.reflection && (
                    <p className="text-xs text-stone-500 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                      "{proj.reflection}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span>
                    Completed: {new Date(proj.completedAt || proj.createdAt).toLocaleDateString()}
                  </span>
                  {parentClass && (
                    <span className="font-medium text-stone-600 truncate max-w-[160px]">
                      {parentClass.title}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: New Portfolio Project */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900">Add Portfolio Showcase Project</h3>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Project Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Retail Sales Performance Dashboard"
                className="w-full p-2 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Data Modeling, Finance..."
                  className="w-full p-2 text-xs rounded-xl border border-stone-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Related Course</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white"
                >
                  <option value="">None / Independent</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Built an interactive dashboard in Excel connecting raw ERP transaction tables with dynamic PivotCharts..."
                rows={2}
                className="w-full p-2 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Demonstrated Skills (Comma separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="INDEX & MATCH, PivotTable, Slicers, Data Validation"
                className="w-full p-2 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Deliverables & Outcomes (One per line)
              </label>
              <textarea
                value={outcomesInput}
                onChange={(e) => setOutcomesInput(e.target.value)}
                placeholder="Multi-sheet Excel workbook&#10;Executive summary KPI table"
                rows={2}
                className="w-full p-2 text-xs rounded-xl border border-stone-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Personal Reflection</label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Key lessons learned or obstacles overcome during the project..."
                rows={2}
                className="w-full p-2 text-xs rounded-xl border border-stone-200"
              />
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
                onClick={handleCreateProject}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
              >
                Add to Portfolio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
