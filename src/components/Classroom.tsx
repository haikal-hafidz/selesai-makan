import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Circle,
  FileQuestion,
  FileText,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { LearningClass, Chapter, Lesson, Quiz, QuizAttempt, ResourceItem } from '../types';
import { MarkdownViewer } from './MarkdownViewer';
import { LessonEditor } from './LessonEditor';
import { ResourceLibrary } from './ResourceLibrary';
import { QuizTaker } from './QuizTaker';
import { QuizEditorModal } from './QuizEditorModal';

interface ClassroomProps {
  learningClass: LearningClass;
  chapters: Chapter[];
  lessons: Lesson[];
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  resources: ResourceItem[];
  selectedLessonId?: string;
  onSelectLesson: (id: string) => void;
  onBackToClasses: () => void;
  onAddChapter: (title: string) => Promise<void>;
  onDeleteChapter: (id: string) => Promise<void>;
  onAddLesson: (chapterId: string, title: string) => Promise<void>;
  onSaveLesson: (lesson: Lesson) => Promise<void>;
  onDeleteLesson: (id: string) => Promise<void>;
  onToggleLessonComplete: (lessonId: string) => Promise<void>;
  onSaveQuiz: (quiz: Quiz) => Promise<void>;
  onDeleteQuiz: (id: string) => Promise<void>;
  onRecordAttempt: (attempt: QuizAttempt) => Promise<void>;
  onUploadResource: (file: File) => Promise<void>;
  onDeleteResource: (id: string) => Promise<void>;
}

