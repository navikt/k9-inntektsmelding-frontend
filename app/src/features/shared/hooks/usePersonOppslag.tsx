import { useMutation } from "@tanstack/react-query";

import {
  hentPersonFraFnr,
  hentPersonFraFnrUnntattAareg,
} from "~/api/queries.ts";
import { Ytelsetype } from "~/types/api-models.ts";

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

export function usePersonOppslagUnntattAareg() {
  return useMutation({
    mutationFn: async () => {
      return await hentPersonFraFnrUnntattAareg();
    },
  });
}
