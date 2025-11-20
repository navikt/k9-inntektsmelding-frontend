import { ArrowRightIcon } from "@navikt/aksel-icons";
import {
  BodyShort,
  Button,
  HStack,
  Label,
  TextField,
  VStack,
} from "@navikt/ds-react";
import { fnr } from "@navikt/fnrvalidator";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useFormContext } from "react-hook-form";

import { hentOpplysninger } from "~/api/queries.ts";
import { PersonOppslagError } from "~/features/shared/components/PersonOppslagFeil";
import { usePersonOppslag } from "~/features/shared/hooks/usePersonOppslag";
import { DatePickerWrapped } from "~/features/shared/react-hook-form-wrappers/DatePickerWrapped";
import { ARBEIDSGIVER_INITERT_ID } from "~/routes/opprett";
import { OpplysningerRequest, Ytelsetype } from "~/types/api-models.ts";

import { HentOpplysningerError } from "./HentOpplysningerError";
import { FormType } from "./types";
import { VelgArbeidsgiver } from "./VelgArbeidsgiver";

export function NyAnsattForm({ ytelseType }: { ytelseType: Ytelsetype }) {
  const formMethods = useFormContext<FormType>();
  const navigate = useNavigate();
  const hentPersonMutation = usePersonOppslag();

  const opprettOpplysningerMutation = useMutation({
    mutationFn: async (opplysningerRequest: OpplysningerRequest) => {
      return hentOpplysninger(opplysningerRequest);
    },
    onSuccess: (opplysninger) => {
      if (opplysninger.forespørselUuid === undefined) {
        const opplysningerMedId = {
          ...opplysninger,
          forespørselUuid: ARBEIDSGIVER_INITERT_ID,
        };

        sessionStorage.setItem(
          ARBEIDSGIVER_INITERT_ID,
          JSON.stringify(opplysningerMedId),
        );
        sessionStorage.removeItem(`skjemadata-${ARBEIDSGIVER_INITERT_ID}`);

        return navigate({
          to: "/agi/$id/dine-opplysninger",
          params: {
            id: ARBEIDSGIVER_INITERT_ID,
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
    hentPersonMutation.isPending || opprettOpplysningerMutation.isPending;

  const handleSubmit = (values: FormType) => {
    hentPersonMutation.mutate(
      {
        fødselsnummer: values.fødselsnummer,
        ytelse: ytelseType,
        førsteFraværsdag: values.førsteFraværsdag,
      },
      {
        onSuccess: (data) => {
          if (data.arbeidsforhold.length === 1) {
            return opprettOpplysningerMutation.mutate({
              fødselsnummer: values.fødselsnummer,
              førsteFraværsdag: values.førsteFraværsdag,
              ytelseType,
              organisasjonsnummer: data.arbeidsforhold[0].organisasjonsnummer,
            });
          }
        },
      },
    );
  };

  return (
    <form onSubmit={formMethods.handleSubmit(handleSubmit)}>
      <VStack gap="8">
        <HStack gap="10">
          <TextField
            {...formMethods.register("fødselsnummer", {
              required: "Må oppgis",
              validate: (value) =>
                (value && fnr(value).status === "valid") ||
                "Du må fylle ut et gyldig fødselsnummer",
            })}
            error={formMethods.formState.errors.fødselsnummer?.message}
            label="Ansattes fødselsnummer"
          />
          <VStack gap="4">
            <Label>Navn</Label>
            {hentPersonMutation.data && (
              <BodyShort>
                {hentPersonMutation.data.fornavn}{" "}
                {hentPersonMutation.data.etternavn}
              </BodyShort>
            )}
          </VStack>
        </HStack>
        <DatePickerWrapped
          label="Første fraværsdag med refusjon"
          name="førsteFraværsdag"
          rules={{ required: "Må oppgis" }} // TODO: Forklare hvorfor det må oppgis
        />
        <Button
          className="w-fit"
          loading={isPending}
          type="submit"
          variant="secondary"
        >
          Hent opplysninger
        </Button>
        <VelgArbeidsgiver data={hentPersonMutation.data} />
        <PersonOppslagError
          context="person_oppslag"
          error={hentPersonMutation.error}
          ytelse={ytelseType}
        />
        <HentOpplysningerError error={opprettOpplysningerMutation.error} />
        {(hentPersonMutation.data?.arbeidsforhold.length ?? 0) > 1 && (
          <Button
            className="w-fit"
            icon={<ArrowRightIcon />}
            iconPosition="right"
            loading={opprettOpplysningerMutation.isPending}
            onClick={() =>
              opprettOpplysningerMutation.mutate({
                fødselsnummer: formMethods.watch("fødselsnummer"),
                førsteFraværsdag: formMethods.watch("førsteFraværsdag"),
                organisasjonsnummer: formMethods.watch("organisasjonsnummer"),
                ytelseType,
              })
            }
            type="button"
          >
            Opprett inntektsmelding
          </Button>
        )}
      </VStack>
    </form>
  );
}
