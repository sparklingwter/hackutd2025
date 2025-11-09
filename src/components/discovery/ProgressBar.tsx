"use client";

import { Check } from "lucide-react";
import { cn } from "~/lib/utils";

interface Step {
  number: number;
  name: string;
  description: string;
}

const STEPS: Step[] = [
  { number: 1, name: "Budget", description: "Set your budget" },
  { number: 2, name: "Body Style", description: "Choose vehicle type" },
  { number: 3, name: "Preferences", description: "Fuel & seating" },
  { number: 4, name: "Features", description: "Must-have features" },
];

interface ProgressBarProps {
  currentStep: number;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="w-full py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Desktop Progress Bar */}
        <div className="hidden md:flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                    currentStep > step.number
                      ? "bg-green-600 border-green-600 text-white"
                      : currentStep === step.number
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                  )}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="font-semibold">{step.number}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      currentStep >= step.number
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-all duration-200",
                    currentStep > step.number
                      ? "bg-green-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Mobile Progress Bar */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {STEPS[currentStep - 1]?.name}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
