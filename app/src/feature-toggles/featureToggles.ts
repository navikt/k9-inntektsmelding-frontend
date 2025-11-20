import { devGcpFeatureToggles } from "./dev-gcp";
import { FeatureTogglesType } from "./featureTogglesType";
import { prodGcpFeatureToggles } from "./prod-gcp";

const PROD = "prod-gcp";
const DEV = "dev-gcp";

type Environment = typeof PROD | typeof DEV;

const togglesPerEnvironment: Record<Environment, FeatureTogglesType> = {
  [PROD]: prodGcpFeatureToggles,
  [DEV]: devGcpFeatureToggles,
};

export const finnEnvironmentForHostname = (hostname: string) => {
  if (
    hostname.includes(".intern.dev.nav.no") ||
    hostname.includes(".dev.nav.no")
  ) {
    return DEV;
  }

  return PROD;
};

const environment = finnEnvironmentForHostname(
  globalThis?.location?.hostname ?? "",
);

export const featureToggles = togglesPerEnvironment[environment];
