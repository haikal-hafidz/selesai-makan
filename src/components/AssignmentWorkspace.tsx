import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Award,
  AlertCircle,
  Download,
} from 'lucide-react';
import { Assignment, AssignmentSubmission, ResourceItem } from '../types';

interface AssignmentWorkspaceProps {
  assignment: Assignment;
  classId: string;
  lessonId?: string;
  associatedResources?: ResourceItem[];
  existingSubmission?: AssignmentSubmission;
  onSaveSubmission: (submission: AssignmentSubmission) => Promise<void>;
  onBack: () => void;
}

export const AssignmentWorkspace: React.FC<AssignmentWorkspaceProps> = ({
  assignment,
  classId,
  lessonId,
  associatedResources = [],
  existingSubmission,
  onSaveSubmission,
  onBack,
}) => {
  const [submissionType] = useState(assignment.submissionType || 'text');
  const [textResponse, setTextResponse] = useState(existingSubmission?.textResponse || '');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Self-assessment & Rubric state
  const [rubricScores, setRubricScores] = useState<Record<string, number>>(
    existingSubmission?.rubricScores || {}
  );
  const [selfAssessmentDone, setSelfAssessmentDone] = useState(
    existingSubmission?.isEvaluated || false
  );
  const [feedback, setFeedback] = useState(existingSubmission?.feedback || '');

  const evaluationMethod = assignment.evaluationMethod || (assignment.expectedAnswer ? 'automatic' : assignment.rubric && assignment.rubric.length > 0 ? 'rubric' : 'self_assessment');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleScoreChange = (criteria: string, score: number) => {
    setRubricScores((prev) => ({
      ...prev,
      [criteria]: score,
    }));
  };

  const calculateMaxPoints = () => {
    if (!assignment.rubric || assignment.rubric.length === 0) return 100;
    return assignment.rubric.reduce((acc, r) => acc + (r.points || 10), 0);
  };

  const calculateAwardedPoints = () => {
    return Object.values(rubricScores).reduce((acc, v) => acc + v, 0);
  };

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (submissionType === 'text' || submissionType === 'code' || submissionType === 'url') {
      if (!textResponse.trim()) {
        setError('Please provide your response before submitting.');
        return;
      }
    } else if (submissionType === 'file' || submissionType === 'spreadsheet') {
      if (!uploadedFile && !existingSubmission?.fileName) {
        setError('Please select and attach your completed file before submitting.');
        return;
      }
    }

    try {
      setIsSubmitting(true);

      let isEvaluated = false;
      let score: number | undefined = undefined;
      let calculatedFeedback = feedback;

      // 1. Automatic evaluation (deterministic check)
      if (evaluationMethod === 'automatic' && assignment.expectedAnswer) {
        const cleanExpected = assignment.expectedAnswer.trim().toLowerCase();
        const cleanActual = textResponse.trim().toLowerCase();
        const isMatch = cleanActual === cleanExpected || cleanActual.includes(cleanExpected);
        score = isMatch ? 100 : 0;
        isEvaluated = true;
        calculatedFeedback = isMatch
          ? 'Automated check passed: Response matches expected criteria.'
          : `Automated check notice: Expected "${assignment.expectedAnswer}".`;
      }

      // 2. Rubric-based self evaluation if already filled
      if (evaluationMethod === 'rubric' && assignment.rubric) {
        const awarded = calculateAwardedPoints();
        const max = calculateMaxPoints();
        score = Math.round((awarded / max) * 100);
        isEvaluated = Object.keys(rubricScores).length === assignment.rubric.length;
      }

      const submission: AssignmentSubmission = {
        id: existingSubmission?.id || crypto.randomUUID(),
        assignmentId: assignment.id,
        classId,
        lessonId: lessonId || assignment.lessonId,
        submissionType,
        textResponse: textResponse.trim(),
        fileName: uploadedFile ? uploadedFile.name : existingSubmission?.fileName,
        fileBlob: uploadedFile || existingSubmission?.fileBlob,
        dataUrl: existingSubmission?.dataUrl,
        evaluationMethod,
        isEvaluated,
        score,
        maxScore: 100,
        rubricScores,
        feedback: calculatedFeedback,
        submittedAt: Date.now(),
        evaluatedAt: isEvaluated ? Date.now() : undefined,
      };

      await onSaveSubmission(submission);
      setSelfAssessmentDone(isEvaluated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteSelfAssessment = async () => {
    if (!existingSubmission) return;

    let score = existingSubmission.score;
    if (evaluationMethod === 'rubric' && assignment.rubric) {
      const awarded = calculateAwardedPoints();
      const max = calculateMaxPoints();
      score = Math.round((awarded / max) * 100);
    } else {
      score = 100; // Completed self check
    }

    const updated: AssignmentSubmission = {
      ...existingSubmission,
      isEvaluated: true,
      score,
      rubricScores,
      feedback: feedback.trim() || 'Self-evaluation completed against model guidelines.',
      evaluatedAt: Date.now(),
    };

    await onSaveSubmission(updated);
    setSelfAssessmentDone(true);
  };

  // Find target template resources matching assignment
  const targetResources = associatedResources.filter((r) => {
    if (assignment.attachmentResourceNames && assignment.attachmentResourceNames.length > 0) {
      return assignment.attachmentResourceNames.includes(r.name);
    }
    return false;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
              Practical Assignment
            </span>
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
              Format: {submissionType.toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mt-1.5">{assignment.title}</h1>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-xl border border-stone-300 hover:bg-stone-50 transition cursor-pointer"
        >
          Back to Practice Center
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Brief & Instructions */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-600">Task Brief & Objectives</h3>
        <p className="text-sm text-stone-700 leading-relaxed">{assignment.description}</p>

        <div className="border-t border-stone-100 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">Step-by-Step Instructions</h4>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-stone-700 leading-relaxed">
            {assignment.instructions.map((inst, idx) => (
              <li key={idx} className="pl-1">
                {inst}
              </li>
            ))}
          </ol>
        </div>

        {/* Downloadable templates / datasets */}
        {targetResources.length > 0 && (
          <div className="border-t border-stone-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
              Provided Starter Files & Templates
            </h4>
            <div className="flex flex-wrap gap-2">
              {targetResources.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 text-xs text-stone-800"
                >
                  <FileText size={15} className="text-amber-700" />
                  <span className="font-medium truncate max-w-[200px]">{res.name}</span>
                  {res.dataBlob && (
                    <button
                      type="button"
                      onClick={() => {
                        const url = URL.createObjectURL(res.dataBlob!);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = res.name;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-900 underline ml-2 cursor-pointer"
                    >
                      <Download size={12} /> Download
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submission Area */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700">Your Submission</h3>
          {existingSubmission && (
            <span className="text-[11px] text-stone-400">
              Last submitted: {new Date(existingSubmission.submittedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {(submissionType === 'text' || submissionType === 'code' || submissionType === 'url') && (
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              {submissionType === 'url' ? 'Project / Document URL' : 'Written Response / Work Output'}
            </label>
            <textarea
              value={textResponse}
              onChange={(e) => setTextResponse(e.target.value)}
              rows={submissionType === 'url' ? 2 : 6}
              placeholder={
                submissionType === 'url'
                  ? 'https://example.com/my-project'
                  : 'Enter your response, analysis, written copy, or formulas here...'
              }
              className="w-full p-3 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
        )}

        {(submissionType === 'file' || submissionType === 'spreadsheet') && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-stone-600">
              Completed {submissionType === 'spreadsheet' ? 'Spreadsheet (.xlsx / .csv)' : 'File'}
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-medium transition cursor-pointer">
                <Upload size={14} />
                <span>Choose File to Upload</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={submissionType === 'spreadsheet' ? '.xlsx,.xls,.csv' : '*'}
                  className="hidden"
                />
              </label>
              {(uploadedFile || existingSubmission?.fileName) && (
                <span className="text-xs text-stone-600 font-medium">
                  Attached: {uploadedFile ? uploadedFile.name : existingSubmission?.fileName}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Submit Action */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Saving Submission...' : existingSubmission ? 'Update Submission' : 'Submit Work'}</span>
          </button>
        </div>
      </div>

      {/* Evaluation & Feedback Section */}
      {existingSubmission && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <Award size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Evaluation & Self-Assessment</h3>
                <p className="text-[11px] text-stone-500">
                  Method: {evaluationMethod.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>

            {existingSubmission.score !== undefined && (
              <div className="text-right">
                <span className="text-xs text-stone-500 block">Score</span>
                <span className="text-lg font-bold text-emerald-700">{existingSubmission.score} / 100</span>
              </div>
            )}
          </div>

          {/* 1. Model Answer / Answer Key Comparison */}
          {assignment.answerKeyOrModelAnswer && (
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Official Answer Key & Model Answer
              </h4>
              <pre className="text-xs text-stone-800 whitespace-pre-wrap font-sans bg-white p-3 rounded-lg border border-amber-100 leading-relaxed">
                {assignment.answerKeyOrModelAnswer}
              </pre>
            </div>
          )}

          {/* 2. Evaluation Rubric Interactive Scoring */}
          {assignment.rubric && assignment.rubric.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Rubric Evaluation Breakdown
              </h4>
              <div className="space-y-3">
                {assignment.rubric.map((item, idx) => {
                  const maxPts = item.points || 10;
                  const currentScore = rubricScores[item.criteria] ?? 0;

                  return (
                    <div key={idx} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold text-xs text-stone-900">{item.criteria}</div>
                          <p className="text-[11px] text-stone-500 mt-0.5">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <label className="text-[11px] font-medium text-stone-600">Points:</label>
                          <input
                            type="number"
                            min={0}
                            max={maxPts}
                            value={currentScore}
                            onChange={(e) => handleScoreChange(item.criteria, Number(e.target.value))}
                            className="w-14 px-2 py-1 text-xs text-center font-bold bg-white rounded border border-stone-300 focus:outline-none focus:border-amber-500"
                          />
                          <span className="text-xs text-stone-400">/ {maxPts}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feedback & Confirmation Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Review Notes & Self-Evaluation Reflection
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={2}
              placeholder="Record notes on where your solution diverged or areas for improvement..."
              className="w-full p-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleCompleteSelfAssessment}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs transition cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>{selfAssessmentDone ? 'Update Evaluation Score' : 'Finalize Evaluation'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
