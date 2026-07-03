import { BodyShort, Label, Loader } from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { ComboboxWrapped } from "~/features/shared/react-hook-form-wrappers/ComboboxWrapped";

import { hentArbeidsgiversOrganisasjonerOptions } from "../api/queries.ts";
import { useSkjemaState } from "../SkjemaStateContext";

export const ArbeidsgiverUnntattSeksjon = () => {
  const { register, setValue } = useSkjemaState();
  const { data, isLoading, error } = useQuery(
    hentArbeidsgiversOrganisasjonerOptions(),
  );

  const enkeltUnntatt =
    !isLoading && !error && data?.organisasjoner.length === 1
      ? data.organisasjoner[0]
      : null;

  useEffect(() => {
    if (enkeltUnntatt) {
      setValue("meta.organisasjonsnavn", enkeltUnntatt.organisasjonsnavn);
    }
  }, [enkeltUnntatt?.organisasjonsnavn]);

  if (isLoading) return <Loader title="Henter virksomheter" />;

  if (error || data?.organisasjoner.length === 0) {
    return (
      <BodyShort>
        Vi finner ingen finner ingen organisasjoner knyttet til innlogget
        bruker.
      </BodyShort>
    );
  }

  if (!data) return null;

  if (data.organisasjoner.length > 1) {
    const options = data.organisasjoner
      .toSorted((a, b) =>
        a.organisasjonsnavn.localeCompare(b.organisasjonsnavn, "nb"),
      )
      .map((org) => ({
        value: org.organisasjonsnummer,
        label: `${org.organisasjonsnavn} (org.nr. ${org.organisasjonsnummer})`,
      }));

    return (
      <ComboboxWrapped
        label="Velg virksomhet"
        name="organisasjonsnummer"
        options={options}
        onOptionSelected={(valgt) => {
          const organisasjon = data.organisasjoner.find(
            (org) => org.organisasjonsnummer === valgt?.value,
          );
          setValue(
            "meta.organisasjonsnavn",
            organisasjon?.organisasjonsnavn ?? "",
          );
        }}
      />
    );
  }

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <Label>Virksomhetsnavn</Label>
        <BodyShort>{enkeltUnntatt!.organisasjonsnavn}</BodyShort>
      </div>
      <div className="flex-1">
        <Label>Org.nr. for underenhet</Label>
        <input
          type="hidden"
          {...register("organisasjonsnummer")}
          value={enkeltUnntatt!.organisasjonsnummer}
        />
        <BodyShort>{enkeltUnntatt!.organisasjonsnummer}</BodyShort>
      </div>
    </div>
  );
};
