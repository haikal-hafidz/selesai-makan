import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import {
  validateLearningPack,
  importLearningPack,
  exportLearningPack,
} from '../services/learningPack';
import { storage } from '../services/storage';
import { extractResourceContent } from '../services/resourceExtractor';
import { LearningPack } from '../types';

describe('Expanded Learning Pack (v1.1) and Legacy (v1.0) Compatibility', () => {
  beforeEach(async () => {
    await storage.resetAll();
  });

  const legacyV10Pack: LearningPack = {
    schemaVersion: '1.0',
    class: {
      title: 'Human Resources Fundamentals',
      description: 'Master employee relations and hiring workflows',
      subject: 'Human Resources',
      tags: ['HR', 'Management'],
      color: '#059669',
      level: 'Beginner',
      language: 'English',
      learningObjectives: ['Understand recruitment cycles', 'Implement onboarding checklist'],
    },
    chapters: [
      {
        title: 'Recruitment & Talent Acquisition',
        description: 'Sourcing and interviewing candidates',
        order: 1,
        lessons: [
          {
            title: 'Structured Interviewing',
            content: '# Structured Interviewing\nStandardized questions eliminate bias.',
            learningObjectives: ['Define behavioral questions'],
            keyTakeaways: ['Use rubrics for all candidates'],
            exercises: ['Draft 3 behavioral questions for a junior designer role'],
            order: 1,
            quiz: {
              title: 'Interview Technique Quick Check',
              questions: [
                {
                  prompt: 'What is the primary benefit of structured interviews?',
                  options: ['Reduces hiring bias', 'Eliminates background checks', 'Shortens interview to 2 minutes'],
                  correctOptionIndex: 0,
                  explanation: 'Standardization ensures candidates are evaluated on identical criteria.',
                },
              ],
            },
          },
        ],
      },
    ],
    resources: [
      {
        name: 'hr-onboarding-cheatsheet.txt',
        fileType: 'text/plain',
        contentText: 'Day 1: Welcome & Setup\nDay 2: Team Introductions\nWeek 1: First Sprint',
      },
    ],
  };

  const expandedV11Pack: LearningPack = {
    schemaVersion: '1.1',
    class: {
      title: 'Microsoft Excel Financial Modeling',
      description: 'Build enterprise forecast models and dynamic reports.',
      subject: 'Microsoft Excel',
      tags: ['Excel', 'Finance'],
      color: '#059669',
      level: 'Advanced',
      language: 'English',
      finalProject: {
        title: 'Complete 3-Year Corporate Budget',
        brief: 'Build a dynamic 3-year departmental budget with variance analysis.',
        milestones: ['Setup input assumptions', 'Link dynamic lookups', 'Create KPI summary dashboard'],
        submissionGuidelines: 'Submit completed .xlsx workbook with zero hardcoded formulas.',
        evaluationRubric: [
          { criteria: 'Formula Modularity', description: 'Uses dynamic arrays and exact match lookups' },
        ],
      },
    },
    chapters: [
      {
        title: 'Advanced Lookups & Dynamic Arrays',
        lessons: [
          {
            title: 'XLOOKUP Mastery',
            content: '# XLOOKUP in Depth\nModern exact-match lookups.',
            exercises: ['Replace nested IF with XLOOKUP'],
            assignments: [
              {
                title: 'Tiered Commission Schedule',
                description: 'Build an approximate lookup formula for sales thresholds.',
                instructions: ['Inspect the tier matrix', 'Use match_mode -1 for lower bound matching'],
                submissionType: 'spreadsheet',
                rubric: [
                  { criteria: 'Exact vs Approximate Logic', points: 50, description: 'Correctly sets match_mode argument' },
                ],
                answerKeyOrModelAnswer: '=XLOOKUP(D2, Tiers[SalesTarget], Tiers[CommissionRate], 0, -1)',
              },
            ],
            quiz: {
              title: 'Lookup Quiz',
              questions: [
                {
                  prompt: 'What is the default match mode in XLOOKUP?',
                  options: ['Exact Match (0)', 'Approximate Match (1)'],
                  correctOptionIndex: 0,
                  explanation: 'XLOOKUP defaults to exact match.',
                },
              ],
            },
          },
        ],
      },
    ],
    resources: [
      {
        name: 'formula-guide.txt',
        fileType: 'text/plain',
        contentText: 'XLOOKUP, FILTER, UNIQUE, SORT',
      },
    ],
  };

  it('validates and imports legacy v1.0 packages seamlessly', async () => {
    const val = validateLearningPack(legacyV10Pack);
    expect(val.isValid).toBe(true);
    expect(val.schemaVersion).toBe('1.0');

    const result = await importLearningPack(legacyV10Pack);
    expect(result.classId).toBeDefined();
    expect(result.lessonsCount).toBe(1);

    const classes = await storage.getClasses();
    expect(classes.length).toBe(1);
    expect(classes[0].title).toBe('Human Resources Fundamentals');
  });

  it('validates and imports expanded v1.1 packages with assignments and final project', async () => {
    const val = validateLearningPack(expandedV11Pack);
    expect(val.isValid).toBe(true);
    expect(val.schemaVersion).toBe('1.1');
    expect(val.summary.assignmentsCount).toBe(1);
    expect(val.summary.hasFinalProject).toBe(true);

    const result = await importLearningPack(expandedV11Pack);
    expect(result.assignmentsCount).toBe(1);

    const lessons = await storage.getLessons(result.classId);
    const xlookupLesson = lessons.find((l) => l.title === 'XLOOKUP Mastery');
    expect(xlookupLesson).toBeDefined();
    expect(xlookupLesson?.assignments?.length).toBe(1);
    expect(xlookupLesson?.content).toContain('Tiered Commission Schedule');
    expect(xlookupLesson?.content).toContain('Evaluation Rubric');

    // Final project chapter created
    const chapters = await storage.getChapters(result.classId);
    const projectChapter = chapters.find((c) => c.title.includes('Final Project'));
    expect(projectChapter).toBeDefined();
  });

  it('rejects invalid JSON structure and missing required fields', () => {
    const invalidPack = {
      class: {
        description: 'No title or subject',
      },
      chapters: 'not-an-array',
    };
    const result = validateLearningPack(invalidPack);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('title'))).toBe(true);
    expect(result.errors.some((e) => e.includes('subject'))).toBe(true);
    expect(result.errors.some((e) => e.includes('chapters'))).toBe(true);
  });

  it('validates quiz answer key ranges and missing questions', () => {
    const malformedQuizPack = {
      class: { title: 'Test', subject: 'Other' },
      chapters: [
        {
          title: 'Ch 1',
          lessons: [
            {
              title: 'L 1',
              content: 'content',
              quiz: {
                title: 'Bad Quiz',
                questions: [
                  {
                    prompt: 'Q with invalid index',
                    options: ['A', 'B'],
                    correctOptionIndex: 5, // out of range
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const result = validateLearningPack(malformedQuizPack);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('out of range'))).toBe(true);
  });

  it('supports importing into an existing class without overwriting existing syllabus', async () => {
    // 1. First import
    const firstRes = await importLearningPack(legacyV10Pack);

    // 2. Second pack appended into existing class
    const secondPack: LearningPack = {
      schemaVersion: '1.1',
      class: { title: 'Ignored Title', description: 'Additional material', subject: 'Human Resources' },
      chapters: [
        {
          title: 'Chapter 2: Performance Management',
          lessons: [
            {
              title: '360 Reviews',
              content: 'Conducting constructive feedback.',
            },
          ],
        },
      ],
    };

    const secondRes = await importLearningPack(secondPack, { targetClassId: firstRes.classId });
    expect(secondRes.classId).toBe(firstRes.classId);

    const allChapters = await storage.getChapters(firstRes.classId);
    expect(allChapters.length).toBe(2);
    expect(allChapters[0].title).toBe('Recruitment & Talent Acquisition');
    expect(allChapters[1].title).toBe('Chapter 2: Performance Management');
    expect(allChapters[1].order).toBeGreaterThan(allChapters[0].order);
  });

  it('exports and re-imports Learning Pack preserving full structure', async () => {
    const originalImport = await importLearningPack(expandedV11Pack);
    const exportedJson = await exportLearningPack(originalImport.classId);

    expect(exportedJson).toContain('Microsoft Excel Financial Modeling');
    expect(exportedJson).toContain('XLOOKUP Mastery');
    expect(exportedJson).toContain('Tiered Commission Schedule');

    // Parse and validate exported JSON
    const parsed = JSON.parse(exportedJson);
    const validation = validateLearningPack(parsed);
    expect(validation.isValid).toBe(true);
    expect(validation.schemaVersion).toBe('1.1');

    // Clean and re-import
    await storage.resetAll();
    const reImport = await importLearningPack(parsed);
    // 2 chapters: original chapter + final project chapter
    expect(reImport.chaptersCount).toBeGreaterThanOrEqual(2);
    expect(reImport.assignmentsCount).toBe(1);
    expect(reImport.quizzesCount).toBe(1);
  });
});

describe('Universal Resource Extraction', () => {
  it('extracts plain text and markdown files', async () => {
    const textBlob = new Blob(['# Markdown Title\nSample notes'], { type: 'text/markdown' });
    const file = new File([textBlob], 'study-notes.md', { type: 'text/markdown' });

    const result = await extractResourceContent(file);
    expect(result.status).toBe('extracted');
    expect(result.previewType).toBe('text');
    expect(result.text).toContain('# Markdown Title');
  });

  it('extracts CSV data into formatted tables', async () => {
    const csvContent = 'Skill,Level,Status\nExcel,Advanced,Done\nCopywriting,Intermediate,In-Progress';
    const csvFile = new File([csvContent], 'skills.csv', { type: 'text/csv' });

    const result = await extractResourceContent(csvFile);
    expect(result.status).toBe('extracted');
    expect(result.text).toContain('| Skill | Level | Status |');
    expect(result.text).toContain('| Excel | Advanced | Done |');
  });

  it('gracefully treats unsupported formats as attachments with instructions', async () => {
    const genericBlob = new Blob(['binarydata'], { type: 'application/octet-stream' });
    const file = new File([genericBlob], 'project-slides.pptx', { type: 'application/octet-stream' });

    const result = await extractResourceContent(file);
    expect(result.status).toBe('attachment_only');
    expect(result.previewType).toBe('unsupported');
    expect(result.info).toContain('downloadable attachment');
  });
});
