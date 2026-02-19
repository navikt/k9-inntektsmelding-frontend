import { ArrowLeftIcon, PaperplaneIcon } from "@navikt/aksel-icons";
import { Alert, BodyLong, Button, Heading, Stack } from "@navikt/ds-react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";

import { sendInntektsmeldingArbeidsgiverInitiert } from "~/api/mutations.ts";
import { useDocumentTitle } from "~/features/shared/hooks/useDocumentTitle.tsx";
import { Fremgangsindikator } from "~/features/shared/skjema-moduler/Fremgangsindikator.tsx";
import { ARBEIDSGIVERINITERT_NYANSATT_ID } from "~/routes/opprett";
import type {
  OpplysningerDto,
  SendInntektsmeldingRequestDtoSchemaArbeidsgiverInitiertType,
} from "~/types/api-models.ts";
import { formatStrengTilTall, formatYtelsesnavn } from "~/utils";

import { useOpplysninger } from "../../../shared/hooks/useOpplysninger.tsx";
import { useScrollToTopOnMount } from "../../../shared/hooks/useScrollToTopOnMount.tsx";
import { Skjemaoppsummering } from "../Skjemaoppsummering.tsx";
import { useInntektsmeldingSkjemaAGINyansatt } from "../SkjemaStateContext.tsx";
import { InntektsmeldingSkjemaStateValidAGINyansatt } from "../zodSchemas.tsx";

export const Steg3Oppsummering = () => {
  useScrollToTopOnMount();
  const opplysninger = useOpplysninger();
  useDocumentTitle(
    `Oppsummering – inntektsmelding for ${formatYtelsesnavn(opplysninger.ytelse)}`,
  );

  const { gyldigInntektsmeldingSkjemaState, inntektsmeldingSkjemaStateError } =
    useInntektsmeldingSkjemaAGINyansatt();

  if (!gyldigInntektsmeldingSkjemaState) {
    // På dette punktet "skal" skjemaet være gyldig med mindre noe har gått galt. Logg error til Grafana for innsikt.
    // eslint-disable-next-line no-console
    console.error(
      "Ugyldig skjemaState på oppsummeringssiden",
      inntektsmeldingSkjemaStateError,
    );
    return (
      <Alert className="mt-4 mx-4 ax-md:mx-0" variant="error">
        <Stack gap="4">
          <BodyLong>
            Noe gikk galt med utfyllingen av inntektsmeldingen din. Du må
            dessverre begynne på nytt.
          </BodyLong>
          <Button
            data-color="neutral"
            as={Link}
            size="small"
            to={`/opprett?ytelseType=${opplysninger.ytelse}`}
            variant="secondary"
          >
            Start på nytt
          </Button>
        </Stack>
      </Alert>
    );
  }

  return (
    <section>
      <div className="bg-ax-bg-default mt-4 px-5 py-6 rounded-md flex flex-col gap-6">
        <Heading level="2" size="large">
          Oppsummering
        </Heading>
        <Fremgangsindikator aktivtSteg={3} />
        <Skjemaoppsummering
          gyldigInntektsmeldingSkjemaState={gyldigInntektsmeldingSkjemaState}
          opplysninger={opplysninger}
        />{" "}
        <SendInnInntektsmelding opplysninger={opplysninger} />
      </div>
    </section>
  );
};

type SendInnInntektsmeldingProps = {
  opplysninger: OpplysningerDto;
};
function SendInnInntektsmelding({ opplysninger }: SendInnInntektsmeldingProps) {
  const navigate = useNavigate();

  const { gyldigInntektsmeldingSkjemaState, setInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjemaAGINyansatt();

  const { mutate, error, isPending } = useMutation({
    mutationFn: async (
      skjemaState: InntektsmeldingSkjemaStateValidAGINyansatt,
    ) => {
      const inntektsmeldingRequest = lagSendInntektsmeldingRequest(
        skjemaState,
        opplysninger,
      );

      return sendInntektsmeldingArbeidsgiverInitiert(inntektsmeldingRequest);
    },
    onSuccess: (inntektsmeldingResponse) => {
      setInntektsmeldingSkjemaState((prev) => ({
        ...prev,
        id: inntektsmeldingResponse.id,
        opprettetTidspunkt: inntektsmeldingResponse.opprettetTidspunkt,
      }));

      navigate({
        to: "/agi/$id/kvittering",
        params: {
          id: opplysninger.forespørselUuid || ARBEIDSGIVERINITERT_NYANSATT_ID,
        },
      });
    },
  });

  if (!gyldigInntektsmeldingSkjemaState) {
    return null;
  }

  return (
    <>
      {error ? <Alert variant="error">{error.message}</Alert> : undefined}
      <div className="flex gap-4 justify-center">
        <Button
          as={Link}
          icon={<ArrowLeftIcon />}
          to="../refusjon"
          variant="secondary"
        >
          Forrige steg
        </Button>
        <Button
          icon={<PaperplaneIcon />}
          iconPosition="right"
          loading={isPending}
          onClick={() => mutate(gyldigInntektsmeldingSkjemaState)}
          variant="primary"
        >
          Send inn
        </Button>
      </div>
    </>
  );
}

function lagSendInntektsmeldingRequest(
  skjemaState: InntektsmeldingSkjemaStateValidAGINyansatt,
  opplysninger: OpplysningerDto,
) {
  const refusjon =
    skjemaState.skalRefunderes === "JA_LIK_REFUSJON"
      ? skjemaState.refusjon.slice(0, 1)
      : skjemaState.skalRefunderes === "JA_VARIERENDE_REFUSJON"
        ? skjemaState.refusjon
        : [];

  return {
    aktorId: opplysninger.person.aktørId,
    ytelse: opplysninger.ytelse,
    arbeidsgiverIdent: opplysninger.arbeidsgiver.organisasjonNummer,
    kontaktperson: skjemaState.kontaktperson,
    startdato: skjemaState.førsteFraværsdag,
    refusjon: refusjon.map((r) => ({
      ...r,
      beløp: formatStrengTilTall(r.beløp),
    })),
    foresporselUuid:
      opplysninger.forespørselUuid === ARBEIDSGIVERINITERT_NYANSATT_ID
        ? undefined
        : opplysninger.forespørselUuid,
  } satisfies SendInntektsmeldingRequestDtoSchemaArbeidsgiverInitiertType;
}
