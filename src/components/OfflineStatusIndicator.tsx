import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export const OfflineStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition select-none ${
        isOnline
          ? 'text-stone-600 bg-stone-100'
          : 'text-amber-800 bg-amber-100 font-semibold border border-amber-300'
      }`}
      title={
        isOnline
          ? 'Online: All features available'
          : 'Offline mode: Learning materials, notes, and progress are stored safely on your device'
      }
    >
      {isOnline ? (
        <>
          <Wifi size={13} className="text-emerald-600 shrink-0" />
          <span className="hidden sm:inline">Online</span>
        </>
      ) : (
        <>
          <WifiOff size={13} className="text-amber-700 animate-pulse shrink-0" />
          <span>Offline (PWA)</span>
        </>
      )}
    </div>
  );
};
