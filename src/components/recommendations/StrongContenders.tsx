"use client";

import { ThumbsUp } from "lucide-react";
import { RecommendationCard } from "./RecommendationCard";
import type { Recommendation, Vehicle } from "~/server/api/schemas";

interface StrongContendersProps {
  recommendations: (Recommendation & {
    vehicle: Pick<Vehicle, "id" | "model" | "year" | "msrp" | "bodyStyle" | "fuelType" | "mpgCombined" | "seating" | "imageUrls">;
  })[];
}

export function StrongContenders({ recommendations }: StrongContendersProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <ThumbsUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Strong Contenders
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Great alternatives worth considering
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.vehicleId}
            recommendation={recommendation}
            tier="strong-contender"
          />
        ))}
      </div>
    </section>
  );
}
