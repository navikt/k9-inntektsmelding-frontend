/* eslint-disable @typescript-eslint/no-unused-vars */
import { ArrowRightIcon } from "@navikt/aksel-icons";
import {
  Alert,
  BodyShort,
  Button,
  Heading,
  HStack,
  TextField,
  VStack,
} from "@navikt/ds-react";
import { fnr } from "@navikt/fnrvalidator";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useFormContext } from "react-hook-form";

import { featureToggles } from "~/feature-toggles/featureToggles";
import { usePersonOppslagUnntattAareg } from "~/features/shared/hooks/usePersonOppslag";
import { ARBEIDSGIVERINITIERT_UNNTATT_AAREGISTER_ID } from "~/routes/opprett";
import {
  OpplysningerDto,
  OpplysningerRequest,
  Ytelsetype,
} from "~/types/api-models.ts";

import { HentOpplysningerError } from "./HentOpplysningerError";
import { FormType } from "./types";

export function UnntattAaregRegistreringForm({
  ytelseType,
}: {
  ytelseType: Ytelsetype;
}) {
  const formMethods = useFormContext<FormType>();
  const navigate = useNavigate();

  //TODO: Erstatt med egen usePersonOppslag hook for unntatt_aaregister
  const hentPersonMutation = usePersonOppslagUnntattAareg();

  //TODO: Gjenbruk, denne kan være lik som i NyAnsattForm
  const opprettOpplysningerMutation = useMutation({
    mutationFn: async (opplysningerRequest: OpplysningerRequest) => {
      // stub
      return Promise.resolve({
        forespørselUuid: undefined,
        person: {
          fornavn: "Ola",
          etternavn: "Nordmann",
          fødselsnummer: "26448515302",
          aktørId: "1234567890123",
        },
        arbeidsgiver: {
          organisasjonNavn: "NAV",
          organisasjonNummer: "315853370",
        },
        ytelse: "PLEIEPENGER_SYKT_BARN",
        innsender: {
          fornavn: "Emil",
          etternavn: "Johansen",
          mellomnavn: undefined,
          telefon: undefined,
        },
        inntektsopplysninger: {
          gjennomsnittLønn: 50_000,
          // tre siste måneder med rapportert lønn
          månedsinntekter: Array.from({ length: 3 }, (_, index) => ({
            fom: new Date(
              new Date().setMonth(new Date().getMonth() - index),
            ).toISOString(),
            tom: new Date(
              new Date().setMonth(new Date().getMonth() - index),
            ).toISOString(),
            beløp: 50_000,
            status: "BRUKT_I_GJENNOMSNITT",
          })),
        },
        forespørselStatus: "UNDER_BEHANDLING",
        forespørselType: "BESTILT_AV_FAGSYSTEM",
        skjæringstidspunkt: new Date().toDateString(),
        førsteUttaksdato: new Date().toISOString(),
      }) satisfies Promise<OpplysningerDto>;
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

  const handleSubmit = (values: FormType) => {
    hentPersonMutation.mutate(undefined, {
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
    });
  };

  if (!featureToggles.AGI_NYANSATT) {
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
        </HStack>
        <div>
          <Button type="submit" variant="secondary">
            Hent opplysninger
          </Button>
        </div>
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
