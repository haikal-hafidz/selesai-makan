export interface LearningClass {
  id: string;
  title: string;
  description: string;
  subject: string;
  tags: string[];
  color: string;
  level?: string;
  language?: string;
  learningObjectives?: string[];
  finalProject?: FinalProject;
  createdAt: number;
  updatedAt: number;
}

export interface Chapter {
  id: string;
  classId: string;
  title: string;
  description?: string;
  order: number;
}

export interface AssignmentRubricItem {
  criteria: string;
  points?: number;
  description: string;
}

export interface Assignment {
  id: string;
  classId?: string;
  lessonId?: string;
  title: string;
  description: string;
  instructions: string[];
  submissionType: 'text' | 'file' | 'spreadsheet' | 'code' | 'url' | 'none';
  evaluationMethod?: 'automatic' | 'rubric' | 'self_assessment' | 'manual_review';
  expectedAnswer?: string; // For deterministic automatic check
  rubric?: AssignmentRubricItem[];
  answerKeyOrModelAnswer?: string;
  attachmentResourceNames?: string[];
}

export interface FinalProject {
  title: string;
  brief: string;
  milestones?: string[];
  submissionGuidelines?: string;
  evaluationRubric?: {
    criteria: string;
    description: string;
  }[];
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  classId: string;
  lessonId?: string;
  submissionType: 'text' | 'file' | 'spreadsheet' | 'code' | 'url' | 'none';
  textResponse?: string;
  fileName?: string;
  fileBlob?: Blob;
  dataUrl?: string; // Cached or serialized for export
  evaluationMethod: 'automatic' | 'rubric' | 'self_assessment' | 'manual_review';
  isEvaluated: boolean;
  score?: number;
  maxScore?: number;
  rubricScores?: Record<string, number>; // criteria -> awarded score
  feedback?: string;
  submittedAt: number;
  evaluatedAt?: number;
}

export interface Lesson {
  id: string;
  classId: string;
  chapterId: string;
  title: string;
  content: string; // Markdown / note text
  learningObjectives?: string[];
  keyTakeaways?: string[];
  exercises?: string[];
  assignments?: Assignment[];
  order: number;
  isCompleted: boolean;
  completedAt?: number;
  updatedAt: number;
}

export interface ResourceItem {
  id: string;
  classId: string;
  chapterId?: string;
  lessonId?: string;
  name: string;
  fileType: string; // MIME type or extension
  size: number;
  description?: string;
  extractedText?: string; // Text extracted from TXT, MD, CSV, DOCX, XLSX
  status?: 'ready' | 'extracted' | 'attachment_only';
  dataBlob?: Blob; // For IndexedDB binary storage
  dataUrl?: string; // Cache / serialized data for export
  uploadedAt: number;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[]; // Options list (e.g. 2 to 6 options)
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
  submissions?: Omit<AssignmentSubmission, 'fileBlob'>[];
}

// -------------------------------------------------------------
// Learning Pack Schemas (.json format for export/import)
// -------------------------------------------------------------

export interface LearningPackQuizQuestion {
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface LearningPackQuiz {
  title: string;
  description?: string;
  questions: LearningPackQuizQuestion[];
}

export interface LearningPackAssignment {
  title: string;
  description: string;
  instructions: string[];
  submissionType: 'text' | 'file' | 'spreadsheet' | 'code' | 'url' | 'none';
  evaluationMethod?: 'automatic' | 'rubric' | 'self_assessment' | 'manual_review';
  expectedAnswer?: string;
  rubric?: {
    criteria: string;
    points?: number;
    description: string;
  }[];
  answerKeyOrModelAnswer?: string;
  attachmentResourceNames?: string[];
}

export interface LearningPackFinalProject {
  title: string;
  brief: string;
  milestones?: string[];
  submissionGuidelines?: string;
  evaluationRubric?: {
    criteria: string;
    description: string;
  }[];
}

export interface LearningPackLesson {
  title: string;
  content: string; // Markdown
  learningObjectives?: string[];
  keyTakeaways?: string[];
  exercises?: string[];
  assignments?: LearningPackAssignment[];
  order?: number;
  quiz?: LearningPackQuiz;
}

export interface LearningPackChapter {
  title: string;
  description?: string;
  order?: number;
  lessons: LearningPackLesson[];
}

export interface LearningPackResource {
  name: string;
  fileType: string;
  description?: string;
  contentBase64?: string; // Optional embedded data
  contentText?: string; // Extracted or raw text representation
}

export interface LearningPack {
  schemaVersion: '1.0' | '1.1';
  exportedAt?: number;
  class: {
    title: string;
    description: string;
    subject: string;
    tags?: string[];
    color?: string;
    level?: string;
    language?: string;
    learningObjectives?: string[];
    finalProject?: LearningPackFinalProject;
  };
  chapters: LearningPackChapter[];
  assignments?: LearningPackAssignment[]; // Course-level assignments / capstones
  finalProject?: LearningPackFinalProject; // Direct course-level project
  quizzes?: LearningPackQuiz[]; // Class-level quizzes
  resources?: LearningPackResource[];
}

export interface LearningPackValidationResult {
  isValid: boolean;
  schemaVersion: '1.0' | '1.1' | 'unknown';
  errors: string[];
  warnings: string[];
  unsupportedFeatures: string[];
  summary: {
    classesCount: number;
    chaptersCount: number;
    lessonsCount: number;
    exercisesCount: number;
    assignmentsCount: number;
    hasFinalProject: boolean;
    quizzesCount: number;
    resourcesCount: number;
  };
  data?: LearningPack;
}
