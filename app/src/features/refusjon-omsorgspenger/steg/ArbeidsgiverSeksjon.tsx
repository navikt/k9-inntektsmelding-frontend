import { BodyShort, Detail, Label, VStack } from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect } from "react";

import { ComboboxWrapped } from "~/features/shared/react-hook-form-wrappers/ComboboxWrapped";

import { hentArbeidstakerOptions } from "../api/queries.ts";
import { useSkjemaState } from "../SkjemaStateContext";

type ArbeidsgiverSeksjonProps = {
  fødselsnummer?: string;
};

export const ArbeidsgiverSeksjon = ({
  fødselsnummer,
}: ArbeidsgiverSeksjonProps) => {
  const { setValue, getValues } = useSkjemaState();
  const { data } = useQuery(
    hentArbeidstakerOptions(fødselsnummer ?? "", getValues("årForRefusjon")),
  );

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
    const options = data.arbeidsforhold
      .toSorted((a, b) =>
        a.organisasjonsnavn.localeCompare(b.organisasjonsnavn, "nb"),
      )
      .map((af) => ({
        value: af.organisasjonsnummer,
        label: `${af.organisasjonsnavn} (org.nr. ${af.organisasjonsnummer})${af.ansettelsesperiode.tom ? ` – avsluttet ${dayjs(af.ansettelsesperiode.tom).format("DD.MM.YYYY")}` : ""}`,
      }));

    return (
      <ComboboxWrapped
        label="Velg arbeidsforhold"
        name="organisasjonsnummer"
        options={options}
        onOptionSelected={(valgt) => {
          const arbeidsforhold = data.arbeidsforhold.find(
            (af) => af.organisasjonsnummer === valgt?.value,
          );
          setValue(
            "meta.organisasjonsnavn",
            arbeidsforhold?.organisasjonsnavn ?? "",
          );
        }}
      />
    );
  }

  const enkelt = data.arbeidsforhold[0];
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <Label>Virksomhetsnavn</Label>
        <VStack gap="space-2">
          <BodyShort>{enkelt.organisasjonsnavn}</BodyShort>
          {enkelt.ansettelsesperiode.tom && (
            <Detail>{`Arbeidsforholdet ble avsluttet ${dayjs(enkelt.ansettelsesperiode.tom).format("DD.MM.YYYY")}`}</Detail>
          )}
        </VStack>
      </div>
      <div className="flex-1">
        <Label>Org.nr. for underenhet</Label>
        <BodyShort>{enkelt.organisasjonsnummer}</BodyShort>
      </div>
    </div>
  );
};
