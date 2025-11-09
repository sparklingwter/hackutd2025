"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useDiscovery } from "~/components/discovery/DiscoveryContext";
import { TopPicks } from "~/components/recommendations/TopPicks";
import { StrongContenders } from "~/components/recommendations/StrongContenders";
import { ExploreAlternatives } from "~/components/recommendations/ExploreAlternatives";
import { FilterChips } from "~/components/recommendations/FilterChips";
import { AudioPlayer } from "~/components/voice/AudioPlayer";
import { api } from "~/trpc/react";

import type { Recommendation, Vehicle } from "~/server/api/schemas";

type RecommendationWithVehicle = Recommendation & {
  vehicle: Pick<Vehicle, "id" | "model" | "year" | "msrp" | "bodyStyle" | "fuelType" | "mpgCombined" | "seating" | "imageUrls">;
};

export default function RecommendationsPage() {
  const router = useRouter();
  const { profile } = useDiscovery();
  const [filterChips, setFilterChips] = useState<Array<{ id: string; label: string; value: string }>>([]);
  const [audioSummary, setAudioSummary] = useState<string>("");

  // Check if profile is complete
  useEffect(() => {
    if (!profile.budgetType || !profile.budgetAmount || !profile.bodyStyle || !profile.fuelType || !profile.seating) {
      // Redirect back to discovery if incomplete
      router.push("/discovery/budget");
    }
  }, [profile, router]);

  // Generate filter chips from profile
  useEffect(() => {
    const chips: Array<{ id: string; label: string; value: string }> = [];
    
    if (profile.budgetType && profile.budgetAmount) {
      chips.push({
        id: "budget",
        label: "Budget",
        value: profile.budgetType === "monthly" 
          ? `$${profile.budgetAmount}/mo` 
          : `$${profile.budgetAmount.toLocaleString()}`,
      });
    }
    
    if (profile.bodyStyle) {
      chips.push({
        id: "bodyStyle",
        label: "Body Style",
        value: profile.bodyStyle.charAt(0).toUpperCase() + profile.bodyStyle.slice(1),
      });
    }
    
    if (profile.fuelType) {
      chips.push({
        id: "fuelType",
        label: "Fuel Type",
        value: profile.fuelType === "plugin-hybrid" ? "Plug-in Hybrid" : profile.fuelType.charAt(0).toUpperCase() + profile.fuelType.slice(1),
      });
    }
    
    if (profile.seating) {
      chips.push({
        id: "seating",
        label: "Seating",
        value: `${profile.seating}+ seats`,
      });
    }

    setFilterChips(chips);
  }, [profile]);

  // Fetch recommendations using tRPC
  const { data, isLoading, error, refetch } = api.search.recommend.useQuery(
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
    }
  );

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

  const handleRemoveFilter = (filterId: string) => {
    // In a full implementation, this would update the profile and refetch
    console.log("Remove filter:", filterId);
    // For now, just redirect back to start a new discovery
    router.push("/discovery/budget");
  };

  const handleClearAllFilters = () => {
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

  // No results
  if (!data || (data.topPicks.length === 0 && data.strongContenders.length === 0 && data.exploreAlternatives.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Vehicles Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We couldn&apos;t find any vehicles matching all your criteria. Try adjusting your preferences or budget.
            </p>
            <Link
              href="/discovery/budget"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Adjust Preferences
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Filter Chips */}
        <FilterChips
          filters={filterChips}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
        />

        {/* Results Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Found {(data.topPicks.length + data.strongContenders.length + data.exploreAlternatives.length)} vehicles</strong> matching your criteria.
            We&apos;ve organized them into tiers based on how well they match your needs.
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
