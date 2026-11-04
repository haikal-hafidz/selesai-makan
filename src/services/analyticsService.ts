import { storage } from './storage';
import { StudySession } from '../types';

export interface AnalyticsSummary {
  totalStudyMinutes: number;
  totalSessionsCount: number;
  completedLessonsCount: number;
  completedCoursesCount: number;
  totalQuizAttemptsCount: number;
  averageQuizScore: number;
  totalSubmissionsCount: number;
  activeCardsCount: number;
  dueCardsCount: number;
  masteredSkillsCount: number;
  studyStreakDays: number;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: number;
    details?: string;
  }>;
}

export class AnalyticsService {
  /**
   * Records a study session activity.
   */
  async recordSession(session: Omit<StudySession, 'id'>): Promise<StudySession> {
    const fullSession: StudySession = {
      ...session,
      id: crypto.randomUUID(),
    };
    return storage.saveStudySession(fullSession);
  }

  /**
   * Compiles comprehensive real-time analytics from persisted IndexedDB records.
   */
  async getSummary(): Promise<AnalyticsSummary> {
    const [
      classes,
      lessons,
      quizzes,
      attempts,
      submissions,
      cards,
      skills,
      sessions,
    ] = await Promise.all([
      storage.getClasses(),
      storage.getLessons(''),
      storage.getQuizzes(''),
      storage.getQuizAttempts(''),
      storage.getSubmissions(''),
      storage.getFlashcards(),
      storage.getSkills(),
      storage.getStudySessions(),
    ]);

    const totalStudyMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const completedLessons = lessons.filter((l) => l.isCompleted);

    // Calculate completed courses (where all lessons in the course are completed and > 0 lessons exist)
    let completedCoursesCount = 0;
    for (const c of classes) {
      const courseLessons = lessons.filter((l) => l.classId === c.id);
      if (courseLessons.length > 0 && courseLessons.every((l) => l.isCompleted)) {
        completedCoursesCount++;
      }
    }

    const averageQuizScore =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
        : 0;

    const now = Date.now();
    const dueCardsCount = cards.filter((c) => c.schedule.nextReviewAt <= now).length;
    const masteredSkillsCount = skills.filter((s) => s.level === 'mastered').length;

    // Calculate daily learning streak based on distinct dates with completed lessons or study sessions
    const activityDates = new Set<string>();
    completedLessons.forEach((l) => {
      if (l.completedAt) {
        activityDates.add(new Date(l.completedAt).toISOString().split('T')[0]);
      }
    });
    sessions.forEach((s) => {
      activityDates.add(new Date(s.timestamp).toISOString().split('T')[0]);
    });
    attempts.forEach((a) => {
      activityDates.add(new Date(a.takenAt).toISOString().split('T')[0]);
    });

    let studyStreakDays = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activityDates.has(dateStr)) {
        studyStreakDays++;
      } else if (i === 0) {
        // Today might not have activity yet, allow checking yesterday
        continue;
      } else {
        break;
      }
    }

    // Build timeline of recent real events
    const recentActivity: AnalyticsSummary['recentActivity'] = [];

    completedLessons.slice(-5).forEach((l) => {
      recentActivity.push({
        id: `ls-${l.id}`,
        type: 'lesson_completed',
        title: `Completed lesson: ${l.title}`,
        timestamp: l.completedAt || l.updatedAt,
      });
    });

    attempts.slice(-5).forEach((a) => {
      const parentQuiz = quizzes.find((q) => q.id === a.quizId);
      recentActivity.push({
        id: `att-${a.id}`,
        type: 'quiz_attempt',
        title: `Attempted quiz: ${parentQuiz?.title || 'Quiz'}`,
        timestamp: a.takenAt,
        details: `Score: ${a.score}% (${a.passed ? 'Passed' : 'Need Review'})`,
      });
    });

    submissions.slice(-5).forEach((s) => {
      recentActivity.push({
        id: `sub-${s.id}`,
        type: 'assignment_submitted',
        title: `Submitted assignment (${s.submissionType.toUpperCase()})`,
        timestamp: s.submittedAt,
        details: s.score !== undefined ? `Evaluated: ${s.score}/100` : 'Pending evaluation',
      });
    });

    recentActivity.sort((a, b) => b.timestamp - a.timestamp);

    return {
      totalStudyMinutes,
      totalSessionsCount: sessions.length,
      completedLessonsCount: completedLessons.length,
      completedCoursesCount,
      totalQuizAttemptsCount: attempts.length,
      averageQuizScore,
      totalSubmissionsCount: submissions.length,
      activeCardsCount: cards.length,
      dueCardsCount,
      masteredSkillsCount,
      studyStreakDays,
      recentActivity: recentActivity.slice(0, 10),
    };
  }
}

export const analyticsService = new AnalyticsService();
