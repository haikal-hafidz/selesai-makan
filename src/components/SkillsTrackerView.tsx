import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Link,
  Trash2,
} from 'lucide-react';
import { Skill, SkillLevel, LearningClass, AssignmentSubmission } from '../types';

interface SkillsTrackerViewProps {
  skills: Skill[];
  classes?: LearningClass[];
  submissions: AssignmentSubmission[];
  onSaveSkill: (skill: Skill) => Promise<void>;
  onDeleteSkill: (skillId: string) => Promise<void>;
}

export const SkillsTrackerView: React.FC<SkillsTrackerViewProps> = ({
  skills,
  submissions,
  onSaveSkill,
  onDeleteSkill,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [targetSkillId, setTargetSkillId] = useState<string | null>(null);

  // New Skill form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Data Analysis');
  const [criteriaInput, setCriteriaInput] = useState('');

  // Evidence form
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('');

  const categories = ['All', ...Array.from(new Set(skills.map((s) => s.category)))];

  const filteredSkills = skills.filter(
    (s) => selectedCategory === 'All' || s.category === selectedCategory
  );

  const getLevelBadge = (level: SkillLevel) => {
    switch (level) {
      case 'mastered':
        return <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Mastered</span>;
      case 'demonstrated':
        return <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">Demonstrated</span>;
      case 'practicing':
        return <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Practicing</span>;
      case 'learning':
        return <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded">Learning</span>;
      default:
        return <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 bg-stone-100 px-2 py-0.5 rounded">Not Started</span>;
    }
  };

  const handleCreateSkill = async () => {
    if (!name.trim()) return;
    const criteria = criteriaInput
      .split('\n')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      category: category.trim() || 'General',
      level: 'not_started',
      proficiencyCriteria: criteria.length > 0 ? criteria : ['Successfully apply concept in realistic tasks'],
      relatedClassIds: [],
      evidence: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await onSaveSkill(newSkill);
    setIsSkillModalOpen(false);
    setName('');
    setDescription('');
    setCriteriaInput('');
  };

  const handleUpdateLevel = async (skill: Skill, newLevel: SkillLevel) => {
    await onSaveSkill({
      ...skill,
      level: newLevel,
      lastDemonstratedAt: newLevel === 'demonstrated' || newLevel === 'mastered' ? Date.now() : skill.lastDemonstratedAt,
      updatedAt: Date.now(),
    });
  };

  const handleAddEvidence = async () => {
    if (!targetSkillId || !evidenceTitle.trim()) return;
    const target = skills.find((s) => s.id === targetSkillId);
    if (!target) return;

    const newEvidence = {
      id: crypto.randomUUID(),
      title: evidenceTitle.trim(),
      type: selectedSubmissionId ? ('assignment' as const) : ('reflection' as const),
      referenceId: selectedSubmissionId || undefined,
      notes: evidenceNotes.trim() || undefined,
      attachedAt: Date.now(),
    };

    const updated: Skill = {
      ...target,
      evidence: [...target.evidence, newEvidence],
      level: target.level === 'not_started' || target.level === 'learning' ? 'demonstrated' : target.level,
      lastDemonstratedAt: Date.now(),
      updatedAt: Date.now(),
    };

    await onSaveSkill(updated);
    setIsEvidenceModalOpen(false);
    setEvidenceTitle('');
    setEvidenceNotes('');
    setSelectedSubmissionId('');
    setTargetSkillId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Skills & Competency Matrix
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Measure verifiable practical capabilities backed by assignment deliverables, projects, and workbooks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsSkillModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition cursor-pointer shadow-xs"
        >
          <Plus size={15} />
          <span>New Competency</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
              selectedCategory === cat
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-stone-300 text-center text-xs text-stone-500 max-w-lg mx-auto">
          No competencies defined yet. Create your first skill to start collecting evidence and tracking proficiency.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col justify-between shadow-2xs hover:border-amber-300 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                    {skill.category}
                  </span>
                  <div className="flex items-center gap-2">
                    {getLevelBadge(skill.level)}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Delete this skill?')) onDeleteSkill(skill.id);
                      }}
                      className="text-stone-300 hover:text-red-600 cursor-pointer p-0.5"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-stone-900 text-base">{skill.name}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{skill.description}</p>

                {/* Criteria */}
                {skill.proficiencyCriteria && skill.proficiencyCriteria.length > 0 && (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-[11px] text-stone-700 space-y-1">
                    <div className="font-bold text-[10px] uppercase text-stone-400">
                      Proficiency Criteria
                    </div>
                    {skill.proficiencyCriteria.map((crit, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 size={12} className="text-amber-600 shrink-0 mt-0.5" />
                        <span>{crit}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Evidence Attached */}
                <div className="text-[11px] text-stone-500">
                  <span className="font-semibold text-stone-700">Evidence Count:</span>{' '}
                  {skill.evidence.length} artifact(s)
                </div>
              </div>

              {/* Footer actions */}
              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                <select
                  value={skill.level}
                  onChange={(e) => handleUpdateLevel(skill, e.target.value as SkillLevel)}
                  className="text-xs font-semibold p-1.5 rounded-lg border border-stone-200 bg-white"
                >
                  <option value="not_started">Not Started</option>
                  <option value="learning">Learning</option>
                  <option value="practicing">Practicing</option>
                  <option value="demonstrated">Demonstrated</option>
                  <option value="mastered">Mastered</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setTargetSkillId(skill.id);
                    setIsEvidenceModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-900 cursor-pointer"
                >
                  <Link size={12} />
                  <span>Attach Evidence</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Skill */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900">Add New Competency</h3>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Skill Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Advanced Two-Way Lookup (INDEX & MATCH)"
                className="w-full p-2 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Data Analysis, Modeling, Automation..."
                className="w-full p-2 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ability to perform flexible lookups in any direction without VLOOKUP column restrictions..."
                rows={2}
                className="w-full p-2 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Proficiency Criteria (One per line)
              </label>
              <textarea
                value={criteriaInput}
                onChange={(e) => setCriteriaInput(e.target.value)}
                placeholder="Can construct left-lookup without error&#10;Can explain exact vs approximate match"
                rows={3}
                className="w-full p-2 text-xs rounded-xl border border-stone-200 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSkillModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateSkill}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
              >
                Save Skill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Attach Evidence */}
      {isEvidenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900">Attach Skill Demonstration Evidence</h3>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Evidence Title</label>
              <input
                type="text"
                value={evidenceTitle}
                onChange={(e) => setEvidenceTitle(e.target.value)}
                placeholder="e.g. Sales Report Workbook Submission"
                className="w-full p-2 text-xs rounded-xl border border-stone-200"
              />
            </div>
            {submissions.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Link to Practical Submission (Optional)
                </label>
                <select
                  value={selectedSubmissionId}
                  onChange={(e) => setSelectedSubmissionId(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white"
                >
                  <option value="">None / Manual Evidence</option>
                  {submissions.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.fileName || `Submission ${sub.id.slice(0, 6)}`} (Score: {sub.score ?? 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Reflections or Notes
              </label>
              <textarea
                value={evidenceNotes}
                onChange={(e) => setEvidenceNotes(e.target.value)}
                placeholder="Demonstrated two-way lookup with INDEX and MATCH inside the capstone sales model."
                rows={2}
                className="w-full p-2 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEvidenceModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddEvidence}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
              >
                Attach Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
