import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DiscoveryProvider } from "~/components/discovery/DiscoveryContext";

export default function DiscoveryLayout({ children }: { children: ReactNode }) {
  return (
    <DiscoveryProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Home</span>
              </Link>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Vehicle Discovery
              </h1>
              <div className="w-24" /> {/* Spacer for centering */}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
          <div className="container mx-auto px-4 py-6">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Your preferences are saved locally in your browser. No account required.
            </p>
          </div>
        </footer>
      </div>
    </DiscoveryProvider>
  );
}
