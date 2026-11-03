import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssignmentWorkspace } from '../components/AssignmentWorkspace';
import { Assignment } from '../types';

describe('AssignmentWorkspace Final Assignment & Defensive Rendering Tests', () => {
  it('does NOT render literal undefined when title, description, or instructions are missing', () => {
    // Intentionally construct an assignment with missing/undefined properties
    const sparseAssignment: Assignment = {
      id: 'assign-sparse',
      title: (undefined as unknown) as string,
      description: (undefined as unknown) as string,
      instructions: (undefined as unknown) as string[],
      submissionType: (undefined as unknown) as 'text',
    };

    const { container } = render(
      <AssignmentWorkspace
        assignment={sparseAssignment}
        classId="class-1"
        onSaveSubmission={vi.fn()}
        onBack={vi.fn()}
      />
    );

    // Verify literal "undefined" does not appear in the rendered HTML output
    expect(container.innerHTML).not.toContain('undefined');

    // Default safe fallbacks are rendered
    const headings = screen.getAllByText('Practical Assignment');
    expect(headings.length).toBeGreaterThan(0);
    expect(screen.getByText('No task description provided.')).toBeInTheDocument();
  });

  it('renders all final project fields: title, description, objectives, instructions, deliverables, rubric weights, and answerKey', () => {
    // Exact structure matching the user's uploaded JSON finalProject specification
    const finalAssignment: Assignment = {
      id: 'assign-final-project',
      title: 'Company Annual Sales Forecast & Dashboard Capstone',
      description: 'Build an end-to-end multi-departmental forecasting and variance model.',
      objectives: [
        'Model multi-year revenue projections using dynamic arrays.',
        'Implement automated variance analysis and KPI flags.',
      ],
      instructions: [
        'Import historical revenue tables.',
        'Construct XLOOKUP models for department growth multipliers.',
        'Format the executive presentation view.',
      ],
      deliverables: [
        'Completed .xlsx financial workbook',
        'Summary variance commentary note',
      ],
      submissionType: 'file',
      evaluationMethod: 'rubric',
      rubric: [
        { criteria: 'Formula Dynamic Structure', weight: '40%', points: 40, description: 'No hardcoded formula numbers' },
        { criteria: 'Variance Integrity', weight: '30%', points: 30, description: 'Accurate variance percentages' },
        { criteria: 'Executive Dashboard Aesthetics', weight: '30%', points: 30, description: 'Clean layout and visual hierarchy' },
      ],
      answerKeyOrModelAnswer: 'Standard model: =XLOOKUP(A4, DepartmentTiers[ID], DepartmentTiers[Rate]) linked to cells B2:G12.',
    };

    const existingSubmission = {
      id: 'sub-1',
      assignmentId: finalAssignment.id,
      classId: 'class-1',
      submissionType: 'file' as const,
      fileName: 'final-budget-forecast.xlsx',
      evaluationMethod: 'rubric' as const,
      isEvaluated: true,
      score: 95,
      submittedAt: Date.now(),
    };

    const { container } = render(
      <AssignmentWorkspace
        assignment={finalAssignment}
        classId="class-1"
        existingSubmission={existingSubmission}
        onSaveSubmission={vi.fn()}
        onBack={vi.fn()}
      />
    );

    // 1. Title & Description
    expect(screen.getByText('Company Annual Sales Forecast & Dashboard Capstone')).toBeInTheDocument();
    expect(screen.getByText('Build an end-to-end multi-departmental forecasting and variance model.')).toBeInTheDocument();

    // 2. Objectives
    expect(screen.getByText('Project Objectives')).toBeInTheDocument();
    expect(screen.getByText('Model multi-year revenue projections using dynamic arrays.')).toBeInTheDocument();
    expect(screen.getByText('Implement automated variance analysis and KPI flags.')).toBeInTheDocument();

    // 3. Instructions
    expect(screen.getByText('Step-by-Step Instructions')).toBeInTheDocument();
    expect(screen.getByText('Import historical revenue tables.')).toBeInTheDocument();
    expect(screen.getByText('Construct XLOOKUP models for department growth multipliers.')).toBeInTheDocument();
    expect(screen.getByText('Format the executive presentation view.')).toBeInTheDocument();

    // 4. Deliverables
    expect(screen.getByText('Required Deliverables')).toBeInTheDocument();
    expect(screen.getByText('Completed .xlsx financial workbook')).toBeInTheDocument();
    expect(screen.getByText('Summary variance commentary note')).toBeInTheDocument();

    // 5. Rubric criteria and weights
    expect(screen.getByText(/Formula Dynamic Structure/)).toBeInTheDocument();
    expect(screen.getByText(/Weight: 40%/)).toBeInTheDocument();
    expect(screen.getByText(/Variance Integrity/)).toBeInTheDocument();
    const thirtyPercentBadges = screen.getAllByText(/Weight: 30%/);
    expect(thirtyPercentBadges.length).toBe(2);

    // 6. Answer Key (revealed after submission)
    expect(screen.getByText(/Standard model: =XLOOKUP/)).toBeInTheDocument();

    // 7. Verify no literal undefined or [object Object] anywhere in container
    expect(container.innerHTML).not.toContain('undefined');
    expect(container.innerHTML).not.toContain('[object Object]');
  });
});
