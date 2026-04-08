import { BodyShort, Loader } from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { lagFulltNavn } from "~/utils.ts";

import {
  hentArbeidstakerOptions,
  hentPersonUnntattAaregisterOptions,
} from "../api/queries.ts";
import { useSkjemaState } from "../SkjemaStateContext";

const PersonNavnVisning = ({ navn }: { navn: string | undefined }) => {
  const [visGrønnBakgrunn, setVisGrønnBakgrunn] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisGrønnBakgrunn(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <span
      className="flex-1 flex flex-col justify-center px-2 py-1 rounded transition-colors duration-300"
      style={{
        backgroundColor: visGrønnBakgrunn
          ? "var(--ax-bg-success-soft)"
          : "transparent",
      }}
    >
      {navn}
    </span>
  );
};

export const NavnVisning = () => {
  const { register, watch } = useSkjemaState();

  const fødselsnummer = watch("ansattesFødselsnummer");
  const erUnntattAaregisteret = watch("erUnntattAaregisteret");
  const førsteFraværsdatoForÅret = watch("førsteFraværsdatoForÅret");
  const valgtOrganisasjonsnummer = watch("organisasjonsnummer");

  const visUnntattLøype = erUnntattAaregisteret ?? false;

  const { data, error, isLoading } = useQuery(
    hentArbeidstakerOptions(fødselsnummer ?? ""),
  );

  const unntattOppslagArgs =
    visUnntattLøype &&
    fødselsnummer &&
    førsteFraværsdatoForÅret &&
    valgtOrganisasjonsnummer
      ? {
          fødselsnummer,
          førsteFraværsdatoForÅret,
          organisasjonsnummer: valgtOrganisasjonsnummer,
        }
      : null;

  const { data: personUnntatt, isLoading: isLoadingPersonUnntatt } = useQuery(
    hentPersonUnntattAaregisterOptions(unntattOppslagArgs),
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

  if (isLoadingPersonUnntatt) {
    return <Loader className="block mt-5" title="Henter informasjon" />;
  }

  if (personUnntatt) {
    return (
      <>
        <PersonNavnVisning navn={lagFulltNavn(personUnntatt.person)} />
        <input
          type="hidden"
          {...register("ansattesFornavn", {
            value: personUnntatt.person.fornavn,
          })}
        />
        <input
          type="hidden"
          {...register("ansattesEtternavn", {
            value: personUnntatt.person.etternavn,
          })}
        />
        <input
          type="hidden"
          {...register("ansattesAktørId", {
            value: personUnntatt.person.aktørId,
          })}
        />
      </>
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
