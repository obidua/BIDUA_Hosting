import React from 'react';
import { X, RefreshCw, Loader } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onRenewSelected: () => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onRenewSelected,
  onClearSelection,
  isLoading = false,
}: BulkActionsBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 right-6 z-40 bg-slate-900 border border-cyan-500/50 rounded-lg p-4 shadow-2xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-white font-semibold">
              {selectedCount} server{selectedCount !== 1 ? 's' : ''} selected
            </p>
            <p className="text-slate-400 text-sm">
              Selected servers will be renewed for 1 year
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClearSelection}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
          <button
            onClick={onRenewSelected}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition disabled:opacity-50 font-medium"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Renewing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Renew Selected
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
