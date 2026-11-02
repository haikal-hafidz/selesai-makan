import React, { useState, useEffect } from 'react';
import { FileText, Download, X, ExternalLink, BookOpen } from 'lucide-react';
import { ResourceItem } from '../types';

interface ResourcePreviewModalProps {
  resource: ResourceItem;
  onClose: () => void;
  onCreateLessonFromText?: (title: string, text: string) => void;
}

export const ResourcePreviewModal: React.FC<ResourcePreviewModalProps> = ({
  resource,
  onClose,
  onCreateLessonFromText,
}) => {
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
    resource.fileType.includes('pdf') || resource.name.toLowerCase().endsWith('.pdf');
  const isImage =
    resource.fileType.startsWith('image/') ||
    /\.(png|jpe?g|gif|webp|svg)$/i.test(resource.name);
  const hasExtractedText = !!resource.extractedText && resource.extractedText.trim().length > 0;

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
                {resource.status === 'extracted' && ' • Content Processed'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasExtractedText && onCreateLessonFromText && (
              <button
                type="button"
                onClick={() => {
                  const cleanedTitle = resource.name.replace(/\.[^/.]+$/, '');
                  onCreateLessonFromText(`Notes from: ${cleanedTitle}`, resource.extractedText!);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-xs font-medium text-white hover:bg-amber-700 transition cursor-pointer shadow-xs"
              >
                <BookOpen size={14} />
                <span>Create Lesson from Content</span>
              </button>
            )}
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
          {hasExtractedText ? (
            <div className="w-full h-full bg-white rounded-xl p-6 overflow-y-auto border border-stone-200 shadow-inner">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
                <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                  Processed Readable Text Content
                </span>
                <span className="text-xs text-stone-400">
                  {resource.extractedText!.length} characters
                </span>
              </div>
              <pre className="font-mono text-xs whitespace-pre-wrap text-stone-800 leading-relaxed font-sans">
                {resource.extractedText}
              </pre>
            </div>
          ) : isPdf && objectUrl ? (
            <iframe
              src={objectUrl}
              title={resource.name}
              className="w-full h-full rounded border-0 bg-white"
            />
          ) : isImage && objectUrl ? (
            <div className="flex items-center justify-center h-full p-4">
              <img
                src={objectUrl}
                alt={resource.name}
                className="max-h-full max-w-full rounded-lg object-contain shadow-md"
              />
            </div>
          ) : (
            <div className="text-center p-8 max-w-md bg-white rounded-xl shadow-xs border border-stone-200">
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-semibold text-stone-800 mb-2">Stored Attachment</h3>
              <p className="text-sm text-stone-600 mb-6 leading-relaxed">
                This document is safely stored locally in your IndexedDB. Client-side preview is not available for this binary format, but it remains fully accessible for offline download or opening.
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
