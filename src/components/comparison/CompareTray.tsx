"use client";

import Link from "next/link";
import { useCompare } from "~/components/comparison/CompareContext";
import { Button } from "~/components/ui/button";
import { X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export function CompareTray() {
  const { vehicleIds, removeVehicle, clearAll } = useCompare();
  const [isVisible, setIsVisible] = useState(false);

  // Only show tray if there are vehicles
  useEffect(() => {
    setIsVisible(vehicleIds.length > 0);
  }, [vehicleIds.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">
              Compare Tray ({vehicleIds.length}/4)
            </div>
            <div className="flex gap-2">
              {vehicleIds.map((vehicleId) => (
                <div
                  key={vehicleId}
                  className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2 text-sm"
                >
                  <span className="max-w-32 truncate">{vehicleId}</span>
                  <button
                    onClick={() => removeVehicle(vehicleId)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={`Remove ${vehicleId}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear All
            </Button>
            <Button asChild size="sm" disabled={vehicleIds.length < 2}>
              <Link href={`/compare?ids=${vehicleIds.join(",")}`}>
                Compare Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
