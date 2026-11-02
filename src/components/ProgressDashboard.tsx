import React from 'react';
import {
  CheckCircle2,
  Circle,
  FileQuestion,
  Award,
  BookOpen,
} from 'lucide-react';
import {
  Chapter,
  Lesson,
  Quiz,
  QuizAttempt,
  Assignment,
  AssignmentSubmission,
} from '../types';

interface ProgressDashboardProps {
  chapters: Chapter[];
  lessons: Lesson[];
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  onNavigateToLesson: (lessonId: string) => void;
  onOpenAssignment: (assignment: Assignment) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  chapters,
  lessons,
  quizzes,
  attempts,
  assignments,
  submissions,
  onNavigateToLesson,
  onOpenAssignment,
}) => {
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((l) => l.isCompleted).length;
  const lessonProgressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  const passedQuizzes = quizzes.filter((q) => {
    const qAttempts = attempts.filter((a) => a.quizId === q.id);
    return qAttempts.some((a) => a.passed);
  }).length;

  const evaluatedAssignments = assignments.filter((a) => {
    const s = submissions.find((sub) => sub.assignmentId === a.id);
    return s && s.isEvaluated;
  }).length;

  const overallProgress = Math.round(
    ((completedLessons + passedQuizzes + evaluatedAssignments) /
      Math.max(1, totalLessons + quizzes.length + assignments.length)) *
      100
  );

  return (
    <div className="space-y-6">
      {/* Overview Metric Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 uppercase tracking-wider px-2 py-0.5 rounded">
            Overall Course Mastery
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-1">Study Progress & Evaluation Summary</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Holistic view of lesson completion, quiz assessments, and practical assignment evaluations.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-3xl font-bold text-stone-900">{overallProgress}%</span>
            <span className="text-xs text-stone-400 block">Course Completed</span>
          </div>
          <div className="w-28 h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
            <div
              className="h-full bg-amber-600 transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Progress Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Lessons */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <BookOpen size={14} className="text-amber-600" /> Lessons Read
            </span>
            <span className="text-xs font-bold text-stone-800">
              {completedLessons} / {totalLessons}
            </span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-600" style={{ width: `${lessonProgressPercent}%` }} />
          </div>
          <p className="text-[11px] text-stone-500">
            {totalLessons - completedLessons} remaining to mark complete.
          </p>
        </div>

        {/* 2. Quizzes */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <FileQuestion size={14} className="text-amber-600" /> Quizzes Mastered
            </span>
            <span className="text-xs font-bold text-stone-800">
              {passedQuizzes} / {quizzes.length}
            </span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-600"
              style={{ width: `${quizzes.length ? (passedQuizzes / quizzes.length) * 100 : 0}%` }}
            />
          </div>
          <p className="text-[11px] text-stone-500">
            {attempts.length} attempts recorded in local browser.
          </p>
        </div>

        {/* 3. Assignments */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Award size={14} className="text-emerald-600" /> Tasks Evaluated
            </span>
            <span className="text-xs font-bold text-stone-800">
              {evaluatedAssignments} / {assignments.length}
            </span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600"
              style={{ width: `${assignments.length ? (evaluatedAssignments / assignments.length) * 100 : 0}%` }}
            />
          </div>
          <p className="text-[11px] text-stone-500">
            {submissions.length} practical submissions saved.
          </p>
        </div>
      </div>

      {/* Chapters & Syllabus Progress Details */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700">
          Chapter-by-Chapter Syllabus Status
        </h3>

        <div className="space-y-4">
          {chapters.map((ch) => {
            const chLessons = lessons.filter((l) => l.chapterId === ch.id);
            const chCompleted = chLessons.filter((l) => l.isCompleted).length;
            const pct = chLessons.length ? Math.round((chCompleted / chLessons.length) * 100) : 0;

            return (
              <div key={ch.id} className="p-4 rounded-xl border border-stone-100 bg-stone-50/50 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800">{ch.title}</span>
                  <span className="text-stone-500 font-medium">
                    {chCompleted}/{chLessons.length} Done ({pct}%)
                  </span>
                </div>

                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600" style={{ width: `${pct}%` }} />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {chLessons.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => onNavigateToLesson(l.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                        l.isCompleted
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {l.isCompleted ? <CheckCircle2 size={11} className="text-emerald-700" /> : <Circle size={11} />}
                      <span className="truncate max-w-[180px]">{l.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Submissions & Evaluations Table */}
      {submissions.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700">
            Recent Practical Assignment Submissions
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Assignment</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Submitted</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {submissions.map((sub) => {
                  const assign = assignments.find((a) => a.id === sub.assignmentId);

                  return (
                    <tr key={sub.id} className="hover:bg-stone-50/50">
                      <td className="py-2.5 px-3 font-semibold text-stone-900 truncate max-w-[200px]">
                        {assign ? assign.title : sub.assignmentId}
                      </td>
                      <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-stone-500">
                        {sub.submissionType}
                      </td>
                      <td className="py-2.5 px-3">
                        {sub.isEvaluated ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                            Evaluated
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
                            Pending Review
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-stone-800">
                        {sub.score !== undefined ? `${sub.score} / 100` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-stone-400">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {assign && (
                          <button
                            type="button"
                            onClick={() => onOpenAssignment(assign)}
                            className="text-amber-700 hover:underline font-medium cursor-pointer"
                          >
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
