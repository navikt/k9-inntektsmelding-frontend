import { ArrowLeftIcon, PaperplaneIcon } from "@navikt/aksel-icons";
import { Alert, Button, Heading, VStack } from "@navikt/ds-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { OppsummeringArbeidsgiverOgAnsatt } from "~/components/oppsummering/OppsummeringArbeidsgiverOgAnsatt.tsx";
import { OppsummeringMånedslønn } from "~/components/oppsummering/OppsummeringMånedslønn.tsx";
import { OppsummeringOmsorgsdager } from "~/components/oppsummering/OppsummeringOmsorgsdager.tsx";
import { OppsummeringRefusjon } from "~/components/oppsummering/OppsummeringRefusjon.tsx";

import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle.tsx";
import { useScrollToTopOnMount } from "../../shared/hooks/useScrollToTopOnMount.tsx";
import {
  RefusjonOmsorgspengerResponseDto,
  sendInntektsmeldingOmsorgspengerRefusjonMutation,
} from "../api/mutations.ts";
import { useSkjemaState } from "../SkjemaStateContext";
import { mapSkjemaTilSendInntektsmeldingRequest } from "../utils.ts";
import { OmsorgspengerFremgangsindikator } from "../visningskomponenter/OmsorgspengerFremgangsindikator.tsx";
export const RefusjonOmsorgspengerArbeidsgiverSteg5 = () => {
  useScrollToTopOnMount();
  useDocumentTitle(
    "Oppsummering – søknad om refusjon av omsorgspenger for arbeidsgiver",
  );

  const { handleSubmit, setValue, getValues } = useSkjemaState();
  const navigate = useNavigate();
  const navigateTilKvittering = () => {
    navigate({
      from: "/refusjon-omsorgspenger/$organisasjonsnummer/5-oppsummering",
      to: "../6-kvittering",
    });
  };

  useEffect(() => {
    setValue("meta.step", 5);
    if (getValues("meta.innsendtSøknadId")) {
      navigateTilKvittering();
    }
  }, []);

  const {
    mutate: sendInntektsmeldingOmsorgspengerRefusjon,
    isPending,
    isError,
  } = sendInntektsmeldingOmsorgspengerRefusjonMutation({
    onSuccess: (v: RefusjonOmsorgspengerResponseDto) => {
      setValue("meta.innsendtSøknadId", v.id);
      navigateTilKvittering();
    },
  });

  return (
    <div className="bg-ax-bg-default rounded-md flex flex-col gap-6">
      <Heading level="1" size="large">
        Oppsummering
      </Heading>
      <OmsorgspengerFremgangsindikator aktivtSteg={5} />
      <VStack gap="space-16">
        <OppsummeringRefusjon redigerbar={true} />
        <OppsummeringArbeidsgiverOgAnsatt redigerbar={true} />
        <OppsummeringOmsorgsdager
          dagerSomSkalTrekkes={getValues("dagerSomSkalTrekkes")}
          fraværDelerAvDagen={getValues("fraværDelerAvDagen")}
          fraværHeleDager={getValues("fraværHeleDager")}
          harDekket10FørsteOmsorgsdager={
            getValues("harDekket10FørsteOmsorgsdager") === "ja"
          }
          redigerbar={true}
        />
        <OppsummeringMånedslønn redigerbar={true} />
      </VStack>
      {isError && (
        <Alert variant="error">
          Noe gikk galt. Vennligst prøv igjen senere.
        </Alert>
      )}
      <div className="flex gap-4 mt-4">
        <Button
          as={Link}
          icon={<ArrowLeftIcon />}
          to={"../4-refusjon"}
          variant="secondary"
        >
          Forrige steg
        </Button>
        <Button
          icon={<PaperplaneIcon />}
          iconPosition="right"
          loading={isPending}
          onClick={handleSubmit((values) => {
            const request = mapSkjemaTilSendInntektsmeldingRequest(values);
            sendInntektsmeldingOmsorgspengerRefusjon(request);
          })}
          variant="primary"
        >
          Send inn
        </Button>
      </div>
    </div>
  );
};
