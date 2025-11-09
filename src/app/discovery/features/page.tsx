"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, TrendingUp, Shield, Car, MapPin, 
  ArrowRight, ArrowLeft, CheckCircle2 
} from "lucide-react";
import { ProgressBar } from "~/components/discovery/ProgressBar";
import { useDiscovery } from "~/components/discovery/DiscoveryContext";
import type { 
  CargoNeed, 
  TowingNeed, 
  SafetyPriority, 
  DrivingPattern, 
  CommuteLength 
} from "~/components/discovery/DiscoveryContext";

const CARGO_NEEDS: { value: CargoNeed; label: string; description: string }[] = [
  { value: "none", label: "None", description: "Minimal cargo space" },
  { value: "light", label: "Light", description: "Groceries & errands" },
  { value: "moderate", label: "Moderate", description: "Weekend trips" },
  { value: "heavy", label: "Heavy", description: "Moving & hauling" },
];

const TOWING_NEEDS: { value: TowingNeed; label: string; description: string }[] = [
  { value: "none", label: "None", description: "No towing needed" },
  { value: "light", label: "Light", description: "Small trailer" },
  { value: "moderate", label: "Moderate", description: "Boat or camper" },
  { value: "heavy", label: "Heavy", description: "Large equipment" },
];

const SAFETY_PRIORITIES: { value: SafetyPriority; label: string }[] = [
  { value: "low", label: "Basic" },
  { value: "medium", label: "Important" },
  { value: "high", label: "Essential" },
];

const DRIVING_PATTERNS: { value: DrivingPattern; label: string }[] = [
  { value: "urban", label: "City Driving" },
  { value: "highway", label: "Highway" },
  { value: "mixed", label: "Mixed" },
];

const COMMUTE_LENGTHS: { value: CommuteLength; label: string }[] = [
  { value: "short", label: "< 10 miles" },
  { value: "medium", label: "10-30 miles" },
  { value: "long", label: "> 30 miles" },
];

const DRIVER_ASSIST_FEATURES = [
  { id: "adaptive-cruise", label: "Adaptive Cruise Control" },
  { id: "lane-keep", label: "Lane Keep Assist" },
  { id: "blind-spot", label: "Blind Spot Monitor" },
  { id: "auto-emergency-brake", label: "Auto Emergency Braking" },
  { id: "parking-assist", label: "Parking Assist" },
];

const MUST_HAVE_FEATURES = [
  { id: "apple-carplay", label: "Apple CarPlay" },
  { id: "android-auto", label: "Android Auto" },
  { id: "heated-seats", label: "Heated Seats" },
  { id: "sunroof", label: "Sunroof" },
  { id: "leather", label: "Leather Seats" },
  { id: "premium-audio", label: "Premium Audio" },
];

export default function FeaturesPage() {
  const router = useRouter();
  const { profile, updateProfile, setCurrentStep } = useDiscovery();
  
  const [cargoNeeds, setCargoNeeds] = useState<CargoNeed>(profile.cargoNeeds ?? "none");
  const [towingNeeds, setTowingNeeds] = useState<TowingNeed>(profile.towingNeeds ?? "none");
  const [requireAwd, setRequireAwd] = useState(profile.requireAwd ?? false);
  const [safetyPriority, setSafetyPriority] = useState<SafetyPriority>(profile.safetyPriority ?? "medium");
  const [drivingPattern, setDrivingPattern] = useState<DrivingPattern>(profile.drivingPattern ?? "mixed");
  const [commuteLength, setCommuteLength] = useState<CommuteLength>(profile.commuteLength ?? "medium");
  const [driverAssistNeeds, setDriverAssistNeeds] = useState<string[]>(profile.driverAssistNeeds ?? []);
  const [mustHaveFeatures, setMustHaveFeatures] = useState<string[]>(profile.mustHaveFeatures ?? []);

  useEffect(() => {
    setCurrentStep(4);
  }, [setCurrentStep]);

  const toggleDriverAssist = (featureId: string) => {
    setDriverAssistNeeds(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const toggleMustHave = (featureId: string) => {
    setMustHaveFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleSubmit = () => {
    updateProfile({
      cargoNeeds,
      towingNeeds,
      requireAwd,
      safetyPriority,
      drivingPattern,
      commuteLength,
      driverAssistNeeds,
      mustHaveFeatures,
    });
    
    // Navigate to recommendations page with the completed profile
    router.push("/recommendations");
  };

  const handleBack = () => {
    router.push("/discovery/preferences");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ProgressBar currentStep={4} />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mt-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Features & Needs
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Help us understand your specific requirements
          </p>
        </div>

        <div className="space-y-8">
          {/* Cargo Needs */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cargo Space Needs
              </label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CARGO_NEEDS.map((need) => (
                <button
                  key={need.value}
                  onClick={() => setCargoNeeds(need.value)}
                  className={`p-3 border-2 rounded-lg transition-all text-left ${
                    cargoNeeds === need.value
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {need.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {need.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Towing Needs */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Towing Capacity Needs
              </label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TOWING_NEEDS.map((need) => (
                <button
                  key={need.value}
                  onClick={() => setTowingNeeds(need.value)}
                  className={`p-3 border-2 rounded-lg transition-all text-left ${
                    towingNeeds === need.value
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {need.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {need.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AWD Requirement */}
          <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="flex items-center gap-3">
              <Car className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Require AWD or 4WD
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  All-wheel or four-wheel drive capability
                </div>
              </div>
            </div>
            <button
              onClick={() => setRequireAwd(!requireAwd)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                requireAwd ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  requireAwd ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Safety Priority */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Safety Feature Priority
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {SAFETY_PRIORITIES.map((priority) => (
                <button
                  key={priority.value}
                  onClick={() => setSafetyPriority(priority.value)}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    safetyPriority === priority.value
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {priority.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Driving Pattern */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Primary Driving Pattern
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {DRIVING_PATTERNS.map((pattern) => (
                <button
                  key={pattern.value}
                  onClick={() => setDrivingPattern(pattern.value)}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    drivingPattern === pattern.value
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {pattern.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Commute Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Daily Commute Length
            </label>
            <div className="grid grid-cols-3 gap-3">
              {COMMUTE_LENGTHS.map((length) => (
                <button
                  key={length.value}
                  onClick={() => setCommuteLength(length.value)}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    commuteLength === length.value
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {length.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Driver Assist Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Must-Have Driver Assist Features (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DRIVER_ASSIST_FEATURES.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => toggleDriverAssist(feature.id)}
                  className={`p-3 border-2 rounded-lg transition-all text-left flex items-center gap-2 ${
                    driverAssistNeeds.includes(feature.id)
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  {driverAssistNeeds.includes(feature.id) && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {feature.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Other Must-Have Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Other Must-Have Features (Optional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {MUST_HAVE_FEATURES.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => toggleMustHave(feature.id)}
                  className={`p-3 border-2 rounded-lg transition-all text-left flex items-center gap-2 ${
                    mustHaveFeatures.includes(feature.id)
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  {mustHaveFeatures.includes(feature.id) && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {feature.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              See Recommendations
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
