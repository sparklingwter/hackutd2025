"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type BudgetType = "monthly" | "cash";
export type BodyStyle = "sedan" | "suv" | "truck" | "van" | "coupe" | "hatchback";
export type FuelType = "gas" | "hybrid" | "electric" | "plugin-hybrid";
export type CargoNeed = "none" | "light" | "moderate" | "heavy";
export type TowingNeed = "none" | "light" | "moderate" | "heavy";
export type SafetyPriority = "low" | "medium" | "high";
export type DrivingPattern = "urban" | "highway" | "mixed";
export type CommuteLength = "short" | "medium" | "long";

export interface UserNeedsProfile {
  // Step 1: Budget
  budgetType?: BudgetType;
  budgetAmount?: number;

  // Step 2: Body Style
  bodyStyle?: BodyStyle;

  // Step 3: Preferences
  seating?: number;
  fuelType?: FuelType;
  priorityMpg?: boolean;
  priorityRange?: boolean;

  // Step 4: Features and Needs
  cargoNeeds?: CargoNeed;
  towingNeeds?: TowingNeed;
  requireAwd?: boolean;
  safetyPriority?: SafetyPriority;
  driverAssistNeeds?: string[];
  mustHaveFeatures?: string[];
  drivingPattern?: DrivingPattern;
  commuteLength?: CommuteLength;
}

interface DiscoveryContextType {
  profile: UserNeedsProfile;
  updateProfile: (updates: Partial<UserNeedsProfile>) => void;
  resetProfile: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const DiscoveryContext = createContext<DiscoveryContextType | undefined>(
  undefined
);

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserNeedsProfile>({
    priorityMpg: false,
    priorityRange: false,
    requireAwd: false,
    driverAssistNeeds: [],
    mustHaveFeatures: [],
  });
  const [currentStep, setCurrentStep] = useState(1);

  const updateProfile = (updates: Partial<UserNeedsProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const resetProfile = () => {
    setProfile({
      priorityMpg: false,
      priorityRange: false,
      requireAwd: false,
      driverAssistNeeds: [],
      mustHaveFeatures: [],
    });
    setCurrentStep(1);
  };

  return (
    <DiscoveryContext.Provider
      value={{ profile, updateProfile, resetProfile, currentStep, setCurrentStep }}
    >
      {children}
    </DiscoveryContext.Provider>
  );
}

export function useDiscovery() {
  const context = useContext(DiscoveryContext);
  if (context === undefined) {
    throw new Error("useDiscovery must be used within a DiscoveryProvider");
  }
  return context;
}
