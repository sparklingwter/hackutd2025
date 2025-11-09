"use client";

import { useState } from "react";
import { Zap, Fuel, Leaf } from "lucide-react";
import type { FuelType } from "~/components/discovery/DiscoveryContext";

interface FuelTypeFilterProps {
  fuelType: FuelType;
  onUpdate: (fuelType: FuelType) => void;
  onClose: () => void;
}

const FUEL_TYPE_OPTIONS: Array<{
  value: FuelType;
  label: string;
  icon: typeof Fuel;
  description: string;
}> = [
  {
    value: "gas",
    label: "Gasoline",
    icon: Fuel,
    description: "Traditional fuel",
  },
  {
    value: "hybrid",
    label: "Hybrid",
    icon: Leaf,
    description: "Gas + electric",
  },
  {
    value: "plugin-hybrid",
    label: "Plug-in Hybrid",
    icon: Leaf,
    description: "Rechargeable hybrid",
  },
  {
    value: "electric",
    label: "Electric",
    icon: Zap,
    description: "Fully electric",
  },
];

export function FuelTypeFilter({
  fuelType,
  onUpdate,
  onClose,
}: FuelTypeFilterProps) {
  const [selectedType, setSelectedType] = useState(fuelType);

  const handleApply = () => {
    onUpdate(selectedType);
    onClose();
  };

  const handleReset = () => {
    setSelectedType(fuelType);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-96">
      <div className="flex items-center gap-2 mb-4">
        <Fuel className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Fuel Type Filter
        </h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Choose your preferred fuel type
      </p>

      {/* Fuel Type Options */}
      <div className="space-y-3 mb-6">
        {FUEL_TYPE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedType(option.value)}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                isSelected
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <Icon
                className={`w-6 h-6 flex-shrink-0 ${
                  isSelected
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              />
              <div className="flex-1 text-left">
                <div
                  className={`font-semibold ${
                    isSelected
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {option.label}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {option.description}
                </div>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </button>
          );
        })}
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
