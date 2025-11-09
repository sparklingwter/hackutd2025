"use client";

/**
 * T043 [P] [US4]: Saved compare sets section component
 */

import { useState, useEffect } from "react";
import { GitCompare, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getAnonymousCompareSets, deleteAnonymousCompareSet } from "~/lib/localStorage";
import type { CompareSetSchema } from "~/server/api/schemas";
import type { z } from "zod";

type CompareSet = z.infer<typeof CompareSetSchema>;

export function SavedCompareSets() {
  const [compareSets, setCompareSets] = useState<CompareSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCompareSets();
  }, []);

  const loadCompareSets = () => {
    setIsLoading(true);
    const saved = getAnonymousCompareSets();
    setCompareSets(saved);
    setIsLoading(false);
  };

  const handleDelete = (compareSetId: string) => {
    deleteAnonymousCompareSet(compareSetId);
    loadCompareSets();
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <GitCompare className="text-purple-500" size={24} />
          <h2 className="text-xl font-semibold">Saved Comparisons</h2>
        </div>
        <p className="text-gray-500">Loading comparisons...</p>
      </div>
    );
  }

  if (compareSets.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <GitCompare className="text-purple-500" size={24} />
          <h2 className="text-xl font-semibold">Saved Comparisons</h2>
        </div>
        <p className="text-gray-500">
          No saved comparisons yet. Compare vehicles and save the comparison to revisit later.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitCompare className="text-purple-500" size={24} />
          <h2 className="text-xl font-semibold">Saved Comparisons</h2>
          <span className="text-sm text-gray-500">({compareSets.length})</span>
        </div>
      </div>

      <div className="space-y-3">
        {compareSets.map((compareSet) => (
          <div
            key={compareSet.id}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold mb-2">
                  {compareSet.name ?? `Comparison ${compareSet.id.slice(0, 8)}`}
                </h3>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{compareSet.vehicleIds.length} vehicles</span>
                  {" • "}
                  <span>
                    Created {new Date(compareSet.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {compareSet.vehicleIds.map((vehicleId) => (
                    <span
                      key={vehicleId}
                      className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {vehicleId}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Link
                  href={`/compare?ids=${compareSet.vehicleIds.join(",")}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="View comparison"
                  title="View comparison"
                >
                  <ExternalLink size={18} />
                </Link>
                <button
                  onClick={() => handleDelete(compareSet.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Delete comparison"
                  title="Delete comparison"
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
