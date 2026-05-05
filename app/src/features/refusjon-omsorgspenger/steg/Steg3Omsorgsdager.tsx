import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  TrashIcon,
} from "@navikt/aksel-icons";
import {
  Accordion,
  Alert,
  BodyLong,
  BodyShort,
  Box,
  Button,
  Detail,
  Dropdown,
  GuidePanel,
  Heading,
  HelpText,
  HStack,
  Label,
  List,
  Radio,
  RadioGroup,
  VStack,
} from "@navikt/ds-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useFieldArray } from "react-hook-form";

import { formatDatoKort } from "~/utils.ts";

import { HjelpetekstAlert } from "../../shared/Hjelpetekst.tsx";
import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle.tsx";
import { useScrollToTopOnMount } from "../../shared/hooks/useScrollToTopOnMount.tsx";
import { DateRangePickerWrapped } from "../../shared/react-hook-form-wrappers/DateRangePickerWrapped.tsx";
import { FraværDelerAvDagenListeInput } from "../../shared/skjema-moduler/FraværDelerAvDagenListeInput.tsx";
import { FraværHeleDagerListeInput } from "../../shared/skjema-moduler/FraværHeleDagerListeInput.tsx";
import { RefusjonOmsorgspengerResponseDto } from "../api/mutations.ts";
import { useHentInntektsmeldingForÅr } from "../api/queries.ts";
import { useSkjemaState } from "../SkjemaStateContext";
import { utledDefaultMonthDatepicker } from "../utils.ts";
import { OmsorgspengerFremgangsindikator } from "../visningskomponenter/OmsorgspengerFremgangsindikator.tsx";

