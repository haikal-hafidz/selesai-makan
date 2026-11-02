import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Quiz, QuizQuestion } from '../types';

interface QuizEditorModalProps {
  classId: string;
  lessonId?: string;
  existingQuiz?: Quiz;
  onSave: (quiz: Quiz) => void;
  onClose: () => void;
}

export const QuizEditorModal: React.FC<QuizEditorModalProps> = ({
  classId,
  lessonId,
  existingQuiz,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(existingQuiz?.title || '');
  const [description, setDescription] = useState(existingQuiz?.description || '');
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    existingQuiz?.questions || [
      {
        id: crypto.randomUUID(),
        prompt: '',
        options: ['', ''],
        correctOptionIndex: 0,
        explanation: '',
      },
    ]
  );
  const [error, setError] = useState<string | null>(null);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        prompt: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestionPrompt = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].prompt = text;
    setQuestions(updated);
  };

  const updateQuestionExplanation = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].explanation = text;
    setQuestions(updated);
  };

  const updateOptionText = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    const options = [...updated[qIndex].options];
    options[optIndex] = text;
    updated[qIndex].options = options;
    setQuestions(updated);
  };

  const setCorrectOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correctOptionIndex = optIndex;
    setQuestions(updated);
  };

  const addOptionToQuestion = (qIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options.length >= 6) return;
    updated[qIndex].options.push('');
    setQuestions(updated);
  };

  const removeOptionFromQuestion = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options.length <= 2) return;
    updated[qIndex].options.splice(optIndex, 1);
    if (updated[qIndex].correctOptionIndex >= updated[qIndex].options.length) {
      updated[qIndex].correctOptionIndex = 0;
    }
    setQuestions(updated);
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError('Please provide a quiz title.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.prompt.trim()) {
        setError(`Question ${i + 1} prompt cannot be empty.`);
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        setError(`All options in Question ${i + 1} must be filled out.`);
        return;
      }
    }

    const quiz: Quiz = {
      id: existingQuiz?.id || crypto.randomUUID(),
      classId,
      lessonId,
      title: title.trim(),
      description: description.trim(),
      questions,
      createdAt: existingQuiz?.createdAt || Date.now(),
    };

    onSave(quiz);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="flex h-full max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50">
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              {existingQuiz ? 'Edit Quiz / Exercise' : 'Create New Quiz / Exercise'}
            </h2>
            <p className="text-xs text-stone-500">
              Craft multi-choice exercises and answer explanations for this subject.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-sm font-medium cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                Quiz Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Formulas Quick Assessment"
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                Description / Instructions
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Test your understanding of lookup formulas and table referencing..."
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t border-stone-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900">Questions ({questions.length})</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-6">
              {questions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="p-5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      Question {qIndex + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-stone-400 hover:text-red-600 p-1 transition cursor-pointer"
                        title="Remove Question"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Question Prompt
                    </label>
                    <input
                      type="text"
                      value={q.prompt}
                      onChange={(e) => updateQuestionPrompt(qIndex, e.target.value)}
                      placeholder="e.g. Which function handles exact matching lookup safely?"
                      className="w-full px-3 py-2 bg-white rounded-lg border border-stone-300 text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-stone-600">
                      Answer Options (select radio button for the correct answer)
                    </label>
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-opt-${q.id}`}
                          checked={q.correctOptionIndex === optIndex}
                          onChange={() => setCorrectOption(qIndex, optIndex)}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
                          title="Mark as correct answer"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOptionText(qIndex, optIndex, e.target.value)}
                          placeholder={`Option ${optIndex + 1}`}
                          className={`flex-1 px-3 py-1.5 rounded-lg border text-sm focus:outline-none ${
                            q.correctOptionIndex === optIndex
                              ? 'border-emerald-500 bg-emerald-50/30'
                              : 'border-stone-300 bg-white'
                          }`}
                        />
                        {q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOptionFromQuestion(qIndex, optIndex)}
                            className="text-stone-400 hover:text-red-500 text-xs px-1 cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {q.options.length < 6 && (
                      <button
                        type="button"
                        onClick={() => addOptionToQuestion(qIndex)}
                        className="text-xs text-amber-700 hover:underline pt-1 cursor-pointer"
                      >
                        + Add another option
                      </button>
                    )}
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Answer Explanation & Study Note (shown after submission)
                    </label>
                    <textarea
                      value={q.explanation}
                      onChange={(e) => updateQuestionExplanation(qIndex, e.target.value)}
                      rows={2}
                      placeholder="Explain why this answer is correct to reinforce learning..."
                      className="w-full px-3 py-1.5 bg-white rounded-lg border border-stone-300 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-stone-200 px-6 py-4 bg-stone-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition cursor-pointer shadow-xs"
          >
            <CheckCircle2 size={16} />
            <span>Save Quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
};
