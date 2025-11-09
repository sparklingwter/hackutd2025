"use client";

import { useState } from "react";
import { Car, Truck, Package } from "lucide-react";
import type { BodyStyle } from "~/components/discovery/DiscoveryContext";

interface BodyStyleFilterProps {
  bodyStyle: BodyStyle;
  onUpdate: (bodyStyle: BodyStyle) => void;
  onClose: () => void;
}

const BODY_STYLE_OPTIONS: Array<{
  value: BodyStyle;
  label: string;
  icon: typeof Car;
  description: string;
}> = [
  {
    value: "sedan",
    label: "Sedan",
    icon: Car,
    description: "4-door comfort",
  },
  {
    value: "suv",
    label: "SUV",
    icon: Package,
    description: "Spacious & versatile",
  },
  {
    value: "truck",
    label: "Truck",
    icon: Truck,
    description: "Cargo & towing",
  },
  {
    value: "van",
    label: "Van",
    icon: Package,
    description: "Maximum space",
  },
  {
    value: "coupe",
    label: "Coupe",
    icon: Car,
    description: "2-door sporty",
  },
  {
    value: "hatchback",
    label: "Hatchback",
    icon: Car,
    description: "Compact & efficient",
  },
];

export function BodyStyleFilter({
  bodyStyle,
  onUpdate,
  onClose,
}: BodyStyleFilterProps) {
  const [selectedStyle, setSelectedStyle] = useState(bodyStyle);

  const handleApply = () => {
    onUpdate(selectedStyle);
    onClose();
  };

  const handleReset = () => {
    setSelectedStyle(bodyStyle);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-96">
      <div className="flex items-center gap-2 mb-4">
        <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Body Style Filter
        </h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Select the body style that fits your needs
      </p>

      {/* Body Style Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {BODY_STYLE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedStyle === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedStyle(option.value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <Icon
                className={`w-8 h-8 mx-auto mb-2 ${
                  isSelected
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              />
              <div className="text-center">
                <div
                  className={`font-semibold mb-1 ${
                    isSelected
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {option.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </div>
              </div>
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
