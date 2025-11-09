"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { api } from "~/trpc/react";
import { Breadcrumbs } from "~/components/vehicle/Breadcrumbs";
import { ImageGallery } from "~/components/vehicle/ImageGallery";
import { TrimSelector } from "~/components/vehicle/TrimSelector";
import { SpecsGrid } from "~/components/vehicle/SpecsGrid";
import { FeaturesList } from "~/components/vehicle/FeaturesList";
import { SafetyRatings } from "~/components/vehicle/SafetyRatings";
import { Button } from "~/components/ui/button";
import { useState } from "react";

/**
 * T045 [US7]: Vehicle Detail Page
 * Shows full vehicle information including trims, specs, gallery, features
 */
export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;
  const [selectedTrimId, setSelectedTrimId] = useState<string | null>(null);

  // Fetch vehicle details
  const { data: vehicle, isLoading: vehicleLoading, error: vehicleError } = api.vehicles.getById.useQuery({
    vehicleId,
  });

  // Fetch trims
  const { data: trimsData, isLoading: trimsLoading } = api.vehicles.getTrims.useQuery({
    vehicleId,
  });

  // Fetch selected trim details if a trim is selected
  const { data: selectedTrim, error: trimError } = api.vehicles.getTrimById.useQuery(
    {
      vehicleId,
      trimId: selectedTrimId!,
    },
    {
      enabled: !!selectedTrimId,
    }
  );

  const isLoading = vehicleLoading || trimsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (vehicleError || !vehicle) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-2xl font-bold">Vehicle Not Found</h2>
          <p className="text-muted-foreground">
            {vehicleError?.message ?? "The vehicle you're looking for doesn't exist or is no longer available."}
          </p>
          <div className="mt-4 flex gap-3">
            <Button onClick={() => router.push("/recommendations")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Vehicles
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const trims = trimsData?.trims ?? [];
  const currentTrim = selectedTrim ?? null;

  // Handle trim not found but vehicle exists
  const showTrimError = selectedTrimId && trimError && !selectedTrim;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Recommendations", href: "/recommendations" },
            { label: `${vehicle.year} ${vehicle.model}`, href: `/vehicles/${vehicle.id}` },
          ]}
        />

        {/* Trim Error Warning */}
        {showTrimError && (
          <div className="mb-6 mt-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Selected Trim Not Available
                </p>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  The trim you selected is no longer available. Showing base vehicle information instead.
                </p>
                <button
                  onClick={() => setSelectedTrimId(null)}
                  className="mt-2 text-sm font-medium text-yellow-800 underline hover:text-yellow-900 dark:text-yellow-200 dark:hover:text-yellow-100"
                >
                  Clear selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 mt-6">
          <h1 className="text-4xl font-bold">
            {vehicle.year} Toyota {vehicle.model}
          </h1>
          <p className="mt-2 text-xl text-muted-foreground">{vehicle.description}</p>
          <div className="mt-4 flex items-center gap-6">
            <div>
              <span className="text-3xl font-bold text-primary">
                ${(currentTrim?.msrp ?? vehicle.msrp).toLocaleString()}
              </span>
              <span className="ml-2 text-sm text-muted-foreground">MSRP</span>
            </div>
            {vehicle.safetyRating && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Safety Rating:</span>
                <span className="text-lg font-bold">{vehicle.safetyRating}/5</span>
              </div>
            )}
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-12">
          <ImageGallery 
            images={currentTrim?.imageUrls ?? vehicle.imageUrls} 
            alt={`${vehicle.year} Toyota ${vehicle.model}`}
          />
        </div>

        {/* Trim Selector */}
        {trims.length > 0 && (
          <div className="mb-12">
            <TrimSelector
              trims={trims}
              selectedTrimId={selectedTrimId}
              onTrimChange={setSelectedTrimId}
              baseMsrp={vehicle.msrp}
            />
          </div>
        )}

        {/* Specs Grid */}
        <div className="mb-12">
          <SpecsGrid
            vehicle={vehicle}
            trim={currentTrim}
          />
        </div>

        {/* Features List */}
        <div className="mb-12">
          <FeaturesList
            features={currentTrim?.features ?? vehicle.features}
            trimName={currentTrim?.name}
          />
        </div>

        {/* Safety Ratings */}
        {vehicle.safetyRating && (
          <div className="mb-12">
            <SafetyRatings
              rating={vehicle.safetyRating}
              features={vehicle.features.filter(f => 
                f.toLowerCase().includes('safety') || 
                f.toLowerCase().includes('airbag') ||
                f.toLowerCase().includes('brake') ||
                f.toLowerCase().includes('collision')
              )}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-12 flex flex-wrap gap-4">
          <Button size="lg" onClick={() => router.push(`/estimate?vehicleId=${vehicle.id}`)}>
            Get Estimate
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push(`/dealer?vehicleId=${vehicle.id}`)}>
            Find Dealers
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push(`/compare?add=${vehicle.id}`)}>
            Add to Compare
          </Button>
        </div>

        {/* Back Link */}
        <div className="border-t pt-8">
          <Link
            href="/recommendations"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recommendations
          </Link>
        </div>
      </div>
    </div>
  );
}
