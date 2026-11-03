import { describe, it, expect } from 'vitest';
import { generateExcelPracticeWorkbook } from '../services/excelWorkbookGenerator';
import * as XLSX from 'xlsx';
import { Lesson, Assignment } from '../types';

describe('Excel Practice Workbook Generator', () => {
  const mockLesson: Lesson = {
    id: 'lesson-ex-1',
    classId: 'class-1',
    chapterId: 'chap-1',
    title: 'XLOOKUP & Dynamic Lookup Tables',
    content: '# XLOOKUP Fundamentals\nLookup values dynamically.',
    learningObjectives: ['Implement exact match lookups', 'Avoid legacy VLOOKUP #N/A errors'],
    exercises: ['Build an exact match formula in column E'],
    order: 1,
    isCompleted: false,
    updatedAt: Date.now(),
  };

  const mockAssignment: Assignment = {
    id: 'assign-ex-1',
    title: 'Sales Tier Lookup Model',
    description: 'Calculate tiered commission bonuses.',
    instructions: ['Inspect source table', 'Write formula in designated workspace'],
    submissionType: 'spreadsheet',
    rubric: [{ criteria: 'Formula exactness', points: 50, description: 'Correct arguments used' }],
    answerKeyOrModelAnswer: '=XLOOKUP(D4, Table1[ID], Table1[Rate])',
  };

  it('generates a valid XLSX blob with instructions, workspace, and criteria sheets', async () => {
    const blob = generateExcelPracticeWorkbook(mockLesson, mockAssignment);
    expect(blob).toBeDefined();
    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });
    const workbook = XLSX.read(buffer, { type: 'array' });

    expect(workbook.SheetNames).toContain('Instructions');
    expect(workbook.SheetNames).toContain('Practice Workspace');
    expect(workbook.SheetNames).toContain('Evaluation & Criteria');

    // Check Instructions content
    const instructionsCsv = XLSX.utils.sheet_to_csv(workbook.Sheets['Instructions']);
    expect(instructionsCsv).toContain('XLOOKUP & Dynamic Lookup Tables');
    expect(instructionsCsv).toContain('Avoid legacy VLOOKUP #N/A errors');

    // Check Workspace content
    const workspaceCsv = XLSX.utils.sheet_to_csv(workbook.Sheets['Practice Workspace']);
    expect(workspaceCsv).toContain('PREPARED DATASET & LEARNER WORKSPACE');
    expect(workspaceCsv).toContain('REC-101');
    expect(workspaceCsv).toContain('Target Formula Output');

    // Check Evaluation content
    const evalCsv = XLSX.utils.sheet_to_csv(workbook.Sheets['Evaluation & Criteria']);
    expect(evalCsv).toContain('Formula exactness');
    expect(evalCsv).toContain('=XLOOKUP');
  });
});
