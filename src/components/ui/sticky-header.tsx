"use client";

import Image from "next/image";
import Link from "next/link";

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
      className="sticky top-0 z-50 border-b border-primary/20 bg-primary/80 backdrop-blur-md text-primary-foreground shadow-xl"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
      role="banner"
    >
      {/* Header height is dictated by the logo + padding */}
      <div className="flex w-full items-center justify-center px-6 py-3">
        <Link href="/" className="cursor-pointer transition-opacity hover:opacity-80">
          <Image
            src={src}
            alt={alt}
            width={logoSize}
            height={logoSize}
            className="object-contain drop-shadow-lg"
            priority
          />
        </Link>
      </div>
    </header>
  );
}
