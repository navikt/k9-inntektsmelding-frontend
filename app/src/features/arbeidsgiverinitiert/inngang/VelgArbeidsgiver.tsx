import { ComboboxWrapped } from "~/features/shared/react-hook-form-wrappers/ComboboxWrapped";
import { SlåOppArbeidstakerResponseDto } from "~/types/api-schemas.ts";

export function VelgArbeidsgiver({
  data,
  description = "Den ansatte har flere arbeidsforhold hos samme arbeidsgiver. Velg hvilken underenhet inntektsmeldingen gjelder for.",
}: {
  data?: SlåOppArbeidstakerResponseDto;
  description?: string;
}) {
  if (!data || data.arbeidsforhold.length <= 1) {
    return null;
  }

  const options = data.arbeidsforhold
    .toSorted((a, b) =>
      a.organisasjonsnavn.localeCompare(b.organisasjonsnavn, "nb"),
    )
    .map((arbeidsforhold) => ({
      value: arbeidsforhold.organisasjonsnummer,
      label: `${arbeidsforhold.organisasjonsnavn} (${arbeidsforhold.organisasjonsnummer})`,
    }));

  return (
    <ComboboxWrapped
      data-testid="steg-0-combobox-arbeidsgiver"
      description={description}
      label="Arbeidsgiver"
      name="organisasjonsnummer"
      options={options}
      rules={{ required: "Må oppgis" }}
    />
  );
}
