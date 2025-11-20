import { Select } from "@navikt/ds-react";
import { useFormContext } from "react-hook-form";

import { SlåOppArbeidstakerResponseDto } from "~/types/api-models.ts";

import { FormType } from "./types";

export function VelgArbeidsgiver({
  data,
}: {
  data?: SlåOppArbeidstakerResponseDto;
}) {
  const formMethods = useFormContext<FormType>();

  if (!data || data.arbeidsforhold.length <= 1) {
    return null;
  }

  return (
    <Select
      data-testid="steg-0-select-arbeidsgiver"
      description="Den ansatte har flere arbeidsforhold hos samme arbeidsgiver. Velg hvilken underenhet inntektsmeldingen gjelder for. "
      error={formMethods.formState.errors.organisasjonsnummer?.message}
      label="Arbeidsgiver"
      {...formMethods.register(`organisasjonsnummer`, {
        required: "Må oppgis",
      })}
    >
      <option value="">Velg Organisasjon</option>
      {data?.arbeidsforhold.map((arbeidsforhold) => (
        <option
          key={arbeidsforhold.organisasjonsnummer}
          value={arbeidsforhold.organisasjonsnummer}
        >
          {arbeidsforhold.organisasjonsnavn} (
          {arbeidsforhold.organisasjonsnummer})
        </option>
      ))}
    </Select>
  );
}
