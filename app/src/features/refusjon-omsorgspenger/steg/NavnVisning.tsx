import { BodyShort, Loader } from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";

import { lagFulltNavn } from "~/utils.ts";

import { hentArbeidstakerOptions } from "../api/queries.ts";
import { useSkjemaState } from "../SkjemaStateContext";

export const NavnVisning = () => {
  const { register, watch, getValues } = useSkjemaState();

  const erUnntattAaregisteret = watch("erUnntattAaregisteret");

  const { data, error, isLoading } = useQuery(
    hentArbeidstakerOptions(
      getValues("ansattesFødselsnummer") ?? "",
      getValues("årForRefusjon"),
    ),
  );

  if (erUnntattAaregisteret) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mt-5" role="status">
        <Loader title="Henter informasjon" />
      </div>
    );
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
