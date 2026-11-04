import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { storage } from '../services/storage';
import { calculateNextReview, createDefaultSchedule } from '../services/spacedRepetition';
import { searchService } from '../services/searchService';
import {
  Note,
  FlashcardDeck,
  Flashcard,
  Skill,
  LearningPath,
  CalendarEvent,
  LearningClass,
  Lesson,
} from '../types';

describe('Personal Learning Ecosystem Integration Test Suite', () => {
  beforeEach(async () => {
    await storage.resetAll();
  });

  it('verifies SM-2 spaced repetition calculation progression', () => {
    const initial = createDefaultSchedule();
    expect(initial.intervalDays).toBe(0);
    expect(initial.repetitions).toBe(0);
    expect(initial.easeFactor).toBe(2.5);

    // First review with 'good'
    const step1 = calculateNextReview(initial, 'good', 100000);
    expect(step1.repetitions).toBe(1);
    expect(step1.intervalDays).toBe(1);

    // Second review with 'good'
    const step2 = calculateNextReview(step1, 'good', 200000);
    expect(step2.repetitions).toBe(2);
    expect(step2.intervalDays).toBe(6);

    // Third review with 'easy'
    const step3 = calculateNextReview(step2, 'easy', 300000);
    expect(step3.repetitions).toBe(3);
    expect(step3.intervalDays).toBeGreaterThan(6);
    expect(step3.easeFactor).toBeGreaterThanOrEqual(2.5);

    // Lapse with 'again'
    const lapsed = calculateNextReview(step3, 'again', 400000);
    expect(lapsed.repetitions).toBe(0);
    expect(lapsed.intervalDays).toBe(1);
    expect(lapsed.lapses).toBe(1);
  });

  it('tests full CRUD persistence for notes, flashcards, skills, and learning paths', async () => {
    // 1. Note
    const note: Note = {
      id: 'n-1',
      title: 'Excel Lookup Rules',
      content: '# Lookup Notes\nVLOOKUP searches left to right only.',
      tags: ['Excel', 'Formulas'],
      isPinned: true,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await storage.saveNote(note);
    const savedNotes = await storage.getNotes();
    expect(savedNotes).toHaveLength(1);
    expect(savedNotes[0].title).toBe('Excel Lookup Rules');

    // 2. Flashcard Deck & Card
    const deck: FlashcardDeck = {
      id: 'd-1',
      title: 'Excel Shortcuts',
      description: 'Windows keyboard shortcuts',
      tags: ['Excel'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await storage.saveFlashcardDeck(deck);

    const card: Flashcard = {
      id: 'c-1',
      deckId: 'd-1',
      front: 'What shortcut edits the active cell?',
      back: 'F2',
      tags: ['Shortcuts'],
      schedule: createDefaultSchedule(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await storage.saveFlashcard(card);

    const savedDecks = await storage.getFlashcardDecks();
    const savedCards = await storage.getFlashcards('d-1');
    expect(savedDecks).toHaveLength(1);
    expect(savedCards).toHaveLength(1);
    expect(savedCards[0].back).toBe('F2');

    // 3. Skill & Competency
    const skill: Skill = {
      id: 'sk-1',
      name: 'Dynamic Array Modeling',
      description: 'Using FILTER, SORT, and UNIQUE in Excel 2021',
      category: 'Data Analysis',
      level: 'practicing',
      proficiencyCriteria: ['Spill range comprehension'],
      relatedClassIds: [],
      evidence: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await storage.saveSkill(skill);
    const savedSkills = await storage.getSkills();
    expect(savedSkills).toHaveLength(1);
    expect(savedSkills[0].level).toBe('practicing');

    // 4. Learning Path
    const path: LearningPath = {
      id: 'lp-1',
      title: 'Financial Analyst Track',
      description: 'End-to-end spreadsheet mastery',
      category: 'Finance',
      objectives: ['Master financial modeling'],
      steps: [{ classId: 'cls-1', order: 1 }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await storage.saveLearningPath(path);
    const savedPaths = await storage.getLearningPaths();
    expect(savedPaths).toHaveLength(1);
    expect(savedPaths[0].title).toBe('Financial Analyst Track');
  });

  it('tests full backup export and restoration including all ecosystem entities', async () => {
    const course: LearningClass = {
      id: 'cls-test',
      title: 'Ecosystem Test Class',
      description: 'Test description',
      subject: 'Technology',
      tags: ['Test'],
      color: '#d97706',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await storage.saveClass(course);

    const note: Note = {
      id: 'n-backup',
      title: 'Backup Test Note',
      content: 'Important takeaway',
      tags: ['Backup'],
      isPinned: false,
      isFavorite: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await storage.saveNote(note);

    const event: CalendarEvent = {
      id: 'ev-1',
      title: 'Study Session',
      type: 'study_session',
      date: '2026-11-05',
      durationMinutes: 60,
      isCompleted: false,
      createdAt: Date.now(),
    };
    await storage.saveCalendarEvent(event);

    const backupJson = await storage.exportBackup();
    expect(backupJson).toContain('Ecosystem Test Class');
    expect(backupJson).toContain('Backup Test Note');
    expect(backupJson).toContain('Study Session');

    // Clear everything
    await storage.resetAll();
    expect((await storage.getClasses()).length).toBe(0);
    expect((await storage.getNotes()).length).toBe(0);
    expect((await storage.getCalendarEvents()).length).toBe(0);

    // Restore from backup
    await storage.importBackup(backupJson);
    const restoredClasses = await storage.getClasses();
    const restoredNotes = await storage.getNotes();
    const restoredEvents = await storage.getCalendarEvents();

    expect(restoredClasses).toHaveLength(1);
    expect(restoredClasses[0].title).toBe('Ecosystem Test Class');
    expect(restoredNotes).toHaveLength(1);
    expect(restoredNotes[0].title).toBe('Backup Test Note');
    expect(restoredEvents).toHaveLength(1);
    expect(restoredEvents[0].date).toBe('2026-11-05');
  });

  it('verifies global search across classes, lessons, notes, and flashcards', async () => {
    const course: LearningClass = {
      id: 'c-search',
      title: 'Power Query Automation',
      description: 'Transform messy data tables',
      subject: 'Data Analysis',
      tags: ['ETL'],
      color: '#059669',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await storage.saveClass(course);

    const lesson: Lesson = {
      id: 'l-search',
      classId: 'c-search',
      chapterId: 'ch-1',
      title: 'Applied Steps in Power Query',
      content: 'Power Query records every recipe step automatically.',
      order: 1,
      isCompleted: false,
      updatedAt: Date.now(),
    };
    await storage.saveLesson(lesson);

    const note: Note = {
      id: 'n-search',
      title: 'ETL Best Practices',
      content: 'Never edit raw source data manually.',
      tags: ['Data'],
      isPinned: false,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await storage.saveNote(note);

    const queryResults = await searchService.search('Power Query');
    expect(queryResults.length).toBeGreaterThanOrEqual(2);
    expect(queryResults.some((r) => r.type === 'class')).toBe(true);
    expect(queryResults.some((r) => r.type === 'lesson')).toBe(true);
  });
});
