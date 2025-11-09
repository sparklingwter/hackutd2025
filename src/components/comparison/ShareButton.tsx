"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { Share2, Check, Copy } from "lucide-react";

interface ShareButtonProps {
  vehicleIds: string[];
}

export function ShareButton({ vehicleIds }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const generateShareLink = api.compare.generateShareLink.useMutation();

  const handleShare = async () => {
    try {
      const result = await generateShareLink.mutateAsync({ vehicleIds });
      await navigator.clipboard.writeText(result.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to generate share link:", error);
      alert("Failed to generate share link. Please try again.");
    }
  };

  return (
    <Button onClick={handleShare} disabled={generateShareLink.isPending || copied} variant="outline">
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Copied!
        </>
      ) : generateShareLink.isPending ? (
        <>
          <Copy className="mr-2 h-4 w-4 animate-pulse" />
          Generating...
        </>
      ) : (
        <>
          <Share2 className="mr-2 h-4 w-4" />
          Share Comparison
        </>
      )}
    </Button>
  );
}
