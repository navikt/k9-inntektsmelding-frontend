import { describe, expect, test } from "vitest";

import { MIDLERTIDIG_NATURALYTELSETYPE } from "~/feature-toggles/midlertidigKompatibilitet";
import { InntektsmeldingResponseDtoUregistrertSchema } from "~/features/arbeidsgiverinitiert/unntattAAregister/api-schemas";
import { InntektsmeldingResponseDtoSchema } from "~/features/inntektsmelding/api-schemas";
import {
  naturalytelsePerioderDtoSchema,
  NaturalytelseTypeSchema,
  opplysningerSchema,
  SlåOppArbeidstakerResponseDtoSchema,
} from "~/types/api-schemas";

import {
  agiOpplysningerAlternativYtelse,
  agiOpplysningerResponseNyAnsatt,
  agiOpplysningerResponseUregistrert,
} from "../../tests/mocks/arbeidsgiverinitiert/nyansatt/agi-opplysninger";
import { agiSendInntektsmeldingResponse } from "../../tests/mocks/arbeidsgiverinitiert/nyansatt/agi-send-inntektsmelding";
import { arbeidsforholdResponse } from "../../tests/mocks/arbeidsgiverinitiert/nyansatt/arbeidsforhold";
import { agiUregistrertSendInntektsmeldingResponse } from "../../tests/mocks/arbeidsgiverinitiert/uregistrert/agi-send-inntektsmelding";
import { arbeidsforholdUregistrertResponse } from "../../tests/mocks/arbeidsgiverinitiert/uregistrert/arbeidsforhold";
import {
  enkeltOpplysningerResponse,
  utgåttOpplysningerResponse,
} from "../../tests/mocks/inntektsmelding/opplysninger";
import { enkelSendInntektsmeldingResponse } from "../../tests/mocks/inntektsmelding/send-inntektsmelding";

describe("naturalytelsePerioderDtoSchema", () => {
  test.each([
    // Midlertidig testtilfelle. Fjern når backend ikke lenger returnerer ELEKTRISK_KOMMUNIKASJON.
    [MIDLERTIDIG_NATURALYTELSETYPE, "ELEKTRONISK_KOMMUNIKASJON"] as const,
    ...NaturalytelseTypeSchema.options.map((type) => [type, type] as const),
  ])("parser %s som %s", (naturalytelsetype, forventetType) => {
    const periode = {
      fom: "2026-01-01",
      beløp: 100,
      naturalytelsetype,
    };

    expect(naturalytelsePerioderDtoSchema.parse([periode])).toEqual([
      { ...periode, naturalytelsetype: forventetType },
    ]);
  });

  test.each(["UKJENT_TYPE", null, 123, undefined])(
    "avviser ugyldig naturalytelsetype %s",
    (naturalytelsetype) => {
      expect(
        naturalytelsePerioderDtoSchema.safeParse([
          { fom: "2026-01-01", beløp: 100, naturalytelsetype },
        ]).success,
      ).toBe(false);
    },
  );

  test("tilbyr ikke den gamle verdien i enumen", () => {
    expect(NaturalytelseTypeSchema.options).not.toContain(
      MIDLERTIDIG_NATURALYTELSETYPE,
    );
  });
});

describe("opplysningerSchema parser alle mock-respons", () => {
  test.each([
    ["enkel inntektsmelding-opplysninger", enkeltOpplysningerResponse],
    ["utgått inntektsmelding-opplysninger", utgåttOpplysningerResponse],
    ["AGI nyansatt-opplysninger", agiOpplysningerResponseNyAnsatt],
    ["AGI uregistrert-opplysninger", agiOpplysningerResponseUregistrert],
    ["AGI alternativ ytelse-opplysninger", agiOpplysningerAlternativYtelse],
  ])("parser %s uten feil", (_, mock) => {
    const result = opplysningerSchema.safeParse(mock);
    expect(result.success).toBe(true);
  });

  test("feiler på ukjent forespørselType", () => {
    const result = opplysningerSchema.safeParse({
      ...enkeltOpplysningerResponse,
      forespørselType: "UKJENT_TYPE",
    });
    expect(result.success).toBe(false);
  });
});

describe("SlåOppArbeidstakerResponseDtoSchema parser arbeidsforhold-respons", () => {
  test.each([
    ["nyansatt-arbeidsforhold", arbeidsforholdResponse],
    ["uregistrert-arbeidsforhold", arbeidsforholdUregistrertResponse],
  ])("parser %s uten feil", (_, mock) => {
    const result = SlåOppArbeidstakerResponseDtoSchema.safeParse(mock);
    expect(result.success).toBe(true);
  });
});

describe("InntektsmeldingResponseDtoSchema parser send-inntektsmelding-respons", () => {
  test.each([
    ["enkel inntektsmelding-respons", enkelSendInntektsmeldingResponse],
    ["AGI nyansatt-respons", agiSendInntektsmeldingResponse],
  ])("parser %s uten feil", (_, mock) => {
    const result = InntektsmeldingResponseDtoSchema.safeParse(mock);
    expect(result.success).toBe(true);
  });
});

describe("InntektsmeldingResponseDtoUregistrertSchema parser uregistrert-respons", () => {
  test("parser AGI uregistrert send-inntektsmelding-respons uten feil", () => {
    const result = InntektsmeldingResponseDtoUregistrertSchema.safeParse(
      agiUregistrertSendInntektsmeldingResponse,
    );
    expect(result.success).toBe(true);
  });
});