export const RefusjonOmsorgspengerArbeidsgiverSteg3 = () => {
  useScrollToTopOnMount();
  useDocumentTitle(
    "Omsorgsdager - søknad om refusjon av omsorgspenger for arbeidsgiver",
  );

  const {
    register,
    formState,
    watch,
    handleSubmit,
    getValues,
    setValue,
    clearErrors,
  } = useSkjemaState();

  const årForRefusjon = watch("årForRefusjon");
  const harUtbetaltLønn = watch("harUtbetaltLønn");
  const fraværHeleDager = watch("fraværHeleDager");
  const fraværDelerAvDagen = watch("fraværDelerAvDagen");
  const dagerSomSkalTrekkes = watch("dagerSomSkalTrekkes");
  const navigate = useNavigate();

  const { data: inntektsmeldingerForÅr } = useHentInntektsmeldingForÅr({
    aktørId: watch("ansattesAktørId") as string,
    arbeidsgiverIdent: watch("organisasjonsnummer") as string,
    år: årForRefusjon,
  });

  useEffect(() => {
    setValue("meta.step", 3);
    const besøkteSteg = getValues("meta.besøkteSteg") ?? [];
    setValue("meta.besøkteSteg", [...besøkteSteg, 3]);
    if (getValues("meta.innsendtSøknadId")) {
      navigate({
        from: "/refusjon-omsorgspenger/$organisasjonsnummer/3-omsorgsdager",
        to: "../6-kvittering",
      });
    }
  }, []);

  useEffect(() => {
    if (!årForRefusjon || !harUtbetaltLønn) {
      navigate({
        from: "/refusjon-omsorgspenger/$organisasjonsnummer/3-omsorgsdager",
        to: "../1-intro",
      });
    }
  }, [årForRefusjon, harUtbetaltLønn]);

  useEffect(() => {
    if (formState.errors.manglerFraværEllerTrekk) {
      const harFravær =
        fraværHeleDager.length > 0 ||
        fraværDelerAvDagen.length > 0 ||
        dagerSomSkalTrekkes.length > 0;
      if (harFravær) {
        clearErrors("manglerFraværEllerTrekk");
      }
    }
  }, [fraværHeleDager, fraværDelerAvDagen, dagerSomSkalTrekkes]);

  const onSubmit = handleSubmit(() => {
    navigate({
      from: "/refusjon-omsorgspenger/$organisasjonsnummer/3-omsorgsdager",
      to: "../4-refusjon",
    });
  });

  const { name, ...harDekket10FørsteOmsorgsdagerRadioGroupProps } = register(
    "harDekket10FørsteOmsorgsdager",
    {
      required:
        "Du må svare på om dere har dekket de 10 første omsorgsdagene i år",
    },
  );

  return (
    <div className="bg-ax-bg-default rounded-md flex flex-col gap-6">
      <Heading level="1" size="large">
        Omsorgsdager dere søker refusjon for
      </Heading>
      <OmsorgspengerFremgangsindikator aktivtSteg={3} />
      <GuidePanel className="mb-4">
        <BodyLong>
          Her oppgir du hvilke dager dere har utbetalt lønn og søker om refusjon
          fordi den ansatte har brukt omsorgsdager. Dagene må være innenfor
          samme kalenderår og kan ikke være frem i tid.
        </BodyLong>
        <BodyLong>
          Hvis dere kun har betalt lønn for deler av fraværet, må den ansatte
          selv søke om omsorgspenger for de dagene dere ikke har utbetalt lønn.
        </BodyLong>
      </GuidePanel>
      <form onSubmit={onSubmit}>
        <VStack gap="space-16">
          <RadioGroup
            error={formState.errors.harDekket10FørsteOmsorgsdager?.message}
            legend={`Har dere dekket de 10 første omsorgsdagene i ${årForRefusjon}?`}
            name={name}
          >
            <Radio value="ja" {...harDekket10FørsteOmsorgsdagerRadioGroupProps}>
              Ja
            </Radio>
            <Radio
              value="nei"
              {...harDekket10FørsteOmsorgsdagerRadioGroupProps}
            >
              Nei
            </Radio>
          </RadioGroup>
          <TiFørsteOmsorgsdagerInfo />
          {formState.errors.manglerFraværEllerTrekk?.message && (
            <Alert aria-live="polite" variant="error">
              <BodyLong>
                {formState.errors.manglerFraværEllerTrekk.message}
              </BodyLong>
            </Alert>
          )}
          <VStack gap="space-32">
            <TidligereInnsendinger
              inntektsmeldinger={inntektsmeldingerForÅr}
              årForRefusjon={årForRefusjon}
            />
            <FraværHeleDagerListeInput
              overskrift="Hele dager dere søker refusjon for"
              år={Number(årForRefusjon)}
            />
            <FraværDelerAvDagenListeInput
              overskrift="Delvise dager dere søker refusjon for"
              år={Number(årForRefusjon)}
            />
            <DagerSomSkalTrekkes />
          </VStack>

          <div className="flex gap-4 mt-8">
            <Button
              as={Link}
              icon={<ArrowLeftIcon />}
              to={"../2-ansatt-og-arbeidsgiver"}
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
        </VStack>
      </form>
    </div>
  );
};

const DagerSomSkalTrekkes = () => {
  const { control, watch } = useSkjemaState();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "dagerSomSkalTrekkes",
  });
  const årForRefusjon = Number(watch("årForRefusjon"));
  return (
    <VStack gap="space-16">
      <Heading level="3" size="small">
        Dager dere ønsker å trekke
      </Heading>
      {fields.map((periode, index) => (
        <HStack
          className="border-solid border-0 border-l-4 border-ax-bg-neutral-soft pl-4 py-2 relative"
          gap="space-16"
          key={periode.id}
        >
          <DateRangePickerWrapped
            datepickerProps={{
              defaultMonth: utledDefaultMonthDatepicker(årForRefusjon),
            }}
            name={`dagerSomSkalTrekkes.${index}`}
          />
          <Button
            aria-label="Slett periode"
            className="absolute top-9 right-20"
            icon={<TrashIcon />}
            onClick={() => {
              remove(index);
            }}
            size="small"
            type="button"
            variant="tertiary"
          >
            Slett
          </Button>
        </HStack>
      ))}
      {fields.length > 0 && (
        <>
          <BodyLong className="text-ax-text-neutral-subtle" size="small">
            Dager eller perioder du legger inn her vil trekke/korrigere
            tidligere innsendt refusjonskrav for de samme dagene. Skal du endre
            en dag fra hel dag med refusjon til delvis dag med refusjon, må du
            bruke feltet over &quot;Delvise dager dere søker refusjon for&quot;.
          </BodyLong>
        </>
      )}
      <div>
        <Button
          icon={<PlusIcon />}
          onClick={() => {
            append({ fom: "", tom: "" }, { shouldFocus: false });
          }}
          size="small"
          type="button"
          variant="secondary"
        >
          Legg til periode
        </Button>
      </div>
    </VStack>
  );
};

