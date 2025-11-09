"use client";

import { Button } from "~/components/ui/button";
import { useCompare } from "~/components/comparison/CompareContext";
import { Plus, Check } from "lucide-react";

interface AddToCompareButtonProps {
  vehicleId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function AddToCompareButton({
  vehicleId,
  variant = "outline",
  size = "default",
}: AddToCompareButtonProps) {
  const { addVehicle, removeVehicle, isInCompareTray, canAddMore } = useCompare();

  const isAdded = isInCompareTray(vehicleId);

  const handleClick = () => {
    if (isAdded) {
      removeVehicle(vehicleId);
    } else {
      addVehicle(vehicleId);
    }
  };

  return (
    <Button
      variant={isAdded ? "default" : variant}
      size={size}
      onClick={handleClick}
      disabled={!isAdded && !canAddMore}
      aria-label={isAdded ? "Remove from compare" : "Add to compare"}
    >
      {isAdded ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          In Compare
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          Compare
        </>
      )}
    </Button>
  );
}
