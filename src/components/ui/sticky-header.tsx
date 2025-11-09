"use client";

import Image from "next/image";

type StickyHeaderProps = {
  /** Control the base logo size (px). Make it bigger → header gets taller */
  logoSize?: number;
  /** Optional path if not using /public/logo */
  src?: string;
  alt?: string;
};

export default function StickyHeader({
  logoSize = 96,
  src = "/Toyota-logo.png",
  alt = "Logo",
}: StickyHeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
      role="banner"
    >
      {/* Header height is dictated by the logo + padding */}
      <div className="flex w-full items-center justify-center px-6 py-3">
        <Image
          src={src}
          alt={alt}
          width={logoSize}
          height={logoSize}
          className="object-contain"
          priority
        />
      </div>
    </header>
  );
}
