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
  weight?: string | number;
  description: string;
}

export interface Assignment {
  id: string;
  classId?: string;
  lessonId?: string;
  title: string;
  description: string;
  objectives?: string[];
  instructions: string[];
  deliverables?: string[];
  submissionType: 'text' | 'file' | 'spreadsheet' | 'code' | 'url' | 'none';
  evaluationMethod?: 'automatic' | 'rubric' | 'self_assessment' | 'manual_review';
  expectedAnswer?: string; // For deterministic automatic check
  rubric?: AssignmentRubricItem[];
  answerKeyOrModelAnswer?: string;
  attachmentResourceNames?: string[];
}

export interface FinalProjectRubricItem {
  criteria: string;
  weight?: string | number;
  points?: number;
  description: string;
}

export interface AnswerKeyObject {
  type?: string;
  content: string;
}

export type AnswerKeyType = string | AnswerKeyObject;

export interface FinalProject {
  title: string;
  description?: string;
  brief?: string;
  objectives?: string[];
  instructions?: string[];
  milestones?: string[];
  deliverables?: string[];
  submissionGuidelines?: string;
  rubric?: FinalProjectRubricItem[];
  evaluationRubric?: FinalProjectRubricItem[];
  answerKey?: AnswerKeyType;
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

// -------------------------------------------------------------
// Ecosystem Domain Entities (Personal LMS)
// -------------------------------------------------------------

export interface Note {
  id: string;
  classId?: string;
  lessonId?: string;
  title: string;
  content: string; // Markdown
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Highlight {
  id: string;
  classId: string;
  lessonId: string;
  text: string;
  note?: string;
  color?: string; // Yellow, green, blue, etc.
  createdAt: number;
}

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface SpacedRepetitionSchedule {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  lastReviewedAt?: number;
  nextReviewAt: number;
}

export interface Flashcard {
  id: string;
  deckId: string;
  classId?: string;
  lessonId?: string;
  front: string;
  back: string;
  explanation?: string;
  example?: string;
  tags: string[];
  schedule: SpacedRepetitionSchedule;
  createdAt: number;
  updatedAt: number;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description: string;
  classId?: string;
  tags: string[];
  color?: string;
  createdAt: number;
  updatedAt: number;
}

export type SkillLevel = 'not_started' | 'learning' | 'practicing' | 'demonstrated' | 'mastered';

export interface SkillEvidence {
  id: string;
  title: string;
  type: 'assignment' | 'project' | 'workbook' | 'reflection' | 'external';
  referenceId?: string; // Assignment ID, submission ID, or project ID
  notes?: string;
  attachedAt: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  level: SkillLevel;
  proficiencyCriteria: string[];
  relatedClassIds: string[];
  relatedAssignmentIds?: string[];
  evidence: SkillEvidence[];
  lastDemonstratedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface PathStep {
  classId: string;
  order: number;
  prerequisites?: string[]; // IDs of preceding classes in path
  milestoneTitle?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  objectives: string[];
  steps: PathStep[];
  capstoneTitle?: string;
  capstoneDescription?: string;
  createdAt: number;
  updatedAt: number;
}

export type CalendarEventType =
  | 'study_session'
  | 'course_milestone'
  | 'assignment_deadline'
  | 'flashcard_review'
  | 'quiz'
  | 'project_milestone';

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  durationMinutes?: number;
  classId?: string;
  assignmentId?: string;
  isCompleted: boolean;
  notes?: string;
  createdAt: number;
}

export interface LearningGoal {
  id: string;
  title: string;
  period: 'daily' | 'weekly' | 'monthly' | 'custom';
  targetMinutes: number;
  targetItems?: number; // e.g. lessons or cards
  completedMinutes: number;
  completedItems?: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isArchived: boolean;
  createdAt: number;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: 'curriculum' | 'assessment' | 'practice' | 'consistency' | 'mastery';
  unlockedAt?: number;
  progressCurrent: number;
  progressTarget: number;
}

export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  category: string;
  skillsDemonstrated: string[];
  classId?: string;
  assignmentId?: string;
  status: ProjectStatus;
  keyOutcomes: string[];
  reflection?: string;
  resourceIds?: string[];
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface StudySession {
  id: string;
  classId?: string;
  lessonId?: string;
  activityType: 'reading' | 'quiz' | 'practice' | 'flashcards' | 'project';
  durationMinutes: number;
  timestamp: number;
  notes?: string;
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
  notes?: Note[];
  highlights?: Highlight[];
  flashcardDecks?: FlashcardDeck[];
  flashcards?: Flashcard[];
  skills?: Skill[];
  learningPaths?: LearningPath[];
  calendarEvents?: CalendarEvent[];
  learningGoals?: LearningGoal[];
  achievements?: Achievement[];
  portfolioProjects?: PortfolioProject[];
  studySessions?: StudySession[];
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
  answerKeyOrModelAnswer?: string | AnswerKeyObject;
  answerKey?: AnswerKeyType;
  attachmentResourceNames?: string[];
}

export interface LearningPackFinalProject {
  title: string;
  description?: string;
  brief?: string;
  objectives?: string[];
  instructions?: string[];
  milestones?: string[];
  deliverables?: string[];
  submissionGuidelines?: string;
  rubric?: {
    criteria: string;
    weight?: string | number;
    points?: number;
    description: string;
  }[];
  evaluationRubric?: {
    criteria: string;
    weight?: string | number;
    points?: number;
    description: string;
  }[];
  answerKey?: AnswerKeyType;
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
