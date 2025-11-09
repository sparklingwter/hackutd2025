"use client";

/**
 * T045 [P] [US4]: Favorite button component
 * 
 * Allows users to add/remove vehicles from favorites.
 * Works for both anonymous (localStorage) and authenticated (Firestore) users.
 */

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  isVehicleFavorited,
  addAnonymousFavorite,
  removeAnonymousFavorite,
} from "~/lib/localStorage";

interface FavoriteButtonProps {
  vehicleId: string;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function FavoriteButton({
  vehicleId,
  className,
  showLabel = false,
  size = "md",
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if vehicle is favorited on mount
  useEffect(() => {
    setIsFavorited(isVehicleFavorited(vehicleId));
  }, [vehicleId]);

  const handleToggleFavorite = async () => {
    setIsLoading(true);
    
    try {
      if (isFavorited) {
        removeAnonymousFavorite(vehicleId);
        setIsFavorited(false);
      } else {
        addAnonymousFavorite(vehicleId);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border-2 transition-all",
        isFavorited
          ? "border-red-500 bg-red-500 text-white hover:bg-red-600"
          : "border-gray-300 bg-white text-gray-600 hover:border-red-500 hover:text-red-500",
        isLoading && "opacity-50 cursor-not-allowed",
        sizeClasses[size],
        className
      )}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        size={iconSizes[size]}
        className={cn(
          "transition-all",
          isFavorited && "fill-current"
        )}
      />
      {showLabel && (
        <span className="text-sm font-medium">
          {isFavorited ? "Favorited" : "Favorite"}
        </span>
      )}
    </button>
  );
}
