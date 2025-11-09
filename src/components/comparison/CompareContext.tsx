"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface CompareContextType {
  vehicleIds: string[];
  addVehicle: (vehicleId: string) => void;
  removeVehicle: (vehicleId: string) => void;
  clearAll: () => void;
  isInCompareTray: (vehicleId: string) => boolean;
  canAddMore: boolean;
  errorMessage: string | null;
  clearError: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_VEHICLES = 4;
const STORAGE_KEY = "compare-tray-vehicles";

export function CompareProvider({ children }: { children: ReactNode }) {
  const [vehicleIds, setVehicleIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[];
        setVehicleIds(parsed);
      } catch {
        // Ignore parse errors
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever vehicleIds change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicleIds));
    }
  }, [vehicleIds, isHydrated]);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const addVehicle = (vehicleId: string) => {
    if (vehicleIds.length >= MAX_COMPARE_VEHICLES) {
      setErrorMessage(`Compare tray is full. You can compare up to ${MAX_COMPARE_VEHICLES} vehicles at once. Remove a vehicle to add another.`);
      return;
    }
    if (vehicleIds.includes(vehicleId)) {
      return; // Already in tray
    }
    setVehicleIds((prev) => [...prev, vehicleId]);
    setErrorMessage(null); // Clear any existing errors
  };

  const removeVehicle = (vehicleId: string) => {
    setVehicleIds((prev) => prev.filter((id) => id !== vehicleId));
    setErrorMessage(null); // Clear errors when removing
  };

  const clearAll = () => {
    setVehicleIds([]);
    setErrorMessage(null);
  };

  const clearError = () => {
    setErrorMessage(null);
  };

  const isInCompareTray = (vehicleId: string) => {
    return vehicleIds.includes(vehicleId);
  };

  const canAddMore = vehicleIds.length < MAX_COMPARE_VEHICLES;

  return (
    <CompareContext.Provider
      value={{
        vehicleIds,
        addVehicle,
        removeVehicle,
        clearAll,
        isInCompareTray,
        canAddMore,
        errorMessage,
        clearError,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return context;
}
