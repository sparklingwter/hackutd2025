import { Fuel, Users, Gauge, Package, TrendingUp, Zap } from "lucide-react";
import type { Vehicle, Trim } from "~/server/api/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface SpecsGridProps {
  vehicle: Vehicle;
  trim: Trim | null;
}

/**
 * T041 [P] [US7]: Specs Grid Component
 * Displays vehicle specifications in an organized grid layout
 */
export function SpecsGrid({ vehicle, trim }: SpecsGridProps) {
  const specs = [
    {
      icon: Fuel,
      label: "Fuel Type",
      value: vehicle.fuelType === "plugin-hybrid" ? "Plug-in Hybrid" : 
             vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1),
    },
    {
      icon: Users,
      label: "Seating",
      value: `${vehicle.seating} passengers`,
    },
    {
      icon: Gauge,
      label: "Fuel Economy",
      value: vehicle.mpgCombined 
        ? `${vehicle.mpgCombined} MPG combined` 
        : vehicle.range 
        ? `${vehicle.range} miles range` 
        : "N/A",
    },
    {
      icon: Package,
      label: "Cargo Volume",
      value: `${vehicle.cargoVolume} cu ft`,
    },
    {
      icon: TrendingUp,
      label: "Towing Capacity",
      value: vehicle.towingCapacity > 0 
        ? `${vehicle.towingCapacity.toLocaleString()} lbs` 
        : "Not rated",
    },
    {
      icon: Zap,
      label: "Drivetrain",
      value: vehicle.awd ? "AWD" : vehicle.fourWheelDrive ? "4WD" : "FWD/RWD",
    },
  ];

  // Add trim-specific specs if available
  const trimSpecs = trim ? [
    {
      icon: Gauge,
      label: "Engine",
      value: trim.engine,
    },
    {
      icon: TrendingUp,
      label: "Power",
      value: `${trim.horsepower} HP • ${trim.torque} lb-ft`,
    },
    {
      icon: Zap,
      label: "Transmission",
      value: trim.transmission,
    },
    ...(trim.zeroToSixty ? [{
      icon: Gauge,
      label: "0-60 mph",
      value: `${trim.zeroToSixty}s`,
    }] : []),
  ] : [];

  const allSpecs = [...specs, ...trimSpecs];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allSpecs.map((spec, index) => {
            const Icon = spec.icon;
            return (
              <div key={index} className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{spec.label}</p>
                  <p className="text-lg font-semibold">{spec.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Details */}
        <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">City MPG</p>
            <p className="text-lg font-semibold">{vehicle.mpgCity ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Highway MPG</p>
            <p className="text-lg font-semibold">{vehicle.mpgHighway ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Body Style</p>
            <p className="text-lg font-semibold capitalize">{vehicle.bodyStyle}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Model Year</p>
            <p className="text-lg font-semibold">{vehicle.year}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
