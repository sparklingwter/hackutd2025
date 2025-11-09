"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "~/components/theme-toggle";

type StickyHeaderProps = {
  /** Base logo size (px). Default = 200 */
  logoSize?: number;
  /** Logo path (default /toyota-logo.png) */
  src?: string;
  /** Alt text for the logo */
  alt?: string;
};

export default function StickyHeader({
  logoSize = 200,
  src = "/toyota-logo.png",
  alt = "Logo",
}: StickyHeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Detect dark mode via 'dark' class on <html>
    const checkDarkMode = () => {
      if (typeof document !== "undefined") {
        setIsDarkMode(document.documentElement.classList.contains("dark"));
      }
    };

    checkDarkMode();

    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Instantly switch to white logo when dark mode is active
  const logoSrc = useMemo(
    () => (isDarkMode ? "/toyota-logo-white.png" : src),
    [isDarkMode, src]
  );

  return (
    <header
      className="sticky top-0 z-50 bg-secondary text-primary-foreground shadow-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
      role="banner"
    >
      <div className="relative mx-auto flex w-full items-center justify-center py-4">
        {/* Centered, large logo */}
        <Image
          src={logoSrc}
          alt={alt}
          width={logoSize}
          height={logoSize}
          className="object-contain"
          priority
        />

        {/* Theme toggle pinned to the right */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
