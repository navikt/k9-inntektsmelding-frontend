import { BodyShort, Label, Loader, Select } from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { hentArbeidsgiversOrganisasjonerOptions } from "../api/queries.ts";
import { useSkjemaState } from "../SkjemaStateContext";

export const ArbeidsgiverUnntattSeksjon = () => {
  const { register, formState, setValue } = useSkjemaState();
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
    return (
      <Select
        label="Velg virksomhet"
        {...register("organisasjonsnummer", {
          value: "",
          onChange: (e) => {
            const valgt = data.organisasjoner.find(
              (org) => org.organisasjonsnummer === e.target.value,
            );
            setValue("meta.organisasjonsnavn", valgt?.organisasjonsnavn ?? "");
          },
        })}
        error={formState.errors.organisasjonsnummer?.message}
      >
        <option value="">Velg virksomhet</option>
        {data.organisasjoner.map((ag) => (
          <option key={ag.organisasjonsnummer} value={ag.organisasjonsnummer}>
            {`${ag.organisasjonsnavn} (org.nr. ${ag.organisasjonsnummer})`}
          </option>
        ))}
      </Select>
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
