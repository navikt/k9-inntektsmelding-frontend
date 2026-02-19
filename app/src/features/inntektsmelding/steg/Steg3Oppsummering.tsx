import { ArrowLeftIcon, PaperplaneIcon } from "@navikt/aksel-icons";
import { Alert, BodyLong, Button, Heading, Stack } from "@navikt/ds-react";
import { useMutation } from "@tanstack/react-query";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import isEqual from "lodash/isEqual";

import { sendInntektsmelding } from "~/api/mutations.ts";
import { useInntektsmeldingSkjema } from "~/features/inntektsmelding/SkjemaStateContext";
import { useDocumentTitle } from "~/features/shared/hooks/useDocumentTitle";
import { Fremgangsindikator } from "~/features/shared/skjema-moduler/Fremgangsindikator";
import type { OpplysningerDto } from "~/types/api-models.ts";
import { SendInntektsmeldingRequestDto } from "~/types/api-models.ts";
import {
  finnSenesteInntektsmelding,
  formatStrengTilTall,
  formatYtelsesnavn,
} from "~/utils";

import { useOpplysninger } from "../../shared/hooks/useOpplysninger";
import { useScrollToTopOnMount } from "../../shared/hooks/useScrollToTopOnMount";
import { Skjemaoppsummering } from "../visningskomponenter/Skjemaoppsummering";
import { InntektsmeldingSkjemaStateValid } from "../zodSchemas";

const route = getRouteApi("/$id");

export const Steg3Oppsummering = () => {
  useScrollToTopOnMount();
  const opplysninger = useOpplysninger();
  useDocumentTitle(
    `Oppsummering – inntektsmelding for ${formatYtelsesnavn(opplysninger.ytelse)}`,
  );
  const { id } = route.useParams();

  const { gyldigInntektsmeldingSkjemaState, inntektsmeldingSkjemaStateError } =
    useInntektsmeldingSkjema();

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
            as={Link}
            size="small"
            to={`/${id}`}
            variant="secondary-neutral"
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
          opplysninger={opplysninger}
          skjemaState={gyldigInntektsmeldingSkjemaState}
        />
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
  const { id } = route.useParams();
  const { eksisterendeInntektsmeldinger } = route.useLoaderData();

  const { gyldigInntektsmeldingSkjemaState, setInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjema();

  const { mutate, error, isPending } = useMutation({
    mutationFn: async (skjemaState: InntektsmeldingSkjemaStateValid) => {
      if (opplysninger.forespørselStatus === "UTGÅTT") {
        throw new Error(
          "Du kan ikke sende inn en ny inntektsmelding når oppgaven den er knyttet til er utgått.",
        );
      }
      const inntektsmeldingRequest = lagSendInntektsmeldingRequest(
        id,
        skjemaState,
        opplysninger,
      );
      const sisteInntektsmelding = finnSenesteInntektsmelding(
        eksisterendeInntektsmeldinger,
      );

      if (sisteInntektsmelding) {
        const eksisterendeInntektsmelding = lagSendInntektsmeldingRequest(
          id,
          sisteInntektsmelding,
          opplysninger,
        );
        if (isEqual(inntektsmeldingRequest, eksisterendeInntektsmelding)) {
          throw new Error(
            "Du har ikke gjort noen endringer fra forrige innsendte inntektsmelding.",
          );
        }
      }

      return sendInntektsmelding(inntektsmeldingRequest);
    },
    onSuccess: (inntektsmeldingState) => {
      setInntektsmeldingSkjemaState(inntektsmeldingState);
      navigate({
        from: "/$id/oppsummering",
        to: "../kvittering",
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
          to="../inntekt-og-refusjon"
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
  id: string,
  skjemaState: InntektsmeldingSkjemaStateValid,
  opplysninger: OpplysningerDto,
) {
  const gjeldendeInntekt = skjemaState.korrigertInntekt ?? skjemaState.inntekt;

  const refusjon =
    skjemaState.skalRefunderes === "JA_LIK_REFUSJON"
      ? skjemaState.refusjon.slice(0, 1)
      : skjemaState.skalRefunderes === "JA_VARIERENDE_REFUSJON"
        ? skjemaState.refusjon
        : [];

  const endringAvInntektÅrsaker = skjemaState.endringAvInntektÅrsaker.map(
    (endring) => ({
      årsak: endring.årsak,
      fom: endring.fom,
      tom: endring.ignorerTom ? undefined : endring.tom,
      bleKjentFom: endring.bleKjentFom,
    }),
  );

  return {
    foresporselUuid: id,
    aktorId: opplysninger.person.aktørId,
    ytelse: opplysninger.ytelse,
    arbeidsgiverIdent: opplysninger.arbeidsgiver.organisasjonNummer,
    kontaktperson: skjemaState.kontaktperson,
    startdato: opplysninger.førsteUttaksdato,
    inntekt: formatStrengTilTall(gjeldendeInntekt),
    refusjon:
      opplysninger.ytelse === "OMSORGSPENGER"
        ? []
        : refusjon.map((r) => ({
            ...r,
            beløp: formatStrengTilTall(r.beløp),
          })),
    bortfaltNaturalytelsePerioder: konverterNaturalytelsePerioder(
      skjemaState.bortfaltNaturalytelsePerioder,
    ),
    endringAvInntektÅrsaker,
  } satisfies SendInntektsmeldingRequestDto;
}

function konverterNaturalytelsePerioder(
  naturalytelsePerioder: InntektsmeldingSkjemaStateValid["bortfaltNaturalytelsePerioder"],
): SendInntektsmeldingRequestDto["bortfaltNaturalytelsePerioder"] {
  return naturalytelsePerioder.map((periode) => ({
    naturalytelsetype: periode.navn,
    fom: periode.fom,
    beløp: formatStrengTilTall(periode.beløp),
    tom: periode.tom,
  }));
}
