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
  LayoutDashboard,
  Compass,
  FileText,
  Brain,
  Layers,
  Calendar,
  FolderGit2,
  TrendingUp,
} from 'lucide-react';
import {
  LearningClass,
  Chapter,
  Lesson,
  Quiz,
  QuizAttempt,
  ResourceItem,
  AssignmentSubmission,
  Note,
  FlashcardDeck,
  Flashcard,
  Skill,
  LearningPath,
  CalendarEvent,
  LearningGoal,
  Achievement,
  PortfolioProject,
} from './types';
import { storage } from './services/storage';
import { preferencesService, UserPreferences } from './services/preferences';
import { extractResourceContent } from './services/resourceExtractor';
import { analyticsService, AnalyticsSummary } from './services/analyticsService';
import { achievementService } from './services/achievementService';

import { ClassModal } from './components/ClassModal';
import { Classroom } from './components/Classroom';
import { BackupSettings } from './components/BackupSettings';
import { LearningPackImportModal } from './components/LearningPackImportModal';
import { LoadingScreen } from './components/LoadingScreen';
import { OfflineStatusIndicator } from './components/OfflineStatusIndicator';
import { PersonalDashboard } from './components/PersonalDashboard';
import { NotebookView } from './components/NotebookView';
import { FlashcardsView } from './components/FlashcardsView';
import { SkillsTrackerView } from './components/SkillsTrackerView';
import { LearningPathsView } from './components/LearningPathsView';
import { CalendarGoalsView } from './components/CalendarGoalsView';
import { PortfolioView } from './components/PortfolioView';
import { AnalyticsView } from './components/AnalyticsView';
import { GlobalSearchModal } from './components/GlobalSearchModal';

export type MainNavigationTab =
  | 'dashboard'
  | 'classes'
  | 'paths'
  | 'notebook'
  | 'flashcards'
  | 'resources'
  | 'skills'
  | 'calendar'
  | 'portfolio'
  | 'analytics'
  | 'settings';

