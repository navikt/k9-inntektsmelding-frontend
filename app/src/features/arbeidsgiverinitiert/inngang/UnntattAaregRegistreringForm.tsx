import { Alert, Button, TextField, VStack } from "@navikt/ds-react";
import { fnr } from "@navikt/fnrvalidator";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

import {
  hentArbeidsgiversOrganisasjonerOptions,
  hentOpplysningerUnntattAaregister,
} from "~/api/queries.ts";
import { ComboboxWrapped } from "~/features/shared/react-hook-form-wrappers/ComboboxWrapped";
import { DatePickerWrapped } from "~/features/shared/react-hook-form-wrappers/DatePickerWrapped";
import { ARBEIDSGIVERINITIERT_UNNTATT_AAREGISTER_ID } from "~/routes/opprett";
import { OpplysningerRequest, Ytelsetype } from "~/types/api-schemas.ts";

import { HentOpplysningerError } from "./HentOpplysningerError";
import { FormType } from "./types";

export function UnntattAaregRegistreringForm({
  ytelseType,
}: {
  ytelseType: Ytelsetype;
}) {
  const {
    register,
    handleSubmit: rhfHandleSubmit,
    formState,
    getValues,
    setValue,
  } = useFormContext<FormType>();
  const navigate = useNavigate();
  const [erOppslagetUtdatert, setErOppslagetUtdatert] = useState(false);
  const organisasjonerQuery = useQuery(
    hentArbeidsgiversOrganisasjonerOptions(),
  );
  const organisasjoner = organisasjonerQuery.data?.organisasjoner;

  const opprettOpplysningerMutation = useMutation({
    mutationFn: async (opplysningerRequest: OpplysningerRequest) => {
      return hentOpplysningerUnntattAaregister(opplysningerRequest);
    },
    onSuccess: (opplysninger, forespørsel) => {
      const verdier = getValues();
      // Et svar som kommer etter at brukeren har forlatt flyten, skal ikke åpne skjemaet igjen.
      if (verdier.årsak !== "unntatt_aaregister") {
        return;
      }
      if (
        verdier.fødselsnummer !== forespørsel.fødselsnummer ||
        verdier.førsteFraværsdag !== forespørsel.førsteFraværsdag ||
        verdier.organisasjonsnummer !== forespørsel.organisasjonsnummer
      ) {
        setErOppslagetUtdatert(true);
        return;
      }
      if (opplysninger.forespørselUuid === undefined) {
        const opplysningerMedId = {
          ...opplysninger,
          forespørselUuid: ARBEIDSGIVERINITIERT_UNNTATT_AAREGISTER_ID,
        };

        sessionStorage.setItem(
          ARBEIDSGIVERINITIERT_UNNTATT_AAREGISTER_ID,
          JSON.stringify(opplysningerMedId),
        );
        sessionStorage.removeItem(
          `skjemadata-${ARBEIDSGIVERINITIERT_UNNTATT_AAREGISTER_ID}`,
        );

        return navigate({
          to: "/agi-unntatt-aaregister/$id/dine-opplysninger",
          params: {
            id: ARBEIDSGIVERINITIERT_UNNTATT_AAREGISTER_ID,
          },
        });
      }

      return navigate({
        to: "/$id",
        params: { id: opplysninger.forespørselUuid },
      });
    },
  });

  const opprettOpplysninger = (verdier: FormType) => {
    opprettOpplysningerMutation.mutate({
      fødselsnummer: verdier.fødselsnummer,
      førsteFraværsdag: verdier.førsteFraværsdag,
      organisasjonsnummer: verdier.organisasjonsnummer,
      ytelseType,
    });
  };

  const isPending =
    organisasjonerQuery.isPending || opprettOpplysningerMutation.isPending;

  const handleSubmit = (verdier: FormType) => {
    setErOppslagetUtdatert(false);
    if (!organisasjoner?.length || organisasjonerQuery.isError) {
      return;
    }
    const organisasjonsnummer =
      organisasjoner.length === 1
        ? organisasjoner[0].organisasjonsnummer
        : verdier.organisasjonsnummer;
    setValue("organisasjonsnummer", organisasjonsnummer);
    opprettOpplysninger({
      ...verdier,
      organisasjonsnummer,
    });
  };

  const nullstillFeilmeldinger = () => {
    setErOppslagetUtdatert(false);
    opprettOpplysningerMutation.reset();
  };
  return (
    <form onSubmit={rhfHandleSubmit(handleSubmit)}>
      <VStack gap="space-32">
        <TextField
          {...register("fødselsnummer", {
            required: "Må oppgis",
            validate: (value: string) =>
              (value && fnr(value).status === "valid") ||
              "Du må fylle ut et gyldig fødselsnummer",
            onChange: nullstillFeilmeldinger,
          })}
          error={formState.errors.fødselsnummer?.message}
          label="Ansattes fødselsnummer"
          className="max-w-xs"
        />
        <DatePickerWrapped
          label="Første fraværsdag"
          name="førsteFraværsdag"
          callback={nullstillFeilmeldinger}
          rules={{ required: "Må oppgis" }}
        />
        {organisasjoner && organisasjoner.length > 1 && (
          <ComboboxWrapped
            data-testid="steg-0-combobox-arbeidsgiver"
            description="Velg hvilken underenhet inntektsmeldingen gjelder for."
            label="Arbeidsgiver"
            name="organisasjonsnummer"
            shouldUnregister
            onOptionSelected={nullstillFeilmeldinger}
            options={organisasjoner
              .toSorted((a, b) =>
                a.organisasjonsnavn.localeCompare(b.organisasjonsnavn, "nb"),
              )
              .map((organisasjon) => ({
                value: organisasjon.organisasjonsnummer,
                label: `${organisasjon.organisasjonsnavn} (${organisasjon.organisasjonsnummer})`,
              }))}
            rules={{ required: "Du må velge arbeidsgiver" }}
          />
        )}
        <Button
          className="w-fit"
          disabled={!organisasjoner?.length || organisasjonerQuery.isError}
          loading={isPending}
          type="submit"
          variant="secondary"
        >
          {organisasjoner && organisasjoner.length > 1
            ? "Opprett inntektsmelding"
            : "Hent opplysninger"}
        </Button>
        {organisasjonerQuery.isError && (
          <Alert variant="error">
            Kunne ikke hente virksomhetene dine. Prøv igjen.
            <Button
              className="mt-4"
              type="button"
              variant="secondary"
              loading={organisasjonerQuery.isFetching}
              onClick={() => organisasjonerQuery.refetch()}
            >
              Prøv igjen
            </Button>
          </Alert>
        )}
        {organisasjoner?.length === 0 && (
          <Alert variant="warning">
            Vi finner ingen virksomheter du har tilgang til. Sjekk tilgangene
            dine i Altinn.
          </Alert>
        )}
        {erOppslagetUtdatert && (
          <Alert variant="warning" role="alert">
            Opplysningene ble endret under henting. Prøv igjen med de oppdaterte
            opplysningene.
          </Alert>
        )}
        <HentOpplysningerError error={opprettOpplysningerMutation.error} />
      </VStack>
    </form>
  );
}
