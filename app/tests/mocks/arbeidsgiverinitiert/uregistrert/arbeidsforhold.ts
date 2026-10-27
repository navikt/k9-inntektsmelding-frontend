import { SlåOppArbeidstakerUregistrertResponseDto } from "~/types/api-schemas.ts";

export const arbeidsforholdUregistrertResponse = {
  arbeidsforhold: [
    {
      organisasjonsnavn: "HELDIG SPRUDLENDE TIGER AS",
      organisasjonsnummer: "315786940",
    },
  ],
  kjønn: "MANN",
} satisfies SlåOppArbeidstakerUregistrertResponseDto;
