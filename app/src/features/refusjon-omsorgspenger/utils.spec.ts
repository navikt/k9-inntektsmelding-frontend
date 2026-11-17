import { describe, expect, test } from "vitest";

import { RefusjonOmsorgspengerRequestDtoSchema } from "./api/mutations";
import { RefusjonOmsorgspengerFormData } from "./frontendSchemas";
import {
  beregnGyldigDatoIntervall,
  datoErInnenforGyldigDatoIntervall,
  mapSkjemaTilSendInntektsmeldingRequest,
  refusjonForOmsorgspenger,
  utledFørsteFraværsdag,
} from "./utils";

describe("mapSkjemaTilSendInntektsmeldingRequest", () => {
  const skjemadata: RefusjonOmsorgspengerFormData = {
    meta: { step: 5, skalKorrigereInntekt: false },
    ansattesFødselsnummer: "16878397960",
    organisasjonsnummer: "123456789",
    kontaktperson: { navn: "Test", telefonnummer: "12345678" },
    harUtbetaltLønn: "ja",
    årForRefusjon: "2025",
    harDekket10FørsteOmsorgsdager: "ja",
    fraværHeleDager: [{ fom: "2025-06-15", tom: "2025-06-20" }],
    fraværDelerAvDagen: [],
    dagerSomSkalTrekkes: [],
    inntekt: "50000",
  };

  test("lager V2-request uten navn og aktør-ID", () => {
    const forespørsel = mapSkjemaTilSendInntektsmeldingRequest(skjemadata);
    expect(RefusjonOmsorgspengerRequestDtoSchema.parse(forespørsel)).toEqual({
      fødselsnummer: "16878397960",
      arbeidsgiverIdent: "123456789",
      kontaktperson: skjemadata.kontaktperson,
      startdato: "2025-06-15",
      inntekt: 50000,
      refusjon: [{ fom: "2025-06-15", beløp: 50000 }],
      omsorgspenger: {
        harUtbetaltPliktigeDager: true,
        fraværHeleDager: skjemadata.fraværHeleDager,
        fraværDelerAvDagen: [],
      },
      endringAvInntektÅrsaker: [],
      bortfaltNaturalytelsePerioder: [],
    });
    expect(forespørsel).not.toHaveProperty("aktorId");
    expect(forespørsel).not.toHaveProperty("ytelse");
  });

  test.each([undefined, ""])(
    "stopper mapping når fødselsnummer mangler (%s)",
    (ansattesFødselsnummer) => {
      expect(() =>
        mapSkjemaTilSendInntektsmeldingRequest({
          ...skjemadata,
          ansattesFødselsnummer,
        }),
      ).toThrow("Fødselsnummer mangler ved innsending av refusjonskrav.");
    },
  );

  test("beholder fravær og trekk ved korrigert inntekt", () => {
    const forespørsel = mapSkjemaTilSendInntektsmeldingRequest({
      ...skjemadata,
      korrigertInntekt: "48000",
      endringAvInntektÅrsaker: [{ årsak: "BONUS" }],
      fraværDelerAvDagen: [{ dato: "2025-06-10", timer: "3.5" }],
      dagerSomSkalTrekkes: [{ fom: "2025-06-01", tom: "2025-06-01" }],
    });
    expect(forespørsel.startdato).toBe("2025-06-01");
    expect(forespørsel.inntekt).toBe(48000);
    expect(forespørsel.endringAvInntektÅrsaker).toEqual([{ årsak: "BONUS" }]);
    expect(forespørsel.omsorgspenger.fraværDelerAvDagen).toEqual([
      { dato: "2025-06-10", timer: 3.5 },
      { dato: "2025-06-01", timer: 0 },
    ]);
  });
});

describe("refusjonForOmsorgspenger", () => {
  test("returnerer én periode med beløp som tall", () => {
    expect(refusjonForOmsorgspenger("2024-01-15", 50_000)).toEqual([
      { fom: "2024-01-15", beløp: 50_000 },
    ]);
  });

  test("konverterer norsk komma til punktum og parser som tall", () => {
    expect(refusjonForOmsorgspenger("2024-01-15", "12 345,50")).toEqual([
      { fom: "2024-01-15", beløp: Number("12 345.50") },
    ]);
  });
});

describe("utledFørsteFraværsdag", () => {
  test("returnerer tidligste fom fra hele dager når deler-av-dag er tom", () => {
    const result = utledFørsteFraværsdag(
      [
        { fom: "2024-03-10", tom: "2024-03-12" },
        { fom: "2024-03-05", tom: "2024-03-06" },
      ],
      [],
    );
    expect(result).toBe("2024-03-05");
  });

  test("returnerer tidligste dato fra deler-av-dag når hele dager er tom", () => {
    const result = utledFørsteFraværsdag(
      [],
      [
        { dato: "2024-03-10", timer: "3" },
        { dato: "2024-03-05", timer: "2" },
      ],
    );
    expect(result).toBe("2024-03-05");
  });

  test("returnerer tidligste dato på tvers av begge listene", () => {
    const result = utledFørsteFraværsdag(
      [{ fom: "2024-03-10", tom: "2024-03-12" }],
      [{ dato: "2024-03-05", timer: "2" }],
    );
    expect(result).toBe("2024-03-05");
  });

  test("returnerer undefined når begge listene er tomme", () => {
    expect(utledFørsteFraværsdag([], [])).toBeUndefined();
  });
});

describe("beregnGyldigDatoIntervall", () => {
  test("for inneværende år: minDato er 1. januar, maxDato er i dag", () => {
    const iÅr = new Date().getFullYear();
    const { minDato, maxDato } = beregnGyldigDatoIntervall(iÅr);
    expect(minDato.getFullYear()).toBe(iÅr);
    expect(minDato.getMonth()).toBe(0);
    expect(minDato.getDate()).toBe(1);
    // maxDato skal ikke være i fremtiden
    expect(maxDato.getTime()).toBeLessThanOrEqual(Date.now() + 1000);
  });

  test("for fjoråret: returnerer hele fjoråret", () => {
    const fjorÅret = new Date().getFullYear() - 1;
    const { minDato, maxDato } = beregnGyldigDatoIntervall(fjorÅret);
    expect(minDato.getFullYear()).toBe(fjorÅret);
    expect(minDato.getMonth()).toBe(0);
    expect(minDato.getDate()).toBe(1);
    expect(maxDato.getFullYear()).toBe(fjorÅret);
    expect(maxDato.getMonth()).toBe(11);
    expect(maxDato.getDate()).toBe(31);
  });
});

describe("datoErInnenforGyldigDatoIntervall", () => {
  test("returnerer true for dato innenfor fjoråret", () => {
    const fjorÅret = new Date().getFullYear() - 1;
    expect(
      datoErInnenforGyldigDatoIntervall(`${fjorÅret}-06-15`, fjorÅret),
    ).toBe(true);
  });

  test("returnerer false for dato utenfor fjoråret", () => {
    const fjorÅret = new Date().getFullYear() - 1;
    expect(
      datoErInnenforGyldigDatoIntervall(`${fjorÅret + 1}-01-15`, fjorÅret),
    ).toBe(false);
  });
});
