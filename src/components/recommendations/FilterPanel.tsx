"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { BudgetFilter } from "./filters/BudgetFilter";
import { BodyStyleFilter } from "./filters/BodyStyleFilter";
import { FuelTypeFilter } from "./filters/FuelTypeFilter";
import { SeatingFilter } from "./filters/SeatingFilter";
import { ClearFilters } from "./ClearFilters";
import type { BudgetType, BodyStyle, FuelType } from "~/components/discovery/DiscoveryContext";

export interface FilterPanelFilters {
  budgetType: BudgetType;
  budgetAmount: number;
  bodyStyle: BodyStyle;
  fuelType: FuelType;
  seating: number;
}

interface FilterPanelProps {
  filters: FilterPanelFilters;
  onFilterChange: (filters: Partial<FilterPanelFilters>) => void;
  onClearAll: () => void;
}

type ActiveFilter = "budget" | "bodyStyle" | "fuelType" | "seating" | null;

export function FilterPanel({ filters, onFilterChange, onClearAll }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setActiveFilter(null);
      }
    };

    if (activeFilter) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activeFilter]);

  const handleBudgetUpdate = (budgetType: BudgetType, budgetAmount: number) => {
    onFilterChange({ budgetType, budgetAmount });
  };

  const handleBodyStyleUpdate = (bodyStyle: BodyStyle) => {
    onFilterChange({ bodyStyle });
  };

  const handleFuelTypeUpdate = (fuelType: FuelType) => {
    onFilterChange({ fuelType });
  };

  const handleSeatingUpdate = (seating: number) => {
    onFilterChange({ seating });
  };

  const activeFilterCount = 4; // Budget, body style, fuel type, seating are always set

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Refine Results
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Adjust your preferences without starting over
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ClearFilters onClearAll={onClearAll} filterCount={activeFilterCount} />
            
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isExpanded ? "Hide Filters" : "Show Filters"}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Filter Options */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3" ref={panelRef}>
            {/* Budget Filter Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveFilter(activeFilter === "budget" ? null : "budget")}
                className="w-full p-3 text-left rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-400 transition-colors"
              >
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Budget
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {filters.budgetType === "monthly" 
                    ? `$${filters.budgetAmount}/mo` 
                    : `$${filters.budgetAmount.toLocaleString()}`}
                </div>
              </button>

              {activeFilter === "budget" && (
                <div className="absolute top-full left-0 mt-2 z-10">
                  <BudgetFilter
                    budgetType={filters.budgetType}
                    budgetAmount={filters.budgetAmount}
                    onUpdate={handleBudgetUpdate}
                    onClose={() => setActiveFilter(null)}
                  />
                </div>
              )}
            </div>

            {/* Body Style Filter Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveFilter(activeFilter === "bodyStyle" ? null : "bodyStyle")}
                className="w-full p-3 text-left rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-400 transition-colors"
              >
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Body Style
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate capitalize">
                  {filters.bodyStyle}
                </div>
              </button>

              {activeFilter === "bodyStyle" && (
                <div className="absolute top-full left-0 mt-2 z-10">
                  <BodyStyleFilter
                    bodyStyle={filters.bodyStyle}
                    onUpdate={handleBodyStyleUpdate}
                    onClose={() => setActiveFilter(null)}
                  />
                </div>
              )}
            </div>

            {/* Fuel Type Filter Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveFilter(activeFilter === "fuelType" ? null : "fuelType")}
                className="w-full p-3 text-left rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-400 transition-colors"
              >
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Fuel Type
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate capitalize">
                  {filters.fuelType === "plugin-hybrid" ? "Plug-in Hybrid" : filters.fuelType}
                </div>
              </button>

              {activeFilter === "fuelType" && (
                <div className="absolute top-full left-0 mt-2 z-10">
                  <FuelTypeFilter
                    fuelType={filters.fuelType}
                    onUpdate={handleFuelTypeUpdate}
                    onClose={() => setActiveFilter(null)}
                  />
                </div>
              )}
            </div>

            {/* Seating Filter Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveFilter(activeFilter === "seating" ? null : "seating")}
                className="w-full p-3 text-left rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-400 transition-colors"
              >
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Seating
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {filters.seating}+ seats
                </div>
              </button>

              {activeFilter === "seating" && (
                <div className="absolute top-full left-0 mt-2 z-10">
                  <SeatingFilter
                    seating={filters.seating}
                    onUpdate={handleSeatingUpdate}
                    onClose={() => setActiveFilter(null)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Changes are applied instantly and update your recommendations in real-time
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
