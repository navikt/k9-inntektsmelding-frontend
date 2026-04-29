import { OpplysningerDto } from "~/types/api-schemas.ts";

const STANDARD_OPPLYSNINGER = {
  person: {
    fornavn: "UNDERFUNDIG",
    etternavn: "DYREFLOKK",
    fødselsnummer: "27527827812",
    aktørId: "2715347149890",
  },
  arbeidsgiver: {
    organisasjonNavn: "Papir- og pappvareproduksjon el.",
    organisasjonNummer: "810007842",
  },
  innsender: {
    fornavn: "BERØMT",
    etternavn: "FLYTTELASS",
  },
  forespørselStatus: "UNDER_BEHANDLING" as const,
  inntektsopplysninger: {
    gjennomsnittLønn: 53_000,
    månedsinntekter: [
      {
        fom: "2024-02-01",
        tom: "2024-02-29",
        beløp: 52_000,
        status: "BRUKT_I_GJENNOMSNITT",
      },
      {
        fom: "2024-03-01",
        tom: "2024-03-31",
        beløp: 50_000,
        status: "BRUKT_I_GJENNOMSNITT",
      },
      {
        fom: "2024-04-01",
        tom: "2024-04-30",
        beløp: 57_000,
        status: "BRUKT_I_GJENNOMSNITT",
      },
    ],
  },
  skjæringstidspunkt: "2024-05-30",
  førsteUttaksdato: "2024-05-31",
  ytelse: "PLEIEPENGER_SYKT_BARN" as const,
  forespørselType: "BESTILT_AV_FAGSYSTEM" as const,
} satisfies OpplysningerDto;

export const enkeltOpplysningerResponse = STANDARD_OPPLYSNINGER;

export const utgåttOpplysningerResponse = {
  ...STANDARD_OPPLYSNINGER,
  forespørselStatus: "UTGÅTT" as const,
  forespørselType: "BESTILT_AV_FAGSYSTEM" as const,
} satisfies OpplysningerDto;

export const opplysningerMedSisteMånedIkkeRapportertFørRapporteringsfrist = {
  ...STANDARD_OPPLYSNINGER,
  inntektsopplysninger: {
    gjennomsnittLønn: 51_666.67,
    månedsinntekter: [
      {
        fom: "2024-01-01",
        tom: "2024-01-29",
        beløp: 53_000,
        status: "BRUKT_I_GJENNOMSNITT",
      },
      {
        fom: "2024-02-01",
        tom: "2024-02-29",
        beløp: 52_000,
        status: "BRUKT_I_GJENNOMSNITT",
      },
      {
        fom: "2024-03-01",
        tom: "2024-03-31",
        beløp: 50_000,
        status: "BRUKT_I_GJENNOMSNITT",
      },
      {
        fom: "2024-04-01",
        tom: "2024-04-30",
        status: "IKKE_RAPPORTERT_RAPPORTERINGSFRIST_IKKE_PASSERT",
      },
    ],
  },
  forespørselType: "BESTILT_AV_FAGSYSTEM" as const,
} satisfies OpplysningerDto;

export const opplysningerMedSisteMånedRapportert0 = {
  ...STANDARD_OPPLYSNINGER,
  inntektsopplysninger: {
    gjennomsnittLønn: 34_000,
    månedsinntekter: [
      {
        fom: "2024-02-01",
        tom: "2024-02-29",
        beløp: 52_000,
        status: "BRUKT_I_GJENNOMSNITT",
      },
      {
        fom: "2024-03-01",
        tom: "2024-03-31",
        beløp: 50_000,
        status: "BRUKT_I_GJENNOMSNITT",
      },
      {
        fom: "2024-04-01",
        tom: "2024-04-30",
        status: "IKKE_RAPPORTERT_MEN_BRUKT_I_GJENNOMSNITT",
      },
    ],
  },
  forespørselType: "BESTILT_AV_FAGSYSTEM" as const,
} satisfies OpplysningerDto;

export const opplysningerMedAInntektNede = {
  ...STANDARD_OPPLYSNINGER,
  inntektsopplysninger: {
    månedsinntekter: [
      {
        fom: "2024-02-01",
        tom: "2024-02-29",
        status: "NEDETID_AINNTEKT",
      },
      {
        fom: "2024-03-01",
        tom: "2024-03-31",
        status: "NEDETID_AINNTEKT",
      },
      {
        fom: "2024-04-01",
        tom: "2024-04-30",
        status: "NEDETID_AINNTEKT",
      },
    ],
  },
  forespørselType: "BESTILT_AV_FAGSYSTEM" as const,
} satisfies OpplysningerDto;

export const opplysningerMedFlereEnn3Måneder = {
  ...STANDARD_OPPLYSNINGER,
  skjæringstidspunkt: "2024-05-04",
  inntektsopplysninger: {
    gjennomsnittLønn: 52_000,
    månedsinntekter: [
      {
        fom: "2023-12-01",
        tom: "2023-12-31",
        beløp: 52_000,
        status: "BRUKT_I_GJENNOMSNITT",
      },
      {
        fom: "2024-01-01",
        tom: "2024-01-29",
        beløp: 52_000,
        status: "BRUKT_I_GJENNOMSNITT",
      },
      {
        fom: "2024-02-01",
        tom: "2024-02-29",
        beløp: 52_000,
        status: "BRUKT_I_GJENNOMSNITT",
      },
      {
        fom: "2024-03-01",
        tom: "2024-03-31",
        status: "IKKE_RAPPORTERT_RAPPORTERINGSFRIST_IKKE_PASSERT",
      },
      {
        fom: "2024-04-01",
        tom: "2024-04-30",
        status: "IKKE_RAPPORTERT_RAPPORTERINGSFRIST_IKKE_PASSERT",
      },
    ],
  },
  forespørselType: "BESTILT_AV_FAGSYSTEM" as const,
} satisfies OpplysningerDto;

export const svpOpplysninger = {
  ...STANDARD_OPPLYSNINGER,
  forespørselType: "BESTILT_AV_FAGSYSTEM" as const,
  ytelse: "PLEIEPENGER_I_LIVETS_SLUTTFASE",
} satisfies OpplysningerDto;

export const opplysningerMedBådeRapportertOgIkkePassert = {
  ...STANDARD_OPPLYSNINGER,
  skjæringstidspunkt: "2024-12-01",
  inntektsopplysninger: {
    gjennomsnittLønn: 52_000,
    månedsinntekter: [
      {
        fom: "2024-08-01",
        tom: "2024-08-31",
        beløp: 52_000,
        status: "BRUKT_I_GJENNOMSNITT",
      },
      {
        fom: "2024-09-01",
        tom: "2024-09-30",
        beløp: 52_000,
        status: "BRUKT_I_GJENNOMSNITT",
      },
      {
        fom: "2024-10-01",
        tom: "2024-10-31",
        status: "IKKE_RAPPORTERT_MEN_BRUKT_I_GJENNOMSNITT",
      },
      {
        fom: "2024-11-01",
        tom: "2024-11-30",
        status: "IKKE_RAPPORTERT_RAPPORTERINGSFRIST_IKKE_PASSERT",
      },
    ],
  },
  forespørselType: "BESTILT_AV_FAGSYSTEM" as const,
} satisfies OpplysningerDto;

export const fullførtOppgaveResponse = {
  ...STANDARD_OPPLYSNINGER,
  forespørselStatus: "FERDIG" as const,
  forespørselType: "BESTILT_AV_FAGSYSTEM" as const,
} satisfies OpplysningerDto;
