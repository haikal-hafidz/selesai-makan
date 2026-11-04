import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, FileText, Brain, Award, Layers, FolderGit2 } from 'lucide-react';
import { searchService, GlobalSearchResult } from '../services/searchService';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: GlobalSearchResult) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim()) {
        setIsSearching(true);
        try {
          const res = await searchService.search(query);
          setResults(res);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'class':
      case 'lesson':
        return <BookOpen size={14} className="text-amber-600" />;
      case 'note':
        return <FileText size={14} className="text-blue-600" />;
      case 'flashcard':
        return <Brain size={14} className="text-purple-600" />;
      case 'skill':
        return <Layers size={14} className="text-emerald-600" />;
      case 'portfolio':
        return <FolderGit2 size={14} className="text-indigo-600" />;
      default:
        return <Award size={14} className="text-stone-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl border border-stone-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="p-4 border-b border-stone-100 flex items-center gap-3">
          <Search size={18} className="text-stone-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across courses, lessons, notes, flashcards, skills, and portfolio..."
            className="w-full text-sm bg-transparent focus:outline-none placeholder:text-stone-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-stone-400 hover:text-stone-600 rounded cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-stone-400 hover:text-stone-700 font-medium px-2 py-1 rounded bg-stone-100 cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {isSearching ? (
            <div className="text-center py-8 text-xs text-stone-400">Searching your workspace...</div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((res) => (
                <div
                  key={`${res.type}-${res.id}`}
                  onClick={() => {
                    onSelectResult(res);
                    onClose();
                  }}
                  className="p-3 rounded-xl hover:bg-stone-50 flex items-start gap-3 cursor-pointer transition"
                >
                  <div className="p-2 rounded-lg bg-stone-100 shrink-0 mt-0.5">
                    {getTypeIcon(res.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-900 truncate">
                        {res.title}
                      </span>
                      {res.subtitle && (
                        <span className="text-[10px] uppercase font-semibold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                          {res.subtitle}
                        </span>
                      )}
                    </div>
                    {res.snippet && (
                      <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">{res.snippet}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="text-center py-8 text-xs text-stone-400">
              No learning records match "{query}".
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-stone-400">
              Start typing to search across your offline personal learning hub.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
