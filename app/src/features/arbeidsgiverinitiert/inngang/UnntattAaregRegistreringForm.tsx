import { ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Button, TextField, VStack } from "@navikt/ds-react";
import { fnr } from "@navikt/fnrvalidator";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useFormContext } from "react-hook-form";

import {
  hentArbeidsgiversOrganisasjoner,
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
    setValue,
  } = useFormContext<FormType>();
  const navigate = useNavigate();
  const hentOrganisasjonerMutation = useMutation({
    mutationFn: async () => {
      const data = await hentArbeidsgiversOrganisasjoner();
      if (data.organisasjoner.length === 0) {
        throw new Error(
          "Fant ingen organisasjoner knyttet til innlogget bruker",
        );
      }
      return data;
    },
  });

  const opprettOpplysningerMutation = useMutation({
    mutationFn: async (opplysningerRequest: OpplysningerRequest) => {
      return hentOpplysningerUnntattAaregister(opplysningerRequest);
    },
    onSuccess: (opplysninger) => {
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

  const isPending =
    hentOrganisasjonerMutation.isPending ||
    opprettOpplysningerMutation.isPending;

  const handleSubmit = (values: FormType) => {
    if (hentOrganisasjonerMutation.data) {
      opprettOpplysningerMutation.mutate({
        fødselsnummer: values.fødselsnummer,
        førsteFraværsdag: values.førsteFraværsdag,
        ytelseType,
        organisasjonsnummer: values.organisasjonsnummer,
      });
      return;
    }

    hentOrganisasjonerMutation.mutate(undefined, {
      onSuccess: (data) => {
        if (data?.organisasjoner.length === 1) {
          setValue(
            "organisasjonsnummer",
            data.organisasjoner[0].organisasjonsnummer,
          );
          return opprettOpplysningerMutation.mutate({
            fødselsnummer: values.fødselsnummer,
            førsteFraværsdag: values.førsteFraværsdag,
            ytelseType,
            organisasjonsnummer: data.organisasjoner[0].organisasjonsnummer,
          });
        }
      },
    });
  };

  const nullstillFeilmeldinger = () => {
    opprettOpplysningerMutation.reset();
  };
  const organisasjoner = hentOrganisasjonerMutation.data?.organisasjoner ?? [];
  const options = organisasjoner
    .toSorted((første, andre) =>
      første.organisasjonsnavn.localeCompare(andre.organisasjonsnavn, "nb"),
    )
    .map((organisasjon) => ({
      value: organisasjon.organisasjonsnummer,
      label: `${organisasjon.organisasjonsnavn} (${organisasjon.organisasjonsnummer})`,
    }));
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
        />
        <DatePickerWrapped
          label="Første fraværsdag"
          name="førsteFraværsdag"
          callback={nullstillFeilmeldinger}
          rules={{ required: "Må oppgis" }}
        />
        {organisasjoner.length === 0 && (
          <Button
            className="w-fit"
            loading={isPending}
            type="submit"
            variant="secondary"
          >
            Hent opplysninger
          </Button>
        )}
        {organisasjoner.length > 1 && (
          <ComboboxWrapped
            data-testid="steg-0-combobox-arbeidsgiver"
            description="Velg hvilken underenhet den ansatte jobber for."
            label="Arbeidsgiver"
            name="organisasjonsnummer"
            options={options}
            rules={{ required: "Må oppgis" }}
          />
        )}
        {hentOrganisasjonerMutation.error && (
          <Alert role="alert" variant="error">
            Kunne ikke hente virksomheter knyttet til innlogget bruker. Prøv
            igjen.
          </Alert>
        )}
        <HentOpplysningerError error={opprettOpplysningerMutation.error} />
        {organisasjoner.length > 0 && (
          <Button
            className="w-fit"
            icon={<ArrowRightIcon />}
            iconPosition="right"
            loading={opprettOpplysningerMutation.isPending}
            type="submit"
          >
            Opprett inntektsmelding
          </Button>
        )}
      </VStack>
    </form>
  );
}
