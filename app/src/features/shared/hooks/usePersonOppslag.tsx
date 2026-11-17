import { useMutation } from "@tanstack/react-query";

import { hentPersonFraFnr } from "~/api/queries.ts";
import { Ytelsetype } from "~/types/api-schemas.ts";

export interface PersonOppslagParams {
  fødselsnummer: string;
  ytelse: Ytelsetype;
  førsteFraværsdag: string;
}

export function usePersonOppslag() {
  return useMutation({
    mutationFn: async ({
      fødselsnummer,
      ytelse,
      førsteFraværsdag,
    }: PersonOppslagParams) => {
      return await hentPersonFraFnr(fødselsnummer, ytelse, førsteFraværsdag);
    },
  });
}
