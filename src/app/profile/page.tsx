"use client";

/**
 * T040 [US4]: Profile page
 * 
 * Main profile page displaying user's saved data:
 * - Favorites
 * - Saved searches
 * - Saved comparisons
 * - Saved estimates
 */

import { User } from "lucide-react";
import { Favorites } from "~/components/profile/Favorites";
import { SavedSearches } from "~/components/profile/SavedSearches";
import { SavedCompareSets } from "~/components/profile/SavedCompareSets";
import { SavedEstimates } from "~/components/profile/SavedEstimates";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="text-blue-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600">
                Manage your saved vehicles, searches, comparisons, and estimates
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner - Anonymous User */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You are currently using anonymous storage. Your data is saved
            locally in your browser. Sign in to sync your data across devices.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Favorites */}
          <Favorites />

          {/* Saved Searches */}
          <SavedSearches />

          {/* Saved Comparisons */}
          <SavedCompareSets />

          {/* Saved Estimates */}
          <SavedEstimates />
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-gray-100 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            Your data is stored locally on this device. Clear your browser data will remove all
            saved information.
          </p>
        </div>
      </div>
    </div>
  );
}
