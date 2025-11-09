"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Fuel, Users, Package, ArrowRight, Scale, Calculator, Car } from "lucide-react";
import { cn } from "~/lib/utils";
import { useCompare } from "~/components/comparison/CompareContext";
import { useMemo } from "react";
import type { Recommendation, Vehicle } from "~/server/api/schemas";

interface RecommendationCardProps {
  recommendation: Recommendation & {
    vehicle: Pick<Vehicle, "id" | "model" | "year" | "msrp" | "bodyStyle" | "fuelType" | "mpgCombined" | "seating" | "imageUrls">;
  };
  tier: "top-pick" | "strong-contender" | "explore-alternative";
}

const TIER_STYLES = {
  "top-pick": {
    badge: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    border: "border-green-200 dark:border-green-800",
    label: "Top Pick",
  },
  "strong-contender": {
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    label: "Strong Contender",
  },
  "explore-alternative": {
    badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
    label: "Worth Exploring",
  },
};

export function RecommendationCard({ recommendation, tier }: RecommendationCardProps) {
  const { vehicle, score, explanation, matchedCriteria, tradeoffs } = recommendation;
  const styles = TIER_STYLES[tier];
  const { addVehicle, removeVehicle, isInCompareTray, canAddMore } = useCompare();
  
  const isComparing = isInCompareTray(vehicle.id);
  
  // Select a random image from available images for variety
  // Use vehicle ID as seed for consistent selection across renders
  const selectedImage = useMemo(() => {
    if (!vehicle.imageUrls || vehicle.imageUrls.length === 0) return null;
    
    // Use vehicle ID as seed for deterministic random selection
    let hash = 0;
    for (let i = 0; i < vehicle.id.length; i++) {
      hash = ((hash << 5) - hash) + vehicle.id.charCodeAt(i);
      hash = hash & hash;
    }
    const index = Math.abs(hash) % vehicle.imageUrls.length;
    return vehicle.imageUrls[index];
  }, [vehicle.id, vehicle.imageUrls]);
  
  const hasImage = selectedImage !== null;
  
  const handleCompareToggle = () => {
    if (isComparing) {
      removeVehicle(vehicle.id);
    } else {
      addVehicle(vehicle.id);
    }
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all border-2",
        styles.border
      )}
    >
      {/* Header with Badge and Score */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", styles.badge)}>
          {styles.label}
        </span>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {score}/100
          </span>
        </div>
      </div>

      {/* Vehicle Image or Compact Header */}
      {hasImage && selectedImage ? (
        <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
          <Image
            src={selectedImage}
            alt={`${vehicle.year} ${vehicle.model}`}
            fill
            className="object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 p-6">
          <div className="flex items-center justify-center">
            <Car className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
      )}

      {/* Vehicle Info */}
      <div className={cn("p-4", !hasImage && "py-3")}>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          {vehicle.year} {vehicle.model}
        </h3>
        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">
          ${vehicle.msrp.toLocaleString()}
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {vehicle.mpgCombined ? `${vehicle.mpgCombined} MPG` : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {vehicle.seating} seats
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
              {vehicle.bodyStyle}
            </span>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {explanation}
          </p>
        </div>

        {/* Matched Criteria */}
        {matchedCriteria && matchedCriteria.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              MATCHES YOUR NEEDS:
            </p>
            <div className="flex flex-wrap gap-2">
              {matchedCriteria.map((criterion, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full"
                >
                  {criterion}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tradeoffs */}
        {tradeoffs && tradeoffs.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              TRADEOFFS:
            </p>
            <ul className="space-y-1">
              {tradeoffs.map((tradeoff, index) => (
                <li key={index} className="text-xs text-gray-600 dark:text-gray-400">
                  • {tradeoff}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* View Details Button */}
          <Link
            href={`/vehicles/${vehicle.id}`}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Compare and Estimate Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {/* Compare Toggle Button */}
            <button
              onClick={handleCompareToggle}
              disabled={!isComparing && !canAddMore}
              className={cn(
                "flex items-center justify-center gap-2 px-3 py-2 font-medium rounded-lg transition-colors text-sm",
                isComparing
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
                !isComparing && !canAddMore && "opacity-50 cursor-not-allowed"
              )}
              title={isComparing ? "Remove from compare" : "Add to compare"}
            >
              <Scale className="w-4 h-4" />
              {isComparing ? "Comparing" : "Compare"}
            </button>

            {/* Get Estimate Button */}
            <Link
              href={`/estimate?carId=${vehicle.id}`}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              <Calculator className="w-4 h-4" />
              Estimate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
