// lib/cars.ts
export type Car = {
  id: string;
  name: string;
  img: string;
  price: string;
  tags: string[]; // lowercase keywords for filtering
  description: string;
  specs: {
    drivetrain: "awd" | "4wd" | "fwd" | "rwd";
    powertrain: "hybrid" | "ev" | "gas" | "phev";
    body: "suv" | "sedan" | "truck" | "crossover" | "coupe" | "hatchback" | "minivan";
    mpg?: string;   // hybrid/gas
    range?: string; // ev
  };
};

export const CARS: Car[] = [
  {
    id: "rav4-hybrid-awd",
    name: "Toyota RAV4 Hybrid XSE (AWD)",
    img: "/cars/rav4-hybrid.jpg",
    description: "Efficient compact SUV with e-AWD, great for families and weekend trips.",
    tags: ["toyota", "suv", "hybrid", "awd", "4wd", "economy"],
    price: "$36,990",
    specs: { drivetrain: "awd", powertrain: "hybrid", body: "suv", mpg: "39 mpg" },
  },
  {
    id: "highlander-hybrid-awd",
    name: "Toyota Highlander Hybrid (AWD)",
    img: "/cars/highlander-hybrid.jpg",
    description: "Three-row hybrid SUV with confident all-weather capability.",
    tags: ["toyota", "suv", "hybrid", "awd", "family"],
    price: "$45,250",
    specs: { drivetrain: "awd", powertrain: "hybrid", body: "suv", mpg: "36 mpg" },
  },
  {
    id: "tacoma-4wd-trd",
    name: "Toyota Tacoma TRD Off-Road (4WD)",
    img: "/cars/tacoma.jpg",
    description: "Mid-size truck with 4WD and off-road tuning for rugged adventures.",
    tags: ["toyota", "truck", "4wd", "offroad", "towing"],
    price: "$41,100",
    specs: { drivetrain: "4wd", powertrain: "gas", body: "truck", mpg: "21 mpg" },
  },
  {
    id: "camry-hybrid",
    name: "Toyota Camry Hybrid XLE",
    img: "/cars/camry-hybrid.jpg",
    description: "Comfortable hybrid sedan with excellent mpg and safety tech.",
    tags: ["toyota", "sedan", "hybrid", "economy"],
    price: "$34,500",
    specs: { drivetrain: "fwd", powertrain: "hybrid", body: "sedan", mpg: "52 mpg" },
  },
  {
    id: "crown-awd-hybridmax",
    name: "Toyota Crown Platinum (AWD Hybrid MAX)",
    img: "/cars/crown.jpg",
    description: "Upscale, sporty liftback with powerful Hybrid MAX and AWD.",
    tags: ["toyota", "sedan", "awd", "hybrid", "luxury", "sport"],
    price: "$53,000",
    specs: { drivetrain: "awd", powertrain: "hybrid", body: "sedan", mpg: "30 mpg" },
  },
  {
    id: "bZ4X-ev-awd",
    name: "Toyota bZ4X (EV AWD)",
    img: "/cars/bz4x.jpg",
    description: "All-electric crossover with available dual-motor AWD.",
    tags: ["toyota", "ev", "crossover", "awd", "suv"],
    price: "$42,350",
    specs: { drivetrain: "awd", powertrain: "ev", body: "crossover", range: "252 mi" },
  },
];

export const CAR_INDEX: Record<string, Car> = Object.fromEntries(
  CARS.map((c) => [c.id, c])
);