export const App: React.FC = () => {
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Core LMS data
  const [classes, setClasses] = useState<LearningClass[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);

  // Ecosystem data
  const [notes, setNotes] = useState<Note[]>([]);
  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [portfolioProjects, setPortfolioProjects] = useState<PortfolioProject[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  const [preferences] = useState<UserPreferences>(() => preferencesService.getPreferences());

  const [activeTab, setActiveTab] = useState<MainNavigationTab>('dashboard');
  const [activeClassId, setActiveClassId] = useState<string | null>(
    preferences.selectedClassId || null
  );
  const [activeLessonId, setActiveLessonId] = useState<string | undefined>(
    preferences.selectedLessonId
  );

  // Modals & search
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isPackImportModalOpen, setIsPackImportModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<LearningClass | undefined>(undefined);
  const [classCatalogSearch, setClassCatalogSearch] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  // Load all initial data from IndexedDB
  const refreshData = async () => {
    try {
      const [
        cls,
        nts,
        decks,
        cards,
        sks,
        paths,
        events,
        goals,
        projs,
        ach,
        anl,
      ] = await Promise.all([
        storage.getClasses(),
        storage.getNotes(),
        storage.getFlashcardDecks(),
        storage.getFlashcards(),
        storage.getSkills(),
        storage.getLearningPaths(),
        storage.getCalendarEvents(),
        storage.getLearningGoals(),
        storage.getPortfolioProjects(),
        achievementService.evaluateAchievements(),
        analyticsService.getSummary(),
      ]);

      setClasses(cls);
      setNotes(nts);
      setFlashcardDecks(decks);
      setFlashcards(cards);
      setSkills(sks);
      setLearningPaths(paths);
      setCalendarEvents(events);
      setLearningGoals(goals);
      setPortfolioProjects(projs);
      setAchievements(ach);
      setAnalytics(anl);
    } catch (err) {
      console.error('Failed to load data from IndexedDB:', err);
    } finally {
      setIsInitialLoading(false);
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
      activeView: activeTab === 'settings' ? 'settings' : 'classes',
    });
  }, [activeClassId, activeLessonId, activeTab]);

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
    await reloadSubCollections();
  };

  const handleDeleteChapter = async (chapterId: string) => {
    await storage.deleteChapter(chapterId);
    await reloadSubCollections();
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
    await reloadSubCollections();
    await refreshData();
  };

  const handleSaveLesson = async (lesson: Lesson) => {
    await storage.saveLesson(lesson);
    await reloadSubCollections();
    await refreshData();
  };

  const handleDeleteLesson = async (lessonId: string) => {
    await storage.deleteLesson(lessonId);
    if (activeLessonId === lessonId) {
      setActiveLessonId(undefined);
    }
    await reloadSubCollections();
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
    await reloadSubCollections();
    await refreshData();
  };

  // Quiz Actions
  const handleSaveQuiz = async (quiz: Quiz) => {
    await storage.saveQuiz(quiz);
    await reloadSubCollections();
    await refreshData();
  };

  const handleDeleteQuiz = async (id: string) => {
    await storage.deleteQuiz(id);
    await reloadSubCollections();
    await refreshData();
  };

  const handleRecordAttempt = async (attempt: QuizAttempt) => {
    await storage.saveQuizAttempt(attempt);
    await reloadSubCollections();
    await refreshData();
  };

  // Assignment Submission Action
  const handleSaveSubmission = async (submission: AssignmentSubmission) => {
    await storage.saveSubmission(submission);
    await reloadSubCollections();
    await refreshData();
  };

  // Resource Actions
  const handleUploadResource = async (file: File, chapterId?: string, lessonId?: string) => {
    if (!activeClassId) return;
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
    await reloadSubCollections();
    await refreshData();
  };

  const handleDeleteResource = async (id: string) => {
    await storage.deleteResource(id);
    await reloadSubCollections();
    await refreshData();
  };

  // Ecosystem Handlers
  const handleSaveNote = async (note: Note) => {
    await storage.saveNote(note);
    await refreshData();
  };

  const handleDeleteNote = async (noteId: string) => {
    await storage.deleteNote(noteId);
    await refreshData();
  };

  const handleSaveDeck = async (deck: FlashcardDeck) => {
    await storage.saveFlashcardDeck(deck);
    await refreshData();
  };

  const handleDeleteDeck = async (deckId: string) => {
    await storage.deleteFlashcardDeck(deckId);
    await refreshData();
  };

  const handleSaveCard = async (card: Flashcard) => {
    await storage.saveFlashcard(card);
    await refreshData();
  };

  const handleDeleteCard = async (cardId: string) => {
    await storage.deleteFlashcard(cardId);
    await refreshData();
  };

  const handleSaveSkill = async (skill: Skill) => {
    await storage.saveSkill(skill);
    await refreshData();
  };

  const handleDeleteSkill = async (skillId: string) => {
    await storage.deleteSkill(skillId);
    await refreshData();
  };

  const handleSaveLearningPath = async (path: LearningPath) => {
    await storage.saveLearningPath(path);
    await refreshData();
  };

  const handleDeleteLearningPath = async (pathId: string) => {
    await storage.deleteLearningPath(pathId);
    await refreshData();
  };

  const handleSaveCalendarEvent = async (event: CalendarEvent) => {
    await storage.saveCalendarEvent(event);
    await refreshData();
  };

  const handleDeleteCalendarEvent = async (eventId: string) => {
    await storage.deleteCalendarEvent(eventId);
    await refreshData();
  };

  const handleSaveLearningGoal = async (goal: LearningGoal) => {
    await storage.saveLearningGoal(goal);
    await refreshData();
  };

  const handleDeleteLearningGoal = async (goalId: string) => {
    await storage.deleteLearningGoal(goalId);
    await refreshData();
  };

  const handleSavePortfolioProject = async (project: PortfolioProject) => {
    await storage.savePortfolioProject(project);
    await refreshData();
  };

  const handleDeletePortfolioProject = async (projectId: string) => {
    await storage.deletePortfolioProject(projectId);
    await refreshData();
  };

  const activeClass = classes.find((c) => c.id === activeClassId);

  // Filter classes in catalog view
  const uniqueSubjects = ['All', ...Array.from(new Set(classes.map((c) => c.subject)))];
  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(classCatalogSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(classCatalogSearch.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(classCatalogSearch.toLowerCase()));
    const matchesSubject = selectedSubjectFilter === 'All' || c.subject === selectedSubjectFilter;
    return matchesSearch && matchesSubject;
  });

  const dueFlashcards = flashcards.filter((c) => c.schedule.nextReviewAt <= Date.now());

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900 selection:bg-amber-200">
      {isInitialLoading && <LoadingScreen />}

      {/* Primary Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Platform Title */}
          <div
            onClick={() => {
              setActiveClassId(null);
              setActiveTab('dashboard');
            }}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
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

          {/* Quick Search trigger & Offline Status */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white text-stone-500 hover:text-stone-800 text-xs font-medium transition cursor-pointer"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Search workspace...</span>
              <kbd className="hidden sm:inline text-[10px] font-mono bg-stone-200/80 px-1.5 py-0.5 rounded text-stone-600">
                /
              </kbd>
            </button>

            <OfflineStatusIndicator />
          </div>
        </div>

        {/* Global Navigation Tabs Bar */}
        <div className="border-t border-stone-100 bg-stone-50/70 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 py-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveClassId(null);
                setActiveTab('dashboard');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard' && !activeClassId
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveClassId(null);
                setActiveTab('classes');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                (activeTab === 'classes' || activeClassId)
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <BookOpen size={14} />
              <span>My Classes ({classes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveClassId(null);
                setActiveTab('paths');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'paths' && !activeClassId
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Compass size={14} />
              <span>Learning Paths</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveClassId(null);
                setActiveTab('notebook');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'notebook' && !activeClassId
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <FileText size={14} />
              <span>Notebook ({notes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveClassId(null);
                setActiveTab('flashcards');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'flashcards' && !activeClassId
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Brain size={14} />
              <span>Flashcards</span>
              {dueFlashcards.length > 0 && (
                <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                  {dueFlashcards.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveClassId(null);
                setActiveTab('skills');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'skills' && !activeClassId
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Layers size={14} />
              <span>Skills Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveClassId(null);
                setActiveTab('calendar');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'calendar' && !activeClassId
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Calendar size={14} />
              <span>Calendar & Goals</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveClassId(null);
                setActiveTab('portfolio');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'portfolio' && !activeClassId
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <FolderGit2 size={14} />
              <span>Portfolio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveClassId(null);
                setActiveTab('analytics');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'analytics' && !activeClassId
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <TrendingUp size={14} />
              <span>Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveClassId(null);
                setActiveTab('settings');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'settings' && !activeClassId
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <HardDrive size={14} />
              <span>Storage & Backup</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Views */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {activeClass ? (
          /* Active Classroom View */
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
        ) : activeTab === 'dashboard' ? (
          /* Module 1: Dashboard */
          <PersonalDashboard
            classes={classes}
            lessons={lessons}
            analytics={analytics}
            dueCards={dueFlashcards}
            skills={skills}
            upcomingEvents={calendarEvents}
            onOpenClass={(cId, lId) => {
              setActiveClassId(cId);
              setActiveLessonId(lId);
            }}
            onNavigateTab={(tab) => setActiveTab(tab as MainNavigationTab)}
          />
        ) : activeTab === 'paths' ? (
          /* Module 9: Learning Paths */
          <LearningPathsView
            paths={learningPaths}
            classes={classes}
            lessons={lessons}
            onSavePath={handleSaveLearningPath}
            onDeletePath={handleDeleteLearningPath}
            onOpenClass={(cId) => setActiveClassId(cId)}
          />
        ) : activeTab === 'notebook' ? (
          /* Module 3: Personal Notes */
          <NotebookView
            notes={notes}
            classes={classes}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            onNavigateToLesson={(cId, lId) => {
              setActiveClassId(cId);
              setActiveLessonId(lId);
            }}
          />
        ) : activeTab === 'flashcards' ? (
          /* Module 4: Flashcards & Spaced Repetition */
          <FlashcardsView
            decks={flashcardDecks}
            cards={flashcards}
            classes={classes}
            onSaveDeck={handleSaveDeck}
            onDeleteDeck={handleDeleteDeck}
            onSaveCard={handleSaveCard}
            onDeleteCard={handleDeleteCard}
          />
        ) : activeTab === 'skills' ? (
          /* Module 7: Skills & Competency Matrix */
          <SkillsTrackerView
            skills={skills}
            classes={classes}
            submissions={submissions}
            onSaveSkill={handleSaveSkill}
            onDeleteSkill={handleDeleteSkill}
          />
        ) : activeTab === 'calendar' ? (
          /* Module 10: Calendar & Goals */
          <CalendarGoalsView
            events={calendarEvents}
            goals={learningGoals}
            classes={classes}
            onSaveEvent={handleSaveCalendarEvent}
            onDeleteEvent={handleDeleteCalendarEvent}
            onSaveGoal={handleSaveLearningGoal}
            onDeleteGoal={handleDeleteLearningGoal}
          />
        ) : activeTab === 'portfolio' ? (
          /* Module 13: Personal Portfolio */
          <PortfolioView
            projects={portfolioProjects}
            classes={classes}
            resources={resources}
            onSaveProject={handleSavePortfolioProject}
            onDeleteProject={handleDeletePortfolioProject}
          />
        ) : activeTab === 'analytics' ? (
          /* Module 14: Study Analytics */
          <AnalyticsView
            analytics={analytics}
            achievements={achievements}
            skills={skills}
          />
        ) : activeTab === 'settings' ? (
          /* Module 16: Backup & Storage */
          <div className="max-w-7xl mx-auto">
            <BackupSettings onDataChanged={refreshData} />
          </div>
        ) : (
          /* Module 2: Course Catalog & Management */
          <main className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                  Course Catalog & Curriculum Hub
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Structured learning syllabuses, interactive quizzes, exercises, and binary attachments.
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
                  value={classCatalogSearch}
                  onChange={(e) => setClassCatalogSearch(e.target.value)}
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

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectResult={(res) => {
          if (res.type === 'class' && res.classId) {
            setActiveClassId(res.classId);
          } else if (res.type === 'lesson' && res.classId) {
            setActiveClassId(res.classId);
            setActiveLessonId(res.lessonId);
          } else if (res.type === 'note') {
            setActiveClassId(null);
            setActiveTab('notebook');
          } else if (res.type === 'flashcard') {
            setActiveClassId(null);
            setActiveTab('flashcards');
          } else if (res.type === 'skill') {
            setActiveClassId(null);
            setActiveTab('skills');
          } else if (res.type === 'path') {
            setActiveClassId(null);
            setActiveTab('paths');
          } else if (res.type === 'portfolio') {
            setActiveClassId(null);
            setActiveTab('portfolio');
          }
        }}
      />
    </div>
  );
};
export default App;
