import { SendInntektsmeldingResponseDto } from "~/features/inntektsmelding/api-schemas.ts";

export const ingenEksisterendeInntektsmeldingerResponse = [];

export const mangeEksisterendeInntektsmeldingerResponse = [
  {
    id: 1_001_706,
    foresporselUuid: "f29dcea7-febe-4a76-911c-ad8f6d3e8858",
    aktorId: "2715347149890",
    ytelse: "PLEIEPENGER_SYKT_BARN",
    arbeidsgiverIdent: "810007842",
    kontaktperson: {
      navn: "Berømt Flyttelass",
      telefonnummer: "12312312",
    },
    startdato: "2024-05-30",
    inntekt: 500,
    opprettetTidspunkt: "2024-10-04T13:34:43.184",
    refusjon: [
      {
        fom: "2024-05-30",
        beløp: 500,
      },
      {
        fom: "2024-10-25",
        beløp: 80,
      },
    ],
    bortfaltNaturalytelsePerioder: [
      {
        fom: "2024-09-12",
        naturalytelsetype: "LOSJI",
        beløp: 50,
      },
    ],
    endringAvInntektÅrsaker: [
      {
        årsak: "FERIE",
        fom: "2024-09-11",
        tom: "2024-09-25",
      },
      {
        årsak: "PERMISJON",
        fom: "2024-10-11",
      },
    ],
  },
  {
    id: 1_001_705,
    foresporselUuid: "f29dcea7-febe-4a76-911c-ad8f6d3e8858",
    aktorId: "2715347149890",
    ytelse: "PLEIEPENGER_SYKT_BARN",
    arbeidsgiverIdent: "810007842",
    kontaktperson: {
      navn: "Berømt Flyttelass",
      telefonnummer: "12312312",
    },
    startdato: "2024-05-30",
    inntekt: 500,
    opprettetTidspunkt: "2024-10-08T13:34:23.086",
    bortfaltNaturalytelsePerioder: [
      {
        fom: "2024-09-12",
        tom: "2024-10-12",
        naturalytelsetype: "LOSJI",
        beløp: 50,
      },
    ],
    refusjon: [
      {
        fom: "2024-05-30",
        beløp: 500,
      },
      {
        fom: "2024-10-25",
        beløp: 80,
      },
    ],
    endringAvInntektÅrsaker: [
      {
        årsak: "FERIE",
        fom: "2024-03-11",
        tom: "2024-04-25",
      },
      {
        årsak: "PERMISJON",
        fom: "2024-04-11",
      },
    ],
  },
] satisfies SendInntektsmeldingResponseDto[];
