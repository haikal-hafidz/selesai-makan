import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownViewer } from '../components/MarkdownViewer';

describe('MarkdownViewer Component', () => {
  it('renders empty message when content is empty', () => {
    render(<MarkdownViewer content="" />);
    expect(screen.getByText(/No notes or materials written/i)).toBeInTheDocument();
  });

  it('renders headers and bullet lists properly', () => {
    const markdown = `# Main Title\n## Sub Title\n- First point\n- Second point`;
    render(<MarkdownViewer content={markdown} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Title');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Sub Title');
    expect(screen.getByText('First point')).toBeInTheDocument();
    expect(screen.getByText('Second point')).toBeInTheDocument();
  });

  it('renders blockquote properly', () => {
    const markdown = `> Key rule of thumb for copywriting`;
    render(<MarkdownViewer content={markdown} />);
    expect(screen.getByText('Key rule of thumb for copywriting')).toBeInTheDocument();
  });
});
