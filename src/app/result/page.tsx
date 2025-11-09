import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ResultPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-primary hover:underline"
      >
        <ArrowLeft className="h-5 w-5" /> Back
      </Link>

      <h1 className="text-5xl font-bold mb-6">Results Page</h1>
      <p className="text-lg text-muted-foreground">
        This is where your search or chat results will appear.
      </p>
    </main>
  );
}
