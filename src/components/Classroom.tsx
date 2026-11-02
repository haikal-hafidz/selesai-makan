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
  Download,
  Award,
  TrendingUp,
  Paperclip,
} from 'lucide-react';
import {
  LearningClass,
  Chapter,
  Lesson,
  Quiz,
  QuizAttempt,
  ResourceItem,
  Assignment,
  AssignmentSubmission,
} from '../types';
import { MarkdownViewer } from './MarkdownViewer';
import { LessonEditor } from './LessonEditor';
import { ResourceLibrary } from './ResourceLibrary';
import { QuizTaker } from './QuizTaker';
import { QuizEditorModal } from './QuizEditorModal';
import { ResourcePreviewModal } from './ResourcePreviewModal';
import { PracticeCenter } from './PracticeCenter';
import { AssignmentWorkspace } from './AssignmentWorkspace';
import { ProgressDashboard } from './ProgressDashboard';
import { exportLearningPack } from '../services/learningPack';

interface ClassroomProps {
  learningClass: LearningClass;
  chapters: Chapter[];
  lessons: Lesson[];
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  resources: ResourceItem[];
  submissions: AssignmentSubmission[];
  selectedLessonId?: string;
  onSelectLesson: (id: string) => void;
  onBackToClasses: () => void;
  onAddChapter: (title: string) => Promise<void>;
  onDeleteChapter: (id: string) => Promise<void>;
  onAddLesson: (chapterId: string, title: string, content?: string) => Promise<void>;
  onSaveLesson: (lesson: Lesson) => Promise<void>;
  onDeleteLesson: (id: string) => Promise<void>;
  onToggleLessonComplete: (lessonId: string) => Promise<void>;
  onSaveQuiz: (quiz: Quiz) => Promise<void>;
  onDeleteQuiz: (id: string) => Promise<void>;
  onRecordAttempt: (attempt: QuizAttempt) => Promise<void>;
  onSaveSubmission: (submission: AssignmentSubmission) => Promise<void>;
  onUploadResource: (file: File, chapterId?: string, lessonId?: string) => Promise<void>;
  onDeleteResource: (id: string) => Promise<void>;
}

