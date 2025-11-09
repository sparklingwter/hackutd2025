"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import StickyHeader from "~/components/ui/sticky-header";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Search, ArrowRight, ArrowUp, Plus, CheckCircle2, AlertTriangle } from "lucide-react";

// --- Mock inventory (tags are lowercase keywords) ---
type Car = {
  id: string;
  name: string;
  img: string;
  description: string;
  tags: string[]; // e.g. ["toyota", "suv", "awd", "hybrid"]
  price: string;  // display-only
};

const CARS: Car[] = [
  {
    id: "rav4-hybrid-awd",
    name: "Toyota RAV4 Hybrid XSE (AWD)",
    img: "/cars/rav4-hybrid.jpg",
    description: "Efficient compact SUV with e-AWD, great for families and weekend trips.",
    tags: ["toyota", "suv", "hybrid", "awd", "4wd", "economy"],
    price: "$36,990",
  },
  {
    id: "highlander-hybrid-awd",
    name: "Toyota Highlander Hybrid (AWD)",
    img: "/cars/highlander-hybrid.jpg",
    description: "Three-row hybrid SUV with confident all-weather capability.",
    tags: ["toyota", "suv", "hybrid", "awd", "family"],
    price: "$45,250",
  },
  {
    id: "tacoma-4wd-trd",
    name: "Toyota Tacoma TRD Off-Road (4WD)",
    img: "/cars/tacoma.jpg",
    description: "Mid-size truck with 4WD and off-road tuning for rugged adventures.",
    tags: ["toyota", "truck", "4wd", "offroad", "towing"],
    price: "$41,100",
  },
  {
    id: "camry-hybrid",
    name: "Toyota Camry Hybrid XLE",
    img: "/cars/camry-hybrid.jpg",
    description: "Comfortable hybrid sedan with excellent mpg and safety tech.",
    tags: ["toyota", "sedan", "hybrid", "economy"],
    price: "$34,500",
  },
  {
    id: "crown-awd-hybridmax",
    name: "Toyota Crown Platinum (AWD Hybrid MAX)",
    img: "/cars/crown.jpg",
    description: "Upscale, sporty liftback with powerful Hybrid MAX and AWD.",
    tags: ["toyota", "sedan", "awd", "hybrid", "luxury", "sport"],
    price: "$53,000",
  },
  {
    id: "bZ4X-ev-awd",
    name: "Toyota bZ4X (EV AWD)",
    img: "/cars/bz4x.jpg",
    description: "All-electric crossover with available dual-motor AWD.",
    tags: ["toyota", "ev", "crossover", "awd", "suv"],
    price: "$42,350",
  },
];

// --- Keyword dictionary & extraction ---
const KEYWORD_ALIASES: Record<string, string[]> = {
  "4wd": ["4wd", "4x4", "four-wheel drive", "four wheel drive"],
  "awd": ["awd", "all-wheel drive", "all wheel drive"],
  "fwd": ["fwd", "front-wheel drive", "front wheel drive"],
  "rwd": ["rwd", "rear-wheel drive", "rear wheel drive"],
  "hybrid": ["hybrid", "phev", "plug-in hybrid", "plug in hybrid"],
  "ev": ["ev", "electric", "battery electric", "bev"],
  "suv": ["suv", "crossover"],
  "truck": ["truck", "pickup"],
  "sedan": ["sedan"],
  "coupe": ["coupe"],
  "hatchback": ["hatchback"],
  "minivan": ["minivan", "van"],
  "luxury": ["luxury", "premium"],
  "economy": ["economy", "budget", "mpg", "efficient"],
  "sport": ["sport", "sporty", "turbo"],
  "offroad": ["offroad", "off-road", "trail"],
  "towing": ["towing", "tow"],
  "family": ["family", "3-row", "3 row", "seven seater", "8 seater"],
};

const FLAT_KEYWORDS = Object.keys(KEYWORD_ALIASES);

function extractKeywords(text: string): string[] {
  const q = text.toLowerCase();
  const found = new Set<string>();
  for (const canonical of FLAT_KEYWORDS) {
    const aliases = KEYWORD_ALIASES[canonical];
    if (aliases && aliases.some(a => q.includes(a))) {
      found.add(canonical);
    }
  }
  // If user mentions "toyota" or "yota", no need to add—inventory is Toyota-only
  return Array.from(found);
}

