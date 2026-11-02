import {
  LearningClass,
  Chapter,
  Lesson,
  ResourceItem,
  Quiz,
  QuizAttempt,
  BackupPayload,
} from '../types';

const DB_NAME = 'selesai_makan_db';
const DB_VERSION = 1;

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
    // Cascade delete chapters, lessons, resources, quizzes
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
  async getLessons(classId: string): Promise<Lesson[]> {
    const all = await this.getAll<Lesson>('lessons');
    return all.filter((l) => l.classId === classId).sort((a, b) => a.order - b.order);
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

  // Backup and Restore
  async exportBackup(): Promise<string> {
    const classes = await this.getAll<LearningClass>('classes');
    const chapters = await this.getAll<Chapter>('chapters');
    const lessons = await this.getAll<Lesson>('lessons');
    const rawResources = await this.getAll<ResourceItem>('resources');
    const quizzes = await this.getAll<Quiz>('quizzes');
    const attempts = await this.getAll<QuizAttempt>('quiz_attempts');

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
          lessonId: r.lessonId,
          name: r.name,
          fileType: r.fileType,
          size: r.size,
          dataUrl,
          uploadedAt: r.uploadedAt,
        };
      })
    );

    const payload: BackupPayload = {
      version: 1,
      exportedAt: Date.now(),
      classes,
      chapters,
      lessons,
      resources: resourcesWithUrl,
      quizzes,
      attempts,
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
  }

  // Clear all data
  async resetAll(): Promise<void> {
    const db = await this.openDB();
    const storeNames = ['classes', 'chapters', 'lessons', 'resources', 'quizzes', 'quiz_attempts'];
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeNames, 'readwrite');
      storeNames.forEach((s) => transaction.objectStore(s).clear());
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

export const storage = new StorageService();
