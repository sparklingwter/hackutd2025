"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getCarImageUrl } from "~/lib/storage";

interface CarImageProps {
  imagePath: string;
  alt: string;
  fill?: boolean;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * Component that loads car images from Firebase Storage
 * Handles loading states and fallback for missing images
 */
export default function CarImage({
  imagePath,
  alt,
  fill = false,
  className = "",
  width,
  height,
  priority = false,
}: CarImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadImage() {
      try {
        setLoading(true);
        const url = await getCarImageUrl(imagePath);
        
        if (isMounted) {
          setImageUrl(url);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load car image:", err);
        if (isMounted) {
          setLoading(false);
          // Set fallback image
          setImageUrl("/placeholder-car.svg");
        }
      }
    }

    void loadImage();

    return () => {
      isMounted = false;
    };
  }, [imagePath]);

  if (loading) {
    return (
      <div
        className={`bg-muted animate-pulse ${className} ${fill ? "absolute inset-0" : ""}`}
        style={!fill ? { width, height } : undefined}
      />
    );
  }

  if (!imageUrl) {
    return (
      <div
        className={`bg-muted flex items-center justify-center ${className} ${fill ? "absolute inset-0" : ""}`}
        style={!fill ? { width, height } : undefined}
      >
        <span className="text-muted-foreground text-sm">No image</span>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className={className}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
