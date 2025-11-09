"use client";

/**
 * T042 [P] [US4]: Saved searches section component
 * 
 * Displays user's saved discovery searches with option to load or delete.
 */

import { useState, useEffect } from "react";
import { Search, Trash2, Play } from "lucide-react";
import { getAnonymousSavedSearches, deleteAnonymousSavedSearch } from "~/lib/localStorage";
import type { UserNeedsProfileSchema } from "~/server/api/schemas";
import type { z } from "zod";

type SavedSearch = z.infer<typeof UserNeedsProfileSchema>;

export function SavedSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSearches();
  }, []);

  const loadSearches = () => {
    setIsLoading(true);
    const saved = getAnonymousSavedSearches();
    setSearches(saved);
    setIsLoading(false);
  };

  const handleDelete = (index: number) => {
    deleteAnonymousSavedSearch(index);
    loadSearches();
  };

  const handleLoadSearch = (search: SavedSearch) => {
    // Navigate to discovery with pre-filled values
    console.log("Load search:", search);
    // TODO: Implement navigation with query params
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="text-blue-500" size={24} />
          <h2 className="text-xl font-semibold">Saved Searches</h2>
        </div>
        <p className="text-gray-500">Loading searches...</p>
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="text-blue-500" size={24} />
          <h2 className="text-xl font-semibold">Saved Searches</h2>
        </div>
        <p className="text-gray-500">
          No saved searches yet. Complete the discovery journey and save your search to revisit later.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="text-blue-500" size={24} />
          <h2 className="text-xl font-semibold">Saved Searches</h2>
          <span className="text-sm text-gray-500">({searches.length})</span>
        </div>
      </div>

      <div className="space-y-3">
        {searches.map((search, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Budget:</span>{" "}
                    <span className="font-medium">
                      ${search.budgetAmount.toLocaleString()} ({search.budgetType})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Body:</span>{" "}
                    <span className="font-medium">{search.bodyStyle}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Fuel:</span>{" "}
                    <span className="font-medium">{search.fuelType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Seating:</span>{" "}
                    <span className="font-medium">{search.seating}+</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleLoadSearch(search)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="Load search"
                  title="Load search"
                >
                  <Play size={18} />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Delete search"
                  title="Delete search"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
