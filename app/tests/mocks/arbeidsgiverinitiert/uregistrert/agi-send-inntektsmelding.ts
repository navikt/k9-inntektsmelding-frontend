import { SendInntektsmeldingResponseDto } from "~/features/inntektsmelding/api-schemas.ts";

export const agiUregistrertSendInntektsmeldingResponse = {
  id: 3_000_801,
  foresporselUuid: "agi-unntatt-aaregister",
  aktorId: "1234567890123",
  ytelse: "PLEIEPENGER_SYKT_BARN",
  arbeidsgiverIdent: "315786940",
  kontaktperson: {
    navn: "Ola Nordmann",
    telefonnummer: "98765432",
  },
  startdato: "2024-04-01",
  inntekt: 45_000,
  refusjon: [
    {
      fom: "2024-04-01",
      beløp: 45_000,
    },
  ],
  opprettetTidspunkt: "2024-04-15T10:30:00.000",
} satisfies SendInntektsmeldingResponseDto;
