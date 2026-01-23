import { devGcpFeatureToggles } from "./dev-gcp";
import { FeatureTogglesType } from "./featureTogglesType";
import { prodGcpFeatureToggles } from "./prod-gcp";
import { testFeatureToggles } from "./test";

const PROD = "prod-gcp";
const DEV = "dev-gcp";
const TEST = "test";
type Environment = typeof PROD | typeof DEV | typeof TEST;

const togglesPerEnvironment: Record<Environment, FeatureTogglesType> = {
  [PROD]: prodGcpFeatureToggles,
  [DEV]: devGcpFeatureToggles,
  [TEST]: testFeatureToggles,
};

export const finnEnvironmentForHostname = (hostname: string) => {
  if (hostname.includes("localhost")) {
    return TEST;
  }
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
