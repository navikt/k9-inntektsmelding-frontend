import {
  ArrowUndoIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@navikt/aksel-icons";
import {
  Alert,
  BodyLong,
  Button,
  Heading,
  HGrid,
  HStack,
  Label,
  Radio,
  RadioGroup,
  Stack,
  VStack,
} from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";
import { isAfter } from "date-fns";
import { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { hentGrunnbeløpOptions } from "~/api/queries.ts";
import { HjelpetekstReadMore } from "~/features/shared/Hjelpetekst";
import { useOpplysninger } from "~/features/shared/hooks/useOpplysninger";
import { DatePickerWrapped } from "~/features/shared/react-hook-form-wrappers/DatePickerWrapped";
import type { InntektOgRefusjonForm } from "~/features/shared/skjema-moduler/steg/InntektOgRefusjon/InntektOgRefusjon.tsx";
import { formatKroner, formatStønadsnavn } from "~/utils.ts";

import { FormattertTallTextField } from "../react-hook-form-wrappers/FormattertTallTextField";

export const REFUSJON_RADIO_VALG = {
  JA_LIK_REFUSJON: "Ja, likt beløp i hele perioden",
  JA_VARIERENDE_REFUSJON:
    "Ja, men kun deler av perioden eller varierende beløp",
  NEI: "Nei",
} satisfies Record<InntektOgRefusjonForm["skalRefunderes"], string>;

export function UtbetalingOgRefusjon() {
  const opplysninger = useOpplysninger();
  const { register, formState, watch, setValue } =
    useFormContext<InntektOgRefusjonForm>();
  const { name, ...radioGroupProps } = register("skalRefunderes", {
    required: "Du må svare på dette spørsmålet",
  });
  const korrigertInntekt = watch("korrigertInntekt");
  useEffect(() => {
    if (korrigertInntekt) {
      setValue("refusjon.0.beløp", korrigertInntekt);
    }
  }, [korrigertInntekt]);

  // Denne bolken er kun relevant hvis A-inntekt er nede. Da vil bruker endre på inntekts-feltet.
  // I alle andre tilfeller er det korrigertInntekt de vil endre.
  // Dette fordi når A-inntekt er nede forventer vi ingen endringsårsak da bruker ikke fikk noen foreslått inntekt til å begynne med
  const inntekt = watch("inntekt");
  useEffect(() => {
    if (inntekt) {
      setValue("refusjon.0.beløp", inntekt);
    }
  }, [inntekt]);

  const skalRefunderes = watch("skalRefunderes");

  return (
    <VStack gap="4">
      <hr />
      <Heading id="refusjon" level="4" size="medium">
        Utbetaling og refusjon
      </Heading>
      <HjelpetekstReadMore header="Hva vil det si å ha refusjon?">
        <Stack gap="2">
          <BodyLong>
            Refusjon er når arbeidsgiver utbetaler lønn som vanlig til den
            ansatte, og får tilbakebetalt{" "}
            {formatStønadsnavn({
              ytelsesnavn: opplysninger.ytelse,
              form: "ubestemt",
            })}{" "}
            direkte fra Nav. Dette kalles ofte å forskuttere lønn, som man
            krever refundert fra Nav. Vi utbetaler da{" "}
            {formatStønadsnavn({
              ytelsesnavn: opplysninger.ytelse,
              form: "bestemt",
            })}{" "}
            til det kontonummeret som arbeidsgiver har registrert i Altinn.
          </BodyLong>
          <BodyLong>
            Noen arbeidsgivere er forpliktet til å forskuttere ut fra
            tariffavtaler, mens andre arbeidsgivere velger selv om de ønsker en
            slik ordning. Hvis dere velger å forskuttere lønn, er det viktig at
            dere har en god dialog med arbeidstakeren om utfallet av søknaden.
          </BodyLong>
        </Stack>
      </HjelpetekstReadMore>
      <RadioGroup
        error={formState.errors.skalRefunderes?.message}
        legend="Betaler dere lønn under fraværet og krever refusjon?"
        name={name}
      >
        <Radio value="JA_LIK_REFUSJON" {...radioGroupProps}>
          {REFUSJON_RADIO_VALG["JA_LIK_REFUSJON"]}
        </Radio>
        <Radio value="JA_VARIERENDE_REFUSJON" {...radioGroupProps}>
          {REFUSJON_RADIO_VALG["JA_VARIERENDE_REFUSJON"]}
        </Radio>
        <Radio value="NEI" {...radioGroupProps}>
          {REFUSJON_RADIO_VALG["NEI"]}
        </Radio>
      </RadioGroup>
      {skalRefunderes === "JA_LIK_REFUSJON" ? <LikRefusjon /> : undefined}
      {skalRefunderes === "JA_VARIERENDE_REFUSJON" ? (
        <VarierendeRefusjon />
      ) : undefined}
      {skalRefunderes === "NEI" &&
        opplysninger.forespørselType === "ARBEIDSGIVERINITIERT_NYANSATT" && (
          <Alert variant="warning">
            <Heading level="2" size="small">
              Inntektsmelding kan ikke sendes inn
            </Heading>
            Det er ikke nødvendig å sende inn inntektsmelding dersom du ikke
            krever refusjon for den nyansatte.
          </Alert>
        )}
    </VStack>
  );
}

function Over6GAlert() {
  const { watch } = useFormContext<InntektOgRefusjonForm>();
  const GRUNNBELØP = useQuery(hentGrunnbeløpOptions()).data;

  const refusjonsbeløpPerMåned = watch("refusjon")[0];
  const refusjonsbeløpPerMånedSomNummer = Number(refusjonsbeløpPerMåned);
  const erRefusjonOver6G =
    !Number.isNaN(refusjonsbeløpPerMånedSomNummer) &&
    refusjonsbeløpPerMånedSomNummer > 6 * GRUNNBELØP;

  if (erRefusjonOver6G) {
    return (
      <Alert variant="info">
        Nav utbetaler opptil 6G av årslønnen. Du skal likevel føre opp den
        lønnen dere utbetaler til den ansatte i sin helhet.
      </Alert>
    );
  }
  return null;
}

function LikRefusjon() {
  const { watch, resetField, setValue } =
    useFormContext<InntektOgRefusjonForm>();
  const [skalEndreBeløp, setSkalEndreBeløp] = useState(false);

  const refusjonsbeløpPerMåned = watch(`refusjon.0.beløp`);
  const korrigertInntekt = watch("korrigertInntekt");

  return (
    <>
      <div>
        {skalEndreBeløp ? (
          <Stack gap="4">
            <HStack gap="4">
              <FormattertTallTextField
                autoFocus
                label="Refusjonsbeløp per måned"
                min={0}
                name="refusjon.0.beløp"
              />
              <Button
                aria-label="Tilbakestill refusjonsbeløp"
                className="mt-8"
                icon={<ArrowUndoIcon aria-hidden />}
                onClick={() => {
                  // Hvis vi har korrigert inntekt så setter vi beløp tilbake til det. Hvis ikke sett til defaultValue
                  if (korrigertInntekt) {
                    setValue("refusjon.0.beløp", korrigertInntekt);
                  } else {
                    resetField("refusjon.0.beløp");
                  }
                  setSkalEndreBeløp(false);
                }}
                variant="tertiary"
              >
                Tilbakestill
              </Button>
            </HStack>
            <Over6GAlert />
          </Stack>
        ) : (
          <>
            <Label>Refusjonsbeløp per måned</Label>
            <BodyLong className="mb-2" size="medium">
              {formatKroner(refusjonsbeløpPerMåned)}
            </BodyLong>
            <Button
              className="w-fit"
              icon={<PencilIcon />}
              iconPosition="left"
              onClick={() => {
                setSkalEndreBeløp(true);
              }}
              size="medium"
              variant="secondary"
            >
              Endre refusjonsbeløp
            </Button>
          </>
        )}
      </div>
      <DelvisFraværHjelpetekst />
    </>
  );
}

function VarierendeRefusjon() {
  const opplysninger = useOpplysninger();
  const visInfoOmEndringAvFørsteFraværsdagMedRefusjon = [
    "ARBEIDSGIVERINITIERT_NYANSATT",
    "ARBEIDSGIVERINITIERT_UREGISTRERT",
  ].includes(opplysninger.forespørselType);
  return (
    <>
      <VStack data-testid="varierende-refusjon">
        <Heading className="mb-4" level="2" size="small">
          Refusjonsbeløp dere krever per periode
        </Heading>
        <Alert className="mb-4" variant="info">
          <Stack gap="2">
            {visInfoOmEndringAvFørsteFraværsdagMedRefusjon && (
              <BodyLong>
                Skal du endre første fraværsdag med refusjon fremover i tid,
                skriver du 0,- i refusjonsbeløp i perioder uten refusjon. Trykk
                på «Legg til ny periode» for å legge til ny dato dere ønsker
                refusjon fra, og skriv inn refusjonsbeløpet.
              </BodyLong>
            )}
            <BodyLong>
              Hvis dere skal slutte å forskuttere lønn i perioden, skriver du
              0,- i refusjonsbeløp fra den datoen dere ikke lengre forskutterer
              lønn.
            </BodyLong>
          </Stack>
        </Alert>
        <Refusjonsperioder />
        <Over6GAlert />
      </VStack>
      <VStack gap="2">
        <DelvisFraværHjelpetekst />
        <HjelpetekstReadMore header="Hvilke endringer må du informere Nav om?">
          <Stack gap="2">
            <BodyLong>
              Her skal du registrere endringer som påvirker refusjonen fra Nav.
              Dette kan være på grunn av endret stillingsprosent som gjør at
              lønnen dere forskutterer endrer seg i perioden.
            </BodyLong>
            <BodyLong>
              Hvis dere skal slutte å forskuttere lønn i perioden, registrerer
              du det som en endring her. Dette kan være fordi arbeidsforholdet
              opphører, eller fordi dere kun forskutterer en begrenset periode.
              Du skriver da 0,- i refusjon fra den datoen dere ikke lengre
              forskutterer lønn.
            </BodyLong>
            <BodyLong>
              Du trenger ikke å informere om endringer fordi den ansatte jobber
              mer eller mindre i en periode.
            </BodyLong>
          </Stack>
        </HjelpetekstReadMore>
      </VStack>
    </>
  );
}

export const ENDRING_I_REFUSJON_TEMPLATE = {
  fom: "",
  beløp: 0,
};

function Refusjonsperioder() {
  const { control, watch } = useFormContext<InntektOgRefusjonForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "refusjon",
  });

  const tidligsteDato = watch(`refusjon.0.fom`) ?? "";

  return (
    <VStack className="py-4" gap={{ xs: "5", md: "3" }}>
      {fields.map((field, index) => (
        <HGrid
          className="px-4 border-l-4 border-ax-bg-neutral-soft"
          columns={{ xs: "1fr", md: "min-content 1fr 1fr" }}
          gap="6"
          key={field.id}
        >
          <DatePickerWrapped
            label="Fra og med"
            name={`refusjon.${index}.fom` as const}
            readOnly={index === 0}
            rules={{
              required: "Må oppgis",
              validate: (date: string) => {
                if (index === 0) {
                  return true;
                }
                if (!tidligsteDato) {
                  return "Fant ikke starttidspunkt";
                }
                return (
                  isAfter(date, tidligsteDato) || "Kan ikke være før startdato"
                );
              },
            }}
          />
          <div>
            <FormattertTallTextField
              inputMode="numeric"
              label="Refusjonsbeløp per måned"
              min={0}
              name={`refusjon.${index}.beløp` as const}
              required
              size="medium"
            />
          </div>
          {index >= 2 && (
            <div className="flex items-end">
              <Button
                aria-label="Fjern refusjonsendring"
                icon={<TrashIcon />}
                onClick={() => remove(index)}
                type="button"
                variant="tertiary"
              >
                Slett
              </Button>
            </div>
          )}
        </HGrid>
      ))}
      <Button
        className="w-fit col-span-2"
        icon={<PlusIcon />}
        iconPosition="left"
        onClick={() => append(ENDRING_I_REFUSJON_TEMPLATE)}
        size="medium"
        type="button"
        variant="secondary"
      >
        Legg til ny periode
      </Button>
    </VStack>
  );
}

function DelvisFraværHjelpetekst() {
  const { ytelse } = useOpplysninger();
  return (
    <HjelpetekstReadMore header="Har den ansatte delvis fravær i perioden?">
      <BodyLong>
        Hvis den ansatte skal kombinere{" "}
        {formatStønadsnavn({ ytelsesnavn: ytelse, form: "ubestemt" })} fra Nav
        med arbeid, vil Nav redusere utbetalingen ut fra opplysningene fra den
        ansatte. Du oppgir derfor den månedslønnen dere utbetaler til den
        ansatte, uavhengig av hvor mye den ansatte skal jobbe.
      </BodyLong>
    </HjelpetekstReadMore>
  );
}
