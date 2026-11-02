import React from 'react';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className = '' }) => {
  if (!content.trim()) {
    return (
      <div className="py-12 text-center text-stone-400 italic">
        No notes or materials written for this lesson yet. Click "Edit Lesson" to write your notes.
      </div>
    );
  }

  // Parse lines for a clean, distraction-free reading typography
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  lines.forEach((line, index) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${index}`}
            className="my-4 overflow-x-auto rounded-lg bg-stone-900 p-4 font-mono text-sm text-stone-100"
          >
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={index} className="mt-8 mb-4 text-3xl font-bold tracking-tight text-stone-900">
          {line.replace('# ', '')}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="mt-6 mb-3 text-2xl font-semibold tracking-tight text-stone-800">
          {line.replace('## ', '')}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="mt-4 mb-2 text-xl font-medium text-stone-800">
          {line.replace('### ', '')}
        </h3>
      );
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={index}
          className="my-4 border-l-4 border-amber-500 bg-amber-50/50 py-2 pl-4 pr-3 italic text-stone-700"
        >
          {line.replace('> ', '')}
        </blockquote>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={index} className="ml-6 list-disc py-0.5 text-stone-700 leading-relaxed">
          {formatInline(line.substring(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const text = line.replace(/^\d+\.\s/, '');
      elements.push(
        <li key={index} className="ml-6 list-decimal py-0.5 text-stone-700 leading-relaxed">
          {formatInline(text)}
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={index} className="h-4" />);
    } else {
      elements.push(
        <p key={index} className="my-2 leading-relaxed text-stone-800">
          {formatInline(line)}
        </p>
      );
    }
  });

  return (
    <div className={`prose prose-stone max-w-none font-serif text-lg leading-relaxed ${className}`}>
      {elements}
    </div>
  );
};

// Simple inline styling helper for **bold**, *italic*, and `inline code`
function formatInline(text: string): React.ReactNode {
  let remaining = text;
  let counter = 0;

  // Split by backticks first
  const codeSplit = remaining.split('`');
  if (codeSplit.length > 1) {
    return codeSplit.map((segment, i) => {
      if (i % 2 === 1) {
        return (
          <code key={i} className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-sm text-amber-800">
            {segment}
          </code>
        );
      }
      return formatBoldItalic(segment, `${counter}-${i}`);
    });
  }

  return formatBoldItalic(text, 'root');
}

function formatBoldItalic(text: string, keyPrefix: string): React.ReactNode {
  // Bold check **
  const boldSplit = text.split('**');
  if (boldSplit.length > 1) {
    return boldSplit.map((seg, i) => {
      if (i % 2 === 1) {
        return (
          <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-stone-900">
            {seg}
          </strong>
        );
      }
      return seg;
    });
  }
  return text;
}
