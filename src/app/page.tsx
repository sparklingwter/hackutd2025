import Link from "next/link";
import { ArrowRight, Sparkles, Car, Calculator } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo and Badge */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Car className="w-8 h-8 text-red-600" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              FindMyYota
            </h1>
          </div>

          {/* AI Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Recommendations
          </div>

          {/* Hero Description */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4">
            Find your perfect Toyota in minutes
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12">
            Answer a few questions about your needs, and let our AI guide you to vehicles that match your lifestyle, budget, and preferences.
          </p>

          {/* CTA Button */}
          <Link
            href="/discovery/budget"
            className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Start Discovery Journey
            <ArrowRight className="w-5 h-5" />
          </Link>

          {/* Secondary Info */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            No account required • Save preferences locally • Compare up to 4 vehicles
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI-Guided Discovery
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Answer questions about your needs and let AI recommend the perfect vehicles for you.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <Car className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Side-by-Side Comparison
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Compare specs, features, and pricing across multiple vehicles to make an informed decision.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <Calculator className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Cost Estimation
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get detailed estimates for cash, finance, or lease options with transparent breakdowns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
