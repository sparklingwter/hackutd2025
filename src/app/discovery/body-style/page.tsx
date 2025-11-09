"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Car, Truck, Users, ArrowRight, ArrowLeft } from "lucide-react";
import { ProgressBar } from "~/components/discovery/ProgressBar";
import { useDiscovery } from "~/components/discovery/DiscoveryContext";
import type { BodyStyle } from "~/components/discovery/DiscoveryContext";

const BODY_STYLES: { value: BodyStyle; label: string; icon: typeof Car; description: string }[] = [
  { value: "sedan", label: "Sedan", icon: Car, description: "Comfortable daily driver" },
  { value: "suv", label: "SUV", icon: Users, description: "Spacious and versatile" },
  { value: "truck", label: "Truck", icon: Truck, description: "Heavy-duty capability" },
  { value: "van", label: "Van", icon: Users, description: "Maximum passenger space" },
  { value: "coupe", label: "Coupe", icon: Car, description: "Sporty and stylish" },
  { value: "hatchback", label: "Hatchback", icon: Car, description: "Compact and practical" },
];

export default function BodyStylePage() {
  const router = useRouter();
  const { profile, updateProfile, setCurrentStep } = useDiscovery();
  
  const [bodyStyle, setBodyStyle] = useState<BodyStyle | undefined>(
    profile.bodyStyle
  );

  useEffect(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);

  const handleNext = () => {
    if (!bodyStyle) {
      alert("Please select a body style");
      return;
    }

    updateProfile({ bodyStyle });
    router.push("/discovery/preferences");
  };

  const handleBack = () => {
    router.push("/discovery/budget");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ProgressBar currentStep={2} />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mt-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            What type of vehicle are you looking for?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose the body style that best fits your needs
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {BODY_STYLES.map((style) => {
            const Icon = style.icon;
            return (
              <button
                key={style.value}
                onClick={() => setBodyStyle(style.value)}
                className={`p-6 border-2 rounded-lg transition-all hover:shadow-md ${
                  bodyStyle === style.value
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                <Icon className="w-8 h-8 mx-auto mb-3 text-gray-700 dark:text-gray-300" />
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {style.label}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {style.description}
                </div>
              </button>
            );
          })}
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
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
