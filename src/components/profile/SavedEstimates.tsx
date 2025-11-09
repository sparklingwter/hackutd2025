"use client";

/**
 * T044 [P] [US4]: Saved estimates section component
 */

import { useState, useEffect } from "react";
import { DollarSign, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getAnonymousEstimates, deleteAnonymousEstimate } from "~/lib/localStorage";
import type { EstimateSchema } from "~/server/api/schemas";
import type { z } from "zod";

type Estimate = z.infer<typeof EstimateSchema>;

export function SavedEstimates() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEstimates();
  }, []);

  const loadEstimates = () => {
    setIsLoading(true);
    const saved = getAnonymousEstimates();
    setEstimates(saved);
    setIsLoading(false);
  };

  const handleDelete = (estimateId: string) => {
    deleteAnonymousEstimate(estimateId);
    loadEstimates();
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="text-green-500" size={24} />
          <h2 className="text-xl font-semibold">Saved Estimates</h2>
        </div>
        <p className="text-gray-500">Loading estimates...</p>
      </div>
    );
  }

  if (estimates.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="text-green-500" size={24} />
          <h2 className="text-xl font-semibold">Saved Estimates</h2>
        </div>
        <p className="text-gray-500">
          No saved estimates yet. Create a cost estimate and save it to revisit later.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="text-green-500" size={24} />
          <h2 className="text-xl font-semibold">Saved Estimates</h2>
          <span className="text-sm text-gray-500">({estimates.length})</span>
        </div>
      </div>

      <div className="space-y-3">
        {estimates.map((estimate) => (
          <div
            key={estimate.id}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold mb-2">
                  {estimate.name ?? `${estimate.type.toUpperCase()} Estimate`}
                </h3>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-gray-500">Vehicle:</span>{" "}
                    <span className="font-medium">{estimate.vehicleId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>{" "}
                    <span className="font-medium capitalize">{estimate.type}</span>
                  </div>
                  {estimate.outputs.monthlyPayment && (
                    <div>
                      <span className="text-gray-500">Monthly Payment:</span>{" "}
                      <span className="font-medium text-green-600">
                        ${estimate.outputs.monthlyPayment.toLocaleString()}/mo
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Out-the-Door:</span>{" "}
                    <span className="font-medium">
                      ${estimate.outputs.outTheDoorTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Created {new Date(estimate.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Link
                  href={`/estimate?vehicleId=${estimate.vehicleId}&estimateId=${estimate.id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="View estimate"
                  title="View estimate"
                >
                  <ExternalLink size={18} />
                </Link>
                <button
                  onClick={() => handleDelete(estimate.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Delete estimate"
                  title="Delete estimate"
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
