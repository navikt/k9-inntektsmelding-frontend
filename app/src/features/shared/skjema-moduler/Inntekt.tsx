import {
  ArrowUndoIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@navikt/aksel-icons";
import {
  Alert,
  BodyLong,
  BodyShort,
  Button,
  Checkbox,
  Heading,
  HGrid,
  Label,
  Link,
  List,
  Select,
  Stack,
  VStack,
} from "@navikt/ds-react";
import { ListItem } from "@navikt/ds-react/List";
import clsx from "clsx";
import { isAfter } from "date-fns";
import { Fragment } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import {
  HjelpetekstAlert,
  HjelpetekstReadMore,
} from "~/features/shared/Hjelpetekst";
import { DatePickerWrapped } from "~/features/shared/react-hook-form-wrappers/DatePickerWrapped";
import type { InntektOgRefusjonForm } from "~/features/shared/skjema-moduler/steg/InntektOgRefusjon/InntektOgRefusjon.tsx";
import {
  EndringAvInntektÅrsaker,
  OpplysningerDto,
} from "~/types/api-models.ts";
import {
  capitalizeSetning,
  formatDatoKort,
  formatKroner,
  formatOppramsing,
  leggTilGenitiv,
} from "~/utils.ts";
import { navnPåMåned } from "~/utils/date-utils";

import { useDisclosure } from "../hooks/useDisclosure";
import { Informasjonsseksjon } from "../Informasjonsseksjon";
import { FormattertTallTextField } from "../react-hook-form-wrappers/FormattertTallTextField";

type InntektProps = {
  opplysninger: Pick<
    OpplysningerDto,
    "skjæringstidspunkt" | "person" | "inntektsopplysninger"
  >;
  harEksisterendeInntektsmeldinger: boolean;
  children?: React.ReactNode;
};
export function Inntekt({
  opplysninger,
  harEksisterendeInntektsmeldinger,
  children,
}: InntektProps) {
  const { skjæringstidspunkt, person, inntektsopplysninger } = opplysninger;
  const { watch, setValue } = useFormContext<InntektOgRefusjonForm>();
  const { isOpen, onOpen, onClose } = useDisclosure(
    !!watch("korrigertInntekt"),
  );
  const erAInntektNede = inntektsopplysninger.månedsinntekter.some(
    (inntekt) => inntekt.status === "NEDETID_AINNTEKT",
  );
  const førsteDag = formatDatoKort(new Date(skjæringstidspunkt));

  const gjennomsnittAvMånederTekst = `Gjennomsnittet av lønn fra 
  ${formatOppramsing(
    inntektsopplysninger.månedsinntekter
      .filter(
        (m) => m.status !== "IKKE_RAPPORTERT_RAPPORTERINGSFRIST_IKKE_PASSERT",
      )
      .map((m) => navnPåMåned(m.fom).toLowerCase()),
  )}`;

  return (
    <div className="flex flex-col gap-4">
      <Heading id="beregnet-manedslonn" level="4" size="medium">
        Beregnet månedslønn
      </Heading>
      <Informasjonsseksjon
        kilde="Fra A-Ordningen"
        tittel={`${capitalizeSetning(leggTilGenitiv(person.fornavn))} lønn før ${førsteDag}`}
      >
        <HGrid columns={{ md: "max-content 1fr" }} gap="4">
          {inntektsopplysninger.månedsinntekter
            ?.toSorted((a, b) => a.fom.localeCompare(b.fom))
            .map((inntekt) => (
              <Fragment key={inntekt.fom}>
                <span>{navnPåMåned(inntekt.fom)}:</span>
                <Label as="span">
                  <RapportertInntekt inntekt={inntekt} />
                </Label>
              </Fragment>
            ))}
          <AlertOmRapportertLønn
            månedsinntekter={inntektsopplysninger.månedsinntekter}
          />
        </HGrid>
      </Informasjonsseksjon>

      {!erAInntektNede && (
        <VStack data-testid="gjennomsnittinntekt-block" gap="1">
          <BodyShort>Beregnet månedslønn</BodyShort>
          <strong
            className={clsx(
              "text-heading-medium",
              isOpen && "text-text-subtle line-through",
            )}
          >
            {formatKroner(inntektsopplysninger.gjennomsnittLønn)}
          </strong>
          <BodyShort>{gjennomsnittAvMånederTekst}</BodyShort>
        </VStack>
      )}
      {/* Hvis A-inntekt må feltet fylles ut, og det er ingen tilbakestillingsknapp. */}
      {erAInntektNede ? (
        <FormattertTallTextField
          description={gjennomsnittAvMånederTekst}
          htmlSize={20}
          inputMode="numeric"
          label="Beregnet måndslønn"
          min={0}
          name="inntekt"
          required
        />
      ) : isOpen ? (
        <EndreMånedslønn
          gjennomsnittLønn={inntektsopplysninger.gjennomsnittLønn}
          harEksisterendeInntektsmeldinger={harEksisterendeInntektsmeldinger}
          onClose={() => {
            onClose();
            setValue("meta.skalKorrigereInntekt", false);
          }}
          skjæringstidspunkt={skjæringstidspunkt}
        />
      ) : (
        <Button
          className="w-max"
          icon={<PencilIcon />}
          onClick={() => {
            onOpen();
            setValue("meta.skalKorrigereInntekt", true);
          }}
          size="medium"
          type="button"
          variant="secondary"
        >
          Endre månedslønn
        </Button>
      )}
      {children}
      <HjelpetekstAlert>
        <Heading level="4" size="xsmall">
          Er månedslønnen riktig?
        </Heading>
        <BodyLong>
          Har den ansatte i løpet av de siste tre månedene fått varig
          lønnsendring, endret stillingsprosent eller hatt lovlig fravær som
          påvirker lønnsutbetalingen, skal månedslønnen korrigeres. Overtid skal
          ikke inkluderes. Beregningen skal gjøres etter{" "}
          <Link
            href="https://lovdata.no/nav/folketrygdloven/kap8/%C2%A78-28"
            target="_blank"
          >
            folketrygdloven §&nbsp;8-28.
          </Link>
        </BodyLong>
      </HjelpetekstAlert>
      <div className="flex flex-col gap-2">
        <HjelpetekstReadMore header="Har den ansatte hatt ferie eller fravær de siste tre månedene?">
          <Stack gap="2">
            <BodyLong>
              Hvis den ansatte har hatt ferietrekk i en lønnsutbetaling skal
              dette inngå som en del av gjennomsnittet for tre måneder. Du må da
              endre månedslønnen, slik at den representerer et snitt av lønnen
              den ansatte ville hatt uten ferietrekket.
            </BodyLong>
            <BodyLong>
              <strong>Har den ansatte vært borte mer enn 14 dager?</strong>
              <br />
              Hvis den ansatte har vært borte fra jobb i mer enn 14 dager,
              regnes arbeidsforholdet som avbrutt. Hvilken inntekt du oppgir
              avhenger av om den ansatte var tilbake fra jobb etter fraværet:
            </BodyLong>
            <List>
              <ListItem>
                Hvis den ansatte ikke har vært tilbake på jobb, skal du oppgi
                0,- i inntekt. Nav vurderer da søknaden ut fra opplysninger i
                A-meldingen.
              </ListItem>
              <ListItem>
                Hvis den ansatte har vært tilbake i mindre enn 3 måneder, må du
                fastsette månedsinntekten ut fra perioden den ansatte var
                tilbake:
                <List>
                  <ListItem>
                    Hvis den ansatte har fast månedslønn, er det denne du skal
                    bruke
                  </ListItem>
                  <ListItem>
                    Hvis den ansatte har hatt lovlig fravær, skal du bruke
                    inntekten som den ansatte ville hatt hvis han eller hun var
                    på jobb. Lovlig fravær kan for eksempel være på grunn av
                    ferie, sykefravær, foreldrepermisjon eller perioder med
                    pleiepenger.
                  </ListItem>
                  <ListItem>
                    Hvis den ansatte har varierende lønn, og ikke rakk å jobbe
                    tre hele måneder, må du fastsette inntekten for delvise
                    måneder slik: Utbetalt lønn / utførte arbeidsdager x avtalte
                    arbeidsdager for måneden.
                    <br />
                    <em>
                      Eks: Den ansatte skal ha stønad fra 17. november. Det var
                      avtalt 22 arbeidsdager for hele november, og den ansatte
                      jobbet 12 dager frem til første fraværsdag. På disse 12
                      dagene tjente den ansatte 22 000,-. Beregnet inntekt: 22
                      000 / 12 x 22 = 40 333,- månedslønn i november. Denne
                      inntekten tas med i snittet av tre måneder, sammen med
                      september og oktober.
                    </em>
                  </ListItem>
                </List>
              </ListItem>
            </List>
          </Stack>
        </HjelpetekstReadMore>
        <HjelpetekstReadMore header="Jobber den ansatte skift eller har timelønn?">
          <BodyLong>
            Hvis den ansatte jobber skift eller har timelønn, skal inntekten
            fastsettes etter de samme reglene som arbeidstakere med fastlønn.
            Det betyr at du som hovedregel skal bruke et gjennomsnitt av
            inntekten fra de siste tre kalendermånedene.
          </BodyLong>
        </HjelpetekstReadMore>
      </div>
    </div>
  );
}

const RapportertInntekt = ({
  inntekt,
}: {
  inntekt: OpplysningerDto["inntektsopplysninger"]["månedsinntekter"][0];
}) => {
  if (inntekt.status === "IKKE_RAPPORTERT_RAPPORTERINGSFRIST_IKKE_PASSERT") {
    return "Ikke rapportert";
  }
  if (inntekt.status === "IKKE_RAPPORTERT_MEN_BRUKT_I_GJENNOMSNITT") {
    return "Ikke rapportert (0kr)";
  }
  if (inntekt.status === "NEDETID_AINNTEKT") {
    return "-";
  }

  return formatKroner(inntekt.beløp);
};

type AlertOmRapportertLønnProps = {
  månedsinntekter: OpplysningerDto["inntektsopplysninger"]["månedsinntekter"];
};
const AlertOmRapportertLønn = ({
  månedsinntekter,
}: AlertOmRapportertLønnProps) => {
  const AInntektErNede = månedsinntekter.some(
    (inntekt) => inntekt.status === "NEDETID_AINNTEKT",
  );

  const harIkkeRapportertOgFristErPassert = månedsinntekter.some(
    (inntekt) => inntekt.status === "IKKE_RAPPORTERT_MEN_BRUKT_I_GJENNOMSNITT",
  );

  const harIkkeRapportertMenFristIkkePassert = månedsinntekter.some(
    (inntekt) =>
      inntekt.status === "IKKE_RAPPORTERT_RAPPORTERINGSFRIST_IKKE_PASSERT",
  );

  if (AInntektErNede) {
    return (
      <Alert
        className="col-span-2"
        data-testid="alert-a-inntekt-er-nede"
        variant="warning"
      >
        <BodyShort>
          Vi har problemer med å hente inntektsopplysninger fra A-ordningen. Du
          kan legge inn beregnet månedsinntekt manuelt, eller prøve igjen
          senere.
        </BodyShort>
      </Alert>
    );
  }

  if (
    harIkkeRapportertOgFristErPassert &&
    harIkkeRapportertMenFristIkkePassert
  ) {
    return (
      <Alert
        className="col-span-2"
        data-testid="alert-både-ikke-rapportert-og-brukt-i-snitt"
        variant="warning"
      >
        <BodyShort>
          Det er ikke rapportert lønn for alle tre månedene før første
          fraværsdag, og fristen for rapportering er passert for en eller flere
          måneder. Vi har derfor estimert månedslønn basert på gjennomsnittet av
          de tre siste månedene med rapportert lønn, inkludert måneder uten
          rapportert lønn som er satt til 0 kr.
        </BodyShort>
      </Alert>
    );
  }

  if (harIkkeRapportertOgFristErPassert) {
    return (
      <Alert
        className="col-span-2"
        data-testid="alert-ikke-rapportert-brukt-i-snitt"
        variant="warning"
      >
        <BodyShort>
          Det er ikke rapportert lønn for alle tre månedene før første
          fraværsdag, og fristen for rapportering er passert. Vi har derfor
          estimert månedslønn basert på gjennomsnittet av de tre siste månedene,
          inkludert måneder uten rapportert lønn som er satt til 0 kr.
        </BodyShort>
      </Alert>
    );
  }

  if (harIkkeRapportertMenFristIkkePassert) {
    return (
      <Alert
        className="col-span-2"
        data-testid="alert-ikke-rapportert-frist-ikke-passert"
        variant="warning"
      >
        <BodyShort>
          Det er ikke rapportert lønn for alle tre månedene før første
          fraværsdag. Vi har derfor estimert månedslønn basert på gjennomsnittet
          av de tre siste månedene med rapportert lønn.
        </BodyShort>
      </Alert>
    );
  }

  return null;
};

export const endringsårsak = [
  { value: "FERIE", label: "Ferie" },
  { value: "VARIG_LØNNSENDRING", label: "Varig lønnsendring" },
  { value: "PERMISJON", label: "Permisjon" },
  { value: "PERMITTERING", label: "Permittering" },
  { value: "NY_STILLING", label: "Ny stilling" },
  { value: "NY_STILLINGSPROSENT", label: "Ny stillingsprosent" },
  { value: "BONUS", label: "Bonus" },
  { value: "NYANSATT", label: "Nyansatt" },
  { value: "SYKEFRAVÆR", label: "Sykefravær" },
  { value: "TARIFFENDRING", label: "Tariffendring" },
  {
    value: "FERIETREKK_ELLER_UTBETALING_AV_FERIEPENGER",
    label: "Ferietrekk / utbetaling av feriepenger",
  },
  {
    value: "MANGELFULL_RAPPORTERING_AORDNING",
    label: "Feil rapportering til a-ordningen",
  },
  {
    value: "INNTEKT_IKKE_RAPPORTERT_ENDA_AORDNING",
    label: "Inntekt er ikke rapportert til a-ordningen enda",
  },
] satisfies { value: EndringAvInntektÅrsaker; label: string }[];

type EndreMånedslønnProps = {
  onClose: () => void;
  harEksisterendeInntektsmeldinger: boolean;
  gjennomsnittLønn?: number;
  skjæringstidspunkt: string;
};
const EndreMånedslønn = ({
  onClose,
  harEksisterendeInntektsmeldinger,
  gjennomsnittLønn,
  skjæringstidspunkt,
}: EndreMånedslønnProps) => {
  const { unregister, setValue } = useFormContext<InntektOgRefusjonForm>();
  const tilbakestillOgLukk = () => {
    unregister("korrigertInntekt");
    if (gjennomsnittLønn) {
      setValue("inntekt", gjennomsnittLønn);
      setValue("refusjon.0.beløp", gjennomsnittLønn);
    }
    onClose();
  };

  return (
    <>
      <div className="flex items-start gap-4">
        <FormattertTallTextField
          inputMode="numeric"
          label="Endret månedsinntekt"
          min={0}
          name="korrigertInntekt"
          required
        />
        <Button
          aria-label="Tilbakestill månedsinntekt"
          className="mt-8"
          icon={<ArrowUndoIcon aria-hidden />}
          onClick={tilbakestillOgLukk}
          type="button"
          variant="tertiary"
        >
          Tilbakestill
        </Button>
      </div>
      <Endringsårsaker
        harEksisterendeInntektsmeldinger={harEksisterendeInntektsmeldinger}
        skjæringstidspunkt={skjæringstidspunkt}
      />
    </>
  );
};

export const ENDRINGSÅRSAK_TEMPLATE = {
  fom: undefined,
  tom: undefined,
  bleKjentFom: undefined,
  ignorerTom: false,
  årsak: "" as const,
};

type EndringsårsakerProps = {
  harEksisterendeInntektsmeldinger: boolean;
  skjæringstidspunkt: string;
};
function Endringsårsaker({
  harEksisterendeInntektsmeldinger,
  skjæringstidspunkt,
}: EndringsårsakerProps) {
  const { control, register, formState } =
    useFormContext<InntektOgRefusjonForm>();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "endringAvInntektÅrsaker",
  });

  // Tariffendring skal kun være tilgjengelig dersom man endrer en IM, ikke for førstegangs-innsendelse
  const muligeÅrsakerValg = harEksisterendeInntektsmeldinger
    ? Object.values(endringsårsak)
    : Object.values(endringsårsak).filter(
        (årsak) => årsak.value !== "TARIFFENDRING",
      );

  return (
    <VStack gap="4">
      {fields.map((field, index) => {
        return (
          <div
            className="pl-4 border-solid border-0 border-l-4 border-bg-subtle flex flex-col gap-4 relative"
            key={field.id}
          >
            <Select
              description="Dette hjelper oss å forstå avviket fra rapportert lønn."
              error={
                formState.errors?.endringAvInntektÅrsaker?.[index]?.årsak
                  ?.message
              }
              label="Hva er årsaken til endringen?"
              {...register(`endringAvInntektÅrsaker.${index}.årsak`, {
                required: "Må oppgis",
              })}
              className="md:max-w-[60%]"
              onChange={(v) => {
                // vi nullstiller alle andre felter enn årsak, så vi ikke får noe som henger igjen når vi endrer årsak
                update(index, {
                  ...ENDRINGSÅRSAK_TEMPLATE,
                  årsak: v.target.value as EndringAvInntektÅrsaker,
                });
              }}
            >
              <option value="">Velg endringsårsak</option>
              {muligeÅrsakerValg.map((årsak) => (
                <option key={årsak.value} value={årsak.value}>
                  {årsak.label}
                </option>
              ))}
            </Select>
            <Årsaksperioder
              index={index}
              skjæringstidspunkt={skjæringstidspunkt}
            />
            {index > 0 ? (
              <Button
                aria-label="Slett endringsårsak"
                className="w-fit md:absolute top-8 right-0"
                icon={<TrashIcon />}
                onClick={() => remove(index)}
                type="button"
                variant="tertiary"
              >
                Slett
              </Button>
            ) : (
              <div />
            )}
          </div>
        );
      })}
      <Button
        className="w-fit"
        icon={<PlusIcon />}
        iconPosition="left"
        onClick={() => append(ENDRINGSÅRSAK_TEMPLATE)}
        size="medium"
        type="button"
        variant="secondary"
      >
        Legg til ny endringsårsak
      </Button>
    </VStack>
  );
}

