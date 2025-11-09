"use client";

import { Trophy } from "lucide-react";
import { RecommendationCard } from "./RecommendationCard";
import type { Recommendation, Vehicle } from "~/server/api/schemas";

interface TopPicksProps {
  recommendations: (Recommendation & {
    vehicle: Pick<Vehicle, "id" | "model" | "year" | "msrp" | "bodyStyle" | "fuelType" | "mpgCombined" | "seating" | "imageUrls">;
  })[];
}

export function TopPicks({ recommendations }: TopPicksProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
          <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Top Picks
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Best matches for your needs and budget
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.vehicleId}
            recommendation={recommendation}
            tier="top-pick"
          />
        ))}
      </div>
    </section>
  );
}
