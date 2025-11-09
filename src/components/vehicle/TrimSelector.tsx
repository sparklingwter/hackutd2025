"use client";

import { Check } from "lucide-react";
import type { Trim } from "~/server/api/schemas";
import { Card, CardContent } from "~/components/ui/card";

interface TrimSelectorProps {
  trims: Trim[];
  selectedTrimId: string | null;
  onTrimChange: (trimId: string | null) => void;
  baseMsrp: number;
}

/**
 * T039 [P] [US7]: Trim Selector Component
 * Allows users to select different trim levels for the vehicle
 */
export function TrimSelector({ trims, selectedTrimId, onTrimChange, baseMsrp }: TrimSelectorProps) {
  if (trims.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Available Trims</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Base Model Option */}
        <Card
          className={`cursor-pointer transition-all ${
            selectedTrimId === null
              ? "border-primary ring-2 ring-primary"
              : "hover:border-muted-foreground"
          }`}
          onClick={() => onTrimChange(null)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">Base Model</h3>
                <p className="mt-1 text-2xl font-bold text-primary">
                  ${baseMsrp.toLocaleString()}
                </p>
              </div>
              {selectedTrimId === null && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trim Options */}
        {trims.map((trim) => (
          <Card
            key={trim.id}
            className={`cursor-pointer transition-all ${
              selectedTrimId === trim.id
                ? "border-primary ring-2 ring-primary"
                : "hover:border-muted-foreground"
            }`}
            onClick={() => onTrimChange(trim.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{trim.name}</h3>
                  <p className="mt-1 text-2xl font-bold text-primary">
                    ${trim.msrp.toLocaleString()}
                  </p>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p>{trim.engine}</p>
                    <p>{trim.horsepower} HP • {trim.torque} lb-ft</p>
                    <p>{trim.transmission} • {trim.driveType.toUpperCase()}</p>
                    {trim.zeroToSixty && (
                      <p>0-60 mph: {trim.zeroToSixty}s</p>
                    )}
                  </div>
                </div>
                {selectedTrimId === trim.id && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
