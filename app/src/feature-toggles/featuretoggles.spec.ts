import { describe, expect, it } from "vitest";

import { finnEnvironmentForHostname } from "~/feature-toggles/featureToggles";

describe("finnEnvironmentForHostname", () => {
  it("gir dev-gcp for intern.dev.nav.no-domener", () => {
    expect(finnEnvironmentForHostname("arbeidsgiver.intern.dev.nav.no")).toBe(
      "dev-gcp",
    );
  });

  it("gir dev-gcp for dev.nav.no-domener", () => {
    expect(finnEnvironmentForHostname("arbeidsgiver.dev.nav.no")).toBe(
      "dev-gcp",
    );
  });

  it("gir prod-gcp for alt annet", () => {
    expect(finnEnvironmentForHostname("arbeidsgiver.nav.no")).toBe("prod-gcp");
    expect(finnEnvironmentForHostname("ukjent.nav.no")).toBe("prod-gcp");
    expect(finnEnvironmentForHostname("localhost")).toBe("prod-gcp");
    expect(finnEnvironmentForHostname("127.0.0.1")).toBe("prod-gcp");
    expect(finnEnvironmentForHostname("::1")).toBe("prod-gcp");
    expect(finnEnvironmentForHostname("")).toBe("prod-gcp");
  });
});
