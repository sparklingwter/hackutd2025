import { Shield, Star, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface SafetyRatingsProps {
  rating: number;
  features?: string[];
}

/**
 * T043 [P] [US7]: Safety Ratings Component
 * Displays NHTSA safety rating and safety features
 */
export function SafetyRatings({ rating, features = [] }: SafetyRatingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Safety Rating
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* NHTSA Rating */}
          <div>
            <p className="mb-2 text-sm text-muted-foreground">NHTSA Overall Safety Rating</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= rating
                        ? "fill-primary text-primary"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-bold">
                {rating}/5
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Based on National Highway Traffic Safety Administration testing
            </p>
          </div>

          {/* Safety Features */}
          {features.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="mb-3 font-semibold">Safety Features</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Safety ratings are provided by the National Highway Traffic
              Safety Administration (NHTSA). Ratings are subject to change and may vary by trim
              level. Always verify the safety rating for your specific configuration.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
