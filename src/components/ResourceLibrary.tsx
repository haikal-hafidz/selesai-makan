import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  Eye,
  Download,
  AlertCircle,
  FolderOpen,
  FileCode,
  BookOpen,
} from 'lucide-react';
import { ResourceItem, Chapter, Lesson } from '../types';
import { ResourcePreviewModal } from './ResourcePreviewModal';

interface ResourceLibraryProps {
  classId: string;
  chapters?: Chapter[];
  lessons?: Lesson[];
  resources: ResourceItem[];
  onUploadResource: (file: File, chapterId?: string, lessonId?: string) => Promise<void>;
  onDeleteResource: (id: string) => Promise<void>;
  onCreateLessonFromText?: (title: string, text: string) => void;
}

export const ResourceLibrary: React.FC<ResourceLibraryProps> = ({
  chapters = [],
  lessons = [],
  resources,
  onUploadResource,
  onDeleteResource,
  onCreateLessonFromText,
}) => {
  const [activePreview, setActivePreview] = useState<ResourceItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      await onUploadResource(
        file,
        selectedChapterId || undefined,
        selectedLessonId || undefined
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save resource to IndexedDB');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDownloadDirect = (resource: ResourceItem) => {
    let url = resource.dataUrl;
    let revoke = false;
    if (resource.dataBlob) {
      url = URL.createObjectURL(resource.dataBlob);
      revoke = true;
    }
    if (!url) return;

    const a = document.createElement('a');
    a.href = url;
    a.download = resource.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (revoke) {
      setTimeout(() => URL.revokeObjectURL(url!), 1000);
    }
  };

  const filteredLessons = selectedChapterId
    ? lessons.filter((l) => l.chapterId === selectedChapterId)
    : lessons;

  return (
    <div className="space-y-6">
      {/* Top Header & Upload Bar */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Universal Resource Library</h2>
            <p className="text-xs text-stone-500 mt-1">
              Upload PDFs, Markdown, TXT, CSV, Word, and Excel materials. Readable content is parsed client-side and immediately ready to study.
            </p>
          </div>

          <div>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition cursor-pointer shadow-xs">
              <Upload size={15} />
              <span>{uploading ? 'Processing File...' : 'Upload Learning Material'}</span>
              <input
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Association Selectors for Target Chapter / Lesson */}
        {chapters.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-stone-100 text-xs">
            <span className="text-stone-500 font-medium">Attach Upload To:</span>
            <select
              value={selectedChapterId}
              onChange={(e) => {
                setSelectedChapterId(e.target.value);
                setSelectedLessonId('');
              }}
              className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 focus:outline-none focus:border-amber-500"
            >
              <option value="">(Class Level — Entire Subject)</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  Chapter: {ch.title}
                </option>
              ))}
            </select>

            {selectedChapterId && filteredLessons.length > 0 && (
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 focus:outline-none focus:border-amber-500"
              >
                <option value="">(Chapter Level)</option>
                {filteredLessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    Lesson: {l.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* List of Resources */}
      {resources.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <FolderOpen size={30} />
          </div>
          <h3 className="text-lg font-semibold text-stone-800">No resources attached yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-6">
            Upload PDFs, ebooks, markdown notes, spreadsheets, or study guides to have them parsed and stored locally.
          </p>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50 transition cursor-pointer">
            <Upload size={14} />
            <span>Select File from Computer</span>
            <input type="file" onChange={handleFileChange} disabled={uploading} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res) => {
            const isPdf = res.fileType.includes('pdf') || res.name.toLowerCase().endsWith('.pdf');
            const hasExtractedText = !!res.extractedText && res.extractedText.trim().length > 0;
            const ext = res.name.split('.').pop()?.toUpperCase() || 'FILE';

            // Find associated chapter or lesson title
            const associatedChapter = chapters.find((c) => c.id === res.chapterId);
            const associatedLesson = lessons.find((l) => l.id === res.lessonId);

            return (
              <div
                key={res.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between hover:border-amber-300 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="p-2.5 rounded-xl bg-amber-100/60 text-amber-800">
                      {hasExtractedText ? <FileCode size={20} /> : <FileText size={20} />}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {res.status === 'extracted' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Parsed
                        </span>
                      )}
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                        {isPdf ? 'PDF' : ext}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-semibold text-stone-900 text-sm line-clamp-2 mb-1" title={res.name}>
                    {res.name}
                  </h4>

                  <div className="text-[11px] text-stone-400 space-y-0.5 mb-2">
                    <p>
                      {(res.size / (1024 * 1024)).toFixed(2)} MB •{' '}
                      {new Date(res.uploadedAt).toLocaleDateString()}
                    </p>
                    {associatedLesson ? (
                      <p className="text-amber-700 font-medium truncate">
                        Linked: {associatedLesson.title}
                      </p>
                    ) : associatedChapter ? (
                      <p className="text-stone-600 truncate">
                        Chapter: {associatedChapter.title}
                      </p>
                    ) : (
                      <p className="text-stone-400">Class Resource</p>
                    )}
                  </div>

                  {res.extractedText && (
                    <p className="text-xs text-stone-600 bg-stone-50 p-2 rounded-lg line-clamp-2 italic mb-2 border border-stone-100">
                      "{res.extractedText.slice(0, 120)}..."
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-stone-100">
                  {hasExtractedText && onCreateLessonFromText && (
                    <button
                      type="button"
                      onClick={() => {
                        const title = `Notes from: ${res.name.replace(/\.[^/.]+$/, '')}`;
                        onCreateLessonFromText(title, res.extractedText!);
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-medium transition cursor-pointer"
                    >
                      <BookOpen size={13} />
                      <span>Create Lesson from Content</span>
                    </button>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActivePreview(res)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 px-2.5 py-1.5 rounded-md hover:bg-amber-50 transition cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>{hasExtractedText ? 'View Content' : isPdf ? 'Read PDF' : 'Preview'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadDirect(res)}
                        className="p-1.5 text-stone-500 hover:text-stone-800 rounded-md hover:bg-stone-100 transition cursor-pointer"
                        title="Download file"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remove "${res.name}" from your local library?`)) {
                          onDeleteResource(res.id);
                        }
                      }}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition cursor-pointer"
                      title="Delete resource"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Embedded Reader Modal */}
      {activePreview && (
        <ResourcePreviewModal
          resource={activePreview}
          onClose={() => setActivePreview(null)}
          onCreateLessonFromText={onCreateLessonFromText}
        />
      )}
    </div>
  );
};
