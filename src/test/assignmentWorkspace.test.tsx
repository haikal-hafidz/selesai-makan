import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssignmentWorkspace } from '../components/AssignmentWorkspace';
import { Assignment } from '../types';

describe('AssignmentWorkspace Defensive Rendering Regression Tests', () => {
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

  it('renders valid assignment content, brief, and instructions properly', () => {
    const validAssignment: Assignment = {
      id: 'assign-valid',
      title: 'Advanced Financial Modeling Sensitivity',
      description: 'Perform two-way sensitivity analysis on projected revenue.',
      instructions: [
        'Open the starter workbook.',
        'Apply the two-variable Data Table formula.',
        'Document variance findings.',
      ],
      submissionType: 'spreadsheet',
      rubric: [
        { criteria: 'Formula Structure', points: 50, description: 'Correct formula references used.' },
      ],
      answerKeyOrModelAnswer: 'Formula: =E14 linked to Table range B4:G10',
    };

    render(
      <AssignmentWorkspace
        assignment={validAssignment}
        classId="class-1"
        onSaveSubmission={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByText('Advanced Financial Modeling Sensitivity')).toBeInTheDocument();
    expect(screen.getByText('Perform two-way sensitivity analysis on projected revenue.')).toBeInTheDocument();
    expect(screen.getByText('Open the starter workbook.')).toBeInTheDocument();
    expect(screen.getByText('Apply the two-variable Data Table formula.')).toBeInTheDocument();
    expect(screen.getByText('Document variance findings.')).toBeInTheDocument();
  });
});