const TiFørsteOmsorgsdagerInfo = () => {
  const { watch } = useSkjemaState();
  const harDekket10FørsteOmsorgsdager = watch("harDekket10FørsteOmsorgsdager");
  if (harDekket10FørsteOmsorgsdager === "ja") {
    return (
      <HjelpetekstAlert>
        Du kan søke om refusjon fra Nav fra og med den 11. dagen hvis den
        ansatte har rett på flere enn 10 omsorgsdager. Ved kronisk sykt barn
        over 12 år, og ingen andre barn under 13 år, kan du søke om refusjon fra
        første fraværsdag.
      </HjelpetekstAlert>
    );
  }

  if (harDekket10FørsteOmsorgsdager === "nei") {
    return (
      <HjelpetekstAlert>
        <VStack gap="space-16">
          <BodyLong>
            Dere må dekke de første 10 omsorgsdagene hvert kalenderår for
            ansatte som har barn under 12 år, eller som fyller 12 år det
            gjeldende året. Du kan søke om refusjon fra Nav fra og med den 11.
            dagen hvis den ansatte har rett på flere enn 10 omsorgsdager.
          </BodyLong>
          <BodyShort>
            Ved kronisk sykt barn over 12 år, og ingen andre barn under 13 år,
            kan du søke om refusjon fra første fraværsdag.
          </BodyShort>
          <BodyLong>
            Hvis den ansatte ikke har jobbet fire uker før fraværet, kan en
            unntaksvis søke om refusjon fra første fraværsdag.
          </BodyLong>
        </VStack>
      </HjelpetekstAlert>
    );
  }
};

