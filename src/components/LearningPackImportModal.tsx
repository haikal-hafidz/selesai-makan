import React, { useState } from 'react';
import {
  FileCode,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  Layers,
  X,
  ArrowRight,
} from 'lucide-react';
import {
  LearningPackValidationResult,
  LearningClass,
} from '../types';
import { validateLearningPack, importLearningPack } from '../services/learningPack';

interface LearningPackImportModalProps {
  existingClasses: LearningClass[];
  onImportComplete: (classId: string) => void;
  onClose: () => void;
}

export const LearningPackImportModal: React.FC<LearningPackImportModalProps> = ({
  existingClasses,
  onImportComplete,
  onClose,
}) => {
  const [fileName, setFileName] = useState<string>('');
  const [validation, setValidation] = useState<LearningPackValidationResult | null>(null);
  const [importMode, setImportMode] = useState<'new' | 'existing'>('new');
  const [targetClassId, setTargetClassId] = useState<string>(
    existingClasses.length > 0 ? existingClasses[0].id : ''
  );
  const [overrideTitle, setOverrideTitle] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successSummary, setSuccessSummary] = useState<string | null>(null);

  const handleFileSelected = (file: File) => {
    setFileName(file.name);
    setError(null);
    setSuccessSummary(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const parsed = JSON.parse(content);
        const result = validateLearningPack(parsed);
        setValidation(result);
        if (result.isValid && result.data) {
          setOverrideTitle(result.data.class.title);
        }
      } catch (err: unknown) {
        setValidation({
          isValid: false,
          schemaVersion: 'unknown',
          errors: ['JSON Parse Error: ' + (err instanceof Error ? err.message : 'Invalid JSON file.')],
          warnings: [],
          unsupportedFeatures: [],
          summary: {
            classesCount: 0,
            chaptersCount: 0,
            lessonsCount: 0,
            exercisesCount: 0,
            assignmentsCount: 0,
            hasFinalProject: false,
            quizzesCount: 0,
            resourcesCount: 0,
          },
        });
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (!validation || !validation.isValid || !validation.data) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const result = await importLearningPack(validation.data, {
        targetClassId: importMode === 'existing' ? targetClassId : undefined,
        overrideTitle: importMode === 'new' && overrideTitle.trim() ? overrideTitle.trim() : undefined,
      });

      setSuccessSummary(
        `Successfully imported ${result.chaptersCount} chapters, ${result.lessonsCount} lessons, ${result.assignmentsCount} assignments, ${result.quizzesCount} quizzes, and ${result.resourcesCount} resources into "${result.createdClass.title}".`
      );

      setTimeout(() => {
        onImportComplete(result.classId);
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to import Learning Pack.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="flex h-full max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <FileCode size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Import Learning Pack (.json)</h2>
              <p className="text-xs text-stone-500">
                Load AI-generated courses, syllabus structures, practical assignments, quizzes, and attachments.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successSummary && (
            <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successSummary}</span>
            </div>
          )}

          {/* 1. File Upload Dropzone */}
          {!validation && (
            <div className="border-2 border-dashed border-stone-300 hover:border-amber-400 rounded-2xl p-10 text-center transition bg-stone-50/50">
              <FileCode size={40} className="mx-auto text-amber-600 mb-3" />
              <h3 className="text-base font-semibold text-stone-800 mb-1">
                Select or drop your Learning Pack JSON
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto mb-4">
                Structured file containing class syllabus, lesson notes, exercises, quizzes, assignments, and resources.
              </p>
              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition cursor-pointer shadow-xs">
                <span>Browse JSON File</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelected(f);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* 2. Validation & Preview Panel */}
          {validation && (
            <div className="space-y-6">
              {/* File details pill */}
              <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Schema v{validation.schemaVersion}
                  </span>
                  <span className="text-sm font-medium text-stone-800 truncate">{fileName || 'learning-pack.json'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setValidation(null);
                    setFileName('');
                  }}
                  className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                >
                  Choose another file
                </button>
              </div>

              {/* Validation Status message */}
              {validation.isValid ? (
                <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="font-semibold text-emerald-950 block">Valid Learning Pack Schema</strong>
                    <p className="mt-0.5">
                      Ready to import. All required metadata, chapters, lessons, quizzes, and assignments are validated.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 text-red-900 border border-red-200 rounded-xl text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-red-950">
                    <AlertCircle size={16} className="text-red-600 shrink-0" />
                    <span>Package Validation Failed</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-red-800">
                    {validation.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings if any */}
              {validation.warnings.length > 0 && (
                <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs flex items-start gap-2">
                  <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold block">Package Warnings:</span>
                    <ul className="list-disc list-inside space-y-0.5 mt-0.5">
                      {validation.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                    Classes
                  </span>
                  <div className="text-lg font-bold text-stone-800 mt-0.5">
                    {validation.summary.classesCount}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                    Chapters
                  </span>
                  <div className="text-lg font-bold text-amber-700 mt-0.5">
                    {validation.summary.chaptersCount}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                    Lessons
                  </span>
                  <div className="text-lg font-bold text-stone-800 mt-0.5">
                    {validation.summary.lessonsCount}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                    Exercises
                  </span>
                  <div className="text-lg font-bold text-stone-800 mt-0.5">
                    {validation.summary.exercisesCount}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                    Assignments
                  </span>
                  <div className="text-lg font-bold text-emerald-700 mt-0.5">
                    {validation.summary.assignmentsCount}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                    Quizzes
                  </span>
                  <div className="text-lg font-bold text-stone-800 mt-0.5">
                    {validation.summary.quizzesCount}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                    Resources
                  </span>
                  <div className="text-lg font-bold text-stone-800 mt-0.5">
                    {validation.summary.resourcesCount}
                  </div>
                </div>
              </div>

              {/* Package Content Preview List */}
              {validation.data && (
                <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                      Curriculum Preview
                    </h4>
                    {validation.summary.hasFinalProject && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        Includes Final Capstone Project
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {validation.data.chapters.map((ch, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-stone-200 text-xs">
                        <div className="font-semibold text-stone-900 flex items-center justify-between">
                          <span>
                            Chapter {idx + 1}: {ch.title}
                          </span>
                          <span className="text-[11px] text-stone-400">
                            {ch.lessons?.length || 0} lessons
                          </span>
                        </div>
                        {ch.lessons && ch.lessons.length > 0 && (
                          <div className="pl-3 mt-1.5 space-y-0.5 border-l-2 border-amber-200 text-stone-600">
                            {ch.lessons.map((ls, lIdx) => (
                              <div key={lIdx} className="flex items-center gap-1.5 truncate">
                                <span>• {ls.title}</span>
                                {ls.quiz ? (
                                  <span className="text-amber-700 font-medium text-[11px]">(Quiz)</span>
                                ) : null}
                                {ls.assignments && ls.assignments.length > 0 ? (
                                  <span className="text-emerald-700 font-medium text-[11px]">
                                    ({ls.assignments.length} Assignment{ls.assignments.length > 1 ? 's' : ''})
                                  </span>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Destination Mode: Create New vs Add to Existing */}
              {validation.isValid && (
                <div className="space-y-4 border-t border-stone-200 pt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Import Destination
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      onClick={() => setImportMode('new')}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                        importMode === 'new'
                          ? 'border-amber-600 bg-amber-50/50'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={importMode === 'new'}
                        onChange={() => setImportMode('new')}
                        className="mt-0.5 text-amber-600"
                      />
                      <div>
                        <div className="font-semibold text-sm text-stone-900 flex items-center gap-1.5">
                          <FolderPlus size={15} />
                          <span>Create New Class</span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Import as a separate class in your learning catalog.
                        </p>
                      </div>
                    </label>

                    <label
                      onClick={() => setImportMode('existing')}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                        importMode === 'existing'
                          ? 'border-amber-600 bg-amber-50/50'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={importMode === 'existing'}
                        onChange={() => setImportMode('existing')}
                        disabled={existingClasses.length === 0}
                        className="mt-0.5 text-amber-600"
                      />
                      <div>
                        <div className="font-semibold text-sm text-stone-900 flex items-center gap-1.5">
                          <Layers size={15} />
                          <span>Add to Existing Class</span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Append chapters and materials to an existing class without overwriting.
                        </p>
                      </div>
                    </label>
                  </div>

                  {importMode === 'new' && (
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">
                        Class Title in Catalog
                      </label>
                      <input
                        type="text"
                        value={overrideTitle}
                        onChange={(e) => setOverrideTitle(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}

                  {importMode === 'existing' && (
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">
                        Select Target Class
                      </label>
                      <select
                        value={targetClassId}
                        onChange={(e) => setTargetClassId(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-amber-500 bg-white"
                      >
                        {existingClasses.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.title} ({cls.subject})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 px-6 py-4 bg-stone-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          >
            Cancel
          </button>
          {validation && validation.isValid && (
            <button
              type="button"
              disabled={isSubmitting || !validation.data}
              onClick={handleExecuteImport}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white font-medium text-xs hover:bg-amber-700 disabled:opacity-50 transition cursor-pointer shadow-xs"
            >
              <span>{isSubmitting ? 'Importing into IndexedDB...' : 'Confirm & Import Package'}</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