type ÅrsaksperioderProps = {
  index: number;
  skjæringstidspunkt: string;
};

function Årsaksperioder({ index, skjæringstidspunkt }: ÅrsaksperioderProps) {
  const { watch, register } = useFormContext<InntektOgRefusjonForm>();
  const årsak = watch(`endringAvInntektÅrsaker.${index}.årsak`);
  const ignorerTom = watch(`endringAvInntektÅrsaker.${index}.ignorerTom`);

  const endringsÅrsakTekst = endringsårsak.find(
    ({ value }) => value === årsak,
  )?.label;

  // Spesialhåndtering av tariffendring
  if (årsak === "TARIFFENDRING") {
    return (
      <div className="flex gap-4 flex-auto">
        <DatePickerWrapped
          label="Fra og med"
          name={`endringAvInntektÅrsaker.${index}.fom`}
          rules={{ required: "Må oppgis" }}
        />
        <DatePickerWrapped
          label="Ble kjent fra"
          name={`endringAvInntektÅrsaker.${index}.bleKjentFom`}
          rules={{ required: "Må oppgis" }}
        />
      </div>
    );
  }

  const fomErPåkrevd = PÅKREVDE_ENDRINGSÅRSAK_FELTER[årsak].fom;
  const tomErPåkrevd = PÅKREVDE_ENDRINGSÅRSAK_FELTER[årsak].tom;
  const typePåkrevdeFelter = fomErPåkrevd && tomErPåkrevd ? "periode" : "dato";

  return (
    <>
      {(fomErPåkrevd || tomErPåkrevd) && (
        <Label as="span">
          Legg inn {typePåkrevdeFelter} for {endringsÅrsakTekst?.toLowerCase()}:
        </Label>
      )}
      <div className="flex gap-4 flex-auto flex-wrap">
        {fomErPåkrevd ? (
          <DatePickerWrapped
            label="Fra og med"
            name={`endringAvInntektÅrsaker.${index}.fom`}
            rules={{
              required: "Må oppgis",
              validate: (date: string) => {
                return (
                  isAfter(skjæringstidspunkt, date) ||
                  "Lønnsendring må være før første dag med fravær"
                );
              },
            }}
          />
        ) : (
          <div />
        )}
        {tomErPåkrevd ? (
          <DatePickerWrapped
            disabled={ignorerTom}
            label="Til og med"
            name={`endringAvInntektÅrsaker.${index}.tom`}
            rules={{
              required: ignorerTom ? false : "Må oppgis",
              validate: (date: string) => {
                if (ignorerTom) {
                  return true;
                }
                return (
                  isAfter(skjæringstidspunkt, date) ||
                  "Lønnsendring må være før første dag med fravær"
                );
              },
            }}
          />
        ) : (
          <div />
        )}
        {PÅKREVDE_ENDRINGSÅRSAK_FELTER[årsak].tomErValgfritt ? (
          <Checkbox
            className="md:mt-8"
            {...register(`endringAvInntektÅrsaker.${index}.ignorerTom`)}
          >
            {(() => {
              switch (årsak) {
                case "SYKEFRAVÆR": {
                  return "Ansatt har fremdeles sykefravær";
                }
                case "PERMISJON": {
                  return "Ansatt er fremdeles i permisjon";
                }
                case "PERMITTERING": {
                  return "Ansatt er fremdeles permittert";
                }
                default: {
                  return "";
                }
              }
            })()}
          </Checkbox>
        ) : (
          <div />
        )}
      </div>
    </>
  );
}

