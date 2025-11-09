"use client";

interface DifferenceToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function DifferenceToggle({ value, onChange }: DifferenceToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id="show-differences"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300"
      />
      <label htmlFor="show-differences" className="text-sm font-medium cursor-pointer">
        Show only differences
      </label>
    </div>
  );
}
