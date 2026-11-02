import React, { useState } from 'react';
import {
  CheckCircle2,
  FileQuestion,
  FileText,
  ChevronRight,
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

interface PracticeCenterProps {
  chapters: Chapter[];
  lessons: Lesson[];
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  onTakeQuiz: (quiz: Quiz) => void;
  onOpenAssignment: (assignment: Assignment) => void;
  onNavigateToLesson: (lessonId: string) => void;
}

export const PracticeCenter: React.FC<PracticeCenterProps> = ({
  lessons,
  quizzes,
  attempts,
  assignments,
  submissions,
  onTakeQuiz,
  onOpenAssignment,
  onNavigateToLesson,
}) => {
  const [activePracticeTab, setActivePracticeTab] = useState<'all' | 'quizzes' | 'assignments'>('all');

  // Stats calculation
  const totalQuizzes = quizzes.length;
  const passedQuizzes = quizzes.filter((q) => {
    const qAttempts = attempts.filter((a) => a.quizId === q.id);
    return qAttempts.some((a) => a.passed);
  }).length;

  const totalAssignments = assignments.length;
  const evaluatedAssignments = assignments.filter((assign) => {
    const sub = submissions.find((s) => s.assignmentId === assign.id);
    return sub && sub.isEvaluated;
  }).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Practice & Evaluation Center</h2>
          <p className="text-xs text-stone-500 mt-1">
            Test knowledge retention with quizzes, complete course-specific assignments, and review evaluations.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActivePracticeTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activePracticeTab === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Practice ({totalQuizzes + totalAssignments})
          </button>
          <button
            type="button"
            onClick={() => setActivePracticeTab('quizzes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activePracticeTab === 'quizzes'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Quizzes ({totalQuizzes})
          </button>
          <button
            type="button"
            onClick={() => setActivePracticeTab('assignments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activePracticeTab === 'assignments'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Assignments ({totalAssignments})
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Quizzes Completed
          </span>
          <div className="text-xl font-bold text-stone-900 mt-1">
            {passedQuizzes} / {totalQuizzes}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            {totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0}% mastery
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Assignments Evaluated
          </span>
          <div className="text-xl font-bold text-emerald-700 mt-1">
            {evaluatedAssignments} / {totalAssignments}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            {totalAssignments > 0 ? Math.round((evaluatedAssignments / totalAssignments) * 100) : 0}% evaluated
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Total Quiz Attempts
          </span>
          <div className="text-xl font-bold text-amber-700 mt-1">
            {attempts.length}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Recorded submissions</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Work Submissions
          </span>
          <div className="text-xl font-bold text-stone-900 mt-1">
            {submissions.length}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Stored in local IndexedDB</p>
        </div>
      </div>

      {/* Section 1: Practical Assignments */}
      {(activePracticeTab === 'all' || activePracticeTab === 'assignments') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
              <FileText size={16} className="text-emerald-700" />
              <span>Practical Tasks & Assignments ({assignments.length})</span>
            </h3>
          </div>

          {assignments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-8 text-center text-xs text-stone-400">
              No assignments configured for this course yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((assign) => {
                const sub = submissions.find((s) => s.assignmentId === assign.id);
                const parentLesson = lessons.find((l) => l.id === assign.lessonId);

                return (
                  <div
                    key={assign.id}
                    className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                          Format: {assign.submissionType.toUpperCase()}
                        </span>
                        {sub?.isEvaluated ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 size={12} /> {sub.score !== undefined ? `${sub.score} pts` : 'Evaluated'}
                          </span>
                        ) : sub ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            Submitted • Pending Self-Check
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-stone-400">Not Started</span>
                        )}
                      </div>

                      <h4 className="font-semibold text-stone-900 text-base mb-1">{assign.title}</h4>
                      <p className="text-xs text-stone-600 line-clamp-2 mb-2 leading-relaxed">
                        {assign.description}
                      </p>

                      {parentLesson && (
                        <div
                          onClick={() => onNavigateToLesson(parentLesson.id)}
                          className="text-[11px] text-amber-700 hover:underline cursor-pointer flex items-center gap-1 mb-3"
                        >
                          <BookOpen size={11} />
                          <span>Related Lesson: {parentLesson.title}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[11px] text-stone-400">
                        {assign.rubric ? `${assign.rubric.length} Criteria Rubric` : 'Model Answer Evaluation'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenAssignment(assign)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition cursor-pointer"
                      >
                        <span>{sub ? 'Review / Resubmit' : 'Open Assignment'}</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Section 2: Quizzes */}
      {(activePracticeTab === 'all' || activePracticeTab === 'quizzes') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
              <FileQuestion size={16} className="text-amber-700" />
              <span>Knowledge Checks & Quizzes ({quizzes.length})</span>
            </h3>
          </div>

          {quizzes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-8 text-center text-xs text-stone-400">
              No quizzes created for this course yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map((quiz) => {
                const quizAttempts = attempts.filter((a) => a.quizId === quiz.id);
                const bestAttempt = quizAttempts.sort((a, b) => b.score - a.score)[0];

                return (
                  <div
                    key={quiz.id}
                    className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between hover:border-amber-300 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                          {quiz.questions.length} Questions
                        </span>
                        {bestAttempt && (
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded ${
                              bestAttempt.passed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            Best: {bestAttempt.score}/{bestAttempt.totalQuestions}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-stone-900 text-base mb-1">{quiz.title}</h4>
                      {quiz.description && (
                        <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                          {quiz.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-stone-100">
                      <span className="text-[11px] text-stone-400">
                        {quizAttempts.length > 0 ? `${quizAttempts.length} Attempt(s)` : 'Not taken yet'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onTakeQuiz(quiz)}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white font-medium text-xs hover:bg-amber-700 transition cursor-pointer"
                      >
                        {quizAttempts.length > 0 ? 'Retake Quiz' : 'Take Quiz'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
