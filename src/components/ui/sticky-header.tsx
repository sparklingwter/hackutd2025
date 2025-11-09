"use client";

type StickyHeaderProps = {
  name: string;
  left?: React.ReactNode;   // optional: e.g., back button
  right?: React.ReactNode;  // optional: e.g., settings icon
};

export default function StickyHeader({ name = "FindMyYota", left, right }: StickyHeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
      role="banner"
    >
      <div className="mx-auto grid h-24 w-full max-w-7xl grid-cols-3 items-center px-8">
        {/* Left slot (optional, keeps symmetry) */}
        <div className="justify-self-start">
          {left ?? <span className="inline-block w-10" aria-hidden />}
        </div>

        {/* Center name */}
        <h1 className="justify-self-center text-4xl font-extrabold tracking-tight">
          {name}
        </h1>

        {/* Right slot (optional, keeps symmetry) */}
        <div className="justify-self-end">
          {right ?? <span className="inline-block w-10" aria-hidden />}
        </div>
      </div>
    </header>
  );
}