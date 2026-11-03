import * as XLSX from 'xlsx';
import { Lesson, Assignment } from '../types';

/**
 * Generates an Excel practice workbook (.xlsx) customized for the lesson or assignment.
 * Contains:
 * - Instructions & Objectives Sheet
 * - Prepared Source Data & Learner Workspace Sheet
 * - Evaluation Criteria / Model Solution Sheet
 */
export function generateExcelPracticeWorkbook(
  lesson: Lesson,
  assignment?: Assignment
): Blob {
  const wb = XLSX.utils.book_new();

  // 1. Sheet 1: Problem Instructions & Objectives
  const instructionsData: (string | number)[][] = [
    ['SELESAI MAKAN — HANDS-ON EXCEL PRACTICE WORKBOOK'],
    ['Lesson Title:', lesson.title],
    ['Date Generated:', new Date().toLocaleDateString()],
    [''],
    ['1. PRACTICE OVERVIEW & OBJECTIVES'],
  ];

  if (lesson.learningObjectives && lesson.learningObjectives.length > 0) {
    lesson.learningObjectives.forEach((obj, idx) => {
      instructionsData.push([`Objective ${idx + 1}:`, obj]);
    });
  } else {
    instructionsData.push(['Objective 1:', 'Master practical application of the concepts explained in this lesson.']);
  }

  instructionsData.push(['']);
  instructionsData.push(['2. STEP-BY-STEP INSTRUCTIONS']);

  if (assignment && assignment.instructions && assignment.instructions.length > 0) {
    assignment.instructions.forEach((inst, idx) => {
      instructionsData.push([`Step ${idx + 1}:`, inst]);
    });
  } else if (lesson.exercises && lesson.exercises.length > 0) {
    lesson.exercises.forEach((ex, idx) => {
      instructionsData.push([`Exercise ${idx + 1}:`, ex]);
    });
  } else {
    instructionsData.push(['Step 1:', 'Navigate to the "Practice Workspace" sheet tab below.']);
    instructionsData.push(['Step 2:', 'Review the prepared dataset in Columns A through D.']);
    instructionsData.push(['Step 3:', 'Implement your dynamic formulas and calculations in the designated green workspace area.']);
    instructionsData.push(['Step 4:', 'Verify your formula outputs against the "Evaluation & Criteria" sheet.']);
  }

  instructionsData.push(['']);
  instructionsData.push(['3. IMPORTANT GUIDELINES']);
  instructionsData.push(['•', 'Use dynamic formulas rather than hardcoding calculated numbers.']);
  instructionsData.push(['•', 'Formula results must link directly to the source data table.']);

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
  // Auto-width column
  wsInstructions['!cols'] = [{ wch: 18 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

  // 2. Sheet 2: Practice Workspace with Prepared Source Data
  const workspaceData: (string | number)[][] = [
    ['PREPARED DATASET & LEARNER WORKSPACE'],
    ['Source Data Table', '', '', '', 'Learner Workspace Area', ''],
    ['Record ID', 'Item / Category', 'Quantity', 'Unit Rate', 'Target Formula Output', 'Notes / Checks'],
    ['REC-101', 'Direct Marketing Campaign', 140, 45, '', 'Enter formula here'],
    ['REC-102', 'SEO Content Strategy', 85, 90, '', 'Enter formula here'],
    ['REC-103', 'Talent Recruitment Pipeline', 210, 35, '', 'Enter formula here'],
    ['REC-104', 'Corporate Training Module', 60, 120, '', 'Enter formula here'],
    ['REC-105', 'Spreadsheet Financial Audit', 175, 55, '', 'Enter formula here'],
    ['REC-106', 'Brand Copywriting Deck', 95, 80, '', 'Enter formula here'],
    [''],
    ['SUMMARY METRICS', '', '', '', 'FORMULA SUMMARY', ''],
    ['Total Count:', '=COUNTA(A4:A9)', '', '', '', 'Use dynamic formula'],
    ['Total Quantity:', '=SUM(C4:C9)', '', '', '', 'Use dynamic formula'],
    ['Average Rate:', '=AVERAGE(D4:D9)', '', '', '', 'Use dynamic formula'],
  ];

  const wsWorkspace = XLSX.utils.aoa_to_sheet(workspaceData);
  wsWorkspace['!cols'] = [
    { wch: 14 },
    { wch: 32 },
    { wch: 12 },
    { wch: 12 },
    { wch: 25 },
    { wch: 25 },
  ];
  XLSX.utils.book_append_sheet(wb, wsWorkspace, 'Practice Workspace');

  // 3. Sheet 3: Evaluation Criteria & Solution Benchmarks
  const evaluationData: (string | number)[][] = [
    ['EVALUATION CRITERIA & MODEL BENCHMARK'],
    ['Review your calculations against the grading standards below.'],
    [''],
    ['CRITERIA', 'MAX POINTS', 'DESCRIPTION & EXPECTATIONS'],
  ];

  if (assignment && assignment.rubric && assignment.rubric.length > 0) {
    assignment.rubric.forEach((r) => {
      evaluationData.push([r.criteria, r.points || 25, r.description]);
    });
  } else {
    evaluationData.push(['Formula Dynamic Structure', 40, 'Uses native functions with proper range or table cell references.']);
    evaluationData.push(['Data Formatting & Precision', 30, 'Proper number formatting (currency, commas, decimals).']);
    evaluationData.push(['Completeness of Calculation', 30, 'All required summary metrics compute without errors (#N/A, #VALUE!).']);
  }

  if (assignment?.answerKeyOrModelAnswer) {
    evaluationData.push(['']);
    evaluationData.push(['MODEL ANSWER / SOLUTION REFERENCE']);
    evaluationData.push(['Key Guidance:', assignment.answerKeyOrModelAnswer]);
  }

  const wsEvaluation = XLSX.utils.aoa_to_sheet(evaluationData);
  wsEvaluation['!cols'] = [{ wch: 25 }, { wch: 14 }, { wch: 65 }];
  XLSX.utils.book_append_sheet(wb, wsEvaluation, 'Evaluation & Criteria');

  // Generate output buffer
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
