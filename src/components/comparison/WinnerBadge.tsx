"use client";

import { Trophy } from "lucide-react";

export function WinnerBadge() {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800"
      title="Best in category"
    >
      <Trophy className="h-3 w-3" />
      Best
    </div>
  );
}