export const PÅKREVDE_ENDRINGSÅRSAK_FELTER = {
  // Før man har valgt
  "": { fom: false, tom: false, bleKjentFom: false, tomErValgfritt: false },

  // Har ingen ekstra felter
  BONUS: { fom: false, tom: false, bleKjentFom: false, tomErValgfritt: false },
  NYANSATT: {
    fom: false,
    tom: false,
    bleKjentFom: false,
    tomErValgfritt: false,
  },
  FERIETREKK_ELLER_UTBETALING_AV_FERIEPENGER: {
    fom: false,
    tom: false,
    bleKjentFom: false,
    tomErValgfritt: false,
  },
  MANGELFULL_RAPPORTERING_AORDNING: {
    fom: false,
    tom: false,
    bleKjentFom: false,
    tomErValgfritt: false,
  },
  INNTEKT_IKKE_RAPPORTERT_ENDA_AORDNING: {
    fom: false,
    tom: false,
    bleKjentFom: false,
    tomErValgfritt: false,
  },

  // Kun fom
  VARIG_LØNNSENDRING: {
    fom: true,
    tom: false,
    bleKjentFom: false,
    tomErValgfritt: false,
  },
  NY_STILLING: {
    fom: true,
    tom: false,
    bleKjentFom: false,
    tomErValgfritt: false,
  },
  NY_STILLINGSPROSENT: {
    fom: true,
    tom: false,
    bleKjentFom: false,
    tomErValgfritt: false,
  },

  // fom + tom
  FERIE: { fom: true, tom: true, bleKjentFom: false, tomErValgfritt: false },
  PERMISJON: { fom: true, tom: true, bleKjentFom: false, tomErValgfritt: true },
  PERMITTERING: {
    fom: true,
    tom: true,
    bleKjentFom: false,
    tomErValgfritt: true,
  },
  SYKEFRAVÆR: {
    fom: true,
    tom: true,
    bleKjentFom: false,
    tomErValgfritt: true,
  },

  // Tariffendring er noe for seg selv
  TARIFFENDRING: {
    fom: true,
    tom: false,
    bleKjentFom: true,
    tomErValgfritt: false,
  },
} satisfies Record<
  EndringAvInntektÅrsaker & "",
  { fom: boolean; tom: boolean; bleKjentFom: boolean; tomErValgfritt?: boolean }
>;