export const Classroom: React.FC<ClassroomProps> = ({
  learningClass,
  chapters,
  lessons,
  quizzes,
  attempts,
  resources,
  selectedLessonId,
  onSelectLesson,
  onBackToClasses,
  onAddChapter,
  onDeleteChapter,
  onAddLesson,
  onSaveLesson,
  onDeleteLesson,
  onToggleLessonComplete,
  onSaveQuiz,
  onDeleteQuiz,
  onRecordAttempt,
  onUploadResource,
  onDeleteResource,
}) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'resources' | 'quizzes'>('lessons');
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [addingLessonForChapter, setAddingLessonForChapter] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');

  // Quiz Modal & Active Quiz taker
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | undefined>(undefined);
  const [activeTakingQuiz, setActiveTakingQuiz] = useState<Quiz | null>(null);

  const activeLesson = lessons.find((l) => l.id === selectedLessonId) || lessons[0];

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((l) => l.isCompleted).length;
  const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  const toggleChapterCollapse = (chId: string) => {
    setCollapsedChapters((prev) => ({ ...prev, [chId]: !prev[chId] }));
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) return;
    await onAddChapter(newChapterTitle.trim());
    setNewChapterTitle('');
    setIsCreatingChapter(false);
  };

  const handleCreateLesson = async (chapterId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;
    await onAddLesson(chapterId, newLessonTitle.trim());
    setNewLessonTitle('');
    setAddingLessonForChapter(null);
  };

  const handleSaveLessonContent = async (title: string, content: string) => {
    if (!activeLesson) return;
    await onSaveLesson({
      ...activeLesson,
      title,
      content,
      updatedAt: Date.now(),
    });
    setIsEditingLesson(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Breadcrumb & Class Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToClasses}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer"
            title="Back to all classes"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                {learningClass.subject}
              </span>
              <h1 className="text-lg font-bold text-stone-900 leading-tight">
                {learningClass.title}
              </h1>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('lessons');
              setActiveTakingQuiz(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === 'lessons'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen size={14} />
            <span>Curriculum & Notes</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('resources');
              setActiveTakingQuiz(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === 'resources'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText size={14} />
            <span>Library ({resources.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('quizzes');
              setActiveTakingQuiz(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === 'quizzes'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileQuestion size={14} />
            <span>Quizzes ({quizzes.length})</span>
          </button>
        </div>

        {/* Progress summary indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-medium text-stone-500">Progress</span>
            <span className="text-xs font-bold text-stone-800 ml-1.5">
              {completedLessons}/{totalLessons} ({progressPercent}%)
            </span>
          </div>
          <div className="w-24 h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Classroom Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* TAB 1: Lessons & Syllabus */}
        {activeTab === 'lessons' && (
          <>
            {/* Sidebar: Syllabus Outline */}
            <aside className="w-80 border-r border-stone-200 bg-stone-50/70 flex flex-col justify-between overflow-y-auto">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Chapters & Lessons
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsCreatingChapter(true)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                  >
                    <Plus size={14} /> Add Chapter
                  </button>
                </div>

                {isCreatingChapter && (
                  <form onSubmit={handleCreateChapter} className="p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
                    <input
                      type="text"
                      value={newChapterTitle}
                      onChange={(e) => setNewChapterTitle(e.target.value)}
                      placeholder="Chapter title..."
                      autoFocus
                      className="w-full text-xs px-2.5 py-1.5 border border-stone-300 rounded-md mb-2 focus:outline-none focus:border-amber-500"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsCreatingChapter(false)}
                        className="px-2 py-1 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2.5 py-1 text-xs bg-amber-600 text-white rounded font-medium cursor-pointer"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                )}

                {chapters.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-400 border border-dashed border-stone-300 rounded-xl">
                    No chapters created yet. Click "Add Chapter" above to start structuring your course.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chapters.map((chapter) => {
                      const chapterLessons = lessons.filter((l) => l.chapterId === chapter.id);
                      const isCollapsed = !!collapsedChapters[chapter.id];

                      return (
                        <div
                          key={chapter.id}
                          className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-2xs"
                        >
                          <div className="flex items-center justify-between px-3 py-2 bg-stone-100/70 border-b border-stone-100">
                            <button
                              type="button"
                              onClick={() => toggleChapterCollapse(chapter.id)}
                              className="flex items-center gap-1.5 flex-1 text-left text-xs font-semibold text-stone-800 cursor-pointer truncate"
                            >
                              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                              <span className="truncate">{chapter.title}</span>
                            </button>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setAddingLessonForChapter(chapter.id)}
                                className="p-1 text-stone-400 hover:text-stone-800 rounded cursor-pointer"
                                title="Add lesson to this chapter"
                              >
                                <Plus size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete chapter "${chapter.title}" and its lessons?`)) {
                                    onDeleteChapter(chapter.id);
                                  }
                                }}
                                className="p-1 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                                title="Delete chapter"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {!isCollapsed && (
                            <div className="p-1.5 space-y-1">
                              {chapterLessons.map((lesson) => {
                                const isSelected = activeLesson?.id === lesson.id;
                                return (
                                  <div
                                    key={lesson.id}
                                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                                      isSelected
                                        ? 'bg-amber-100/70 text-amber-950 font-medium'
                                        : 'hover:bg-stone-50 text-stone-700'
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => onToggleLessonComplete(lesson.id)}
                                      className="mr-2 text-stone-400 hover:text-emerald-600 cursor-pointer"
                                      title={lesson.isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                                    >
                                      {lesson.isCompleted ? (
                                        <CheckCircle size={15} className="text-emerald-600 fill-emerald-100" />
                                      ) : (
                                        <Circle size={15} />
                                      )}
                                    </button>
                                    <span
                                      onClick={() => {
                                        onSelectLesson(lesson.id);
                                        setIsEditingLesson(false);
                                      }}
                                      className={`flex-1 truncate ${lesson.isCompleted ? 'line-through text-stone-400' : ''}`}
                                    >
                                      {lesson.title}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Delete lesson "${lesson.title}"?`)) {
                                          onDeleteLesson(lesson.id);
                                        }
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-0.5 text-stone-400 hover:text-red-600 transition cursor-pointer"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                );
                              })}

                              {addingLessonForChapter === chapter.id && (
                                <form
                                  onSubmit={(e) => handleCreateLesson(chapter.id, e)}
                                  className="p-2 bg-stone-50 rounded-lg border border-stone-200 mt-1"
                                >
                                  <input
                                    type="text"
                                    value={newLessonTitle}
                                    onChange={(e) => setNewLessonTitle(e.target.value)}
                                    placeholder="Lesson title..."
                                    autoFocus
                                    className="w-full text-xs px-2 py-1 border border-stone-300 rounded mb-1.5 focus:outline-none focus:border-amber-500 bg-white"
                                  />
                                  <div className="flex justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => setAddingLessonForChapter(null)}
                                      className="px-2 py-0.5 text-[11px] text-stone-500 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      className="px-2 py-0.5 text-[11px] bg-amber-600 text-white rounded font-medium cursor-pointer"
                                    >
                                      Add
                                    </button>
                                  </div>
                                </form>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>

            {/* Central Stage: Reading / Editing View */}
            <main className="flex-1 bg-white overflow-y-auto p-6 md:p-10">
              {activeLesson ? (
                isEditingLesson ? (
                  <LessonEditor
                    initialTitle={activeLesson.title}
                    initialContent={activeLesson.content}
                    onSave={handleSaveLessonContent}
                    onCancel={() => setIsEditingLesson(false)}
                  />
                ) : (
                  <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex flex-wrap items-center justify-between pb-6 border-b border-stone-200 gap-4">
                      <div>
                        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                          Current Lesson
                        </span>
                        <h2 className="text-3xl font-serif font-bold text-stone-900 leading-tight">
                          {activeLesson.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleLessonComplete(activeLesson.id)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                            activeLesson.isCompleted
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                              : 'border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700'
                          }`}
                        >
                          <CheckCircle size={15} className={activeLesson.isCompleted ? 'text-emerald-600' : ''} />
                          <span>{activeLesson.isCompleted ? 'Completed' : 'Mark as Done'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingLesson(true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-medium text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
                        >
                          <Edit2 size={14} />
                          <span>Edit Lesson</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-stone-50/40 p-8 rounded-2xl border border-stone-100 min-h-[400px]">
                      <MarkdownViewer content={activeLesson.content} />
                    </div>
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400">
                  <BookOpen size={48} className="mb-4 text-stone-300" />
                  <h3 className="text-lg font-semibold text-stone-700 mb-1">No Lesson Selected</h3>
                  <p className="text-sm max-w-sm">
                    Select a lesson from the syllabus outline on the left, or add a chapter and lesson to begin writing your study materials.
                  </p>
                </div>
              )}
            </main>
          </>
        )}

        {/* TAB 2: Resource Library */}
        {activeTab === 'resources' && (
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-stone-50/50">
            <div className="max-w-5xl mx-auto">
              <ResourceLibrary
                classId={learningClass.id}
                resources={resources}
                onUploadResource={onUploadResource}
                onDeleteResource={onDeleteResource}
              />
            </div>
          </main>
        )}

        {/* TAB 3: Quizzes & Exercises */}
        {activeTab === 'quizzes' && (
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-stone-50/50">
            <div className="max-w-4xl mx-auto">
              {activeTakingQuiz ? (
                <QuizTaker
                  quiz={activeTakingQuiz}
                  onComplete={onRecordAttempt}
                  onExit={() => setActiveTakingQuiz(null)}
                />
              ) : (
                <div className="space-y-6">
                  {/* Quizzes Header */}
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-stone-900">Quizzes & Self-Assessment</h2>
                      <p className="text-sm text-stone-500 mt-1">
                        Solidify your learning with multiple-choice exercises and answer rationale.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuiz(undefined);
                        setIsQuizModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 text-white font-medium text-sm hover:bg-amber-700 transition cursor-pointer shadow-xs"
                    >
                      <Plus size={16} />
                      <span>New Quiz</span>
                    </button>
                  </div>

                  {quizzes.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                        <FileQuestion size={30} />
                      </div>
                      <h3 className="text-lg font-semibold text-stone-800">No quizzes created yet</h3>
                      <p className="text-sm text-stone-500 max-w-sm mx-auto mt-1 mb-6">
                        Reinforce your knowledge by crafting key test questions for this course.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingQuiz(undefined);
                          setIsQuizModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                      >
                        <Plus size={15} />
                        <span>Create First Quiz</span>
                      </button>
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
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveTakingQuiz(quiz)}
                                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-medium text-xs hover:bg-amber-700 transition cursor-pointer"
                                >
                                  Take Quiz
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingQuiz(quiz);
                                    setIsQuizModalOpen(true);
                                  }}
                                  className="p-1.5 text-stone-500 hover:text-stone-800 rounded-md hover:bg-stone-100 transition cursor-pointer"
                                  title="Edit Quiz Questions"
                                >
                                  <Edit2 size={14} />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete quiz "${quiz.title}"?`)) {
                                    onDeleteQuiz(quiz.id);
                                  }
                                }}
                                className="p-1.5 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition cursor-pointer"
                                title="Delete Quiz"
                              >
                                <Trash2 size={14} />
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
          </main>
        )}
      </div>

      {/* Quiz Editor Modal */}
      {isQuizModalOpen && (
        <QuizEditorModal
          classId={learningClass.id}
          existingQuiz={editingQuiz}
          onSave={async (q) => {
            await onSaveQuiz(q);
            setIsQuizModalOpen(false);
          }}
          onClose={() => setIsQuizModalOpen(false)}
        />
      )}
    </div>
  );
};
