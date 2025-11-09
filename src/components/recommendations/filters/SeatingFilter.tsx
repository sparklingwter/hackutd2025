"use client";

import { useState } from "react";
import { Users, Minus, Plus } from "lucide-react";

interface SeatingFilterProps {
  seating: number;
  onUpdate: (seating: number) => void;
  onClose: () => void;
}

const SEATING_OPTIONS = [2, 4, 5, 6, 7, 8];

export function SeatingFilter({
  seating,
  onUpdate,
  onClose,
}: SeatingFilterProps) {
  const [selectedSeating, setSelectedSeating] = useState(seating);

  const handleApply = () => {
    onUpdate(selectedSeating);
    onClose();
  };

  const handleReset = () => {
    setSelectedSeating(seating);
  };

  const handleIncrement = () => {
    if (selectedSeating < 8) {
      setSelectedSeating(selectedSeating + 1);
    }
  };

  const handleDecrement = () => {
    if (selectedSeating > 2) {
      setSelectedSeating(selectedSeating - 1);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-80">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Seating Filter
        </h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Minimum number of seats needed
      </p>

      {/* Large Counter Display */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={selectedSeating <= 2}
            className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-blue-600 dark:hover:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 dark:disabled:hover:border-gray-600"
            aria-label="Decrease seating"
          >
            <Minus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
              {selectedSeating}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              seats minimum
            </div>
          </div>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={selectedSeating >= 8}
            className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-blue-600 dark:hover:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 dark:disabled:hover:border-gray-600"
            aria-label="Increase seating"
          >
            <Plus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Quick Select Buttons */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Quick Select
        </label>
        <div className="grid grid-cols-3 gap-2">
          {SEATING_OPTIONS.map((seats) => (
            <button
              key={seats}
              type="button"
              onClick={() => setSelectedSeating(seats)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedSeating === seats
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {seats}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
