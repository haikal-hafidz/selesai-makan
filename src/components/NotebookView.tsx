import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Trash2,
  BookOpen,
  Check,
} from 'lucide-react';
import { Note, LearningClass } from '../types';
import { MarkdownViewer } from './MarkdownViewer';

interface NotebookViewProps {
  notes: Note[];
  classes: LearningClass[];
  onSaveNote: (note: Note) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onNavigateToLesson?: (classId: string, lessonId: string) => void;
}

export const NotebookView: React.FC<NotebookViewProps> = ({
  notes,
  classes,
  onSaveNote,
  onDeleteNote,
  onNavigateToLesson,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    notes.length > 0 ? notes[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [isEditing, setIsEditing] = useState(false);

  // Active or draft note state
  const selectedNote = notes.find((n) => n.id === selectedNoteId);
  const [title, setTitle] = useState(selectedNote?.title || '');
  const [content, setContent] = useState(selectedNote?.content || '');
  const [tagsInput, setTagsInput] = useState(selectedNote?.tags.join(', ') || '');
  const [associatedClassId, setAssociatedClassId] = useState(selectedNote?.classId || '');

  // Keep editor state in sync when selecting different note
  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setTagsInput(note.tags.join(', '));
    setAssociatedClassId(note.classId || '');
    setIsEditing(false);
  };

  const handleCreateNewNote = () => {
    const newId = crypto.randomUUID();
    const newNote: Note = {
      id: newId,
      title: 'Untitled Note',
      content: 'Write your thoughts, lecture takeaways, or concept summaries here in Markdown...',
      tags: ['General'],
      isPinned: false,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onSaveNote(newNote);
    setSelectedNoteId(newId);
    setTitle(newNote.title);
    setContent(newNote.content);
    setTagsInput('General');
    setAssociatedClassId('');
    setIsEditing(true);
  };

  const handleSaveCurrentNote = async () => {
    if (!selectedNoteId) return;
    const tagArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const updated: Note = {
      id: selectedNoteId,
      title: title.trim() || 'Untitled Note',
      content,
      tags: tagArray.length > 0 ? tagArray : ['General'],
      classId: associatedClassId || undefined,
      lessonId: selectedNote?.lessonId,
      isPinned: selectedNote?.isPinned || false,
      isFavorite: selectedNote?.isFavorite || false,
      createdAt: selectedNote?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    await onSaveNote(updated);
    setIsEditing(false);
  };

  const handleTogglePin = async (note: Note) => {
    await onSaveNote({
      ...note,
      isPinned: !note.isPinned,
      updatedAt: Date.now(),
    });
  };

  // Collect all unique tags
  const allTags = ['All', ...Array.from(new Set(notes.flatMap((n) => n.tags)))];

  const filteredNotes = notes
    .filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag === 'All' || n.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Personal Notebook</h1>
          <p className="text-xs text-stone-500 mt-1">
            Capture independent takeaways, course notes, and personal summaries with full Markdown support.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateNewNote}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition cursor-pointer shadow-xs"
        >
          <Plus size={15} />
          <span>New Note</span>
        </button>
      </div>

      {/* Main split view */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Note List */}
        <div className="md:col-span-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Tag filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap cursor-pointer transition ${
                  selectedTag === tag
                    ? 'bg-amber-100 text-amber-900 font-semibold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Notes List */}
          <div className="space-y-2 max-h-[650px] overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-10 text-xs text-stone-400">
                No notes found. Create your first note!
              </div>
            ) : (
              filteredNotes.map((n) => {
                const parentClass = classes.find((c) => c.id === n.classId);
                const isSelected = n.id === selectedNoteId;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleSelectNote(n)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/40'
                        : 'border-stone-200 hover:border-amber-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs text-stone-900 truncate">
                          {n.title}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePin(n);
                            }}
                            className={`p-1 rounded cursor-pointer ${
                              n.isPinned
                                ? 'text-amber-600 bg-amber-100'
                                : 'text-stone-300 hover:text-stone-600'
                            }`}
                          >
                            <Pin size={12} />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                        {n.content.replace(/[#*`_]/g, '')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-stone-100 text-[10px] text-stone-400">
                      <span>{new Date(n.updatedAt).toLocaleDateString()}</span>
                      {parentClass && (
                        <span className="truncate max-w-[120px] font-medium text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                          {parentClass.title}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Note Viewer & Editor */}
        <div className="md:col-span-8 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          {selectedNote ? (
            <>
              {/* Note actions toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Markdown Note
                  </span>
                  {selectedNote.classId && selectedNote.lessonId && onNavigateToLesson && (
                    <button
                      type="button"
                      onClick={() =>
                        onNavigateToLesson(selectedNote.classId!, selectedNote.lessonId!)
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-900 underline cursor-pointer"
                    >
                      <BookOpen size={13} />
                      <span>Jump to Course Lesson</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={handleSaveCurrentNote}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      <Check size={14} />
                      <span>Save Changes</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium cursor-pointer"
                    >
                      Edit Note
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this note?')) {
                        onDeleteNote(selectedNote.id);
                        setSelectedNoteId(null);
                      }
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition"
                    title="Delete Note"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Editor mode vs Reading view */}
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">
                      Note Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Note Title"
                      className="w-full p-2.5 text-sm font-bold rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">
                        Associated Course (Optional)
                      </label>
                      <select
                        value={associatedClassId}
                        onChange={(e) => setAssociatedClassId(e.target.value)}
                        className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white"
                      >
                        <option value="">None (Independent Note)</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">
                        Tags (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="Formulas, Excel, Architecture"
                        className="w-full p-2 text-xs rounded-xl border border-stone-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">
                      Content (Markdown)
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={14}
                      className="w-full p-3 font-mono text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">{selectedNote.title}</h2>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedNote.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-stone-100 pt-4">
                    <MarkdownViewer content={selectedNote.content} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 text-stone-400 space-y-3">
              <FileText size={36} className="mx-auto text-stone-300" />
              <p className="text-xs">Select a note to view or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
