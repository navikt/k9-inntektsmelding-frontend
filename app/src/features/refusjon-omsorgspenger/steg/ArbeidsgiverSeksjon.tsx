import { BodyShort, Label, Select } from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { hentArbeidstakerOptions } from "../api/queries.ts";
import { useSkjemaState } from "../SkjemaStateContext";

type ArbeidsgiverSeksjonProps = {
  fødselsnummer?: string;
};

export const ArbeidsgiverSeksjon = ({
  fødselsnummer,
}: ArbeidsgiverSeksjonProps) => {
  const { register, formState, setValue } = useSkjemaState();
  const { data } = useQuery(hentArbeidstakerOptions(fødselsnummer ?? ""));

  useEffect(() => {
    if (data?.arbeidsforhold.length === 1) {
      setValue(
        "organisasjonsnummer",
        data.arbeidsforhold[0].organisasjonsnummer,
      );
      setValue(
        "meta.organisasjonsnavn",
        data.arbeidsforhold[0].organisasjonsnavn,
      );
    }
  }, [data]);

  if (!data || data.arbeidsforhold.length === 0) return null;

  if (data.arbeidsforhold.length > 1) {
    return (
      <Select
        label="Velg arbeidsforhold"
        {...register("organisasjonsnummer", {
          onChange: (e) => {
            const valgt = data.arbeidsforhold.find(
              (af) => af.organisasjonsnummer === e.target.value,
            );
            setValue("meta.organisasjonsnavn", valgt?.organisasjonsnavn ?? "");
          },
        })}
        error={formState.errors.organisasjonsnummer?.message}
      >
        <option value="">Velg arbeidsforhold</option>
        {data.arbeidsforhold.map((af) => (
          <option key={af.organisasjonsnummer} value={af.organisasjonsnummer}>
            {af.organisasjonsnavn} ({af.organisasjonsnummer})
          </option>
        ))}
      </Select>
    );
  }

  const enkelt = data.arbeidsforhold[0];
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <Label>Virksomhetsnavn</Label>
        <BodyShort>{enkelt.organisasjonsnavn}</BodyShort>
      </div>
      <div className="flex-1">
        <Label>Org.nr. for underenhet</Label>
        <BodyShort>{enkelt.organisasjonsnummer}</BodyShort>
      </div>
    </div>
  );
};
