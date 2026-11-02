import React, { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, Award } from 'lucide-react';
import { Quiz, QuizAttempt } from '../types';

interface QuizTakerProps {
  quiz: Quiz;
  onComplete: (attempt: QuizAttempt) => void;
  onExit: () => void;
}

export const QuizTaker: React.FC<QuizTakerProps> = ({ quiz, onComplete, onExit }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizAttempt | null>(null);

  const selectOption = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setAnswers({
      ...answers,
      [questionId]: optionIndex,
    });
  };

  const handleSubmit = () => {
    let score = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctOptionIndex) {
        score++;
      }
    });

    const passed = (score / quiz.questions.length) >= 0.7; // 70% threshold

    const attempt: QuizAttempt = {
      id: crypto.randomUUID(),
      quizId: quiz.id,
      classId: quiz.classId,
      lessonId: quiz.lessonId,
      selectedAnswers: answers,
      score,
      totalQuestions: quiz.questions.length,
      passed,
      takenAt: Date.now(),
    };

    setResult(attempt);
    setSubmitted(true);
    onComplete(attempt);
  };

  const handleRetake = () => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
  };

  const allAnswered = quiz.questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Top bar */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
            Interactive Quiz
          </span>
          <h1 className="text-2xl font-bold text-stone-900 mt-2">{quiz.title}</h1>
          {quiz.description && <p className="text-stone-600 text-sm mt-1">{quiz.description}</p>}
        </div>
        <button
          type="button"
          onClick={onExit}
          className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-lg border border-stone-300 hover:bg-stone-50 transition cursor-pointer"
        >
          Back to Classroom
        </button>
      </div>

      {/* Result Card if submitted */}
      {submitted && result && (
        <div
          className={`p-6 rounded-2xl border ${
            result.passed
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-full ${
                result.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              <Award size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {result.passed ? 'Great job! Exercise Passed.' : 'Keep Practicing!'}
              </h2>
              <p className="text-sm mt-1 opacity-90">
                You scored <strong className="font-semibold">{result.score}</strong> out of{' '}
                <strong className="font-semibold">{result.totalQuestions}</strong> (
                {Math.round((result.score / result.totalQuestions) * 100)}%).
              </p>
            </div>
            <button
              type="button"
              onClick={handleRetake}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-stone-300 text-sm font-medium text-stone-800 hover:bg-stone-50 shadow-xs transition cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-6">
        {quiz.questions.map((q, qIndex) => {
          const selected = answers[q.id];
          const isCorrect = submitted && selected === q.correctOptionIndex;

          return (
            <div
              key={q.id}
              className={`p-6 rounded-2xl bg-white border shadow-xs transition ${
                submitted
                  ? isCorrect
                    ? 'border-emerald-300 ring-1 ring-emerald-300'
                    : 'border-red-300 ring-1 ring-red-300'
                  : 'border-stone-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Question {qIndex + 1} of {quiz.questions.length}
                  </span>
                </div>
                {submitted && (
                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle size={14} /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                        <XCircle size={14} /> Incorrect
                      </span>
                    )}
                  </div>
                )}
              </div>

              <p className="text-base font-medium text-stone-900 mb-4">{q.prompt}</p>

              <div className="space-y-2.5">
                {q.options.map((option, optIndex) => {
                  const isThisSelected = selected === optIndex;
                  const isThisCorrect = q.correctOptionIndex === optIndex;

                  let optionStyle =
                    'border-stone-200 hover:border-amber-400 bg-stone-50/50 text-stone-800';

                  if (isThisSelected) {
                    optionStyle = 'border-amber-600 bg-amber-50/60 text-amber-950 font-medium';
                  }

                  if (submitted) {
                    if (isThisCorrect) {
                      optionStyle =
                        'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium ring-1 ring-emerald-500';
                    } else if (isThisSelected && !isThisCorrect) {
                      optionStyle = 'border-red-500 bg-red-50 text-red-950 line-through';
                    } else {
                      optionStyle = 'border-stone-200 opacity-60 bg-stone-50 text-stone-600';
                    }
                  }

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      disabled={submitted}
                      onClick={() => selectOption(q.id, optIndex)}
                      className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${optionStyle}`}
                    >
                      <span className="text-sm">{option}</span>
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                          isThisSelected
                            ? 'border-amber-600 bg-amber-600 text-white'
                            : 'border-stone-300 text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Show explanation on submit */}
              {submitted && q.explanation && (
                <div className="mt-4 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700">
                  <span className="font-semibold text-stone-900 block mb-0.5">Study Note:</span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Submit Action */}
      {!submitted && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            disabled={!allAnswered}
            onClick={handleSubmit}
            className="px-6 py-3 rounded-xl bg-amber-600 text-white font-medium text-sm hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
          >
            Submit Answers & Check Results
          </button>
        </div>
      )}
    </div>
  );
};
