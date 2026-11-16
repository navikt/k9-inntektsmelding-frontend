import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { erTillattProxySti } from "./proxySti.ts";

describe("erTillattProxySti", () => {
  it("slipper gjennom stiene appen bruker", () => {
    assert.equal(
      erTillattProxySti("/imdialog/opplysninger?foresporselUuid=abc-123"),
      true,
    );
    assert.equal(
      erTillattProxySti(
        "/imdialog/send-inntektsmelding/omsorgspenger-refusjon",
      ),
      true,
    );
    assert.equal(
      erTillattProxySti("/refusjon-omsorgsdager/arbeidstaker/v2"),
      true,
    );
  });

  it("avviser stier som endres av normalisering", () => {
    for (const sti of [
      "/../internal/health/isAlive",
      "/../%69nternal/health/isAlive",
      "/%2e%2e/internal/health/isAlive",
      "/%2E%2e/internal/health/isAlive",
      "/imdialog/.%2e/.%2e/internal",
      "//internal/health/isAlive",
      String.raw`/imdialog\..\internal`,
      "/imdialog/./opplysninger",
      "/imdialog/..",
      "",
    ]) {
      assert.equal(erTillattProxySti(sti), false, sti);
    }
  });
});
