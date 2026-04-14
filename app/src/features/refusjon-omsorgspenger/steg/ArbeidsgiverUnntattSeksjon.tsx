import { BodyShort, Label, Loader, Select } from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { hentArbeidsgiversOrganisasjoner } from "../api/queries.ts";
import { useSkjemaState } from "../SkjemaStateContext";

export const ArbeidsgiverUnntattSeksjon = () => {
  const { register, formState, setValue } = useSkjemaState();
  const { data, isLoading, error } = useQuery(
    hentArbeidsgiversOrganisasjoner(),
  );

  const enkelt =
    data && data.arbeidsforhold.length === 1 ? data.arbeidsforhold[0] : null;
  useEffect(() => {
    if (enkelt) setValue("organisasjonsnummer", enkelt.organisasjonsnummer);
  }, [enkelt?.organisasjonsnummer]);

  if (isLoading) return <Loader title="Henter virksomheter" />;

  if (error || data?.arbeidsforhold.length === 0) {
    return (
      <BodyShort>
        Vi finner ingen finner ingen organisasjoner knyttet til innlogget
        bruker.
      </BodyShort>
    );
  }

  if (!data) return null;

  if (data.arbeidsforhold.length > 1) {
    return (
      <Select
        label="Velg virksomhet"
        {...register("organisasjonsnummer", { value: "" })}
        error={formState.errors.organisasjonsnummer?.message}
      >
        <option value="">Velg virksomhet</option>
        {data.arbeidsforhold.map((ag) => (
          <option key={ag.organisasjonsnummer} value={ag.organisasjonsnummer}>
            {ag.organisasjonsnavn} ({ag.organisasjonsnummer})
          </option>
        ))}
      </Select>
    );
  }

  const [enkeltUnntatt] = data.arbeidsforhold;
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <Label>Virksomhetsnavn</Label>
        <BodyShort>{enkeltUnntatt.organisasjonsnavn}</BodyShort>
      </div>
      <div className="flex-1">
        <Label>Org.nr. for underenhet</Label>
        <BodyShort>{enkeltUnntatt.organisasjonsnummer}</BodyShort>
      </div>
    </div>
  );
};
