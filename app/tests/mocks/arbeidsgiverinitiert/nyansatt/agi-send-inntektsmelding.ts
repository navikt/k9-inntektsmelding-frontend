import { SendInntektsmeldingResponseDto } from "~/types/api-models.ts";

export const agiSendInntektsmeldingResponse = {
  id: 2_000_801,
  foresporselUuid: "agi",
  aktorId: "1234567890123",
  ytelse: "PLEIEPENGER_SYKT_BARN",
  arbeidsgiverIdent: "974652293",
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

export const agiSendInntektsmeldingResponseVarierendeRefusjon = {
  ...agiSendInntektsmeldingResponse,
  refusjon: [
    {
      fom: "2024-04-01",
      beløp: 45_000,
    },
    {
      fom: "2024-05-01",
      beløp: 30_000,
    },
  ],
} satisfies SendInntektsmeldingResponseDto;

export const agiSendInntektsmeldingResponseUtenRefusjon = {
  ...agiSendInntektsmeldingResponse,
  refusjon: [],
} satisfies SendInntektsmeldingResponseDto;
