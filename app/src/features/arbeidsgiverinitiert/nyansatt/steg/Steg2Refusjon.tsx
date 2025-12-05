import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, BodyLong, Button, Heading, Stack } from "@navikt/ds-react";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { isAfter } from "date-fns";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { useOpplysninger } from "~/features/shared/hooks/useOpplysninger.tsx";
import { Fremgangsindikator } from "~/features/shared/skjema-moduler/Fremgangsindikator.tsx";
import { ARBEIDSGIVERINITERT_NYANSATT_ID } from "~/routes/opprett";
import { formatDatoKort, formatYtelsesnavn } from "~/utils";

import { PersonOppslagError } from "../../../shared/components/PersonOppslagFeil.tsx";
import { useDocumentTitle } from "../../../shared/hooks/useDocumentTitle.tsx";
import { usePersonOppslag } from "../../../shared/hooks/usePersonOppslag.tsx";
import { useScrollToTopOnMount } from "../../../shared/hooks/useScrollToTopOnMount.tsx";
import { DatePickerWrapped } from "../../../shared/react-hook-form-wrappers/DatePickerWrapped.tsx";
import { UtbetalingOgRefusjon } from "../../../shared/skjema-moduler/UtbetalingOgRefusjon.tsx";
import { useInntektsmeldingSkjemaAGINyansatt } from "../SkjemaStateContext";
import { InntektsmeldingSkjemaStateAGINyansatt } from "../zodSchemas.tsx";

export type RefusjonForm = {
  meta: {
    skalKorrigereInntekt: boolean;
  };
  skalRefunderes: "JA_LIK_REFUSJON" | "JA_VARIERENDE_REFUSJON" | "NEI";
  førsteFraværsdag: string;
} & Pick<InntektsmeldingSkjemaStateAGINyansatt, "refusjon">;

const førsteFraværsdagFremoverItidFeilmeldingHeading =
  "Du kan ikke endre denne datoen fremover i tid.";

