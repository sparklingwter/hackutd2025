"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import { ComparisonTable } from "~/components/comparison/ComparisonTable";
import { ShareButton } from "~/components/comparison/ShareButton";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function ComparePageContent() {
  const searchParams = useSearchParams();
  const vehicleIdsParam = searchParams.get("ids");
  const vehicleIds = vehicleIdsParam ? vehicleIdsParam.split(",") : [];

  const { data, isLoading, error } = api.compare.getComparison.useQuery(
    { vehicleIds },
    { enabled: vehicleIds.length > 0 }
  );

  if (vehicleIds.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">No vehicles to compare</h1>
        <p className="mt-4 text-muted-foreground">
          Add at least 2 vehicles to your compare tray to see a side-by-side comparison.
        </p>
        <Button asChild className="mt-8">
          <Link href="/recommendations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recommendations
          </Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading comparison...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-destructive">Error loading comparison</h1>
        <p className="mt-4 text-muted-foreground">{error?.message ?? "Unknown error"}</p>
        <Button asChild className="mt-8">
          <Link href="/recommendations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recommendations
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Comparison</h1>
          <p className="mt-2 text-muted-foreground">
            Compare {data.vehicles.length} vehicle{data.vehicles.length > 1 ? "s" : ""} side-by-side
          </p>
        </div>
        <ShareButton vehicleIds={vehicleIds} />
      </div>

      <ComparisonTable
        vehicles={data.vehicles}
        categoryWinners={data.categoryWinners}
        comparisonMatrix={data.comparisonMatrix}
      />

      <div className="mt-8 text-center">
        <Button asChild variant="outline">
          <Link href="/recommendations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recommendations
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center">Loading...</div>}>
      <ComparePageContent />
    </Suspense>
  );
}