const TidligereInnsendinger = ({
  årForRefusjon,
  inntektsmeldinger,
}: {
  årForRefusjon: string;
  inntektsmeldinger: RefusjonOmsorgspengerResponseDto[] | undefined;
}) => {
  if (!inntektsmeldinger || inntektsmeldinger.length === 0) {
    return null;
  }

  const tidligereInnsendinger =
    inntektsmeldinger?.map((inntektsmelding) => {
      return {
        id: inntektsmelding.id,
        opprettetDato: new Date(inntektsmelding.opprettetTidspunkt),
        heleDager: inntektsmelding.omsorgspenger.fraværHeleDager,
        delviseDager: inntektsmelding.omsorgspenger.fraværDelerAvDagen?.filter(
          (dag) => Number(dag.timer) > 0,
        ),
        dagerSomSkalTrekkes:
          inntektsmelding.omsorgspenger.fraværDelerAvDagen?.filter(
            (dag) => Number(dag.timer) === 0,
          ),
        erRefusjon: inntektsmelding.refusjon?.length ?? 0 > 0,
      };
    }) || [];

  const [antallInnsendingerSomSkalVises, setAntallInnsendingerSomSkalVises] =
    useState(5);

  const visFlereInnsendinger = () => {
    setAntallInnsendingerSomSkalVises(antallInnsendingerSomSkalVises + 5);
  };

  const innsendingerSomSkalVises = tidligereInnsendinger?.slice(
    0,
    antallInnsendingerSomSkalVises,
  );

  const harFlereInnsendingerEnnAntallSomVises =
    tidligereInnsendinger.length > antallInnsendingerSomSkalVises;

  return (
    <Box className="bg-ax-bg-neutral-soft p-4">
      <div className="flex justify-between">
        <Label size="small">
          {`Tidligere innsendinger for ${årForRefusjon}`}
        </Label>
        <BodyShort size="small">FRA NAV</BodyShort>
      </div>
      {tidligereInnsendinger.length > 5 && (
        <Detail>
          {`Viser ${Math.min(
            antallInnsendingerSomSkalVises,
            tidligereInnsendinger.length,
          )} av ${tidligereInnsendinger.length} innsendinger`}
        </Detail>
      )}
      <Accordion className="bg-ax-bg-neutral-soft mt-4" indent>
        <div className="flex flex-col text-ax-text-neutral">
          {innsendingerSomSkalVises?.map((innsending) => (
            <Accordion.Item key={innsending.id}>
              <Accordion.Header className="text-ax-text-accent-subtle">
                {innsending.erRefusjon
                  ? "Refusjonskrav - sendt inn"
                  : "Inntektsmelding - sendt inn"}{" "}
                {formatDatoKort(innsending.opprettetDato)}
              </Accordion.Header>
              <Accordion.Content className="pl-5 mt-4 border-l-2! border-solid! border-ax-bg-neutral-soft! border-y-0! border-r-0!">
                <div className="flex flex-col gap-4">
                  {innsending.heleDager && innsending.heleDager?.length > 0 && (
                    <div>
                      <div className="flex gap-2 items-center">
                        <Label>
                          {innsending.erRefusjon
                            ? "Hele dager dere søkte refusjon for"
                            : "Dager med oppgitt fravær"}
                        </Label>
                        {!innsending.erRefusjon && (
                          <div className="bg-ax-bg-neutral-soft">
                            <HelpText title="Dager med oppgitt fravær">
                              Hvis den ansatte har hatt oppgitt fravær deler av
                              dagen, viser vi kun datoen for fraværet og ikke
                              antall timer fra inntektsmeldingen
                            </HelpText>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 mt-1">
                        <Box marginBlock="space-16" asChild>
                          <List data-aksel-migrated-v8>
                            {innsending.heleDager?.map((dag) => (
                              <List.Item key={dag.fom}>
                                {formatDatoKort(new Date(dag.fom))} -{" "}
                                {formatDatoKort(new Date(dag.tom))}
                              </List.Item>
                            ))}
                          </List>
                        </Box>
                      </div>
                    </div>
                  )}
                  {innsending.delviseDager &&
                    innsending.delviseDager?.length > 0 && (
                      <div>
                        <Dropdown.Menu.Divider />
                        <div className="mt-4">
                          <Label>Delvise dager dere søkte refusjon for</Label>
                          <div className="flex flex-col gap-2 mt-1">
                            <Box marginBlock="space-16" asChild>
                              <List data-aksel-migrated-v8>
                                {innsending.delviseDager?.map((dag) => (
                                  <List.Item key={dag.dato}>
                                    {formatDatoKort(new Date(dag.dato))} -{" "}
                                    {dag.timer} timer
                                  </List.Item>
                                ))}
                              </List>
                            </Box>
                          </div>
                        </div>
                      </div>
                    )}
                  {innsending.dagerSomSkalTrekkes &&
                    innsending.dagerSomSkalTrekkes?.length > 0 && (
                      <div>
                        <Dropdown.Menu.Divider />
                        <div className="mt-4">
                          <Label>Dager dere ønsker å trekke</Label>
                          <div className="flex flex-col gap-2 mt-1">
                            <Box marginBlock="space-16" asChild>
                              <List data-aksel-migrated-v8>
                                {innsending.dagerSomSkalTrekkes?.map((dag) => (
                                  <List.Item key={dag.dato}>
                                    {formatDatoKort(new Date(dag.dato))}
                                  </List.Item>
                                ))}
                              </List>
                            </Box>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </div>
      </Accordion>
      {harFlereInnsendingerEnnAntallSomVises && (
        <Button
          className="mt-2"
          icon={<ArrowDownIcon />}
          onClick={visFlereInnsendinger}
          size="small"
          type="button"
          variant="tertiary"
        >
          Vis flere
        </Button>
      )}
      <Detail className="mt-4">
        Har dere brukt lønns- og personalsystem eller Altinn for å sende inn
        inntektsmelding for omsorgspenger vil de ikke vises i listen over.
      </Detail>
    </Box>
  );
};