export const Classroom: React.FC<ClassroomProps> = ({
  learningClass,
  chapters,
  lessons,
  quizzes,
  attempts,
  resources,
  submissions,
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
  onRecordAttempt,
  onSaveSubmission,
  onUploadResource,
  onDeleteResource,
}) => {
  // Navigation tabs: Learn | Practice | Resources | Progress
  const [activeTab, setActiveTab] = useState<'learn' | 'practice' | 'resources' | 'progress'>('learn');

  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [addingLessonForChapter, setAddingLessonForChapter] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');

  // Modals & Active Viewers
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingQuiz] = useState<Quiz | undefined>(undefined);
  const [activeTakingQuiz, setActiveTakingQuiz] = useState<Quiz | null>(null);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [previewingResource, setPreviewingResource] = useState<ResourceItem | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const activeLesson = lessons.find((l) => l.id === selectedLessonId) || lessons[0];

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((l) => l.isCompleted).length;
  const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  // Collect all assignments across lessons
  const allAssignments: Assignment[] = [];
  lessons.forEach((l) => {
    if (l.assignments && Array.isArray(l.assignments)) {
      l.assignments.forEach((a) => {
        allAssignments.push({
          ...a,
          lessonId: l.id,
          classId: learningClass.id,
        });
      });
    }
  });

  // Current lesson assignments & resources
  const lessonResources = activeLesson
    ? resources.filter((r) => r.lessonId === activeLesson.id)
    : [];
  const lessonQuiz = activeLesson
    ? quizzes.find((q) => q.lessonId === activeLesson.id)
    : undefined;
  const lessonAssignments = activeLesson?.assignments || [];

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

  const handleExportClassLearningPack = async () => {
    try {
      const json = await exportLearningPack(learningClass.id);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeTitle = learningClass.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      a.download = `${safeTitle}-learning-pack.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportNotice('Learning Pack exported successfully!');
      setTimeout(() => setExportNotice(null), 3500);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Export failed.');
    }
  };

  const handleCreateLessonFromExtractedContent = async (title: string, text: string) => {
    let targetChapterId = chapters.length > 0 ? chapters[0].id : '';
    if (!targetChapterId) {
      await onAddChapter('Course Materials');
      return;
    }
    await onAddLesson(targetChapterId, title, text);
    setActiveTab('learn');
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

        {/* 4 Distinct Classroom Areas: Learn | Practice | Resources | Progress */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('learn');
              setActiveTakingQuiz(null);
              setActiveAssignment(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === 'learn'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen size={14} />
            <span>Learn</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('practice');
              setActiveTakingQuiz(null);
              setActiveAssignment(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === 'practice'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Award size={14} />
            <span>Practice ({quizzes.length + allAssignments.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('resources');
              setActiveTakingQuiz(null);
              setActiveAssignment(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === 'resources'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText size={14} />
            <span>Resources ({resources.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('progress');
              setActiveTakingQuiz(null);
              setActiveAssignment(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === 'progress'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <TrendingUp size={14} />
            <span>Progress</span>
          </button>
        </div>

        {/* Header Right: Export Pack & Progress */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportClassLearningPack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-medium transition cursor-pointer"
            title="Export as versioned JSON Learning Pack"
          >
            <Download size={13} />
            <span>Export Pack</span>
          </button>

          <div className="text-right hidden sm:block">
            <span className="text-xs font-medium text-stone-500">Progress</span>
            <span className="text-xs font-bold text-stone-800 ml-1.5">
              {completedLessons}/{totalLessons} ({progressPercent}%)
            </span>
          </div>
          <div className="w-20 h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {exportNotice && (
        <div className="bg-emerald-50 text-emerald-800 text-xs px-6 py-2 border-b border-emerald-200 flex items-center gap-2">
          <CheckCircle size={14} />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Main Classroom Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* AREA 1: LEARN (Syllabus & Material Reading) */}
        {activeTab === 'learn' && (
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

                    {/* Lesson Associated Actions (Quizzes, Assignments, Resources) */}
                    {(lessonResources.length > 0 || lessonQuiz || lessonAssignments.length > 0) && (
                      <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-2.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                          Associated Materials & Practice Tasks
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {lessonAssignments.map((assign, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setActiveAssignment(assign);
                                setActiveTab('practice');
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 shadow-2xs transition cursor-pointer"
                            >
                              <Award size={13} />
                              <span>Open Assignment: {assign.title}</span>
                            </button>
                          ))}
                          {lessonQuiz && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTakingQuiz(lessonQuiz);
                                setActiveTab('practice');
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition cursor-pointer"
                            >
                              <FileQuestion size={13} />
                              <span>Take Lesson Quiz ({lessonQuiz.questions.length} Qs)</span>
                            </button>
                          )}
                          {lessonResources.map((res) => (
                            <button
                              key={res.id}
                              type="button"
                              onClick={() => setPreviewingResource(res)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-xs font-medium text-stone-800 hover:bg-stone-50 shadow-2xs transition cursor-pointer"
                            >
                              <Paperclip size={12} className="text-amber-700" />
                              <span className="truncate max-w-[200px]">{res.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

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

        {/* AREA 2: PRACTICE (Quizzes, Assignments, Evaluations) */}
        {activeTab === 'practice' && (
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-stone-50/50">
            {activeAssignment ? (
              <AssignmentWorkspace
                assignment={activeAssignment}
                classId={learningClass.id}
                lessonId={activeAssignment.lessonId}
                associatedResources={resources}
                existingSubmission={submissions.find((s) => s.assignmentId === activeAssignment.id)}
                onSaveSubmission={onSaveSubmission}
                onBack={() => setActiveAssignment(null)}
              />
            ) : activeTakingQuiz ? (
              <QuizTaker
                quiz={activeTakingQuiz}
                onComplete={onRecordAttempt}
                onExit={() => setActiveTakingQuiz(null)}
              />
            ) : (
              <div className="max-w-5xl mx-auto">
                <PracticeCenter
                  chapters={chapters}
                  lessons={lessons}
                  quizzes={quizzes}
                  attempts={attempts}
                  assignments={allAssignments}
                  submissions={submissions}
                  onTakeQuiz={(q) => setActiveTakingQuiz(q)}
                  onOpenAssignment={(a) => setActiveAssignment(a)}
                  onNavigateToLesson={(lessonId) => {
                    onSelectLesson(lessonId);
                    setActiveTab('learn');
                  }}
                />
              </div>
            )}
          </main>
        )}

        {/* AREA 3: RESOURCES */}
        {activeTab === 'resources' && (
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-stone-50/50">
            <div className="max-w-5xl mx-auto">
              <ResourceLibrary
                classId={learningClass.id}
                chapters={chapters}
                lessons={lessons}
                resources={resources}
                onUploadResource={onUploadResource}
                onDeleteResource={onDeleteResource}
                onCreateLessonFromText={handleCreateLessonFromExtractedContent}
              />
            </div>
          </main>
        )}

        {/* AREA 4: PROGRESS & EVALUATIONS */}
        {activeTab === 'progress' && (
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-stone-50/50">
            <div className="max-w-5xl mx-auto">
              <ProgressDashboard
                chapters={chapters}
                lessons={lessons}
                quizzes={quizzes}
                attempts={attempts}
                assignments={allAssignments}
                submissions={submissions}
                onNavigateToLesson={(lId) => {
                  onSelectLesson(lId);
                  setActiveTab('learn');
                }}
                onOpenAssignment={(a) => {
                  setActiveAssignment(a);
                  setActiveTab('practice');
                }}
              />
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

      {/* In-Lesson Resource Preview Modal */}
      {previewingResource && (
        <ResourcePreviewModal
          resource={previewingResource}
          onClose={() => setPreviewingResource(null)}
          onCreateLessonFromText={handleCreateLessonFromExtractedContent}
        />
      )}
    </div>
  );
};
