import React from 'react';
import { GraduationCap } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Initializing your personal learning hub...',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-50 text-stone-900 transition-opacity duration-300"
    >
      <div className="flex flex-col items-center text-center p-6 max-w-sm">
        {/* Animated brand emblem */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/20 animate-pulse">
            <GraduationCap size={36} />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-amber-400 opacity-20 blur-sm animate-ping pointer-events-none" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-stone-900">Selesai Makan</h1>
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mt-1">
          Personal Learning Hub
        </p>

        {/* Subtle loading spinner bar */}
        <div className="w-48 h-1 bg-stone-200 rounded-full overflow-hidden mt-6 mb-3">
          <div className="h-full bg-amber-600 rounded-full w-1/3 animate-[indeterminate_1.4s_infinite_linear]" />
        </div>

        <p className="text-xs text-stone-600 font-medium">{message}</p>
      </div>

      <style>{`
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};
