"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCompare } from "~/components/comparison/CompareContext";
import { Button } from "~/components/ui/button";
import { X, ArrowRight, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

export function CompareTray() {
  const pathname = usePathname();
  const { vehicleIds, removeVehicle, clearAll, errorMessage, clearError } = useCompare();
  const [isVisible, setIsVisible] = useState(false);

  // Only show tray on recommendations page and if there are vehicles
  const isRecommendationsPage = pathname === '/recommendations';
  
  useEffect(() => {
    setIsVisible(isRecommendationsPage && vehicleIds.length > 0);
  }, [isRecommendationsPage, vehicleIds.length]);
  
  // Auto-clear compare tray when leaving recommendations page
  useEffect(() => {
    if (!isRecommendationsPage && vehicleIds.length > 0) {
      clearAll();
    }
  }, [isRecommendationsPage, vehicleIds.length, clearAll]);

  if (!isVisible) return null;

  return (
    <>
      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 transform">
          <div className="flex items-center gap-3 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 shadow-lg dark:border-yellow-800 dark:bg-yellow-900/90">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {errorMessage}
            </p>
            <button
              onClick={clearError}
              className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Compare Tray */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-blue-500 bg-white dark:bg-gray-900 shadow-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Left Section - Title and Vehicle Pills */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  Compare Tray
                </div>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                  {vehicleIds.length}/4
                </span>
              </div>
              
              {/* Vehicle Pills */}
              <div className="flex gap-2 flex-wrap">
                {vehicleIds.map((vehicleId) => (
                  <div
                    key={vehicleId}
                    className="flex items-center gap-2 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 px-3 py-1.5 text-sm font-medium text-blue-900 dark:text-blue-100 transition-all hover:border-blue-400 dark:hover:border-blue-600"
                  >
                    <span className="max-w-32 truncate">{vehicleId.split('_').slice(1, 3).join(' ')}</span>
                    <button
                      onClick={() => removeVehicle(vehicleId)}
                      className="text-blue-600 dark:text-blue-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      aria-label={`Remove ${vehicleId}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAll}
                className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
              >
                Clear All
              </Button>
              <Button 
                asChild 
                size="sm" 
                disabled={vehicleIds.length < 2}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Link href={`/compare?ids=${vehicleIds.join(",")}`}>
                  Compare Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
