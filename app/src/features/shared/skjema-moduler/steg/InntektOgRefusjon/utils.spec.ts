import { describe, expect, test } from "vitest";

import type { InntektsmeldingSkjemaStateValid } from "~/features/inntektsmelding/frontendSchemas";
import type { OpplysningerDto } from "~/types/api-schemas";

import { lagSendInntektsmeldingRequest } from "./utils";

const baseOpplysninger: OpplysningerDto = {
  forespørselUuid: "abc-123",
  person: {
    aktørId: "1234567890123",
    fødselsnummer: "27527827812",
    fornavn: "Test",
    etternavn: "Bruker",
  },
  innsender: { fornavn: "Test", etternavn: "Innsender" },
  arbeidsgiver: {
    organisasjonNavn: "Test AS",
    organisasjonNummer: "974652293",
  },
  inntektsopplysninger: {
    gjennomsnittLønn: 45_000,
    månedsinntekter: [],
  },
  forespørselStatus: "UNDER_BEHANDLING",
  forespørselType: "BESTILT_AV_FAGSYSTEM",
  skjæringstidspunkt: "2024-04-01",
  førsteUttaksdato: "2024-04-01",
  ytelse: "PLEIEPENGER_SYKT_BARN",
};

const baseSkjemaState: InntektsmeldingSkjemaStateValid = {
  kontaktperson: { navn: "Ola Nordmann", telefonnummer: "98765432" },
  inntekt: 45_000,
  endringAvInntektÅrsaker: [],
  skalRefunderes: "NEI",
  refusjon: [],
  misterNaturalytelser: false,
  bortfaltNaturalytelsePerioder: [],
};

describe("lagSendInntektsmeldingRequest", () => {
  test("setter inntekt fra basis-inntekt når korrigertInntekt mangler", () => {
    const request = lagSendInntektsmeldingRequest(
      "abc-123",
      baseSkjemaState,
      baseOpplysninger,
    );

    expect(request.inntekt).toBe(45_000);
    expect(request.foresporselUuid).toBe("abc-123");
    expect(request.aktorId).toBe("1234567890123");
    expect(request.arbeidsgiverIdent).toBe("974652293");
  });

  test("bruker korrigertInntekt når den er satt", () => {
    const request = lagSendInntektsmeldingRequest(
      "abc-123",
      { ...baseSkjemaState, korrigertInntekt: 50_000 },
      baseOpplysninger,
    );
    expect(request.inntekt).toBe(50_000);
  });

  test("foresporselUuid er undefined for AGI nyansatt-id", () => {
    const request = lagSendInntektsmeldingRequest(
      "agi",
      baseSkjemaState,
      baseOpplysninger,
    );
    expect(request.foresporselUuid).toBeUndefined();
  });

  test("foresporselUuid er undefined for AGI unntatt aaregister-id", () => {
    const request = lagSendInntektsmeldingRequest(
      "agi-unntatt-aaregister",
      baseSkjemaState,
      baseOpplysninger,
    );
    expect(request.foresporselUuid).toBeUndefined();
  });

  test("refusjon er tom når skalRefunderes er NEI", () => {
    const request = lagSendInntektsmeldingRequest(
      "abc-123",
      {
        ...baseSkjemaState,
        skalRefunderes: "NEI",
        refusjon: [{ fom: "2024-04-01", beløp: 45_000 }],
      },
      baseOpplysninger,
    );
    expect(request.refusjon).toEqual([]);
  });

  test("refusjon kuttes til første post når skalRefunderes er JA_LIK_REFUSJON", () => {
    const request = lagSendInntektsmeldingRequest(
      "abc-123",
      {
        ...baseSkjemaState,
        skalRefunderes: "JA_LIK_REFUSJON",
        refusjon: [
          { fom: "2024-04-01", beløp: 45_000 },
          { fom: "2024-05-01", beløp: 30_000 },
        ],
      },
      baseOpplysninger,
    );
    expect(request.refusjon).toEqual([{ fom: "2024-04-01", beløp: 45_000 }]);
  });

  test("refusjon beholdes hel når skalRefunderes er JA_VARIERENDE_REFUSJON", () => {
    const request = lagSendInntektsmeldingRequest(
      "abc-123",
      {
        ...baseSkjemaState,
        skalRefunderes: "JA_VARIERENDE_REFUSJON",
        refusjon: [
          { fom: "2024-04-01", beløp: 45_000 },
          { fom: "2024-05-01", beløp: 30_000 },
        ],
      },
      baseOpplysninger,
    );
    expect(request.refusjon).toHaveLength(2);
  });

  test("for OMSORGSPENGER: refusjon er alltid tom og omsorgspenger-felt blir lagt til", () => {
    const request = lagSendInntektsmeldingRequest(
      "abc-123",
      {
        ...baseSkjemaState,
        skalRefunderes: "JA_LIK_REFUSJON",
        refusjon: [{ fom: "2024-04-01", beløp: 45_000 }],
        fraværHeleDager: [{ fom: "2024-04-01", tom: "2024-04-05" }],
        fraværDelerAvDagen: [{ dato: "2024-04-08", timer: "3" }],
      },
      { ...baseOpplysninger, ytelse: "OMSORGSPENGER" },
    );

    expect(request.refusjon).toEqual([]);
    expect(request.omsorgspenger).toEqual({
      harUtbetaltPliktigeDager: true,
      fraværHeleDager: [{ fom: "2024-04-01", tom: "2024-04-05" }],
      fraværDelerAvDagen: [{ dato: "2024-04-08", timer: 3 }],
    });
  });

  test("for OMSORGSPENGER med skalRefunderes NEI: harUtbetaltPliktigeDager er false", () => {
    const request = lagSendInntektsmeldingRequest(
      "abc-123",
      {
        ...baseSkjemaState,
        skalRefunderes: "NEI",
      },
      { ...baseOpplysninger, ytelse: "OMSORGSPENGER" },
    );

    expect(request.omsorgspenger?.harUtbetaltPliktigeDager).toBe(false);
  });

  test("ignorerTom på endringsårsak fjerner tom-feltet", () => {
    const request = lagSendInntektsmeldingRequest(
      "abc-123",
      {
        ...baseSkjemaState,
        endringAvInntektÅrsaker: [
          {
            årsak: "TARIFFENDRING",
            fom: "2024-01-01",
            tom: "2024-12-31",
            ignorerTom: true,
          },
        ],
      },
      baseOpplysninger,
    );

    expect(request.endringAvInntektÅrsaker).toEqual([
      {
        årsak: "TARIFFENDRING",
        fom: "2024-01-01",
        tom: undefined,
        bleKjentFom: undefined,
      },
    ]);
  });

  test("naturalytelseperioder konverteres til API-format", () => {
    const request = lagSendInntektsmeldingRequest(
      "abc-123",
      {
        ...baseSkjemaState,
        misterNaturalytelser: true,
        bortfaltNaturalytelsePerioder: [
          {
            navn: "BIL",
            beløp: 5000,
            fom: "2024-04-01",
            tom: "2024-04-30",
            inkluderTom: true,
          },
        ],
      },
      baseOpplysninger,
    );

    expect(request.bortfaltNaturalytelsePerioder).toEqual([
      {
        naturalytelsetype: "BIL",
        fom: "2024-04-01",
        tom: "2024-04-30",
        beløp: 5000,
      },
    ]);
  });
});
