import { OpplysningerDto } from "~/types/api-models.ts";

export const agiOpplysningerResponseNyAnsatt = {
  person: {
    fornavn: "MOMENTAN",
    etternavn: "TRAKT",
    fødselsnummer: "09810198874",
    aktørId: "1234567890123",
  },
  arbeidsgiver: {
    organisasjonNavn: "NAV",
    organisasjonNummer: "974652293",
  },
  innsender: {
    fornavn: "BERØMT",
    etternavn: "FLYTTELASS",
  },
  forespørselStatus: "UNDER_BEHANDLING" as const,
  inntektsopplysninger: {
    gjennomsnittLønn: 45_000,
    månedsinntekter: [
      {
        fom: "2024-01-01",
        tom: "2024-01-31",
        beløp: 45_000,
        status: "BRUKT_I_GJENNOMSNITT",
      },
      {
        fom: "2024-02-01",
        tom: "2024-02-29",
        beløp: 45_000,
        status: "BRUKT_I_GJENNOMSNITT",
      },
      {
        fom: "2024-03-01",
        tom: "2024-03-31",
        beløp: 45_000,
        status: "BRUKT_I_GJENNOMSNITT",
      },
    ],
  },
  skjæringstidspunkt: "2024-04-01",
  førsteUttaksdato: "2024-04-01",
  ytelse: "PLEIEPENGER_SYKT_BARN" as const,
  forespørselType: "ARBEIDSGIVERINITIERT_NYANSATT" as const,
} satisfies OpplysningerDto;

export const agiOpplysningerResponseUregistrert = {
  ...agiOpplysningerResponseNyAnsatt,
  forespørselType: "ARBEIDSGIVERINITIERT_UREGISTRERT" as const,
} satisfies OpplysningerDto;

export const agiOpplysningerAlternativYtelse = {
  ...agiOpplysningerResponseNyAnsatt,
  ytelse: "PLEIEPENGER_SYKT_BARN" as const,
  inntektsopplysninger: {
    gjennomsnittLønn: 55_000,
    månedsinntekter: [
      {
        fom: "2024-01-01",
        tom: "2024-01-31",
        beløp: 55_000,
        status: "BRUKT_I_GJENNOMSNITT",
      },
      {
        fom: "2024-02-01",
        tom: "2024-02-29",
        beløp: 55_000,
        status: "BRUKT_I_GJENNOMSNITT",
      },
      {
        fom: "2024-03-01",
        tom: "2024-03-31",
        beløp: 55_000,
        status: "BRUKT_I_GJENNOMSNITT",
      },
    ],
  },
} satisfies OpplysningerDto;
