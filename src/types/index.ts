export interface LearningClass {
  id: string;
  title: string;
  description: string;
  subject: string;
  tags: string[];
  color: string;
  createdAt: number;
  updatedAt: number;
}

export interface Chapter {
  id: string;
  classId: string;
  title: string;
  order: number;
}

export interface Lesson {
  id: string;
  classId: string;
  chapterId: string;
  title: string;
  content: string; // Markdown / note text
  order: number;
  isCompleted: boolean;
  completedAt?: number;
  updatedAt: number;
}

export interface ResourceItem {
  id: string;
  classId: string;
  lessonId?: string;
  name: string;
  fileType: string; // MIME type or extension
  size: number;
  dataBlob?: Blob; // For IndexedDB binary storage
  dataUrl?: string; // Cache / serialized data for export
  uploadedAt: number;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[]; // Options list (e.g. 2 to 4 options)
  correctOptionIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  classId: string;
  lessonId?: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  createdAt: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  classId: string;
  lessonId?: string;
  selectedAnswers: Record<string, number>; // questionId -> selectedOptionIndex
  score: number;
  totalQuestions: number;
  passed: boolean;
  takenAt: number;
}

export interface BackupPayload {
  version: number;
  exportedAt: number;
  classes: LearningClass[];
  chapters: Chapter[];
  lessons: Lesson[];
  resources: Omit<ResourceItem, 'dataBlob'>[];
  quizzes: Quiz[];
  attempts: QuizAttempt[];
}
