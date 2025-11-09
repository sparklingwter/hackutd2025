"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import StickyHeader from "~/components/ui/sticky-header";
import { CAR_INDEX, CARS, Car } from "~/lib/cars";
import { AlertTriangle } from "lucide-react";

export default function CompareResultPage() {
  const params = useSearchParams();
  const idsParam = params.get("ids") || "";
  const ids = useMemo(() => idsParam.split(",").map((s) => s.trim()).filter(Boolean), [idsParam]);

  const selected: Car[] = useMemo(() => {
    // Map to cars, drop invalid, cap at 3
    const cars = ids.map((id) => CAR_INDEX[id]).filter((c): c is Car => !!c);
    return cars.slice(0, 3);
  }, [ids]);

  const hasOverflow = ids.length > 3;

  return (
    <>
      <StickyHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 text-foreground">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Compare Cars</h1>
          <Link href="/result" className="text-primary underline">Back to Results</Link>
        </div>

        {ids.length === 0 ? (
          <p className="text-muted-foreground">No cars selected for comparison.</p>
        ) : (
          <>
            {hasOverflow && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border bg-card p-4 text-sm">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                Showing first 3 cars only. Remove extras in the Results page.
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border bg-card shadow">
              <table className="w-full border-separate border-spacing-y-0">
                {/* Header row: images + names */}
                <thead>
                  <tr>
                    <th className="w-40 p-4 text-left text-sm font-medium text-muted-foreground">Model</th>
                    {selected.map((car) => (
                      <th key={car.id} className="p-4">
                        <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                          <div className="relative h-28 w-full overflow-hidden rounded-xl">
                            <Image
                              src={car.img}
                              alt={car.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 200px, 320px"
                            />
                          </div>
                          <div className="text-center text-base font-semibold leading-tight">{car.name}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  <SpecRow label="Price" values={selected.map((c) => c.price)} />
                  <SpecRow label="Drivetrain" values={selected.map((c) => c.specs.drivetrain.toUpperCase())} />
                  <SpecRow label="Powertrain" values={selected.map((c) => c.specs.powertrain.toUpperCase())} />
                  <SpecRow label="Body" values={selected.map((c) => c.specs.body.toUpperCase())} />
                  <SpecRow
                    label="Efficiency / Range"
                    values={selected.map((c) =>
                      c.specs.powertrain === "ev" ? (c.specs.range ?? "—") : (c.specs.mpg ?? "—")
                    )}
                  />
                  <SpecRow
                    label="Tags"
                    values={selected.map((c) =>
                      c.tags.length ? c.tags.join(", ") : "—"
                    )}
                  />

                  {/* CTA row */}
                  <tr className="border-t">
                    <th className="w-40 p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    {selected.map((car) => (
                      <td key={`cta-${car.id}`} className="p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href="#"
                            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
                          >
                            Buy
                          </Link>
                          <Link
                            href={`/finance?focus=${encodeURIComponent(car.id)}`}
                            className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm hover:bg-muted"
                          >
                            Back to card
                          </Link>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </>
  );
}

function SpecRow({ label, values }: { label: string; values: (string | number)[] }) {
  return (
    <tr className="border-t">
      <th className="w-40 p-4 text-left text-sm font-medium text-muted-foreground">{label}</th>
      {values.map((v, i) => (
        <td key={`${label}-${i}`} className="p-4 align-top">
          <div className="rounded-lg bg-muted px-3 py-2 text-sm">{String(v)}</div>
        </td>
      ))}
    </tr>
  );
}