"use client";

import { X, RotateCcw } from "lucide-react";
import { useState } from "react";

interface ClearFiltersProps {
  onClearAll: () => void;
  filterCount: number;
}

export function ClearFilters({ onClearAll, filterCount }: ClearFiltersProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleClearClick = () => {
    if (filterCount > 0) {
      setShowConfirmation(true);
    }
  };

  const handleConfirm = () => {
    onClearAll();
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  if (filterCount === 0) {
    return null;
  }

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Clear All Filters?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will reset all {filterCount} active filter{filterCount > 1 ? 's' : ''} and restart your vehicle discovery.
                You&apos;ll be redirected to update your preferences.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClearClick}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
    >
      <X className="w-4 h-4" />
      Clear All Filters ({filterCount})
    </button>
  );
}
