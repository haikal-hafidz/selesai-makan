import {
  LearningClass,
  Chapter,
  Lesson,
  ResourceItem,
  Quiz,
  QuizAttempt,
  AssignmentSubmission,
  BackupPayload,
  Note,
  Highlight,
  FlashcardDeck,
  Flashcard,
  Skill,
  LearningPath,
  CalendarEvent,
  LearningGoal,
  Achievement,
  PortfolioProject,
  StudySession,
} from '../types';

const DB_NAME = 'selesai_makan_db';
const DB_VERSION = 4; // Version 4: Ecosystem stores (notes, highlights, flashcards, skills, paths, calendar, goals, achievements, portfolio, sessions)

export class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB is not available in this environment.'));
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('classes')) {
          const store = db.createObjectStore('classes', { keyPath: 'id' });
          store.createIndex('subject', 'subject', { unique: false });
        }

        if (!db.objectStoreNames.contains('chapters')) {
          const store = db.createObjectStore('chapters', { keyPath: 'id' });
          store.createIndex('classId', 'classId', { unique: false });
        }

        if (!db.objectStoreNames.contains('lessons')) {
          const store = db.createObjectStore('lessons', { keyPath: 'id' });
          store.createIndex('classId', 'classId', { unique: false });
          store.createIndex('chapterId', 'chapterId', { unique: false });
        }

        if (!db.objectStoreNames.contains('resources')) {
          const store = db.createObjectStore('resources', { keyPath: 'id' });
          store.createIndex('classId', 'classId', { unique: false });
          store.createIndex('lessonId', 'lessonId', { unique: false });
        }

        if (!db.objectStoreNames.contains('quizzes')) {
          const store = db.createObjectStore('quizzes', { keyPath: 'id' });
          store.createIndex('classId', 'classId', { unique: false });
          store.createIndex('lessonId', 'lessonId', { unique: false });
        }

        if (!db.objectStoreNames.contains('quiz_attempts')) {
          const store = db.createObjectStore('quiz_attempts', { keyPath: 'id' });
          store.createIndex('quizId', 'quizId', { unique: false });
          store.createIndex('classId', 'classId', { unique: false });
        }

        if (!db.objectStoreNames.contains('assignment_submissions')) {
          const store = db.createObjectStore('assignment_submissions', { keyPath: 'id' });
          store.createIndex('assignmentId', 'assignmentId', { unique: false });
          store.createIndex('classId', 'classId', { unique: false });
        }

        // New stores in DB_VERSION 4
        if (!db.objectStoreNames.contains('notes')) {
          const store = db.createObjectStore('notes', { keyPath: 'id' });
          store.createIndex('classId', 'classId', { unique: false });
          store.createIndex('lessonId', 'lessonId', { unique: false });
        }

        if (!db.objectStoreNames.contains('highlights')) {
          const store = db.createObjectStore('highlights', { keyPath: 'id' });
          store.createIndex('lessonId', 'lessonId', { unique: false });
          store.createIndex('classId', 'classId', { unique: false });
        }

        if (!db.objectStoreNames.contains('flashcard_decks')) {
          const store = db.createObjectStore('flashcard_decks', { keyPath: 'id' });
          store.createIndex('classId', 'classId', { unique: false });
        }

        if (!db.objectStoreNames.contains('flashcards')) {
          const store = db.createObjectStore('flashcards', { keyPath: 'id' });
          store.createIndex('deckId', 'deckId', { unique: false });
          store.createIndex('classId', 'classId', { unique: false });
        }

        if (!db.objectStoreNames.contains('skills')) {
          const store = db.createObjectStore('skills', { keyPath: 'id' });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('level', 'level', { unique: false });
        }

        if (!db.objectStoreNames.contains('learning_paths')) {
          const store = db.createObjectStore('learning_paths', { keyPath: 'id' });
          store.createIndex('category', 'category', { unique: false });
        }

        if (!db.objectStoreNames.contains('calendar_events')) {
          const store = db.createObjectStore('calendar_events', { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('classId', 'classId', { unique: false });
        }

        if (!db.objectStoreNames.contains('learning_goals')) {
          const store = db.createObjectStore('learning_goals', { keyPath: 'id' });
          store.createIndex('period', 'period', { unique: false });
        }

        if (!db.objectStoreNames.contains('achievements')) {
          const store = db.createObjectStore('achievements', { keyPath: 'id' });
          store.createIndex('key', 'key', { unique: true });
        }

        if (!db.objectStoreNames.contains('portfolio_projects')) {
          const store = db.createObjectStore('portfolio_projects', { keyPath: 'id' });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('study_sessions')) {
          const store = db.createObjectStore('study_sessions', { keyPath: 'id' });
          store.createIndex('classId', 'classId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // Generic Helpers
  private async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private async getById<T>(storeName: string, id: string): Promise<T | undefined> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async put<T>(storeName: string, item: T): Promise<T> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }

  private async delete(storeName: string, id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Classes
  async getClasses(): Promise<LearningClass[]> {
    return this.getAll<LearningClass>('classes');
  }

  async saveClass(item: LearningClass): Promise<LearningClass> {
    return this.put<LearningClass>('classes', item);
  }

  async deleteClass(id: string): Promise<void> {
    // Cascade delete chapters, lessons, resources, quizzes, and assignment submissions
    const chapters = await this.getChapters(id);
    for (const c of chapters) {
      await this.deleteChapter(c.id);
    }
    const resources = await this.getResources(id);
    for (const r of resources) {
      await this.deleteResource(r.id);
    }
    const quizzes = await this.getQuizzes(id);
    for (const q of quizzes) {
      await this.deleteQuiz(q.id);
    }
    const submissions = await this.getSubmissions(id);
    for (const s of submissions) {
      await this.deleteSubmission(s.id);
    }
    return this.delete('classes', id);
  }

  // Chapters
  async getChapters(classId: string): Promise<Chapter[]> {
    const all = await this.getAll<Chapter>('chapters');
    return all.filter((c) => c.classId === classId).sort((a, b) => a.order - b.order);
  }

  async saveChapter(chapter: Chapter): Promise<Chapter> {
    return this.put<Chapter>('chapters', chapter);
  }

  async deleteChapter(chapterId: string): Promise<void> {
    const allLessons = await this.getAll<Lesson>('lessons');
    const chapterLessons = allLessons.filter((l) => l.chapterId === chapterId);
    for (const lesson of chapterLessons) {
      await this.deleteLesson(lesson.id);
    }
    return this.delete('chapters', chapterId);
  }

  // Lessons
  async getLessons(classId?: string): Promise<Lesson[]> {
    const all = await this.getAll<Lesson>('lessons');
    if (classId) {
      return all.filter((l) => l.classId === classId).sort((a, b) => a.order - b.order);
    }
    return all.sort((a, b) => a.order - b.order);
  }

  async getLesson(id: string): Promise<Lesson | undefined> {
    return this.getById<Lesson>('lessons', id);
  }

  async saveLesson(lesson: Lesson): Promise<Lesson> {
    return this.put<Lesson>('lessons', lesson);
  }

  async deleteLesson(lessonId: string): Promise<void> {
    return this.delete('lessons', lessonId);
  }

  // Resources
  async getResources(classId: string): Promise<ResourceItem[]> {
    const all = await this.getAll<ResourceItem>('resources');
    return all.filter((r) => r.classId === classId).sort((a, b) => b.uploadedAt - a.uploadedAt);
  }

  async getResource(id: string): Promise<ResourceItem | undefined> {
    return this.getById<ResourceItem>('resources', id);
  }

  async saveResource(resource: ResourceItem): Promise<ResourceItem> {
    return this.put<ResourceItem>('resources', resource);
  }

  async deleteResource(id: string): Promise<void> {
    return this.delete('resources', id);
  }

  // Quizzes
  async getQuizzes(classId: string): Promise<Quiz[]> {
    const all = await this.getAll<Quiz>('quizzes');
    return all.filter((q) => q.classId === classId).sort((a, b) => b.createdAt - a.createdAt);
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    return this.getById<Quiz>('quizzes', id);
  }

  async saveQuiz(quiz: Quiz): Promise<Quiz> {
    return this.put<Quiz>('quizzes', quiz);
  }

  async deleteQuiz(id: string): Promise<void> {
    return this.delete('quizzes', id);
  }

  // Attempts
  async getQuizAttempts(classId: string): Promise<QuizAttempt[]> {
    const all = await this.getAll<QuizAttempt>('quiz_attempts');
    return all.filter((a) => a.classId === classId).sort((a, b) => b.takenAt - a.takenAt);
  }

  async saveQuizAttempt(attempt: QuizAttempt): Promise<QuizAttempt> {
    return this.put<QuizAttempt>('quiz_attempts', attempt);
  }

  // Assignment Submissions (New)
  async getSubmissions(classId: string): Promise<AssignmentSubmission[]> {
    const all = await this.getAll<AssignmentSubmission>('assignment_submissions');
    return all.filter((s) => s.classId === classId).sort((a, b) => b.submittedAt - a.submittedAt);
  }

  async getSubmissionForAssignment(assignmentId: string): Promise<AssignmentSubmission | undefined> {
    const all = await this.getAll<AssignmentSubmission>('assignment_submissions');
    return all.find((s) => s.assignmentId === assignmentId);
  }

  async saveSubmission(submission: AssignmentSubmission): Promise<AssignmentSubmission> {
    return this.put<AssignmentSubmission>('assignment_submissions', submission);
  }

  async deleteSubmission(id: string): Promise<void> {
    return this.delete('assignment_submissions', id);
  }

  // Notes
  async getNotes(classId?: string): Promise<Note[]> {
    const all = await this.getAll<Note>('notes');
    if (classId) {
      return all.filter((n) => n.classId === classId).sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return all.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async getNote(id: string): Promise<Note | undefined> {
    return this.getById<Note>('notes', id);
  }

  async saveNote(note: Note): Promise<Note> {
    return this.put<Note>('notes', note);
  }

  async deleteNote(id: string): Promise<void> {
    return this.delete('notes', id);
  }

  // Highlights
  async getHighlights(lessonId: string): Promise<Highlight[]> {
    const all = await this.getAll<Highlight>('highlights');
    return all.filter((h) => h.lessonId === lessonId).sort((a, b) => b.createdAt - a.createdAt);
  }

  async saveHighlight(highlight: Highlight): Promise<Highlight> {
    return this.put<Highlight>('highlights', highlight);
  }

  async deleteHighlight(id: string): Promise<void> {
    return this.delete('highlights', id);
  }

  // Flashcard Decks & Flashcards
  async getFlashcardDecks(classId?: string): Promise<FlashcardDeck[]> {
    const all = await this.getAll<FlashcardDeck>('flashcard_decks');
    if (classId) {
      return all.filter((d) => d.classId === classId).sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return all.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async saveFlashcardDeck(deck: FlashcardDeck): Promise<FlashcardDeck> {
    return this.put<FlashcardDeck>('flashcard_decks', deck);
  }

  async deleteFlashcardDeck(id: string): Promise<void> {
    const allCards = await this.getAll<Flashcard>('flashcards');
    const deckCards = allCards.filter((c) => c.deckId === id);
    for (const card of deckCards) {
      await this.delete('flashcards', card.id);
    }
    return this.delete('flashcard_decks', id);
  }

  async getFlashcards(deckId?: string): Promise<Flashcard[]> {
    const all = await this.getAll<Flashcard>('flashcards');
    if (deckId) {
      return all.filter((c) => c.deckId === deckId).sort((a, b) => a.schedule.nextReviewAt - b.schedule.nextReviewAt);
    }
    return all.sort((a, b) => a.schedule.nextReviewAt - b.schedule.nextReviewAt);
  }

  async getDueFlashcards(): Promise<Flashcard[]> {
    const now = Date.now();
    const all = await this.getAll<Flashcard>('flashcards');
    return all.filter((c) => c.schedule.nextReviewAt <= now);
  }

  async saveFlashcard(card: Flashcard): Promise<Flashcard> {
    return this.put<Flashcard>('flashcards', card);
  }

  async deleteFlashcard(id: string): Promise<void> {
    return this.delete('flashcards', id);
  }

  // Skills
  async getSkills(): Promise<Skill[]> {
    const all = await this.getAll<Skill>('skills');
    return all.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getSkill(id: string): Promise<Skill | undefined> {
    return this.getById<Skill>('skills', id);
  }

  async saveSkill(skill: Skill): Promise<Skill> {
    return this.put<Skill>('skills', skill);
  }

  async deleteSkill(id: string): Promise<void> {
    return this.delete('skills', id);
  }

  // Learning Paths
  async getLearningPaths(): Promise<LearningPath[]> {
    const all = await this.getAll<LearningPath>('learning_paths');
    return all.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async getLearningPath(id: string): Promise<LearningPath | undefined> {
    return this.getById<LearningPath>('learning_paths', id);
  }

  async saveLearningPath(path: LearningPath): Promise<LearningPath> {
    return this.put<LearningPath>('learning_paths', path);
  }

  async deleteLearningPath(id: string): Promise<void> {
    return this.delete('learning_paths', id);
  }

  // Calendar Events
  async getCalendarEvents(startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    const all = await this.getAll<CalendarEvent>('calendar_events');
    if (startDate && endDate) {
      return all
        .filter((e) => e.date >= startDate && e.date <= endDate)
        .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));
    }
    return all.sort((a, b) => a.date.localeCompare(b.date));
  }

  async saveCalendarEvent(event: CalendarEvent): Promise<CalendarEvent> {
    return this.put<CalendarEvent>('calendar_events', event);
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    return this.delete('calendar_events', id);
  }

  // Learning Goals
  async getLearningGoals(): Promise<LearningGoal[]> {
    const all = await this.getAll<LearningGoal>('learning_goals');
    return all.sort((a, b) => b.createdAt - a.createdAt);
  }

  async saveLearningGoal(goal: LearningGoal): Promise<LearningGoal> {
    return this.put<LearningGoal>('learning_goals', goal);
  }

  async deleteLearningGoal(id: string): Promise<void> {
    return this.delete('learning_goals', id);
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    const all = await this.getAll<Achievement>('achievements');
    return all;
  }

  async saveAchievement(achievement: Achievement): Promise<Achievement> {
    return this.put<Achievement>('achievements', achievement);
  }

  // Portfolio Projects
  async getPortfolioProjects(): Promise<PortfolioProject[]> {
    const all = await this.getAll<PortfolioProject>('portfolio_projects');
    return all.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async getPortfolioProject(id: string): Promise<PortfolioProject | undefined> {
    return this.getById<PortfolioProject>('portfolio_projects', id);
  }

  async savePortfolioProject(project: PortfolioProject): Promise<PortfolioProject> {
    return this.put<PortfolioProject>('portfolio_projects', project);
  }

  async deletePortfolioProject(id: string): Promise<void> {
    return this.delete('portfolio_projects', id);
  }

  // Study Sessions
  async getStudySessions(classId?: string): Promise<StudySession[]> {
    const all = await this.getAll<StudySession>('study_sessions');
    if (classId) {
      return all.filter((s) => s.classId === classId).sort((a, b) => b.timestamp - a.timestamp);
    }
    return all.sort((a, b) => b.timestamp - a.timestamp);
  }

  async saveStudySession(session: StudySession): Promise<StudySession> {
    return this.put<StudySession>('study_sessions', session);
  }

  // Backup and Restore
  async exportBackup(): Promise<string> {
    const classes = await this.getAll<LearningClass>('classes');
    const chapters = await this.getAll<Chapter>('chapters');
    const lessons = await this.getAll<Lesson>('lessons');
    const rawResources = await this.getAll<ResourceItem>('resources');
    const quizzes = await this.getAll<Quiz>('quizzes');
    const attempts = await this.getAll<QuizAttempt>('quiz_attempts');
    const rawSubmissions = await this.getAll<AssignmentSubmission>('assignment_submissions');

    // Convert blobs to dataUrl strings for portable JSON backup if present
    const resourcesWithUrl = await Promise.all(
      rawResources.map(async (r) => {
        let dataUrl = r.dataUrl;
        if (r.dataBlob && !dataUrl) {
          dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(r.dataBlob!);
          });
        }
        return {
          id: r.id,
          classId: r.classId,
          chapterId: r.chapterId,
          lessonId: r.lessonId,
          name: r.name,
          fileType: r.fileType,
          size: r.size,
          description: r.description,
          extractedText: r.extractedText,
          status: r.status,
          dataUrl,
          uploadedAt: r.uploadedAt,
        };
      })
    );

    const submissionsWithUrl = await Promise.all(
      rawSubmissions.map(async (s) => {
        let dataUrl = s.dataUrl;
        if (s.fileBlob && !dataUrl) {
          dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(s.fileBlob!);
          });
        }
        return {
          id: s.id,
          assignmentId: s.assignmentId,
          classId: s.classId,
          lessonId: s.lessonId,
          submissionType: s.submissionType,
          textResponse: s.textResponse,
          fileName: s.fileName,
          dataUrl,
          evaluationMethod: s.evaluationMethod,
          isEvaluated: s.isEvaluated,
          score: s.score,
          maxScore: s.maxScore,
          rubricScores: s.rubricScores,
          feedback: s.feedback,
          submittedAt: s.submittedAt,
          evaluatedAt: s.evaluatedAt,
        };
      })
    );

    const [
      notes,
      highlights,
      flashcardDecks,
      flashcards,
      skills,
      learningPaths,
      calendarEvents,
      learningGoals,
      achievements,
      portfolioProjects,
      studySessions,
    ] = await Promise.all([
      this.getAll<Note>('notes'),
      this.getAll<Highlight>('highlights'),
      this.getAll<FlashcardDeck>('flashcard_decks'),
      this.getAll<Flashcard>('flashcards'),
      this.getAll<Skill>('skills'),
      this.getAll<LearningPath>('learning_paths'),
      this.getAll<CalendarEvent>('calendar_events'),
      this.getAll<LearningGoal>('learning_goals'),
      this.getAll<Achievement>('achievements'),
      this.getAll<PortfolioProject>('portfolio_projects'),
      this.getAll<StudySession>('study_sessions'),
    ]);

    const payload: BackupPayload = {
      version: 2,
      exportedAt: Date.now(),
      classes,
      chapters,
      lessons,
      resources: resourcesWithUrl,
      quizzes,
      attempts,
      submissions: submissionsWithUrl,
      notes,
      highlights,
      flashcardDecks,
      flashcards,
      skills,
      learningPaths,
      calendarEvents,
      learningGoals,
      achievements,
      portfolioProjects,
      studySessions,
    };

    return JSON.stringify(payload, null, 2);
  }

  async importBackup(jsonString: string): Promise<void> {
    const payload = JSON.parse(jsonString) as BackupPayload;
    if (!payload || !payload.classes || !Array.isArray(payload.classes)) {
      throw new Error('Invalid backup file format');
    }

    for (const c of payload.classes) {
      await this.saveClass(c);
    }
    for (const ch of payload.chapters || []) {
      await this.saveChapter(ch);
    }
    for (const l of payload.lessons || []) {
      await this.saveLesson(l);
    }
    for (const r of payload.resources || []) {
      let dataBlob: Blob | undefined;
      if (r.dataUrl) {
        try {
          const res = await fetch(r.dataUrl);
          dataBlob = await res.blob();
        } catch {
          // fallback if base64 fetch fails
        }
      }
      await this.saveResource({
        ...r,
        dataBlob,
      });
    }
    for (const q of payload.quizzes || []) {
      await this.saveQuiz(q);
    }
    for (const a of payload.attempts || []) {
      await this.saveQuizAttempt(a);
    }
    for (const s of payload.submissions || []) {
      let fileBlob: Blob | undefined;
      if (s.dataUrl) {
        try {
          const res = await fetch(s.dataUrl);
          fileBlob = await res.blob();
        } catch {
          // ignore
        }
      }
      await this.saveSubmission({
        ...s,
        fileBlob,
      });
    }
    for (const n of payload.notes || []) {
      await this.saveNote(n);
    }
    for (const h of payload.highlights || []) {
      await this.saveHighlight(h);
    }
    for (const d of payload.flashcardDecks || []) {
      await this.saveFlashcardDeck(d);
    }
    for (const f of payload.flashcards || []) {
      await this.saveFlashcard(f);
    }
    for (const sk of payload.skills || []) {
      await this.saveSkill(sk);
    }
    for (const p of payload.learningPaths || []) {
      await this.saveLearningPath(p);
    }
    for (const ev of payload.calendarEvents || []) {
      await this.saveCalendarEvent(ev);
    }
    for (const g of payload.learningGoals || []) {
      await this.saveLearningGoal(g);
    }
    for (const ac of payload.achievements || []) {
      await this.saveAchievement(ac);
    }
    for (const proj of payload.portfolioProjects || []) {
      await this.savePortfolioProject(proj);
    }
    for (const ss of payload.studySessions || []) {
      await this.saveStudySession(ss);
    }
  }

  // Clear all data
  async resetAll(): Promise<void> {
    const db = await this.openDB();
    const storeNames = [
      'classes',
      'chapters',
      'lessons',
      'resources',
      'quizzes',
      'quiz_attempts',
      'assignment_submissions',
      'notes',
      'highlights',
      'flashcard_decks',
      'flashcards',
      'skills',
      'learning_paths',
      'calendar_events',
      'learning_goals',
      'achievements',
      'portfolio_projects',
      'study_sessions',
    ];
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeNames, 'readwrite');
      storeNames.forEach((s) => transaction.objectStore(s).clear());
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

export const storage = new StorageService();
