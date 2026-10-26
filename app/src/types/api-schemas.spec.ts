import { describe, expect, test } from "vitest";

import { InntektsmeldingResponseDtoUregistrertSchema } from "~/features/arbeidsgiverinitiert/unntattAAregister/api-schemas";
import { InntektsmeldingResponseDtoSchema } from "~/features/inntektsmelding/api-schemas";
import {
  naturalytelsePerioderDtoSchema,
  NaturalytelseTypeSchema,
  opplysningerSchema,
  opplysningerUregistrertSchema,
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
  test.each(NaturalytelseTypeSchema.options)(
    "parser naturalytelsetype %s",
    (naturalytelsetype) => {
      const periode = {
        fom: "2026-01-01",
        beløp: 100,
        naturalytelsetype,
      };

      expect(naturalytelsePerioderDtoSchema.parse([periode])).toEqual([
        periode,
      ]);
    },
  );

  test.each(["ELEKTRISK_KOMMUNIKASJON", "UKJENT_TYPE", null, 123, undefined])(
    "avviser ugyldig naturalytelsetype %s",
    (naturalytelsetype) => {
      expect(
        naturalytelsePerioderDtoSchema.safeParse([
          { fom: "2026-01-01", beløp: 100, naturalytelsetype },
        ]).success,
      ).toBe(false);
    },
  );
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

describe("opplysninger uten navn for uregistrert AGI", () => {
  test("v2-responsen inneholder bare personidentifikatorene", () => {
    const opplysninger = opplysningerUregistrertSchema.parse(
      agiOpplysningerResponseUregistrert,
    );

    expect(opplysninger.person).toEqual({
      fødselsnummer: agiOpplysningerResponseUregistrert.person.fødselsnummer,
      aktørId: agiOpplysningerResponseUregistrert.person.aktørId,
    });
    expect(opplysningerSchema.parse(opplysninger)).toEqual(opplysninger);
  });

  test("fjerner navn fra eldre responser og lagrede opplysninger", () => {
    const opplysninger = opplysningerSchema.parse({
      ...agiOpplysningerResponseUregistrert,
      person: {
        ...agiOpplysningerResponseNyAnsatt.person,
        mellomnavn: "Test",
      },
    });

    expect(opplysninger.person).toEqual(
      agiOpplysningerResponseUregistrert.person,
    );
  });

  test.each(["aktørId", "fødselsnummer"])(
    "krever %s også når navn ikke returneres",
    (felt) => {
      expect(
        opplysningerUregistrertSchema.safeParse({
          ...agiOpplysningerResponseUregistrert,
          person: {
            ...agiOpplysningerResponseUregistrert.person,
            [felt]: undefined,
          },
        }).success,
      ).toBe(false);
    },
  );

  test.each([
    "BESTILT_AV_FAGSYSTEM",
    "ARBEIDSGIVERINITIERT_NYANSATT",
    "OMSORGSPENGER_REFUSJON",
    "BESTILT_AV_SAKSBEHANDLER",
  ])("krever fortsatt navn for %s", (forespørselType) => {
    expect(
      opplysningerSchema.safeParse({
        ...agiOpplysningerResponseUregistrert,
        forespørselType,
      }).success,
    ).toBe(false);
    expect(
      opplysningerUregistrertSchema.safeParse({
        ...agiOpplysningerResponseNyAnsatt,
        forespørselType,
      }).success,
    ).toBe(false);
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
