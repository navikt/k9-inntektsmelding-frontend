import { BodyShort, Label, Loader, Select } from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";

import { hentArbeidsgiversOrganisasjonerOptions } from "../api/queries.ts";
import { useSkjemaState } from "../SkjemaStateContext";

export const ArbeidsgiverUnntattSeksjon = () => {
  const { register, formState } = useSkjemaState();
  const { data, isLoading, error } = useQuery(
    hentArbeidsgiversOrganisasjonerOptions(),
  );

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
        {...register("organisasjonsnummer", { value: "" })}
        error={formState.errors.organisasjonsnummer?.message}
      >
        <option value="">Velg virksomhet</option>
        {data.organisasjoner.map((ag) => (
          <option key={ag.organisasjonsnummer} value={ag.organisasjonsnummer}>
            {ag.organisasjonsnavn} ({ag.organisasjonsnummer})
          </option>
        ))}
      </Select>
    );
  }

  const [enkeltUnntatt] = data.organisasjoner;
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <Label>Virksomhetsnavn</Label>
        <BodyShort>{enkeltUnntatt.organisasjonsnavn}</BodyShort>
      </div>
      <div className="flex-1">
        <Label>Org.nr. for underenhet</Label>
        <input
          type="hidden"
          {...register("organisasjonsnummer")}
          value={enkeltUnntatt.organisasjonsnummer}
        />
        <BodyShort>{enkeltUnntatt.organisasjonsnummer}</BodyShort>
      </div>
    </div>
  );
};
