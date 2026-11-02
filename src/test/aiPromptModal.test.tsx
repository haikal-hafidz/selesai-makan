import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LearningPackImportModal } from '../components/LearningPackImportModal';
import { UNIVERSAL_AI_LEARNING_PACK_PROMPT } from '../services/aiPromptTemplate';

describe('LearningPackImportModal AI Prompt Copy Feature', () => {
  it('renders the Create Learning Pack with AI section below the dropzone', () => {
    render(
      <LearningPackImportModal
        existingClasses={[]}
        onImportComplete={() => {}}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Create a Learning Pack with AI')).toBeInTheDocument();
    expect(screen.getByText('Copy AI Prompt')).toBeInTheDocument();
    expect(screen.getByText('Inspect Prompt')).toBeInTheDocument();
  });

  it('expands and displays the complete master prompt on click', () => {
    render(
      <LearningPackImportModal
        existingClasses={[]}
        onImportComplete={() => {}}
        onClose={() => {}}
      />
    );

    const inspectBtn = screen.getByText('Inspect Prompt');
    fireEvent.click(inspectBtn);

    expect(screen.getByText('Hide Prompt')).toBeInTheDocument();
    expect(screen.getByText(/Full Master Prompt Content/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(UNIVERSAL_AI_LEARNING_PACK_PROMPT.slice(0, 50), 'i'))).toBeInTheDocument();
  });

  it('copies the prompt to clipboard and provides visual feedback', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <LearningPackImportModal
        existingClasses={[]}
        onImportComplete={() => {}}
        onClose={() => {}}
      />
    );

    const copyBtn = screen.getByText('Copy AI Prompt');
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(UNIVERSAL_AI_LEARNING_PACK_PROMPT);
      expect(screen.getByText('Copied to Clipboard!')).toBeInTheDocument();
    });
  });
});
