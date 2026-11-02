import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { storage } from '../services/storage';
import { Assignment, AssignmentSubmission } from '../types';

describe('Practice System & Practical Assignments', () => {
  beforeEach(async () => {
    await storage.resetAll();
  });

  const sampleAssignment: Assignment = {
    id: 'assign-1',
    classId: 'class-1',
    lessonId: 'lesson-1',
    title: 'Financial Model Sensitivity Analysis',
    description: 'Perform two-variable data table sensitivity in spreadsheet.',
    instructions: [
      'Download starter-model.xlsx template.',
      'Construct Data Table for Revenue vs Discount rate.',
      'Submit the final spreadsheet.',
    ],
    submissionType: 'spreadsheet',
    evaluationMethod: 'rubric',
    rubric: [
      { criteria: 'Formula Linkage', points: 40, description: 'Table corners correctly linked' },
      { criteria: 'Scenario Completeness', points: 60, description: 'Both scenarios computed' },
    ],
    answerKeyOrModelAnswer: 'Formula cell must link to =E14, Row input cell = B3, Col input cell = B4.',
  };

  it('saves and retrieves practical assignment submissions in IndexedDB', async () => {
    const submission: AssignmentSubmission = {
      id: 'sub-1',
      assignmentId: sampleAssignment.id,
      classId: 'class-1',
      lessonId: 'lesson-1',
      submissionType: 'spreadsheet',
      fileName: 'completed-sensitivity.xlsx',
      fileBlob: new Blob(['binary-spreadsheet-content'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      evaluationMethod: 'rubric',
      isEvaluated: false,
      submittedAt: Date.now(),
    };

    await storage.saveSubmission(submission);

    const retrieved = await storage.getSubmissionForAssignment(sampleAssignment.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.fileName).toBe('completed-sensitivity.xlsx');
    expect(retrieved?.isEvaluated).toBe(false);
  });

  it('evaluates rubric scoring and calculates score accurately', async () => {
    const submission: AssignmentSubmission = {
      id: 'sub-2',
      assignmentId: sampleAssignment.id,
      classId: 'class-1',
      lessonId: 'lesson-1',
      submissionType: 'spreadsheet',
      fileName: 'model.xlsx',
      evaluationMethod: 'rubric',
      isEvaluated: true,
      rubricScores: {
        'Formula Linkage': 40,
        'Scenario Completeness': 50,
      },
      score: 90, // (40 + 50) / 100
      maxScore: 100,
      feedback: 'Good work, scenario 2 slightly offset.',
      submittedAt: Date.now(),
      evaluatedAt: Date.now(),
    };

    await storage.saveSubmission(submission);

    const storedList = await storage.getSubmissions('class-1');
    expect(storedList.length).toBe(1);
    expect(storedList[0].score).toBe(90);
    expect(storedList[0].rubricScores?.['Formula Linkage']).toBe(40);
  });

  it('persists submissions through export and import backup', async () => {
    const submission: AssignmentSubmission = {
      id: 'sub-3',
      assignmentId: 'assign-test',
      classId: 'class-1',
      submissionType: 'text',
      textResponse: 'Executive Summary analysis text',
      evaluationMethod: 'self_assessment',
      isEvaluated: true,
      score: 100,
      submittedAt: Date.now(),
    };

    await storage.saveSubmission(submission);

    const backupJson = await storage.exportBackup();
    expect(backupJson).toContain('Executive Summary analysis text');

    await storage.resetAll();
    expect((await storage.getSubmissions('class-1')).length).toBe(0);

    await storage.importBackup(backupJson);
    const restored = await storage.getSubmissions('class-1');
    expect(restored.length).toBe(1);
    expect(restored[0].textResponse).toBe('Executive Summary analysis text');
    expect(restored[0].score).toBe(100);
  });
});
