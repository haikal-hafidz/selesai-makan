import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { storage } from '../services/storage';
import { LearningClass, Chapter, Lesson, Quiz } from '../types';

describe('StorageService (IndexedDB)', () => {
  beforeEach(async () => {
    await storage.resetAll();
  });

  it('can create and retrieve classes', async () => {
    const newClass: LearningClass = {
      id: 'class-1',
      title: 'Microsoft Excel Masterclass',
      description: 'Master spreadsheet modeling',
      subject: 'Microsoft Excel',
      tags: ['Excel', 'Formulas'],
      color: '#d97706',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.saveClass(newClass);
    const classes = await storage.getClasses();
    expect(classes.length).toBe(1);
    expect(classes[0].title).toBe('Microsoft Excel Masterclass');
  });

  it('can manage chapters and lessons', async () => {
    const chapter: Chapter = {
      id: 'ch-1',
      classId: 'class-1',
      title: 'Lookup Functions',
      order: 1,
    };
    await storage.saveChapter(chapter);

    const lesson: Lesson = {
      id: 'ls-1',
      classId: 'class-1',
      chapterId: 'ch-1',
      title: 'XLOOKUP vs VLOOKUP',
      content: '# XLOOKUP\nModern lookup function.',
      order: 1,
      isCompleted: false,
      updatedAt: Date.now(),
    };
    await storage.saveLesson(lesson);

    const chapters = await storage.getChapters('class-1');
    const lessons = await storage.getLessons('class-1');
    expect(chapters.length).toBe(1);
    expect(lessons.length).toBe(1);
    expect(lessons[0].title).toBe('XLOOKUP vs VLOOKUP');

    // Toggle completion
    lesson.isCompleted = true;
    await storage.saveLesson(lesson);
    const updated = await storage.getLesson('ls-1');
    expect(updated?.isCompleted).toBe(true);
  });

  it('can save and export/import backup data', async () => {
    const newClass: LearningClass = {
      id: 'class-2',
      title: 'Copywriting 101',
      description: 'Headlines and hooks',
      subject: 'Copywriting',
      tags: ['Marketing'],
      color: '#2563eb',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await storage.saveClass(newClass);

    const quiz: Quiz = {
      id: 'quiz-1',
      classId: 'class-2',
      title: 'Headline Fundamentals',
      questions: [
        {
          id: 'q1',
          prompt: 'What does AIDA stand for?',
          options: ['Attention, Interest, Desire, Action', 'Always In Demand Always'],
          correctOptionIndex: 0,
          explanation: 'Standard advertising hierarchy of effects framework.',
        },
      ],
      createdAt: Date.now(),
    };
    await storage.saveQuiz(quiz);

    const backupJson = await storage.exportBackup();
    expect(backupJson).toContain('Copywriting 101');
    expect(backupJson).toContain('Headline Fundamentals');

    // Clear and restore
    await storage.resetAll();
    expect((await storage.getClasses()).length).toBe(0);

    await storage.importBackup(backupJson);
    const restoredClasses = await storage.getClasses();
    const restoredQuizzes = await storage.getQuizzes('class-2');

    expect(restoredClasses.length).toBe(1);
    expect(restoredClasses[0].title).toBe('Copywriting 101');
    expect(restoredQuizzes.length).toBe(1);
    expect(restoredQuizzes[0].questions[0].options[0]).toBe('Attention, Interest, Desire, Action');
  });
});
