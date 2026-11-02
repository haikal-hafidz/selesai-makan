import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  Eye,
  Download,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import { ResourceItem } from '../types';
import { ResourcePreviewModal } from './ResourcePreviewModal';

interface ResourceLibraryProps {
  classId: string;
  resources: ResourceItem[];
  onUploadResource: (file: File) => Promise<void>;
  onDeleteResource: (id: string) => Promise<void>;
}

export const ResourceLibrary: React.FC<ResourceLibraryProps> = ({
  resources,
  onUploadResource,
  onDeleteResource,
}) => {
  const [activePreview, setActivePreview] = useState<ResourceItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      await onUploadResource(file);
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Resource & Document Library</h2>
          <p className="text-sm text-stone-500 mt-1">
            Store PDFs, ebooks, cheatsheets, and learning materials persistently in your local browser.
          </p>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition cursor-pointer shadow-xs">
            <Upload size={16} />
            <span>{uploading ? 'Storing in IndexedDB...' : 'Upload PDF / Resource'}</span>
            <input
              type="file"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
              accept=".pdf,.doc,.docx,.epub,.txt,.md"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">
          <AlertCircle size={16} />
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
          <p className="text-sm text-stone-500 max-w-sm mx-auto mt-1 mb-6">
            Upload PDFs, ebooks, slides, or study guides to have them stored locally and ready to read.
          </p>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-50 transition cursor-pointer">
            <Upload size={15} />
            <span>Select File from Computer</span>
            <input type="file" onChange={handleFileChange} disabled={uploading} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res) => {
            const isPdf = res.fileType.includes('pdf') || res.name.toLowerCase().endsWith('.pdf');
            return (
              <div
                key={res.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between hover:border-amber-300 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-amber-100/60 text-amber-800">
                      <FileText size={22} />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                      {isPdf ? 'PDF' : res.name.split('.').pop()?.toUpperCase() || 'FILE'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-stone-900 text-sm line-clamp-2 mb-1" title={res.name}>
                    {res.name}
                  </h4>
                  <p className="text-xs text-stone-500">
                    {(res.size / (1024 * 1024)).toFixed(2)} MB •{' '}
                    {new Date(res.uploadedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActivePreview(res)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 px-2.5 py-1.5 rounded-md hover:bg-amber-50 transition cursor-pointer"
                    >
                      <Eye size={14} />
                      <span>{isPdf ? 'Read / Preview' : 'View'}</span>
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
            );
          })}
        </div>
      )}

      {/* Embedded Reader Modal */}
      {activePreview && (
        <ResourcePreviewModal resource={activePreview} onClose={() => setActivePreview(null)} />
      )}
    </div>
  );
};