export function Steg2Refusjon() {
  useScrollToTopOnMount();
  const opplysninger = useOpplysninger();
  const { eksisterendeInntektsmeldinger } =
    getRouteApi("/agi/$id").useLoaderData();

  useDocumentTitle(
    `Refusjon - inntektsmelding for ${formatYtelsesnavn(opplysninger.ytelse)}`,
  );

  const { inntektsmeldingSkjemaState, setInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjemaAGINyansatt();

  const defaultInntekt = opplysninger.inntektsopplysninger.gjennomsnittLønn;

  const formMethods = useForm<RefusjonForm>({
    defaultValues: {
      førsteFraværsdag:
        inntektsmeldingSkjemaState.førsteFraværsdag ||
        opplysninger.førsteUttaksdato,
      refusjon:
        inntektsmeldingSkjemaState.refusjon.length === 0
          ? [
              {
                fom:
                  inntektsmeldingSkjemaState.førsteFraværsdag ||
                  opplysninger.førsteUttaksdato,
                beløp: defaultInntekt,
              },
              { fom: undefined, beløp: 0 },
            ]
          : inntektsmeldingSkjemaState.refusjon.length === 1
            ? [
                ...inntektsmeldingSkjemaState.refusjon,
                { fom: undefined, beløp: 0 },
              ]
            : inntektsmeldingSkjemaState.refusjon,
      skalRefunderes: inntektsmeldingSkjemaState.skalRefunderes,
    },
  });

  const { handleSubmit, watch, setValue } = formMethods;

  // typeguard for sisteInntektsmelding
  const sisteInntektsmelding = eksisterendeInntektsmeldinger[0];
  const sisteInntektsmeldingFørsteFraværsdag =
    sisteInntektsmelding && "førsteFraværsdag" in sisteInntektsmelding
      ? sisteInntektsmelding.førsteFraværsdag
      : undefined;

  const prøverÅSetteFørsteFraværsdagLengerFremITidEnnSisteInntektsmelding =
    () => {
      const førsteFraværsdag = watch("førsteFraværsdag");
      const førsteFraværsdagTidligereInnsending =
        sisteInntektsmeldingFørsteFraværsdag;
      return førsteFraværsdagTidligereInnsending &&
        isAfter(førsteFraværsdag, førsteFraværsdagTidligereInnsending)
        ? førsteFraværsdagFremoverItidFeilmeldingHeading
        : undefined;
    };

  // Legg til person oppslag mutation for dato validering for første fraværsdag
  const validerFørsteFraværsdagMutation = usePersonOppslag();

  const førsteFraværsdag = watch("førsteFraværsdag");

  useEffect(() => {
    if (førsteFraværsdag) {
      const refusjon = watch("refusjon");

      setValue("refusjon", [
        {
          fom: førsteFraværsdag,
          beløp: refusjon[0]?.beløp,
        },
        ...refusjon.slice(1),
      ]);
    }
  }, [førsteFraværsdag]);

  const skalRefunderes = watch("skalRefunderes");
  useEffect(() => {
    if (skalRefunderes && skalRefunderes === "JA_LIK_REFUSJON") {
      const refusjon = watch("refusjon");
      setValue("refusjon", [refusjon[0]]);
    }
  }, [skalRefunderes, førsteFraværsdag]);

  const navigate = useNavigate();
  const onSubmit = handleSubmit((skjemadata) => {
    const { refusjon, skalRefunderes, førsteFraværsdag } = skjemadata;

    validerFørsteFraværsdagMutation.mutate(
      {
        fødselsnummer: opplysninger.person.fødselsnummer,
        ytelse: opplysninger.ytelse,
        førsteFraværsdag,
      },
      {
        onSuccess: () => {
          // Hvis validering er vellykket, lagre og naviger
          setInntektsmeldingSkjemaState(
            (prev: InntektsmeldingSkjemaStateAGINyansatt) => ({
              ...prev,
              førsteFraværsdag,
              refusjon,
              skalRefunderes,
            }),
          );
          navigate({
            from: "/agi/$id/refusjon",
            params: {
              id:
                opplysninger.forespørselUuid || ARBEIDSGIVERINITERT_NYANSATT_ID,
            },
            to: "../oppsummering",
          });
        },
      },
    );
  });

  return (
    <FormProvider {...formMethods}>
      <section className="mt-2">
        <form
          className="bg-bg-default px-5 py-6 rounded-md flex gap-6 flex-col"
          onSubmit={onSubmit}
        >
          <Heading level="3" size="large">
            Refusjon
          </Heading>
          <Fremgangsindikator aktivtSteg={2} />
          <DatePickerWrapped
            label="Første fraværsdag med refusjon"
            name="førsteFraværsdag"
            rules={{
              required: "Må oppgis",
              validate:
                prøverÅSetteFørsteFraværsdagLengerFremITidEnnSisteInntektsmelding,
            }}
          />
          {validerFørsteFraværsdagMutation.error && (
            <PersonOppslagError
              context="dato_validering"
              error={validerFørsteFraværsdagMutation.error}
              ytelse={opplysninger.ytelse}
            />
          )}
          {prøverÅSetteFørsteFraværsdagLengerFremITidEnnSisteInntektsmelding() &&
            sisteInntektsmeldingFørsteFraværsdag && (
              <Alert variant="warning">
                <Stack gap="2">
                  <Heading level="3" size="small" spacing>
                    {førsteFraværsdagFremoverItidFeilmeldingHeading}
                  </Heading>
                  <BodyLong>
                    Første fraværsdag i forrige innsending var{" "}
                    <span className="font-bold">
                      {formatDatoKort(
                        new Date(sisteInntektsmeldingFørsteFraværsdag),
                      )}
                    </span>
                    .
                  </BodyLong>
                  <BodyLong>
                    Skal du endre datoen dere ønsker refusjon fra fremover i
                    tid, må du legge inn endringen under punktet «Ja, men kun
                    deler av perioden eller varierende beløp».
                  </BodyLong>
                </Stack>
              </Alert>
            )}
          <UtbetalingOgRefusjon />

          <div className="flex gap-4 justify-center">
            <Button
              as={Link}
              icon={<ArrowLeftIcon />}
              to="../dine-opplysninger"
              variant="secondary"
            >
              Forrige steg
            </Button>
            <Button
              disabled={
                watch("skalRefunderes") === "NEI" ||
                validerFørsteFraværsdagMutation.isPending
              }
              icon={<ArrowRightIcon />}
              iconPosition="right"
              loading={validerFørsteFraværsdagMutation.isPending}
              type="submit"
              variant="primary"
            >
              Neste steg
            </Button>
          </div>
        </form>
      </section>
    </FormProvider>
  );
}
