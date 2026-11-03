import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Plus,
  Search,
  HardDrive,
  Trash2,
  Edit,
  ArrowRight,
  FileCode,
} from 'lucide-react';
import {
  LearningClass,
  Chapter,
  Lesson,
  Quiz,
  QuizAttempt,
  ResourceItem,
  AssignmentSubmission,
} from './types';
import { storage } from './services/storage';
import { preferencesService, UserPreferences } from './services/preferences';
import { extractResourceContent } from './services/resourceExtractor';
import { ClassModal } from './components/ClassModal';
import { Classroom } from './components/Classroom';
import { BackupSettings } from './components/BackupSettings';
import { LearningPackImportModal } from './components/LearningPackImportModal';
import { LoadingScreen } from './components/LoadingScreen';
import { OfflineStatusIndicator } from './components/OfflineStatusIndicator';

export const App: React.FC = () => {
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [classes, setClasses] = useState<LearningClass[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);

  const [preferences] = useState<UserPreferences>(() =>
    preferencesService.getPreferences()
  );

  const [activeClassId, setActiveClassId] = useState<string | null>(
    preferences.selectedClassId || null
  );
  const [activeLessonId, setActiveLessonId] = useState<string | undefined>(
    preferences.selectedLessonId
  );
  const [currentView, setCurrentView] = useState<'classes' | 'settings'>(
    preferences.activeView === 'settings' ? 'settings' : 'classes'
  );

  // Modals & search
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isPackImportModalOpen, setIsPackImportModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<LearningClass | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  // Load all initial data from IndexedDB
  const refreshData = async () => {
    try {
      const cls = await storage.getClasses();
      setClasses(cls);
    } catch (err) {
      console.error('Failed to load data from IndexedDB:', err);
    } finally {
      // Remove opening loading screen once initial database sync concludes
      setIsInitialLoading(false);
      // Also remove immediate HTML shell loader if present
      const preLoader = document.getElementById('app-pre-loader');
      if (preLoader) {
        preLoader.style.opacity = '0';
        preLoader.style.transition = 'opacity 0.25s ease-out';
        setTimeout(() => preLoader.remove(), 250);
      }
    }
  };

  const reloadSubCollections = async () => {
    try {

      if (activeClassId) {
        const [ch, ls, qz, att, res, subs] = await Promise.all([
          storage.getChapters(activeClassId),
          storage.getLessons(activeClassId),
          storage.getQuizzes(activeClassId),
          storage.getQuizAttempts(activeClassId),
          storage.getResources(activeClassId),
          storage.getSubmissions(activeClassId),
        ]);
        setChapters(ch);
        setLessons(ls);
        setQuizzes(qz);
        setAttempts(att);
        setResources(res);
        setSubmissions(subs);
      }
    } catch (err) {
      console.error('Failed to load subcollections from IndexedDB:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    reloadSubCollections();
  }, [activeClassId]);

  // Sync preferences on change
  useEffect(() => {
    preferencesService.savePreferences({
      selectedClassId: activeClassId || undefined,
      selectedLessonId: activeLessonId || undefined,
      activeView: currentView === 'settings' ? 'settings' : 'classes',
    });
  }, [activeClassId, activeLessonId, currentView]);

  // Class Actions
  const handleSaveClass = async (
    data: Omit<LearningClass, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingClass) {
      const updated: LearningClass = {
        ...editingClass,
        ...data,
        updatedAt: Date.now(),
      };
      await storage.saveClass(updated);
    } else {
      const newClass: LearningClass = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await storage.saveClass(newClass);
    }
    setIsClassModalOpen(false);
    setEditingClass(undefined);
    await refreshData();
  };

  const handleDeleteClass = async (id: string) => {
    if (confirm('Are you sure you want to delete this class and all associated notes?')) {
      await storage.deleteClass(id);
      if (activeClassId === id) {
        setActiveClassId(null);
      }
      await refreshData();
    }
  };

  // Chapter Actions
  const handleAddChapter = async (title: string) => {
    if (!activeClassId) return;
    const newChapter: Chapter = {
      id: crypto.randomUUID(),
      classId: activeClassId,
      title,
      order: chapters.length + 1,
    };
    await storage.saveChapter(newChapter);
    await refreshData();
  };

  const handleDeleteChapter = async (chapterId: string) => {
    await storage.deleteChapter(chapterId);
    await refreshData();
  };

  // Lesson Actions
  const handleAddLesson = async (chapterId: string, title: string, content: string = '') => {
    if (!activeClassId) return;
    const chapterLessons = lessons.filter((l) => l.chapterId === chapterId);
    const newLesson: Lesson = {
      id: crypto.randomUUID(),
      classId: activeClassId,
      chapterId,
      title,
      content,
      order: chapterLessons.length + 1,
      isCompleted: false,
      updatedAt: Date.now(),
    };
    await storage.saveLesson(newLesson);
    setActiveLessonId(newLesson.id);
    await refreshData();
  };

  const handleSaveLesson = async (lesson: Lesson) => {
    await storage.saveLesson(lesson);
    await refreshData();
  };

  const handleDeleteLesson = async (lessonId: string) => {
    await storage.deleteLesson(lessonId);
    if (activeLessonId === lessonId) {
      setActiveLessonId(undefined);
    }
    await refreshData();
  };

  const handleToggleLessonComplete = async (lessonId: string) => {
    const target = lessons.find((l) => l.id === lessonId);
    if (!target) return;
    const updated: Lesson = {
      ...target,
      isCompleted: !target.isCompleted,
      completedAt: !target.isCompleted ? Date.now() : undefined,
      updatedAt: Date.now(),
    };
    await storage.saveLesson(updated);
    await refreshData();
  };

  // Quiz Actions
  const handleSaveQuiz = async (quiz: Quiz) => {
    await storage.saveQuiz(quiz);
    await refreshData();
  };

  const handleDeleteQuiz = async (id: string) => {
    await storage.deleteQuiz(id);
    await refreshData();
  };

  const handleRecordAttempt = async (attempt: QuizAttempt) => {
    await storage.saveQuizAttempt(attempt);
    await refreshData();
  };

  // Assignment Submission Action
  const handleSaveSubmission = async (submission: AssignmentSubmission) => {
    await storage.saveSubmission(submission);
    await refreshData();
  };

  // Universal Resource Actions (Content extraction enabled)
  const handleUploadResource = async (file: File, chapterId?: string, lessonId?: string) => {
    if (!activeClassId) return;

    // Process & extract readable text client-side where possible
    const extracted = await extractResourceContent(file);

    const resource: ResourceItem = {
      id: crypto.randomUUID(),
      classId: activeClassId,
      chapterId,
      lessonId,
      name: file.name,
      fileType: file.type || file.name.split('.').pop() || 'unknown',
      size: file.size,
      dataBlob: file,
      extractedText: extracted.text || undefined,
      status: extracted.status,
      description: extracted.info,
      uploadedAt: Date.now(),
    };

    await storage.saveResource(resource);
    await refreshData();
  };

  const handleDeleteResource = async (id: string) => {
    await storage.deleteResource(id);
    await refreshData();
  };

  const activeClass = classes.find((c) => c.id === activeClassId);

  // Filter classes
  const uniqueSubjects = ['All', ...Array.from(new Set(classes.map((c) => c.subject)))];
  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubjectFilter === 'All' || c.subject === selectedSubjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900">
      {/* Opening loading screen (shown only during initial app initialization) */}
      {isInitialLoading && <LoadingScreen />}

      {/* Top Main Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={() => {
              setActiveClassId(null);
              setCurrentView('classes');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs group-hover:bg-amber-700 transition">
              <GraduationCap size={22} />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-stone-900 leading-none">
                Selesai Makan
              </div>
              <div className="text-[11px] font-medium text-stone-500 mt-1">
                Personal Learning Hub
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <OfflineStatusIndicator />
            <button
              type="button"
              onClick={() => {
                setActiveClassId(null);
                setCurrentView('classes');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                currentView === 'classes' && !activeClassId
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Classes
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveClassId(null);
                setCurrentView('settings');
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                currentView === 'settings'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <HardDrive size={14} />
              <span className="hidden sm:inline">Storage & Backups</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1">
        {/* VIEW 1: Classroom Active View */}
        {activeClass ? (
          <Classroom
            learningClass={activeClass}
            chapters={chapters}
            lessons={lessons}
            quizzes={quizzes}
            attempts={attempts}
            resources={resources}
            submissions={submissions}
            selectedLessonId={activeLessonId}
            onSelectLesson={(id) => setActiveLessonId(id)}
            onBackToClasses={() => setActiveClassId(null)}
            onAddChapter={handleAddChapter}
            onDeleteChapter={handleDeleteChapter}
            onAddLesson={handleAddLesson}
            onSaveLesson={handleSaveLesson}
            onDeleteLesson={handleDeleteLesson}
            onToggleLessonComplete={handleToggleLessonComplete}
            onSaveQuiz={handleSaveQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onRecordAttempt={handleRecordAttempt}
            onSaveSubmission={handleSaveSubmission}
            onUploadResource={handleUploadResource}
            onDeleteResource={handleDeleteResource}
          />
        ) : currentView === 'settings' ? (
          /* VIEW 2: Storage & Backup Settings */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <BackupSettings onDataChanged={refreshData} />
          </div>
        ) : (
          /* VIEW 3: Classes Catalog / Dashboard */
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header banner */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                  My Learning Classes
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Organize subjects, structure syllabuses, read notes, and test your retention.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPackImportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition cursor-pointer shadow-2xs"
                  title="Import a structured JSON learning pack"
                >
                  <FileCode size={15} className="text-amber-600" />
                  <span>Import Learning Pack</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingClass(undefined);
                    setIsClassModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition cursor-pointer shadow-xs"
                >
                  <Plus size={15} />
                  <span>New Class</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[260px] relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search classes, subjects, or tags..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>

              {/* Subject Badges */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {uniqueSubjects.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubjectFilter(sub)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                      selectedSubjectFilter === sub
                        ? 'bg-amber-100 text-amber-900 font-semibold'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Classes Grid */}
            {classes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center max-w-xl mx-auto my-12">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={30} />
                </div>
                <h3 className="text-lg font-bold text-stone-800">No classes yet</h3>
                <p className="text-xs text-stone-500 mt-1 mb-6 max-w-sm mx-auto">
                  Create your first learning class or import a ready-made Learning Pack JSON to jumpstart your structured studies.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPackImportModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-medium text-xs hover:bg-stone-50 transition cursor-pointer"
                  >
                    <FileCode size={15} className="text-amber-600" />
                    <span>Import Learning Pack</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsClassModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white font-medium text-xs hover:bg-amber-700 transition cursor-pointer shadow-xs"
                  >
                    <Plus size={15} />
                    <span>Create First Class</span>
                  </button>
                </div>
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs">
                No classes match your current search and subject filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.map((cls) => {
                  return (
                    <div
                      key={cls.id}
                      className="group bg-white rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <span
                            className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md"
                            style={{
                              backgroundColor: `${cls.color}15`,
                              color: cls.color,
                            }}
                          >
                            {cls.subject}
                          </span>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingClass(cls);
                                setIsClassModalOpen(true);
                              }}
                              className="p-1 text-stone-400 hover:text-stone-800 rounded hover:bg-stone-100 transition cursor-pointer"
                              title="Edit Class details"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClass(cls.id);
                              }}
                              className="p-1 text-stone-400 hover:text-red-600 rounded hover:bg-red-50 transition cursor-pointer"
                              title="Delete Class"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <h3
                          onClick={() => {
                            setActiveClassId(cls.id);
                          }}
                          className="font-bold text-lg text-stone-900 group-hover:text-amber-800 transition cursor-pointer mb-2"
                        >
                          {cls.title}
                        </h3>

                        {cls.description && (
                          <p className="text-xs text-stone-600 line-clamp-3 mb-4 leading-relaxed">
                            {cls.description}
                          </p>
                        )}

                        {cls.tags && cls.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-auto">
                            {cls.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[11px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div
                        onClick={() => {
                          setActiveClassId(cls.id);
                        }}
                        className="px-6 py-3.5 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between cursor-pointer group-hover:bg-amber-50/50 transition"
                      >
                        <span className="text-xs font-semibold text-stone-700 group-hover:text-amber-900">
                          Enter Classroom
                        </span>
                        <ArrowRight
                          size={14}
                          className="text-stone-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        )}
      </div>

      {/* Class Modal */}
      {isClassModalOpen && (
        <ClassModal
          existingClass={editingClass}
          onSave={handleSaveClass}
          onClose={() => {
            setIsClassModalOpen(false);
            setEditingClass(undefined);
          }}
        />
      )}

      {/* Learning Pack Import Modal */}
      {isPackImportModalOpen && (
        <LearningPackImportModal
          existingClasses={classes}
          onImportComplete={async (classId) => {
            setIsPackImportModalOpen(false);
            setActiveClassId(classId);
            await refreshData();
          }}
          onClose={() => setIsPackImportModalOpen(false)}
        />
      )}
    </div>
  );
};
export default App;
