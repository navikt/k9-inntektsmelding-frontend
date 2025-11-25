import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { BodyLong, Button, Heading, VStack } from "@navikt/ds-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";

import { HjelpetekstReadMore } from "~/features/shared/Hjelpetekst";
import { useDocumentTitle } from "~/features/shared/hooks/useDocumentTitle";
import { useEksisterendeInntektsmeldinger } from "~/features/shared/hooks/useEksisterendeInntektsmeldinger.tsx";
import { useOpplysninger } from "~/features/shared/hooks/useOpplysninger";
import { useScrollToTopOnMount } from "~/features/shared/hooks/useScrollToTopOnMount";
import { Informasjonsseksjon } from "~/features/shared/Informasjonsseksjon";
import { Fremgangsindikator } from "~/features/shared/skjema-moduler/Fremgangsindikator.tsx";
import {
  ENDRINGSÅRSAK_TEMPLATE,
  Inntekt,
} from "~/features/shared/skjema-moduler/Inntekt";
import {
  NATURALYTELSE_SOM_MISTES_TEMPLATE,
  Naturalytelser,
} from "~/features/shared/skjema-moduler/Naturalytelser";
import OmFraværetOmsorgspenger from "~/features/shared/skjema-moduler/OmFraværetOmsorgspenger";
import { UtbetalingOgRefusjon } from "~/features/shared/skjema-moduler/UtbetalingOgRefusjon";
import { EndringAvInntektÅrsaker, Naturalytelsetype } from "~/types/api-models";
import {
  capitalize,
  capitalizeSetning,
  formatDatoLang,
  formatYtelsesnavn,
  leggTilGenitiv,
} from "~/utils";

import { useInntektsmeldingSkjemaAGIUnntattAaRegister } from "../SkjemaStateContext.tsx";
import { InntektsmeldingSkjemaStateAGIUnntattAaregister } from "../zodSchemas.tsx";

type JaNei = "ja" | "nei";

export type InntektOgRefusjonForm = {
  meta: {
    skalKorrigereInntekt: boolean;
  };
  skalRefunderes: "JA_LIK_REFUSJON" | "JA_VARIERENDE_REFUSJON" | "NEI";
  misterNaturalytelser: JaNei;
  bortfaltNaturalytelsePerioder: NaturalytelserSomMistesForm[];
  endringAvInntektÅrsaker: EndringsÅrsakerForm[];
} & Pick<
  InntektsmeldingSkjemaStateAGIUnntattAaregister,
  "refusjon" | "inntekt" | "korrigertInntekt"
>;

type EndringsÅrsakerForm = {
  årsak: EndringAvInntektÅrsaker | "";
  fom?: string;
  tom?: string;
  bleKjentFom?: string;
  ignorerTom: boolean;
};
type NaturalytelserSomMistesForm = {
  navn: Naturalytelsetype | "";
  beløp: number | string;
  fom?: string;
  tom?: string;
  inkluderTom?: JaNei;
};

