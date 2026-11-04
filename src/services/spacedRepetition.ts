import { SpacedRepetitionSchedule, ReviewRating } from '../types';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Creates initial default spaced repetition schedule for a brand new flashcard.
 */
export function createDefaultSchedule(): SpacedRepetitionSchedule {
  return {
    intervalDays: 0,
    easeFactor: 2.5,
    repetitions: 0,
    lapses: 0,
    nextReviewAt: Date.now(),
  };
}

/**
 * Calculates updated spaced repetition schedule based on the SM-2 algorithm.
 * Deterministic, offline-friendly, and handles time intervals accurately.
 *
 * @param current Current schedule state of the card
 * @param rating User feedback: 'again' (fail), 'hard', 'good', or 'easy'
 * @param reviewTime Timestamp of review (defaults to now)
 */
export function calculateNextReview(
  current: SpacedRepetitionSchedule,
  rating: ReviewRating,
  reviewTime: number = Date.now()
): SpacedRepetitionSchedule {
  let { intervalDays, easeFactor, repetitions, lapses } = current;

  // Rating grade mapping (SM-2 uses 0 to 5)
  // again = 1, hard = 3, good = 4, easy = 5
  let grade = 4;
  if (rating === 'again') grade = 1;
  else if (rating === 'hard') grade = 3;
  else if (rating === 'good') grade = 4;
  else if (rating === 'easy') grade = 5;

  if (grade < 3) {
    // Lapse: reset repetitions, increase lapse count, review in 1 day
    repetitions = 0;
    intervalDays = 1;
    lapses += 1;
  } else {
    // Successful recall
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor: EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3; // Minimum boundary
  }

  // Extra bonus for 'easy'
  if (rating === 'easy') {
    intervalDays = Math.round(intervalDays * 1.3);
  } else if (rating === 'hard') {
    intervalDays = Math.max(1, Math.round(intervalDays * 0.8));
  }

  const nextReviewAt = reviewTime + intervalDays * ONE_DAY_MS;

  return {
    intervalDays,
    easeFactor: Number(easeFactor.toFixed(2)),
    repetitions,
    lapses,
    lastReviewedAt: reviewTime,
    nextReviewAt,
  };
}
