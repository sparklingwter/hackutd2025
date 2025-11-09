"use client";

import { useState } from "react";
import { WinnerBadge } from "~/components/comparison/WinnerBadge";
import { DifferenceToggle } from "~/components/comparison/DifferenceToggle";

interface Vehicle {
  id: string;
  model: string;
  year: number;
  bodyStyle: string;
  msrp: number;
  mpgCombined: number | null;
  seating: number;
  cargoVolume: number;
  awd: boolean;
  features: string[];
  imageUrls: string[];
}

interface CategoryWinners {
  lowestPrice: string;
  highestMpg: string;
  mostCargo: string;
  highestTowing: string;
  highestSafetyRating: string;
  mostHorsepower: string;
}

type ComparisonMatrix = Record<string, Record<string, unknown>>;

interface ComparisonTableProps {
  vehicles: Vehicle[];
  categoryWinners: CategoryWinners;
  comparisonMatrix: ComparisonMatrix;
}

export function ComparisonTable({ vehicles, categoryWinners, comparisonMatrix }: ComparisonTableProps) {
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);

  // Helper to check if values are different across vehicles
  const isDifferent = (category: keyof ComparisonMatrix[string]) => {
    const values = vehicles.map((v) => comparisonMatrix[v.id]?.[category]);
    return new Set(values.map((v) => JSON.stringify(v))).size > 1;
  };

  const categories = [
    { key: "price" as const, label: "Price (MSRP)", winner: "lowestPrice" as const },
    { key: "mpg" as const, label: "MPG (Combined)", winner: "highestMpg" as const },
    { key: "seating" as const, label: "Seating Capacity", winner: null },
    { key: "cargo" as const, label: "Cargo Volume (cu ft)", winner: "mostCargo" as const },
    { key: "awd" as const, label: "AWD Available", winner: null },
  ];

  return (
    <div className="space-y-4">
      <DifferenceToggle value={showOnlyDifferences} onChange={setShowOnlyDifferences} />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border bg-muted p-4 text-left font-semibold">Category</th>
              {vehicles.map((vehicle) => (
                <th key={vehicle.id} className="border bg-muted p-4 text-center font-semibold">
                  <div className="mb-2">
                    {vehicle.year} {vehicle.model}
                  </div>
                  {vehicle.imageUrls[0] && (
                    <img
                      src={vehicle.imageUrls[0]}
                      alt={`${vehicle.year} ${vehicle.model}`}
                      className="mx-auto h-20 w-auto object-contain"
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map(({ key, label, winner }) => {
              const different = isDifferent(key);
              if (showOnlyDifferences && !different) return null;

              return (
                <tr key={key} className={different ? "bg-accent/10" : ""}>
                  <td className="border p-4 font-medium">{label}</td>
                  {vehicles.map((vehicle) => {
                    const value = comparisonMatrix[vehicle.id]?.[key];
                    const isWinner = winner && categoryWinners[winner] === vehicle.id;

                    return (
                      <td key={vehicle.id} className="border p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {formatValue(key, value)}
                          {isWinner && <WinnerBadge />}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return "—";

  switch (key) {
    case "price":
      return `$${Number(value).toLocaleString()}`;
    case "mpg":
      return typeof value === "number" ? `${value} mpg` : "—";
    case "cargo":
      return typeof value === "number" ? `${value} cu ft` : "—";
    case "seating":
      return typeof value === "number" ? `${value} seats` : "—";
    case "awd":
      return value ? "Yes" : "No";
    default:
      return typeof value === "string" || typeof value === "number" ? String(value) : "—";
  }
}
