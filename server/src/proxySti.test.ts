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
    assert.equal(
      erTillattProxySti("/arbeidsgiverinitiert/arbeidsgiver/organisasjoner"),
      true,
    );
    assert.equal(
      erTillattProxySti(
        "/pdf/inntektsmelding/0b3d8e2a-6c1f-4a8e-9d2b-1f2e3d4c5b6a",
      ),
      true,
    );
  });

  it("avviser stier utenfor de tillatte", () => {
    for (const sti of [
      "/imapi/inntektsmelding/hent/inntektsmeldinger",
      "/foresporsel/opprett",
      "/imdialogX/opplysninger",
      "/imdialog",
      "/IMDIALOG/opplysninger",
      "/",
    ]) {
      assert.equal(erTillattProxySti(sti), false, sti);
    }
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
      "/imdialog/../imapi/inntekt/abc",
      "/imdialog/%2e%2e/foresporsel/opprett",
      "",
    ]) {
      assert.equal(erTillattProxySti(sti), false, sti);
    }
  });
});
