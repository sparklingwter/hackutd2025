import Link from "next/link";
import { DISCLAIMERS } from "~/config/disclaimers";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Toyota Vehicle Finder</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered vehicle discovery and comparison platform
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/discovery/budget" className="text-muted-foreground hover:text-foreground">
                  Start Discovery
                </Link>
              </li>
              <li>
                <Link href="/recommendations" className="text-muted-foreground hover:text-foreground">
                  Browse Vehicles
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-muted-foreground hover:text-foreground">
                  Compare
                </Link>
              </li>
              <li>
                <Link href="/dealer" className="text-muted-foreground hover:text-foreground">
                  Find Dealers
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Tools</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/estimate" className="text-muted-foreground hover:text-foreground">
                  Payment Calculator
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-foreground">
                  Saved Favorites
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimers */}
        <div className="mt-8 space-y-4 border-t pt-8">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs text-muted-foreground">
              <strong>Important Notice:</strong> {DISCLAIMERS.aiRecommendations}
            </p>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p className="mb-2">{DISCLAIMERS.pricing}</p>
            <p>{DISCLAIMERS.noWarranty}</p>
          </div>
        </div>

        {/* AI & Technology Disclosures */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4">
            <span>Powered by Google Gemini AI</span>
            <span>•</span>
            <span>Voice synthesis by ElevenLabs</span>
          </div>
          <div>
            <span>© {currentYear} Toyota Vehicle Finder. All rights reserved.</span>
          </div>
        </div>

        {/* Final Legal Note */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>
            This is an independent vehicle discovery tool. Not affiliated with or endorsed by Toyota Motor Corporation.
          </p>
        </div>
      </div>
    </footer>
  );
}
