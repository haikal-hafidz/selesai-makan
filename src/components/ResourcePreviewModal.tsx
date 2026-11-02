import React, { useState, useEffect } from 'react';
import { FileText, Download, X, ExternalLink } from 'lucide-react';
import { ResourceItem } from '../types';

interface ResourcePreviewModalProps {
  resource: ResourceItem;
  onClose: () => void;
}

export const ResourcePreviewModal: React.FC<ResourcePreviewModalProps> = ({ resource, onClose }) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;
    if (resource.dataBlob) {
      url = URL.createObjectURL(resource.dataBlob);
      setObjectUrl(url);
    } else if (resource.dataUrl) {
      setObjectUrl(resource.dataUrl);
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [resource]);

  const handleDownload = () => {
    if (!objectUrl) return;
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = resource.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isPdf =
    resource.fileType.includes('pdf') ||
    resource.name.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 sm:p-6">
      <div className="flex h-full max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50">
          <div className="flex items-center gap-3 truncate">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <FileText size={20} />
            </div>
            <div className="truncate">
              <h2 className="text-base font-semibold text-stone-900 truncate">{resource.name}</h2>
              <p className="text-xs text-stone-500">
                {(resource.size / (1024 * 1024)).toFixed(2)} MB • Uploaded{' '}
                {new Date(resource.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {objectUrl && (
              <>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
                <a
                  href={objectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                >
                  <ExternalLink size={14} />
                  <span>Open in Tab</span>
                </a>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-stone-100 overflow-hidden flex items-center justify-center p-2">
          {isPdf && objectUrl ? (
            <iframe
              src={objectUrl}
              title={resource.name}
              className="w-full h-full rounded border-0 bg-white"
            />
          ) : (
            <div className="text-center p-8 max-w-md bg-white rounded-xl shadow-xs border border-stone-200">
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-semibold text-stone-800 mb-2">Non-PDF File Preview</h3>
              <p className="text-sm text-stone-600 mb-6">
                Direct in-app embedded preview is tailored for PDFs and ebooks. You can download or open
                this file in a new tab.
              </p>
              {objectUrl && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 text-white font-medium text-sm hover:bg-amber-700 transition cursor-pointer shadow-xs"
                >
                  <Download size={16} />
                  Download / Open File
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
