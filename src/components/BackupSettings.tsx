import React, { useState } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { storage } from '../services/storage';

interface BackupSettingsProps {
  onDataChanged: () => void;
}

export const BackupSettings: React.FC<BackupSettingsProps> = ({ onDataChanged }) => {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setError(null);
      const json = await storage.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `selesai-makan-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('Backup file downloaded successfully!');
      setTimeout(() => setStatus(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const text = await file.text();
      await storage.importBackup(text);
      setStatus('Backup restored successfully!');
      onDataChanged();
      setTimeout(() => setStatus(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Import failed. Invalid backup JSON.');
    } finally {
      e.target.value = '';
    }
  };

  const handleClearAll = async () => {
    if (
      confirm(
        'WARNING: This will permanently delete all your classes, lessons, uploaded resources, and quiz attempts stored in IndexedDB. Are you sure?'
      )
    ) {
      await storage.resetAll();
      setStatus('All local data cleared.');
      onDataChanged();
      setTimeout(() => setStatus(null), 4000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <h2 className="text-xl font-bold text-stone-900">Data Storage & Persistence</h2>
        <p className="text-sm text-stone-600 mt-1">
          Selesai Makan stores all your curriculum notes, uploaded documents, and quiz records completely inside your browser's local <strong>IndexedDB</strong>. No external cloud servers or tracking involved.
        </p>

        <div className="mt-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <Info size={18} className="shrink-0 text-amber-700 mt-0.5" />
          <div>
            <p className="font-semibold">Local-First Storage Guarantee</p>
            <p className="mt-0.5 leading-relaxed">
              Your materials persist through browser restarts and refresh cycles. We recommend exporting a JSON backup periodically if you switch browsers or devices.
            </p>
          </div>
        </div>
      </div>

      {status && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{status}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Actions card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
        <div>
          <h3 className="font-semibold text-stone-900 text-base mb-1">Export Backup</h3>
          <p className="text-xs text-stone-500 mb-3">
            Download your full curriculum data, lesson notes, and uploaded resource attachments into a portable file.
          </p>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition cursor-pointer shadow-xs"
          >
            <Download size={14} />
            <span>Export Backup (.json)</span>
          </button>
        </div>

        <div className="border-t border-stone-100 pt-6">
          <h3 className="font-semibold text-stone-900 text-base mb-1">Restore Backup</h3>
          <p className="text-xs text-stone-500 mb-3">
            Restore previously exported data into your local learning hub.
          </p>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-50 transition cursor-pointer shadow-2xs">
            <Upload size={14} />
            <span>Select Backup File</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>

        <div className="border-t border-stone-100 pt-6">
          <h3 className="font-semibold text-red-700 text-base mb-1">Reset Database</h3>
          <p className="text-xs text-stone-500 mb-3">
            Clear all IndexedDB storage data to start completely fresh.
          </p>
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Reset Local Database</span>
          </button>
        </div>
      </div>
    </div>
  );
};