export default function ResultPage() {
  const [prompt, setPrompt] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Detect keywords from prompt; merge with manual selected ones (unique)
  const detected = useMemo(() => extractKeywords(prompt), [prompt]);
  const activeFilters = useMemo(() => {
    const set = new Set<string>([...detected, ...selected]);
    return Array.from(set);
  }, [detected, selected]);

  // Filter cars: show those matching ANY active filter (if none, show all)
  const filteredCars = useMemo(() => {
    if (activeFilters.length === 0) return CARS;
    return CARS.filter(c => c.tags.some(t => activeFilters.includes(t)));
  }, [activeFilters]);

  const toggleManual = (kw: string) => {
    setSelected(prev =>
      prev.includes(kw) ? prev.filter(x => x !== kw) : [...prev, kw]
    );
  };

  const addCompare = (id: string) => {
    setError(null);
    setCompareIds(prev => {
      if (prev.includes(id)) return prev; // no dup
      if (prev.length >= 3) {
        setError("You can compare up to 3 cars.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const removeCompare = (id: string) => {
    setError(null);
    setCompareIds(prev => prev.filter(x => x !== id));
  };

  return (
    <>
      <StickyHeader />

      <main className="relative mx-auto w-full max-w-7xl px-4 py-8 text-foreground min-h-screen bg-white dark:bg-gradient-to-b dark:from-background dark:via-background dark:to-muted/20">
        {/* Top row: Filters (left) + Chatbox (center) */}
        <div className="grid grid-cols-12 gap-6">
          {/* Filter card (left of chatbox) */}
          <aside className="col-span-12 md:col-span-4 lg:col-span-3">
            <Card className="rounded-2xl shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Detected from prompt */}
                <div>
                  <div className="mb-2 text-sm text-muted-foreground">Detected from your prompt</div>
                  <div className="flex flex-wrap gap-2">
                    {detected.length === 0 ? (
                      <span className="text-sm text-muted-foreground">No keywords yet</span>
                    ) : (
                      detected.map(k => (
                        <span
                          key={`det-${k}`}
                          className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm"
                        >
                          {k}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Manual toggles */}
                <div>
                  <div className="mb-2 text-sm text-muted-foreground">Quick add/remove</div>
                  <div className="flex flex-wrap gap-2">
                    {FLAT_KEYWORDS.map(k => {
                      const active = activeFilters.includes(k);
                      return (
                        <Button
                          key={k}
                          onClick={() => toggleManual(k)}
                          variant={active ? "default" : "outline"}
                          size="sm"
                          className={`rounded-full ${active ? "" : "bg-muted hover:bg-muted/70"}`}
                        >
                          {active ? "✓ " : ""}{k}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Chatbox centered at the top (spans remaining columns) */}
          <section className="col-span-12 md:col-span-8 lg:col-span-9">
            <div className="mx-auto max-w-3xl">
              {/* Search bar (optional) */}
              <div className="mb-4">
                <Card className="rounded-full shadow overflow-hidden">
                  <div className="flex items-center h-14 px-4">
                    <Search className="h-6 w-6 text-muted-foreground shrink-0" />
                    <Input
                      placeholder="Quick search…"
                      className="h-full border-0 px-5 text-base focus:ring-2 focus-visible:ring-2 focus-visible:ring-primary shadow-none bg-transparent"
                    />
                  </div>
                </Card>
              </div>

              {/* Chatbox */}
              <Card className="rounded-2xl shadow overflow-hidden">
                <div className="relative">
                  <Textarea
                    placeholder="Describe what you want… e.g. 'hybrid SUV with AWD for family trips'"
                    className="min-h-[12rem] border-0 p-5 text-base leading-relaxed focus:ring-2 focus-visible:ring-2 focus-visible:ring-primary shadow-none resize-none"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <div className="flex items-center gap-2 pr-4 pb-4 justify-end">
                    <Button className="rounded-full px-4 py-2" variant="default">
                      Apply <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Active filters summary under chatbox */}
              {activeFilters.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Active:</span>
                  {activeFilters.map(k => (
                    <span key={`act-${k}`} className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1">
                      {k}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Results grid */}
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Results</h2>
          {filteredCars.length === 0 ? (
            <Card className="rounded-xl">
              <CardContent className="flex items-center gap-2 p-4 text-sm">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                No cars match the current filters. Try removing a few keywords.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCars.map((car) => {
                const inCompare = compareIds.includes(car.id);
                return (
                  <Card key={car.id} className="flex flex-col overflow-hidden rounded-2xl shadow">
                    <div className="relative h-44 w-full">
                      <Image
                        src={car.img}
                        alt={car.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <CardContent className="flex flex-1 flex-col gap-2 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold">{car.name}</h3>
                        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-sm">
                          {car.price}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground">{car.description}</p>

                      {/* Selected filters (context) */}
                      {activeFilters.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {activeFilters.map(f => (
                            <span key={`${car.id}-${f}`} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                              {f}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <Button asChild className="rounded-full" size="sm">
                          <Link href="#">
                            Buy
                          </Link>
                        </Button>
                        <Button
                          onClick={() => (inCompare ? removeCompare(car.id) : addCompare(car.id))}
                          variant={inCompare ? "default" : "secondary"}
                          size="sm"
                          className={`rounded-full ${inCompare ? "bg-green-600 hover:bg-green-700" : ""}`}
                        >
                          {inCompare ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                          {inCompare ? "Added" : "Compare"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Compare popup (bottom-right) */}
        <div className="fixed bottom-6 right-6 z-50">
          <Card className="w-72 shadow-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Compare</CardTitle>
                <span className="text-sm text-muted-foreground">{compareIds.length} / 3</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {error && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              {compareIds.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Add up to 3 cars to compare.
                </div>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {compareIds.map(id => {
                    const car = CARS.find(c => c.id === id)!;
                    return (
                      <li key={id} className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs">
                        {car.name}
                        <Button
                          onClick={() => removeCompare(id)}
                          variant="ghost"
                          size="icon"
                          className="ml-1 h-5 w-5 rounded-full hover:bg-muted-foreground/10"
                          aria-label={`Remove ${car.name}`}
                          title="Remove"
                        >
                          ×
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <Button
                asChild
                disabled={compareIds.length === 0}
                className="w-full rounded-full"
              >
                <Link href={compareIds.length > 0 ? `/compare_result?ids=${encodeURIComponent(compareIds.join(","))}` : "#"}>
                  Open Compare <ArrowUp className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
