"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, ArrowRight } from "lucide-react";
import { ProgressBar } from "~/components/discovery/ProgressBar";
import { useDiscovery } from "~/components/discovery/DiscoveryContext";
import type { BudgetType } from "~/components/discovery/DiscoveryContext";

export default function BudgetPage() {
  const router = useRouter();
  const { profile, updateProfile, setCurrentStep } = useDiscovery();
  
  const [budgetType, setBudgetType] = useState<BudgetType>(
    profile.budgetType ?? "monthly"
  );
  const [budgetAmount, setBudgetAmount] = useState<string>(
    profile.budgetAmount?.toString() ?? ""
  );

  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  const handleNext = () => {
    const amount = parseFloat(budgetAmount);
    if (!budgetAmount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid budget amount");
      return;
    }

    updateProfile({ budgetType, budgetAmount: amount });
    router.push("/discovery/body-style");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <ProgressBar currentStep={1} />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              What&apos;s your budget?
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Help us find vehicles that fit your financial plan
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Budget Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Budget Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setBudgetType("monthly")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  budgetType === "monthly"
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  Monthly Payment
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Finance or lease
                </div>
              </button>

              <button
                onClick={() => setBudgetType("cash")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  budgetType === "cash"
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  Cash Purchase
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total price
                </div>
              </button>
            </div>
          </div>

          {/* Budget Amount Input */}
          <div>
            <label
              htmlFor="budgetAmount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {budgetType === "monthly" ? "Maximum Monthly Payment" : "Maximum Purchase Price"}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg">
                $
              </span>
              <input
                id="budgetAmount"
                type="number"
                min="0"
                step="100"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder={budgetType === "monthly" ? "500" : "30000"}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {budgetType === "monthly"
                ? "Enter your comfortable monthly payment amount"
                : "Enter your maximum total purchase price"}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Tip:</strong> Consider your monthly expenses and leave room for insurance,
          maintenance, and fuel costs when setting your budget.
        </p>
      </div>
    </div>
  );
}
