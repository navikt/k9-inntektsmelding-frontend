import { devGcpFeatureToggles } from "./dev-gcp";
import { FeatureTogglesType } from "./featureTogglesType";

export const testFeatureToggles = {
  ...devGcpFeatureToggles,
} satisfies FeatureTogglesType;