export function Steg2InntektOgRefusjon() {
  useScrollToTopOnMount();
  const opplysninger = useOpplysninger();
  useDocumentTitle(
    `Inntekt og refusjon – inntektsmelding for ${formatYtelsesnavn(opplysninger.ytelse)}`,
  );

  const { inntektsmeldingSkjemaState, setInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjemaAGIUnntattAaRegister();

  const eksisterendeInntektsmeldinger = useEksisterendeInntektsmeldinger();
  const harEksisterendeInntektsmeldinger =
    eksisterendeInntektsmeldinger.length > 0;

  const defaultInntekt =
    inntektsmeldingSkjemaState.inntekt ||
    opplysninger.inntektsopplysninger.gjennomsnittLønn;

  const formMethods = useForm<InntektOgRefusjonForm>({
    defaultValues: {
      inntekt: defaultInntekt,
      korrigertInntekt:
        inntektsmeldingSkjemaState.korrigertInntekt ??
        (inntektsmeldingSkjemaState.endringAvInntektÅrsaker.length > 0
          ? inntektsmeldingSkjemaState.inntekt
          : undefined),
      endringAvInntektÅrsaker:
        inntektsmeldingSkjemaState.endringAvInntektÅrsaker.length === 0
          ? [ENDRINGSÅRSAK_TEMPLATE]
          : inntektsmeldingSkjemaState.endringAvInntektÅrsaker,
      skalRefunderes: inntektsmeldingSkjemaState.skalRefunderes,
      misterNaturalytelser: konverterTilRadioValg(
        inntektsmeldingSkjemaState.misterNaturalytelser,
      ),
      bortfaltNaturalytelsePerioder:
        inntektsmeldingSkjemaState.bortfaltNaturalytelsePerioder.length === 0
          ? [NATURALYTELSE_SOM_MISTES_TEMPLATE]
          : inntektsmeldingSkjemaState.bortfaltNaturalytelsePerioder.map(
              (naturalYtelse) => ({
                ...naturalYtelse,
                inkluderTom: konverterTilRadioValg(naturalYtelse.inkluderTom),
              }),
            ),
      refusjon:
        inntektsmeldingSkjemaState.refusjon.length === 0
          ? [
              { fom: opplysninger.førsteUttaksdato, beløp: defaultInntekt },
              { fom: undefined, beløp: 0 },
            ]
          : inntektsmeldingSkjemaState.refusjon.length === 1
            ? [
                ...inntektsmeldingSkjemaState.refusjon,
                { fom: undefined, beløp: 0 },
              ]
            : inntektsmeldingSkjemaState.refusjon,
    },
  });

  const { handleSubmit } = formMethods;
  const navigate = useNavigate();

  const onSubmit = handleSubmit((skjemadata) => {
    const { refusjon, skalRefunderes, inntekt, korrigertInntekt } = skjemadata;

    const misterNaturalytelser = skjemadata.misterNaturalytelser === "ja";
    const bortfaltNaturalytelsePerioder = misterNaturalytelser
      ? skjemadata.bortfaltNaturalytelsePerioder.map((naturalYtelse) => ({
          ...naturalYtelse,
          inkluderTom: naturalYtelse.inkluderTom === "ja",
        }))
      : [];
    const endringAvInntektÅrsaker = korrigertInntekt
      ? skjemadata.endringAvInntektÅrsaker
      : [];

    setInntektsmeldingSkjemaState((prev) => ({
      ...prev,
      inntekt,
      korrigertInntekt,
      endringAvInntektÅrsaker,
      refusjon,
      skalRefunderes,
      misterNaturalytelser,
      bortfaltNaturalytelsePerioder,
    }));
    navigate({
      from: "/$id/inntekt-og-refusjon",
      to: "../oppsummering",
    });
  });

  return (
    <FormProvider {...formMethods}>
      <section className="mt-2">
        <form
          className="bg-bg-default px-5 py-6 rounded-md flex gap-6 flex-col"
          onSubmit={onSubmit}
        >
          <Heading level="3" size="large">
            Inntekt og refusjon
          </Heading>
          <Fremgangsindikator aktivtSteg={2} />
          {opplysninger.ytelse !== "OMSORGSPENGER" && <Ytelsesperiode />}
          {opplysninger.ytelse === "OMSORGSPENGER" && (
            <OmFraværetOmsorgspenger />
          )}
          <hr />
          <Inntekt
            harEksisterendeInntektsmeldinger={harEksisterendeInntektsmeldinger}
            opplysninger={opplysninger}
          />
          {opplysninger.ytelse !== "OMSORGSPENGER" && (
            <>
              <UtbetalingOgRefusjon />
              <Naturalytelser opplysninger={opplysninger} />
            </>
          )}
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
              icon={<ArrowRightIcon />}
              iconPosition="right"
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

function konverterTilRadioValg(verdi: boolean | undefined) {
  return verdi === undefined ? undefined : verdi ? "ja" : "nei";
}

function Ytelsesperiode() {
  const opplysninger = useOpplysninger();
  const { person, ytelse, førsteUttaksdato } = opplysninger;

  const førsteDag = capitalize(formatDatoLang(new Date(førsteUttaksdato)));
  if (ytelse === "OMSORGSPENGER") {
    return null;
  }

  return (
    <VStack gap="4">
      <hr />
      <Heading level="4" size="medium">
        Periode med {formatYtelsesnavn(ytelse)}
      </Heading>
      <Informasjonsseksjon
        kilde={`Fra søknaden til ${person.fornavn}`}
        tittel={`${capitalizeSetning(leggTilGenitiv(person.fornavn))} første dag med ${formatYtelsesnavn(ytelse)}`}
      >
        <BodyLong size="medium">{førsteDag}</BodyLong>
      </Informasjonsseksjon>
      <HjelpetekstReadMore header="Hva betyr dette?">
        <>
          Dette er den første dagen den ansatte har søkt om{" "}
          {formatYtelsesnavn(ytelse)}. Det betyr at vi trenger opplysninger om
          den ansattes inntekt de siste tre månedene før denne datoen. Vi
          baserer oss på datoen som er oppgitt i søknaden, du kan derfor ikke
          endre denne i inntektsmeldingen.
          <br />
          <br />
          Hvis du er usikker på om dato for første fraværsdag er riktig, må du
          kontakte den ansatte før du sender inntektsmeldingen. Hvis den ansatte
          endrer søknadsperioden, vil du få en ny oppgave med riktig dato for
          første fraværsdag.
        </>
      </HjelpetekstReadMore>
    </VStack>
  );
}
