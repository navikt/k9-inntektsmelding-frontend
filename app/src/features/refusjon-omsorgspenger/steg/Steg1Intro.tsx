import { ArrowRightIcon } from "@navikt/aksel-icons";
import {
  Alert,
  BodyLong,
  Button,
  GuidePanel,
  Heading,
  Radio,
  RadioGroup,
  VStack,
} from "@navikt/ds-react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { capitalizeSetning } from "~/utils.ts";

import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle.tsx";
import { useScrollToTopOnMount } from "../../shared/hooks/useScrollToTopOnMount.tsx";
import { useSkjemaState } from "../SkjemaStateContext.tsx";
import { useInnloggetBruker } from "../useInnloggetBruker.tsx";
import { OmsorgspengerFremgangsindikator } from "../visningskomponenter/OmsorgspengerFremgangsindikator.tsx";

export const RefusjonOmsorgspengerArbeidsgiverSteg1 = () => {
  useScrollToTopOnMount();
  useDocumentTitle("Søknad om refusjon av omsorgspenger for arbeidsgiver");

  const innloggetBruker = useInnloggetBruker();

  const navigate = useNavigate();
  const iÅr = new Date().getFullYear();
  const iFjor = iÅr - 1;

  const { register, formState, watch, handleSubmit, setValue } =
    useSkjemaState();
  const harUtbetaltLønn = watch("harUtbetaltLønn");
  const onSubmit = handleSubmit(() => {
    navigate({
      from: "/refusjon-omsorgspenger/$organisasjonsnummer/1-intro",
      to: "../2-ansatt-og-arbeidsgiver",
    });
  });

  useEffect(() => {
    setValue("meta.step", 1);
  }, []);

  const { name: harUtbetaltLønnName, ...harUtbetaltLønnRadioGroupProps } =
    register("harUtbetaltLønn");

  const { name: årForRefusjonName, ...årForRefusjonRadioGroupProps } =
    register("årForRefusjon");

  return (
    <div className="bg-ax-bg-default rounded-md flex flex-col gap-6">
      <Heading level="1" size="large">
        Om refusjon
      </Heading>
      <OmsorgspengerFremgangsindikator aktivtSteg={1} />
      <GuidePanel className="mb-4">
        <VStack gap="space-16">
          <Heading level="2" size="medium">
            Hei {capitalizeSetning(innloggetBruker.fornavn)}!
          </Heading>
          <BodyLong>
            Her kan du søke om refusjon for en ansatt som har vært hjemme med
            sykt barn.
          </BodyLong>
          <BodyLong>
            {`Du kan søke for perioder inntil tre måneder tilbake i tid. Du kan kun søke om refusjon innenfor ett kalenderår av gangen.
            Det betyr at hvis du skal søke om refusjon for perioder i både ${iFjor} og ${iÅr}, må du sende to separate søknader.`}
          </BodyLong>
          <BodyLong>
            Du må også sende inn som separate refusjonskrav hvis en har hatt
            varig lønnsendring mellom periodene en søker refusjon for.
          </BodyLong>
        </VStack>
      </GuidePanel>
      <form onSubmit={onSubmit}>
        <VStack gap="space-16">
          <RadioGroup
            error={formState.errors.harUtbetaltLønn?.message}
            legend="Har dere utbetalt lønn under fraværet, og krever refusjon?"
            name={harUtbetaltLønnName}
          >
            <Radio value="ja" {...harUtbetaltLønnRadioGroupProps}>
              Ja
            </Radio>
            <Radio value="nei" {...harUtbetaltLønnRadioGroupProps}>
              Nei
            </Radio>
          </RadioGroup>
          {harUtbetaltLønn === "nei" && (
            <Alert variant="warning">
              <Heading level="3" size="small" spacing>
                Arbeidsgivers plikt til å utbetale omsorgsdager
              </Heading>
              <BodyLong spacing>
                Hvis arbeidsforholdet hos dere har vart i minst fire uker,
                plikter dere å utbetale lønn for alle omsorgsdagene som den
                ansatte har rett til å bruke.
              </BodyLong>
              <BodyLong>
                Hvis dere ikke har utbetalt lønn under fraværet, og den ansatte
                søker om utbetaling direkte fra Nav, vil dere få et varsel om å
                sende inntektsmelding på Min side - arbeidsgiver.
              </BodyLong>
            </Alert>
          )}
          <RadioGroup
            error={formState.errors.årForRefusjon?.message}
            legend="Hvilket år søker dere refusjon for?"
            name={årForRefusjonName}
          >
            <Radio value={String(iFjor)} {...årForRefusjonRadioGroupProps}>
              {iFjor}
            </Radio>
            <Radio value={String(iÅr)} {...årForRefusjonRadioGroupProps}>
              {iÅr}
            </Radio>
          </RadioGroup>

          <div>
            <Button
              disabled={harUtbetaltLønn === "nei"}
              icon={<ArrowRightIcon />}
              iconPosition="right"
              type="submit"
              variant="primary"
            >
              Neste steg
            </Button>
          </div>
        </VStack>
      </form>
    </div>
  );
};
