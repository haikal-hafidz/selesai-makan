import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import {
  validateLearningPack,
  importLearningPack,
  normalizeAnswerKey,
} from '../services/learningPack';
import { storage } from '../services/storage';
import { LearningPack } from '../types';

describe('Final Project answerKey Object Normalization & Robust Import', () => {
  beforeEach(async () => {
    await storage.resetAll();
  });

  it('normalizes answerKey whether string, object, or missing', () => {
    // 1. String case
    expect(normalizeAnswerKey('Formula: =XLOOKUP(A1, B:B, C:C)')).toBe('Formula: =XLOOKUP(A1, B:B, C:C)');

    // 2. Exact object structure from user JSON
    expect(normalizeAnswerKey({ type: 'model_answer', content: 'Use =INDEX(MATCH()) or =XLOOKUP()' })).toBe(
      'Use =INDEX(MATCH()) or =XLOOKUP()'
    );

    // 3. Object with text property
    expect(normalizeAnswerKey({ text: 'Model solution notes' })).toBe('Model solution notes');

    // 4. Missing or empty cases
    expect(normalizeAnswerKey(undefined)).toBeUndefined();
    expect(normalizeAnswerKey('')).toBeUndefined();
    expect(normalizeAnswerKey({ type: 'empty', content: '' })).toBeUndefined();
    expect(normalizeAnswerKey(12345)).toBeUndefined();
  });

  it('imports Learning Pack with object answerKey without crashing and preserves content', async () => {
    const packWithObjectAnswerKey: LearningPack = {
      schemaVersion: '1.1',
      class: {
        title: 'Excel Financial Modeling Capstone',
        description: 'Complete capstone course',
        subject: 'Microsoft Excel',
        finalProject: {
          title: 'Corporate Financial Valuation Model',
          description: 'Construct a 5-year discounted cash flow and sensitivity matrix.',
          objectives: [
            'Forecast revenue using compound annual growth rates.',
            'Calculate weighted average cost of capital (WACC).',
          ],
          instructions: [
            'Download the valuation starter workbook.',
            'Build the dynamic DCF model in the workspace.',
            'Perform sensitivity analysis.',
          ],
          deliverables: [
            'Finished .xlsx valuation model',
            'Summary memo with key valuation metrics',
          ],
          rubric: [
            { criteria: 'DCF Mechanics', weight: '50%', points: 50, description: 'Correct discounting formulas' },
            { criteria: 'Sensitivity Table Integrity', weight: '50%', points: 50, description: 'Two-variable Data Table links' },
          ],
          answerKey: {
            type: 'model_answer',
            content: 'Model solution: Discount factor = 1/(1+WACC)^t; Enterprise value cell =Sum(PV_CashFlows).',
          },
        },
      },
      chapters: [
        {
          title: 'Chapter 1: Valuation Foundations',
          lessons: [
            {
              title: 'Lesson 1.1: DCF Principles',
              content: 'Valuation basics...',
            },
          ],
        },
      ],
    };

    const validation = validateLearningPack(packWithObjectAnswerKey);
    expect(validation.isValid).toBe(true);

    // Import should succeed with zero runtime crashes
    const importResult = await importLearningPack(packWithObjectAnswerKey);
    expect(importResult.classId).toBeDefined();

    // Check saved lessons and assignments
    const lessons = await storage.getLessons(importResult.classId);
    const projectLesson = lessons.find((l) => l.title.includes('Project Brief'));
    expect(projectLesson).toBeDefined();

    // Check lesson content has the normalized model solution
    expect(projectLesson?.content).toContain('Model Solution & Reference Guidance:');
    expect(projectLesson?.content).toContain('Discount factor = 1/(1+WACC)^t');

    // Check project assignment has normalized answerKeyOrModelAnswer string
    expect(projectLesson?.assignments?.length).toBe(1);
    const assign = projectLesson?.assignments?.[0];
    expect(assign?.title).toBe('Corporate Financial Valuation Model');
    expect(assign?.answerKeyOrModelAnswer).toBe(
      'Model solution: Discount factor = 1/(1+WACC)^t; Enterprise value cell =Sum(PV_CashFlows).'
    );
    expect(assign?.objectives?.length).toBe(2);
    expect(assign?.instructions.length).toBe(3);
    expect(assign?.deliverables?.length).toBe(2);
  });

  it('imports Learning Pack with legacy string answerKey cleanly', async () => {
    const packWithStringAnswerKey: LearningPack = {
      schemaVersion: '1.1',
      class: {
        title: 'Legacy String Answer Key Course',
        description: 'Test legacy format',
        subject: 'Microsoft Excel',
        finalProject: {
          title: 'Legacy Final Task',
          description: 'Task description',
          instructions: ['Do step 1'],
          answerKey: 'Legacy string model answer text.',
        },
      },
      chapters: [
        {
          title: 'Chapter 1',
          lessons: [
            {
              title: 'Lesson 1',
              content: 'Content',
            },
          ],
        },
      ],
    };

    const importResult = await importLearningPack(packWithStringAnswerKey);
    const lessons = await storage.getLessons(importResult.classId);
    const projectLesson = lessons.find((l) => l.title.includes('Project Brief'));
    expect(projectLesson?.assignments?.[0].answerKeyOrModelAnswer).toBe('Legacy string model answer text.');
  });

  it('imports Learning Pack with missing answerKey without errors', async () => {
    const packWithoutAnswerKey: LearningPack = {
      schemaVersion: '1.1',
      class: {
        title: 'No Answer Key Course',
        description: 'Test missing format',
        subject: 'Microsoft Excel',
        finalProject: {
          title: 'Open Ended Project',
          description: 'No model answer provided',
          instructions: ['Research and submit findings'],
        },
      },
      chapters: [
        {
          title: 'Chapter 1',
          lessons: [
            {
              title: 'Lesson 1',
              content: 'Content',
            },
          ],
        },
      ],
    };

    const importResult = await importLearningPack(packWithoutAnswerKey);
    const lessons = await storage.getLessons(importResult.classId);
    const projectLesson = lessons.find((l) => l.title.includes('Project Brief'));
    expect(projectLesson?.assignments?.[0].answerKeyOrModelAnswer).toBeUndefined();
    expect(projectLesson?.content).not.toContain('Model Solution & Reference Guidance:');
  });
});
