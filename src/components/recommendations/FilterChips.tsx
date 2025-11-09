"use client";

import { X } from "lucide-react";

interface FilterChip {
  id: string;
  label: string;
  value: string;
}

interface FilterChipsProps {
  filters: FilterChip[];
  onRemove: (filterId: string) => void;
  onClearAll: () => void;
}

export function FilterChips({ filters, onRemove, onClearAll }: FilterChipsProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Active Filters:
        </span>
        <button
          onClick={onClearAll}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <div
            key={filter.id}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
          >
            <span>
              {filter.label}: {filter.value}
            </span>
            <button
              onClick={() => onRemove(filter.id)}
              className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
