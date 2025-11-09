"use client";

import { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";
import type { BudgetType } from "~/components/discovery/DiscoveryContext";

interface BudgetFilterProps {
  budgetType: BudgetType;
  budgetAmount: number;
  onUpdate: (budgetType: BudgetType, budgetAmount: number) => void;
  onClose: () => void;
}

export function BudgetFilter({
  budgetType,
  budgetAmount,
  onUpdate,
  onClose,
}: BudgetFilterProps) {
  const [localBudgetType, setLocalBudgetType] = useState(budgetType);
  const [localBudgetAmount, setLocalBudgetAmount] = useState(budgetAmount);

  // Predefined ranges based on budget type
  const monthlyMin = 200;
  const monthlyMax = 1500;
  const monthlyStep = 50;

  const cashMin = 20000;
  const cashMax = 80000;
  const cashStep = 1000;

  const min = localBudgetType === "monthly" ? monthlyMin : cashMin;
  const max = localBudgetType === "monthly" ? monthlyMax : cashMax;
  const step = localBudgetType === "monthly" ? monthlyStep : cashStep;

  const handleApply = () => {
    onUpdate(localBudgetType, localBudgetAmount);
    onClose();
  };

  const handleReset = () => {
    setLocalBudgetType(budgetType);
    setLocalBudgetAmount(budgetAmount);
  };

  // Update local amount when budget type changes
  useEffect(() => {
    if (localBudgetType === "monthly" && localBudgetAmount > monthlyMax) {
      setLocalBudgetAmount(monthlyMax);
    } else if (localBudgetType === "cash" && localBudgetAmount < cashMin) {
      setLocalBudgetAmount(cashMin);
    }
  }, [localBudgetType, localBudgetAmount]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-80">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Budget Filter
        </h3>
      </div>

      {/* Budget Type Toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Budget Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setLocalBudgetType("monthly")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              localBudgetType === "monthly"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setLocalBudgetType("cash")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              localBudgetType === "cash"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Cash
          </button>
        </div>
      </div>

      {/* Amount Slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {localBudgetType === "monthly" ? "Monthly Payment" : "Cash Budget"}
        </label>
        <div className="space-y-3">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localBudgetAmount}
            onChange={(e) => setLocalBudgetAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              ${localBudgetType === "monthly" ? monthlyMin : cashMin.toLocaleString()}
            </span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              ${localBudgetAmount.toLocaleString()}
              {localBudgetType === "monthly" && "/mo"}
            </span>
            <span>
              ${localBudgetType === "monthly" ? monthlyMax : cashMax.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Direct Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Exact Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            $
          </span>
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={localBudgetAmount}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= min && value <= max) {
                setLocalBudgetAmount(value);
              }
            }}
            className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
