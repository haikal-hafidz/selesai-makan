import { storage } from './storage';
import { Achievement } from '../types';

export const INITIAL_ACHIEVEMENTS: Omit<Achievement, 'id'>[] = [
  {
    key: 'first_lesson',
    title: 'First Step to Mastery',
    description: 'Mark your very first lesson as completed.',
    icon: 'Sparkles',
    category: 'curriculum',
    progressCurrent: 0,
    progressTarget: 1,
  },
  {
    key: 'course_complete',
    title: 'Finisher',
    description: 'Complete all lessons in any course.',
    icon: 'GraduationCap',
    category: 'curriculum',
    progressCurrent: 0,
    progressTarget: 1,
  },
  {
    key: 'first_quiz',
    title: 'Knowledge Checked',
    description: 'Complete and submit your first quiz.',
    icon: 'CheckCircle2',
    category: 'assessment',
    progressCurrent: 0,
    progressTarget: 1,
  },
  {
    key: 'first_assignment',
    title: 'Hands-on Builder',
    description: 'Submit your first practical assignment with deliverables.',
    icon: 'FileText',
    category: 'practice',
    progressCurrent: 0,
    progressTarget: 1,
  },
  {
    key: 'flashcard_scholar',
    title: 'Memory Master',
    description: 'Review 20 flashcards using spaced repetition.',
    icon: 'Brain',
    category: 'consistency',
    progressCurrent: 0,
    progressTarget: 20,
  },
  {
    key: 'skill_demonstrated',
    title: 'Competency Proven',
    description: 'Advance any skill to Demonstrated or Mastered with evidence.',
    icon: 'Award',
    category: 'mastery',
    progressCurrent: 0,
    progressTarget: 1,
  },
  {
    key: 'learning_streak_3',
    title: 'Study Habit',
    description: 'Maintain a 3-day continuous learning streak.',
    icon: 'Flame',
    category: 'consistency',
    progressCurrent: 0,
    progressTarget: 3,
  },
];

export class AchievementService {
  /**
   * Initializes default achievements if not present in storage.
   */
  async ensureInitialized(): Promise<Achievement[]> {
    const existing = await storage.getAchievements();
    if (existing.length === 0) {
      const initialized: Achievement[] = [];
      for (const item of INITIAL_ACHIEVEMENTS) {
        const full: Achievement = {
          ...item,
          id: crypto.randomUUID(),
        };
        await storage.saveAchievement(full);
        initialized.push(full);
      }
      return initialized;
    }
    return existing;
  }

  /**
   * Evaluates and updates achievement progress based on real learner activity.
   */
  async evaluateAchievements(): Promise<Achievement[]> {
    const achievements = await this.ensureInitialized();
    const [lessons, attempts, submissions, cards, skills] = await Promise.all([
      storage.getLessons(''),
      storage.getQuizAttempts(''),
      storage.getSubmissions(''),
      storage.getFlashcards(),
      storage.getSkills(),
    ]);

    const completedLessons = lessons.filter((l) => l.isCompleted);
    const totalCardReviews = cards.reduce((sum, c) => sum + (c.schedule.repetitions || 0), 0);
    const provenSkills = skills.filter((s) => s.level === 'demonstrated' || s.level === 'mastered');

    const updatedAchievements: Achievement[] = [];

    for (const ach of achievements) {
      let currentProgress = ach.progressCurrent;
      let shouldUpdate = false;

      switch (ach.key) {
        case 'first_lesson':
          currentProgress = Math.min(completedLessons.length, ach.progressTarget);
          break;
        case 'first_quiz':
          currentProgress = Math.min(attempts.length, ach.progressTarget);
          break;
        case 'first_assignment':
          currentProgress = Math.min(submissions.length, ach.progressTarget);
          break;
        case 'flashcard_scholar':
          currentProgress = Math.min(totalCardReviews, ach.progressTarget);
          break;
        case 'skill_demonstrated':
          currentProgress = Math.min(provenSkills.length, ach.progressTarget);
          break;
      }

      if (currentProgress !== ach.progressCurrent) {
        ach.progressCurrent = currentProgress;
        shouldUpdate = true;
      }

      if (!ach.unlockedAt && ach.progressCurrent >= ach.progressTarget) {
        ach.unlockedAt = Date.now();
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        await storage.saveAchievement(ach);
      }
      updatedAchievements.push(ach);
    }

    return updatedAchievements;
  }
}

export const achievementService = new AchievementService();
