import { BodyShort, Loader } from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";

import { lagFulltNavn } from "~/utils.ts";

import { hentArbeidstakerOptions } from "../api/queries.ts";
import { useSkjemaState } from "../SkjemaStateContext";

export const NavnVisning = () => {
  const { register, watch } = useSkjemaState();

  const fødselsnummer = watch("ansattesFødselsnummer");

  const { data, error, isLoading } = useQuery(
    hentArbeidstakerOptions(fødselsnummer ?? ""),
  );

  if (isLoading) {
    return <Loader className="block mt-5" title="Henter informasjon" />;
  }

  if (data) {
    return (
      <BodyShort className="flex-1 flex flex-col justify-center">
        {lagFulltNavn(data.personinformasjon)}
        <input
          type="hidden"
          {...register("ansattesFornavn", {
            value: data.personinformasjon.fornavn,
          })}
        />
        <input
          type="hidden"
          {...register("ansattesEtternavn", {
            value: data.personinformasjon.etternavn,
          })}
        />
        <input
          type="hidden"
          {...register("ansattesAktørId", {
            value: data.personinformasjon.aktørId,
          })}
        />
      </BodyShort>
    );
  }

  const fantIngenPersoner =
    error && "feilkode" in error && error.feilkode === "fant ingen personer";

  if (fantIngenPersoner) {
    return (
      <BodyShort className="flex-1 flex flex-col justify-center">
        Fant ikke person
      </BodyShort>
    );
  }

  if (error) {
    return (
      <BodyShort className="flex-1 flex flex-col justify-center">
        Kunne ikke hente data
      </BodyShort>
    );
  }

  return null;
};
