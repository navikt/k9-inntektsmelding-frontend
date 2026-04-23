import { ArrowRightIcon } from "@navikt/aksel-icons";
import {
  Alert,
  BodyShort,
  Button,
  Heading,
  HStack,
  Label,
  TextField,
  VStack,
} from "@navikt/ds-react";
import { fnr } from "@navikt/fnrvalidator";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useFormContext } from "react-hook-form";

import { hentOpplysningerUnntattAaregister } from "~/api/queries.ts";
import { featureToggles } from "~/feature-toggles/featureToggles";
import { PersonOppslagError } from "~/features/shared/components/PersonOppslagFeil";
import { usePersonOppslagUnntattAareg } from "~/features/shared/hooks/usePersonOppslag";
import { DatePickerWrapped } from "~/features/shared/react-hook-form-wrappers/DatePickerWrapped";
import { ARBEIDSGIVERINITIERT_UNNTATT_AAREGISTER_ID } from "~/routes/opprett";
import { OpplysningerRequest, Ytelsetype } from "~/types/api-models.ts";

import { HentOpplysningerError } from "./HentOpplysningerError";
import { FormType } from "./types";
import { VelgArbeidsgiver } from "./VelgArbeidsgiver";

export function UnntattAaregRegistreringForm({
  ytelseType,
}: {
  ytelseType: Ytelsetype;
}) {
  const {
    register,
    handleSubmit: rhfHandleSubmit,
    formState,
    watch,
  } = useFormContext<FormType>();
  const navigate = useNavigate();
  const hentPersonMutation = usePersonOppslagUnntattAareg();

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

  const nullstillFeilmeldinger = () => {
    hentPersonMutation.reset();
    opprettOpplysningerMutation.reset();
  };
  if (!featureToggles.AGI_UREGISTRERT) {
    return (
      <Alert variant="info">
        <Heading level="3" size="small">
          Du må sende inn inntektsmelding via Altinn
        </Heading>
        <BodyShort>
          Skal du sende inn inntektsmelding for en ansatt som er unntatt for
          registrering i Aa-registeret, må du enn så lenge sende inn
          inntektsmelding i Altinn.
        </BodyShort>
      </Alert>
    );
  }

  return (
    <form onSubmit={rhfHandleSubmit(handleSubmit)}>
      <VStack gap="space-32">
        <HStack gap="space-40">
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
          <VStack gap="space-16">
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
          label="Første fraværsdag"
          name="førsteFraværsdag"
          callback={nullstillFeilmeldinger}
          rules={{ required: "Må oppgis" }}
        />
        <Button
          className="w-fit"
          loading={isPending}
          type="submit"
          variant="secondary"
        >
          Hent opplysninger
        </Button>
        <VelgArbeidsgiver
          data={hentPersonMutation.data}
          description="Velg hvilken underenhet den ansatte jobber for."
        />
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
                fødselsnummer: watch("fødselsnummer"),
                førsteFraværsdag: watch("førsteFraværsdag"),
                organisasjonsnummer: watch("organisasjonsnummer"),
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
