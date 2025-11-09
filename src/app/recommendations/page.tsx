"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useDiscovery } from "~/components/discovery/DiscoveryContext";
import { TopPicks } from "~/components/recommendations/TopPicks";
import { StrongContenders } from "~/components/recommendations/StrongContenders";
import { ExploreAlternatives } from "~/components/recommendations/ExploreAlternatives";
import { FilterChips } from "~/components/recommendations/FilterChips";
import { FilterPanel, type FilterPanelFilters } from "~/components/recommendations/FilterPanel";
import { AudioPlayer } from "~/components/voice/AudioPlayer";
import { api } from "~/trpc/react";

import type { Recommendation, Vehicle } from "~/server/api/schemas";

type RecommendationWithVehicle = Recommendation & {
  vehicle: Pick<Vehicle, "id" | "model" | "year" | "msrp" | "bodyStyle" | "fuelType" | "mpgCombined" | "seating" | "imageUrls">;
};

/**
 * Recommendations Page - Optimized for Performance
 * 
 * Performance Optimization:
 * - Fetches ALL recommendations ONCE using Gemini API with the initial profile
 * - Applies filter changes CLIENT-SIDE using useMemo for instant updates
 * - No additional API calls when filters change = no Gemini re-calls
 * - Results are cached for 5 minutes to avoid unnecessary re-fetches
 * 
 * This approach:
 * 1. Reduces cost (fewer Gemini API calls)
 * 2. Improves UX (instant filtering without loading delays)
 * 3. Maintains accuracy (all vehicles are ranked by AI once)
 */
