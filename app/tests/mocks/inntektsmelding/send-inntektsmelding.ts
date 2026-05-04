import { SendInntektsmeldingResponseDto } from "~/features/inntektsmelding/api-schemas.ts";

export const enkelSendInntektsmeldingResponse = {
  id: 1_000_801,
  foresporselUuid: "1",
  aktorId: "2715347149890",
  ytelse: "PLEIEPENGER_SYKT_BARN",
  arbeidsgiverIdent: "810007842",
  kontaktperson: {
    navn: "Test Testesen",
    telefonnummer: "13371337",
  },
  startdato: "2024-05-30",
  inntekt: 20_000,
  refusjon: [],
  opprettetTidspunkt: "2024-09-11T15:23:16.013",
} satisfies SendInntektsmeldingResponseDto;
