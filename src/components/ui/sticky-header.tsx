"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpIcon } from "lucide-react";
import { ThemeToggle } from "~/components/theme-toggle";

type StickyHeaderProps = {
  /** Control the base logo size (px). Make it bigger → header gets taller */
  logoSize?: number;
  /** Optional path if not using /public/logo */
  src?: string;
  alt?: string;
  /** Scroll threshold percentage (0-100) to switch to white logo */
  scrollThreshold?: number;
};

export default function StickyHeader({
  logoSize = 96,
  src = "/Toyota-logo.png",
  alt = "Logo",
  scrollThreshold = 10,
}: StickyHeaderProps) {
  const [useWhiteLogo, setUseWhiteLogo] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    // Create a MutationObserver to watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / document.documentElement.scrollHeight) * 100;
      setUseWhiteLogo(scrollPercentage > scrollThreshold);
    };

    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [scrollThreshold]);

  // Only use white logo in dark mode when scrolled
  const logoSrc = isDarkMode && useWhiteLogo ? "/toyota-logo-white.png" : src;

  return (
    <header
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 text-foreground shadow-sm"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
      role="banner"
    >
      {/* Header height is dictated by the logo + padding */}
      <div className="flex w-full items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
        
        <Image
          src={logoSrc}
          alt={alt}
          width={logoSize}
          height={logoSize}
          className="object-contain transition-opacity duration-300"
          priority
        />
        
        <div className="flex items-center gap-4">
          <Link href="/result">
            <button className="group relative px-6 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-primary/50 active:scale-95 overflow-hidden">
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              
              <span className="relative z-10 flex items-center gap-2">
                View Results
                <ArrowUpIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </span>
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
