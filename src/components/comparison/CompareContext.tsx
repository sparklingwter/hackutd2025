"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface CompareContextType {
  vehicleIds: string[];
  addVehicle: (vehicleId: string) => void;
  removeVehicle: (vehicleId: string) => void;
  clearAll: () => void;
  isInCompareTray: (vehicleId: string) => boolean;
  canAddMore: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_VEHICLES = 4;
const STORAGE_KEY = "compare-tray-vehicles";

export function CompareProvider({ children }: { children: ReactNode }) {
  const [vehicleIds, setVehicleIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

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

  const addVehicle = (vehicleId: string) => {
    if (vehicleIds.length >= MAX_COMPARE_VEHICLES) {
      alert(`Compare tray is full (max ${MAX_COMPARE_VEHICLES} vehicles)`);
      return;
    }
    if (vehicleIds.includes(vehicleId)) {
      return; // Already in tray
    }
    setVehicleIds((prev) => [...prev, vehicleId]);
  };

  const removeVehicle = (vehicleId: string) => {
    setVehicleIds((prev) => prev.filter((id) => id !== vehicleId));
  };

  const clearAll = () => {
    setVehicleIds([]);
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
