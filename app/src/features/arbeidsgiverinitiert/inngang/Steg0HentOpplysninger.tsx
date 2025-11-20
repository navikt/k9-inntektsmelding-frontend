import { Heading, Radio, RadioGroup } from "@navikt/ds-react";
import { getRouteApi } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";

import { useDocumentTitle } from "~/features/shared/hooks/useDocumentTitle";
import { formatYtelsesnavn } from "~/utils.ts";

import { AnnenÅrsak } from "./AnnenÅrsak";
import { NyAnsattForm } from "./NyAnsattForm";
import { FormType } from "./types";
import { UnntattAaregRegistrering } from "./UnntattAaregRegistrering";

export const HentOpplysninger = () => {
  const route = getRouteApi("/opprett");
  const { ytelseType } = route.useSearch();
  useDocumentTitle(
    `Opprett inntektsmelding for ${formatYtelsesnavn(ytelseType)}`,
  );

  const formMethods = useForm<FormType>({
    defaultValues: {
      fødselsnummer: "",
      årsak: "",
      organisasjonsnummer: "",
    },
  });

  const { name, ...radioGroupProps } = formMethods.register("årsak", {
    required: "Du må svare på dette spørsmålet",
  });

  return (
    <FormProvider {...formMethods}>
      <section className="mt-2">
        <div className="bg-bg-default px-5 py-6 rounded-md flex flex-col gap-6">
          <Heading level="3" size="large">
            Opprett manuell inntektsmelding
          </Heading>
          <RadioGroup
            error={formMethods.formState.errors.årsak?.message}
            legend="Årsak til at du vil opprette inntektsmelding"
            name={name}
          >
            <Radio value="ny_ansatt" {...radioGroupProps}>
              Ny ansatt som mottar ytelse fra Nav
            </Radio>
            <Radio
              description="(Ambassadepersonell, fiskere og utenlandske arbeidstakere)"
              value="unntatt_aaregister"
              {...radioGroupProps}
            >
              Unntatt registrering i Aa-registeret
            </Radio>
            <Radio value="annen_årsak" {...radioGroupProps}>
              Annen årsak
            </Radio>
          </RadioGroup>
          {formMethods.watch("årsak") === "ny_ansatt" && (
            <NyAnsattForm ytelseType={ytelseType} />
          )}
          {formMethods.watch("årsak") === "unntatt_aaregister" && (
            <UnntattAaregRegistrering ytelseType={ytelseType} />
          )}
          {formMethods.watch("årsak") === "annen_årsak" && <AnnenÅrsak />}
        </div>
      </section>
    </FormProvider>
  );
};
