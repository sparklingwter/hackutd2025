import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface FeaturesListProps {
  features: string[];
  trimName?: string;
}

/**
 * T042 [P] [US7]: Features List Component
 * Displays vehicle features in an organized list
 */
export function FeaturesList({ features, trimName }: FeaturesListProps) {
  if (features.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Features {trimName && `(${trimName})`}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No features information available.</p>
        </CardContent>
      </Card>
    );
  }

  // Group features by category if they have prefixes like "safety:", "tech:", etc.
  const categorizedFeatures: Record<string, string[]> = {};
  const uncategorizedFeatures: string[] = [];

  features.forEach((feature) => {
    if (feature.includes(":")) {
      const [category, ...rest] = feature.split(":");
      const featureName = rest.join(":").trim();
      const categoryName = category!.trim();
      
      categorizedFeatures[categoryName] ??= [];
      categorizedFeatures[categoryName].push(featureName);
    } else {
      uncategorizedFeatures.push(feature);
    }
  });

  const hasCategories = Object.keys(categorizedFeatures).length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Features {trimName && `(${trimName})`}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Categorized Features */}
          {hasCategories && Object.entries(categorizedFeatures).map(([category, categoryFeatures]) => (
            <div key={category}>
              <h3 className="mb-3 font-semibold capitalize">{category}</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {categoryFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Uncategorized Features */}
          {uncategorizedFeatures.length > 0 && (
            <div>
              {hasCategories && <h3 className="mb-3 font-semibold">Standard Features</h3>}
              <div className="grid gap-2 sm:grid-cols-2">
                {uncategorizedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