export default function RecommendationsPage() {
  const router = useRouter();
  const { profile, updateProfile } = useDiscovery();
  const [filterChips, setFilterChips] = useState<Array<{ id: string; label: string; value: string }>>([]);
  const [audioSummary, setAudioSummary] = useState<string>("");
  
  // Local filter state for instant client-side filtering (no API calls)
  const [localFilters, setLocalFilters] = useState<Partial<FilterPanelFilters>>({});
  const [isFiltering, setIsFiltering] = useState(false);

  // Check if profile is complete
  useEffect(() => {
    if (!profile.budgetType || !profile.budgetAmount || !profile.bodyStyle || !profile.fuelType || !profile.seating) {
      // Redirect back to discovery if incomplete
      router.push("/discovery/budget");
    }
  }, [profile, router]);

  // Fetch recommendations ONCE using the initial profile (no filters applied on backend)
  const { data: rawData, isLoading, error, refetch } = api.search.recommend.useQuery(
    {
      needs: {
        budgetType: profile.budgetType!,
        budgetAmount: profile.budgetAmount!,
        bodyStyle: profile.bodyStyle!,
        seating: profile.seating!,
        fuelType: profile.fuelType!,
        priorityMpg: profile.priorityMpg ?? false,
        priorityRange: profile.priorityRange ?? false,
        cargoNeeds: profile.cargoNeeds ?? "none",
        towingNeeds: profile.towingNeeds ?? "none",
        requireAwd: profile.requireAwd ?? false,
        safetyPriority: profile.safetyPriority ?? "medium",
        driverAssistNeeds: profile.driverAssistNeeds ?? [],
        mustHaveFeatures: profile.mustHaveFeatures ?? [],
        drivingPattern: profile.drivingPattern ?? "mixed",
        commuteLength: profile.commuteLength ?? "medium",
      },
      voiceEnabled: false,
    },
    {
      enabled: !!(profile.budgetType && profile.budgetAmount && profile.bodyStyle && profile.fuelType && profile.seating),
      retry: 2,
      // Cache the results - don't refetch on mount
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Client-side filtering based on local filter overrides
  const data = useMemo(() => {
    if (!rawData) return rawData;

    // Helper function to check if a vehicle matches the current filters
    const matchesFilters = (rec: typeof rawData.topPicks[0]): boolean => {
      // Get active filter values (local overrides or profile defaults)
      const activeBudgetType = localFilters.budgetType ?? profile.budgetType;
      const activeBudgetAmount = localFilters.budgetAmount ?? profile.budgetAmount;
      const activeBodyStyle = localFilters.bodyStyle ?? profile.bodyStyle;
      const activeFuelType = localFilters.fuelType ?? profile.fuelType;
      const activeSeating = localFilters.seating ?? profile.seating;

      // Budget filter
      if (activeBudgetType === 'cash' && activeBudgetAmount) {
        if (rec.vehicle.msrp > activeBudgetAmount) return false;
      }
      // TODO: Add monthly payment calculation for finance/lease

      // Body style filter
      if (activeBodyStyle && rec.vehicle.bodyStyle !== activeBodyStyle) {
        return false;
      }

      // Fuel type filter
      if (activeFuelType && rec.vehicle.fuelType !== activeFuelType) {
        return false;
      }

      // Seating filter
      if (activeSeating && rec.vehicle.seating < activeSeating) {
        return false;
      }

      return true;
    };

    // Apply filters to each tier
    return {
      ...rawData,
      topPicks: rawData.topPicks.filter(matchesFilters),
      strongContenders: rawData.strongContenders.filter(matchesFilters),
      exploreAlternatives: rawData.exploreAlternatives.filter(matchesFilters),
    };
  }, [rawData, localFilters, profile]);

  // Generate filter chips from active filters
  useEffect(() => {
    const chips: Array<{ id: string; label: string; value: string }> = [];
    
    const activeBudgetType = localFilters.budgetType ?? profile.budgetType;
    const activeBudgetAmount = localFilters.budgetAmount ?? profile.budgetAmount;
    const activeBodyStyle = localFilters.bodyStyle ?? profile.bodyStyle;
    const activeFuelType = localFilters.fuelType ?? profile.fuelType;
    const activeSeating = localFilters.seating ?? profile.seating;
    
    if (activeBudgetType && activeBudgetAmount) {
      chips.push({
        id: "budget",
        label: "Budget",
        value: activeBudgetType === "monthly" 
          ? `$${activeBudgetAmount}/mo` 
          : `$${activeBudgetAmount.toLocaleString()}`,
      });
    }
    
    if (activeBodyStyle) {
      chips.push({
        id: "bodyStyle",
        label: "Body Style",
        value: activeBodyStyle.charAt(0).toUpperCase() + activeBodyStyle.slice(1),
      });
    }
    
    if (activeFuelType) {
      chips.push({
        id: "fuelType",
        label: "Fuel Type",
        value: activeFuelType === "plugin-hybrid" ? "Plug-in Hybrid" : activeFuelType.charAt(0).toUpperCase() + activeFuelType.slice(1),
      });
    }
    
    if (activeSeating) {
      chips.push({
        id: "seating",
        label: "Seating",
        value: `${activeSeating}+ seats`,
      });
    }

    setFilterChips(chips);
  }, [localFilters, profile]);

  // Generate audio summary when data is available
  useEffect(() => {
    if (data && data.topPicks.length > 0) {
      const summary = `We found ${data.topPicks.length} top pick${data.topPicks.length > 1 ? 's' : ''} for you. ${
        data.topPicks.map((pick, i) => 
          `${i === 0 ? 'First' : i === 1 ? 'Second' : 'Third'}, the ${pick.vehicleId.replace(/-/g, ' ')}, ${pick.explanation}`
        ).join('. ')
      }`;
      setAudioSummary(summary);
    }
  }, [data]);

  // Handle filter changes with instant updates
  const handleFilterChange = (filters: Partial<FilterPanelFilters>) => {
    setIsFiltering(true);
    setLocalFilters((prev) => ({ ...prev, ...filters }));
    // Update the global profile state as well for persistence
    updateProfile(filters);
    // Reset filtering state after a brief moment
    setTimeout(() => setIsFiltering(false), 300);
  };

  const handleRemoveFilter = (filterId: string) => {
    // Individual filter removal - redirect to discovery to change that specific filter
    console.log("Remove filter:", filterId);
    router.push("/discovery/budget");
  };

  const handleClearAllFilters = () => {
    // Clear all local overrides and redirect to start over
    setLocalFilters({});
    router.push("/discovery/budget");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Finding your perfect vehicles...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Our AI is analyzing your preferences
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Unable to Load Recommendations
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error.message || "An error occurred while fetching recommendations. Please try again."}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => void refetch()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/discovery/budget"
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Start Over
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No results - show closest matches if explore alternatives exist
  if (!data || (data.topPicks.length === 0 && data.strongContenders.length === 0 && data.exploreAlternatives.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Exact Matches Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We couldn&apos;t find any vehicles matching all your criteria. Try adjusting your preferences, budget, or consider alternative options.
            </p>
            <div className="space-y-3">
              <Link
                href="/discovery/budget"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors w-full justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
                Adjust Preferences
              </Link>
              <Link
                href="/recommendations?relaxed=true"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full justify-center"
              >
                Show Closest Matches
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Partial results - show what we found with suggestion to relax filters
  const hasNoTopPicks = data.topPicks.length === 0;
  const hasOnlyAlternatives = data.strongContenders.length === 0 && data.exploreAlternatives.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/discovery/budget"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Adjust Preferences</span>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Recommendations
            </h1>
            <div className="w-32" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Audio Summary */}
        {audioSummary && (
          <div className="max-w-4xl mx-auto mb-6">
            <AudioPlayer
              text={audioSummary}
              autoPlay={false}
              showCaptions={true}
              onError={(error) => console.error("Audio playback error:", error)}
            />
          </div>
        )}

        {/* Filter Panel - NEW: Advanced filtering UI */}
        <FilterPanel
          filters={{
            budgetType: (localFilters.budgetType ?? profile.budgetType)!,
            budgetAmount: localFilters.budgetAmount ?? profile.budgetAmount ?? 0,
            bodyStyle: (localFilters.bodyStyle ?? profile.bodyStyle)!,
            fuelType: (localFilters.fuelType ?? profile.fuelType)!,
            seating: localFilters.seating ?? profile.seating ?? 5,
          }}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAllFilters}
        />

        {/* Filter Chips - Legacy: Simple chip display */}
        <FilterChips
          filters={filterChips}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
        />

        {/* Limited Results Warning */}
        {hasNoTopPicks && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                  Limited matches found
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {hasOnlyAlternatives 
                    ? "No vehicles perfectly match all your criteria. We're showing alternative options that come close."
                    : "We found some matches but they may not perfectly align with all your preferences. Consider adjusting your filters for better results."
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            {isFiltering ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Applying filters...</span>
              </span>
            ) : (
              <>
                <strong>Found {(data.topPicks.length + data.strongContenders.length + data.exploreAlternatives.length)} vehicles</strong> matching your criteria.
                We&apos;ve organized them into tiers based on how well they match your needs.
              </>
            )}
          </p>
        </div>

        {/* Recommendations Sections */}
        <TopPicks recommendations={data.topPicks as unknown as RecommendationWithVehicle[]} />
        <StrongContenders recommendations={data.strongContenders as unknown as RecommendationWithVehicle[]} />
        <ExploreAlternatives recommendations={data.exploreAlternatives as unknown as RecommendationWithVehicle[]} />
      </main>
    </div>
  );
}
