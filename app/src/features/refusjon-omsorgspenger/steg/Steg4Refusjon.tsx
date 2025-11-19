import {
  ArrowCirclepathIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@navikt/aksel-icons";
import {
  Alert,
  BodyLong,
  Button,
  GuidePanel,
  Heading,
  Loader,
  VStack,
} from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { hentGrunnbeløpOptions } from "~/api/queries.ts";

import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle.tsx";
import { useScrollToTopOnMount } from "../../shared/hooks/useScrollToTopOnMount.tsx";
import { Inntekt } from "../../shared/skjema-moduler/Inntekt";
import { hentInntektsopplysningerOptions } from "../api/queries.ts";
import { useSkjemaState } from "../SkjemaStateContext";
import { OmsorgspengerFremgangsindikator } from "../visningskomponenter/OmsorgspengerFremgangsindikator.tsx";
import { RefusjonOmsorgspengerFormData } from "../zodSchemas.tsx";

export const RefusjonOmsorgspengerArbeidsgiverSteg4 = () => {
  useScrollToTopOnMount();
  useDocumentTitle(
    "Refusjon – søknad om refusjon av omsorgspenger for arbeidsgiver",
  );

  const { handleSubmit, getValues, setValue } = useSkjemaState();
  const navigate = useNavigate();

  useEffect(() => {
    setValue("meta.step", 4);
    if (getValues("meta.innsendtSøknadId")) {
      navigate({
        from: "/refusjon-omsorgspenger/$organisasjonsnummer/4-refusjon",
        to: "../6-kvittering",
      });
    }
  }, []);

  const onSubmit = handleSubmit((skjemadata) => {
    const { korrigertInntekt, endringAvInntektÅrsaker } = skjemadata;

    setValue(
      "endringAvInntektÅrsaker",
      korrigertInntekt ? endringAvInntektÅrsaker : [],
    );
    navigate({
      from: "/refusjon-omsorgspenger/$organisasjonsnummer/4-refusjon",
      to: "../5-oppsummering",
    });
  });

  const fraværHeleDager = getValues("fraværHeleDager");
  const fraværDelerAvDagen = getValues("fraværDelerAvDagen");
  const dagerSomSkalTrekkes = getValues("dagerSomSkalTrekkes");

  const førsteFraværsdato = [
    ...(fraværHeleDager?.map((dag) => dag.fom) ?? []),
    ...(fraværDelerAvDagen?.map((dag) => dag.dato) ?? []),
    ...(dagerSomSkalTrekkes?.map((dag) => dag.fom) ?? []),
  ].toSorted()[0];

  const {
    data: inntektsopplysninger,
    isLoading,
    isError,
    refetch,
  } = useQuery(
    hentInntektsopplysningerOptions({
      skjæringstidspunkt: førsteFraværsdato!,
      fødselsnummer: getValues("ansattesFødselsnummer")!,
      organisasjonsnummer: getValues("organisasjonsnummer")!,
    }),
  );

  useEffect(() => {
    if (inntektsopplysninger?.gjennomsnittLønn) {
      setValue("inntekt", inntektsopplysninger.gjennomsnittLønn);
    }
  }, [inntektsopplysninger]);

  if (!førsteFraværsdato) {
    throw new Error("Ingen fraværsdato funnet");
  }

  return (
    <div className="bg-bg-default rounded-md flex flex-col gap-6">
      <Heading level="1" size="large">
        Beregnet månedslønn for refusjon
      </Heading>
      <OmsorgspengerFremgangsindikator aktivtSteg={4} />
      <GuidePanel className="mb-4">
        <BodyLong>
          Vi har forhåndsutfylt beregnet månedsbeløp ut fra opplysninger i
          A-ordningen. Vurder om beløpet er riktig, eller gjør endringer hvis
          noe ikke stemmer. Beregnet månedslønn danner grunnlaget for hva dere
          kan få i refusjon. Hvis fraværet er lavere enn 100 prosent, tar Nav
          hensyn til det når vi utbetaler refusjon. Refusjonen vil være
          begrenset opp til en maksimal årslønn på seks ganger grunnbeløpet
          (6G).
        </BodyLong>
      </GuidePanel>
      <form onSubmit={onSubmit}>
        <VStack gap="4">
          {inntektsopplysninger ? (
            <Inntekt
              harEksisterendeInntektsmeldinger={false}
              opplysninger={{
                person: {
                  aktørId: getValues("ansattesAktørId")!,
                  fødselsnummer: getValues("ansattesFødselsnummer")!,
                  fornavn: getValues("ansattesFornavn")!,
                  etternavn: getValues("ansattesEtternavn")!,
                },
                inntektsopplysninger,
                skjæringstidspunkt: førsteFraværsdato,
              }}
            >
              <Over6GAlert />
            </Inntekt>
          ) : isLoading ? (
            <div className="my-4 flex justify-center">
              <Loader />
            </div>
          ) : isError ? (
            <>
              <Alert variant="error">
                Inntektsopplysninger kunne ikke hentes.
              </Alert>
              <Button
                icon={<ArrowCirclepathIcon />}
                onClick={() => refetch()}
                variant="secondary"
              >
                Forsøk å hente inntektsopplysninger på nytt
              </Button>
            </>
          ) : null}
          <InntektAlert />
          <div className="flex gap-4">
            <Button
              as={Link}
              icon={<ArrowLeftIcon />}
              to="../3-omsorgsdager"
              variant="secondary"
            >
              Forrige steg
            </Button>
            <Button
              disabled={!inntektsopplysninger}
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

function Over6GAlert() {
  const { watch } = useFormContext<RefusjonOmsorgspengerFormData>();
  const GRUNNBELØP = useQuery(hentGrunnbeløpOptions()).data;

  const inntekt = watch("inntekt");
  const korrigertInntekt = watch("korrigertInntekt");
  const valgtInntekt = Number(korrigertInntekt) || Number(inntekt);
  const inntektErOver0Kr = valgtInntekt > 0;
  const erInntektOver6G =
    !Number.isNaN(valgtInntekt) &&
    inntektErOver0Kr &&
    valgtInntekt * 12 > 6 * GRUNNBELØP;

  if (erInntektOver6G) {
    return (
      <Alert variant="info">
        Nav utbetaler opptil 6G av årslønnen. Du skal likevel føre opp den
        lønnen dere utbetaler til den ansatte i sin helhet.
      </Alert>
    );
  }
  return null;
}

function InntektAlert() {
  const { formState } = useFormContext<RefusjonOmsorgspengerFormData>();
  const error = formState.errors.inntekt;

  if (error) {
    return (
      <Alert variant="error">
        <BodyLong>{error.message}</BodyLong>
      </Alert>
    );
  }
  return null;
}
