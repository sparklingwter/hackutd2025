"use client";

/**
 * T041 [P] [US4]: Favorites section component
 * 
 * Displays user's favorited vehicles with option to remove and view details.
 */

import { useState, useEffect } from "react";
import { Heart, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getAnonymousFavorites, removeAnonymousFavorite } from "~/lib/localStorage";

export function Favorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    setIsLoading(true);
    const ids = getAnonymousFavorites();
    setFavoriteIds(ids);
    
    // In a real app, fetch vehicle details from API
    // For now, we'll just show the IDs
    setIsLoading(false);
  };

  const handleRemoveFavorite = (vehicleId: string) => {
    removeAnonymousFavorite(vehicleId);
    loadFavorites();
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="text-red-500" size={24} />
          <h2 className="text-xl font-semibold">Favorites</h2>
        </div>
        <p className="text-gray-500">Loading favorites...</p>
      </div>
    );
  }

  if (favoriteIds.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="text-red-500" size={24} />
          <h2 className="text-xl font-semibold">Favorites</h2>
        </div>
        <p className="text-gray-500">
          You haven&apos;t favorited any vehicles yet. Browse vehicles and click the heart icon to save your favorites.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="text-red-500" size={24} />
          <h2 className="text-xl font-semibold">Favorites</h2>
          <span className="text-sm text-gray-500">({favoriteIds.length})</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {favoriteIds.map((vehicleId) => (
          <div
            key={vehicleId}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{vehicleId}</h3>
                <p className="text-sm text-gray-500">Vehicle details loading...</p>
              </div>
              <button
                onClick={() => handleRemoveFavorite(vehicleId)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove from favorites"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/vehicles/${vehicleId}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                View Details
                <ExternalLink size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
