import { ArrowLeftIcon, PaperplaneIcon } from "@navikt/aksel-icons";
import { Alert, BodyLong, Button, Heading, Stack } from "@navikt/ds-react";
import { useMutation } from "@tanstack/react-query";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import isEqual from "lodash/isEqual";

import { sendInntektsmelding } from "~/api/mutations.ts";
import { Skjemaoppsummering } from "~/features/inntektsmelding/visningskomponenter/Skjemaoppsummering";
import { InntektsmeldingSkjemaStateValid } from "~/features/inntektsmelding/zodSchemas";
import { useDocumentTitle } from "~/features/shared/hooks/useDocumentTitle";
import { useOpplysninger } from "~/features/shared/hooks/useOpplysninger";
import { useScrollToTopOnMount } from "~/features/shared/hooks/useScrollToTopOnMount";
import { Fremgangsindikator } from "~/features/shared/skjema-moduler/Fremgangsindikator";
import { lagSendInntektsmeldingRequest } from "~/features/shared/skjema-moduler/steg/InntektOgRefusjon/utils";
import type { OpplysningerDto } from "~/types/api-models.ts";
import { finnSenesteInntektsmelding, formatYtelsesnavn } from "~/utils";

import { useInntektsmeldingSkjemaAGIUnntattAaRegister } from "../SkjemaStateContext";
import { InntektsmeldingSkjemaStateValidAGIUnntattAaregister } from "../zodSchemas";

export const Steg3Oppsummering = () => {
  useScrollToTopOnMount();
  const opplysninger = useOpplysninger();
  useDocumentTitle(
    `Oppsummering – inntektsmelding for ${formatYtelsesnavn(opplysninger.ytelse)}`,
  );
  const { id } = getRouteApi("/agi-unntatt-aaregister/$id").useParams();

  const { gyldigInntektsmeldingSkjemaState, inntektsmeldingSkjemaStateError } =
    useInntektsmeldingSkjemaAGIUnntattAaRegister();

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
            to={`/${id}`}
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
  const route = getRouteApi("/agi-unntatt-aaregister/$id");
  const { id } = route.useParams();
  const eksisterendeInntektsmeldinger =
    route.useLoaderData().eksisterendeInntektsmeldinger;
  const { gyldigInntektsmeldingSkjemaState, setInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjemaAGIUnntattAaRegister();

  const { mutate, error, isPending } = useMutation({
    mutationFn: async (
      skjemaState:
        | InntektsmeldingSkjemaStateValid
        | InntektsmeldingSkjemaStateValidAGIUnntattAaregister,
    ) => {
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
        from: "/agi-unntatt-aaregister/$id/oppsummering",
        to: "/agi-unntatt-aaregister/$id/kvittering",
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
