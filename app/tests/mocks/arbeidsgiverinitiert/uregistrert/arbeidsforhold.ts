import { SlåOppArbeidstakerResponseDto } from "~/types/api-schemas.ts";

export const arbeidsforholdUregistrertResponse = {
  fornavn: "MOMENTAN",
  etternavn: "TRAKT",
  arbeidsforhold: [
    {
      organisasjonsnavn: "HELDIG SPRUDLENDE TIGER AS",
      organisasjonsnummer: "315786940",
    },
  ],
  kjønn: "MANN",
} satisfies SlåOppArbeidstakerResponseDto;
