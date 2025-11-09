"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Fuel, Users as UsersIcon, ArrowRight, ArrowLeft, Zap, Leaf } from "lucide-react";
import { ProgressBar } from "~/components/discovery/ProgressBar";
import { useDiscovery } from "~/components/discovery/DiscoveryContext";
import type { FuelType } from "~/components/discovery/DiscoveryContext";

const FUEL_TYPES: { value: FuelType; label: string; icon: typeof Fuel; description: string }[] = [
  { value: "gas", label: "Gas", icon: Fuel, description: "Traditional gasoline" },
  { value: "hybrid", label: "Hybrid", icon: Leaf, description: "Gas + electric efficiency" },
  { value: "plugin-hybrid", label: "Plug-in Hybrid", icon: Zap, description: "Rechargeable hybrid" },
  { value: "electric", label: "Electric", icon: Zap, description: "100% electric power" },
];

const SEATING_OPTIONS = [2, 4, 5, 6, 7, 8];

export default function PreferencesPage() {
  const router = useRouter();
  const { profile, updateProfile, setCurrentStep } = useDiscovery();
  
  const [fuelType, setFuelType] = useState<FuelType | undefined>(profile.fuelType);
  const [seating, setSeating] = useState<number | undefined>(profile.seating);
  const [priorityMpg, setPriorityMpg] = useState(profile.priorityMpg ?? false);
  const [priorityRange, setPriorityRange] = useState(profile.priorityRange ?? false);

  useEffect(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  const handleNext = () => {
    if (!fuelType) {
      alert("Please select a fuel type");
      return;
    }
    if (!seating) {
      alert("Please select minimum seating capacity");
      return;
    }

    updateProfile({ fuelType, seating, priorityMpg, priorityRange });
    router.push("/discovery/features");
  };

  const handleBack = () => {
    router.push("/discovery/body-style");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ProgressBar currentStep={3} />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mt-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Fuel Type & Seating Preferences
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tell us about your powertrain and passenger needs
          </p>
        </div>

        <div className="space-y-8">
          {/* Fuel Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Preferred Fuel Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {FUEL_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setFuelType(type.value)}
                    className={`p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                      fuelType === type.value
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2 text-gray-700 dark:text-gray-300" />
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {type.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seating Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Minimum Seating Capacity
            </label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {SEATING_OPTIONS.map((seats) => (
                <button
                  key={seats}
                  onClick={() => setSeating(seats)}
                  className={`p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                    seating === seats
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <UsersIcon className="w-5 h-5 mx-auto mb-1 text-gray-700 dark:text-gray-300" />
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {seats}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority Toggles */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Priorities
            </label>
            
            <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Prioritize Fuel Efficiency
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Prefer vehicles with better MPG
                </div>
              </div>
              <button
                onClick={() => setPriorityMpg(!priorityMpg)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  priorityMpg ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    priorityMpg ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Prioritize Electric Range
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Prefer vehicles with longer electric-only range
                </div>
              </div>
              <button
                onClick={() => setPriorityRange(!priorityRange)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  priorityRange ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    priorityRange ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
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
    </div>
  );
}
