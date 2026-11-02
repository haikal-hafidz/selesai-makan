import React, { useState } from 'react';
import { Bold, Heading1, Heading2, List, Code, Quote, Save, Eye, Edit3 } from 'lucide-react';
import { MarkdownViewer } from './MarkdownViewer';

interface LessonEditorProps {
  initialTitle: string;
  initialContent: string;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
}

export const LessonEditor: React.FC<LessonEditorProps> = ({
  initialTitle,
  initialContent,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [previewMode, setPreviewMode] = useState(false);

  const insertSnippet = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('lesson-content-input') as HTMLTextAreaElement | null;
    if (!textarea) {
      setContent((prev) => prev + prefix + suffix);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = prefix + selected + suffix;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  return (
    <div className="flex h-full flex-col bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Top Header / Actions */}
      <div className="flex flex-wrap items-center justify-between border-b border-stone-200 bg-stone-50/75 px-6 py-4 gap-4">
        <div className="flex-1 min-w-[240px]">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lesson Title (e.g. VLOOKUP & INDEX MATCH Fundamentals)"
            className="w-full text-xl font-bold bg-transparent border-0 border-b border-transparent focus:border-amber-500 focus:outline-none focus:ring-0 text-stone-900 placeholder:text-stone-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            {previewMode ? <Edit3 size={16} /> : <Eye size={16} />}
            <span>{previewMode ? 'Write Mode' : 'Preview'}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!title.trim()}
            onClick={() => onSave(title.trim(), content)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-600 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
          >
            <Save size={16} />
            <span>Save Lesson</span>
          </button>
        </div>
      </div>

      {/* Formatting Bar in Edit Mode */}
      {!previewMode && (
        <div className="flex flex-wrap items-center gap-1 border-b border-stone-200 bg-stone-50 px-6 py-2 text-stone-600 text-xs">
          <button
            type="button"
            title="Heading 1"
            onClick={() => insertSnippet('# ')}
            className="p-1.5 rounded hover:bg-stone-200 cursor-pointer"
          >
            <Heading1 size={16} />
          </button>
          <button
            type="button"
            title="Heading 2"
            onClick={() => insertSnippet('## ')}
            className="p-1.5 rounded hover:bg-stone-200 cursor-pointer"
          >
            <Heading2 size={16} />
          </button>
          <span className="w-px h-4 bg-stone-300 mx-1" />
          <button
            type="button"
            title="Bold"
            onClick={() => insertSnippet('**', '**')}
            className="p-1.5 rounded hover:bg-stone-200 cursor-pointer"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            title="Bullet list"
            onClick={() => insertSnippet('- ')}
            className="p-1.5 rounded hover:bg-stone-200 cursor-pointer"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            title="Quote"
            onClick={() => insertSnippet('> ')}
            className="p-1.5 rounded hover:bg-stone-200 cursor-pointer"
          >
            <Quote size={16} />
          </button>
          <button
            type="button"
            title="Code Block"
            onClick={() => insertSnippet('```\n', '\n```')}
            className="p-1.5 rounded hover:bg-stone-200 cursor-pointer"
          >
            <Code size={16} />
          </button>
        </div>
      )}

      {/* Editor Body */}
      <div className="flex-1 p-6 overflow-y-auto">
        {previewMode ? (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-stone-900 mb-6">{title || 'Untitled Lesson'}</h1>
            <MarkdownViewer content={content} />
          </div>
        ) : (
          <textarea
            id="lesson-content-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your study notes, key concepts, formulas, and explanations here in Markdown format..."
            className="w-full h-full min-h-[450px] resize-none font-mono text-sm leading-relaxed text-stone-800 placeholder:text-stone-400 focus:outline-none"
          />
        )}
      </div>
    </div>
  );
};
