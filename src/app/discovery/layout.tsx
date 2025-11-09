"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";

export default function DiscoveryLayout({ children }: { children: ReactNode }) {
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  return (
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
            {/* Voice Toggle */}
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                voiceEnabled
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              title={voiceEnabled ? "Voice enabled (coming soon)" : "Enable voice (coming soon)"}
            >
              {voiceEnabled ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span className="text-xs font-medium hidden sm:inline">Voice On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="text-xs font-medium hidden sm:inline">Voice Off</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {voiceEnabled && (
          <div className="max-w-3xl mx-auto mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Voice Mode:</strong> Voice input is enabled but not yet fully integrated. 
              You can still use the text-based form below. Voice features coming soon!
            </p>
          </div>
        )}
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
  );
}
