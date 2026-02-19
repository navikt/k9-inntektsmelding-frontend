import { FormSummary, List, VStack, Box } from "@navikt/ds-react";
import {
  FormSummaryAnswer,
  FormSummaryAnswers,
  FormSummaryEditLink,
  FormSummaryFooter,
  FormSummaryHeader,
  FormSummaryHeading,
  FormSummaryLabel,
  FormSummaryValue,
} from "@navikt/ds-react/FormSummary";
import { ListItem } from "@navikt/ds-react/List";
import { Link } from "@tanstack/react-router";

import { InntektsmeldingSkjemaStateValidAGINyansatt } from "~/features/arbeidsgiverinitiert/nyansatt/zodSchemas.tsx";
import { InntektsmeldingSkjemaStateValidAGIUnntattAaregister } from "~/features/arbeidsgiverinitiert/unntattAAregister/zodSchemas.tsx";
import { InntektsmeldingSkjemaStateValid } from "~/features/inntektsmelding/zodSchemas.tsx";
import { endringsårsak } from "~/features/shared/skjema-moduler/Inntekt.tsx";
import { REFUSJON_RADIO_VALG } from "~/features/shared/skjema-moduler/UtbetalingOgRefusjon.tsx";
import type { OpplysningerDto } from "~/types/api-models.ts";
import { EndringAvInntektÅrsakerSchema } from "~/types/api-models.ts";
import {
  capitalize,
  formatDatoKort,
  formatDatoLang,
  formatFødselsnummer,
  formatKroner,
  formatNavn,
  formatTelefonnummer,
  formatYtelsesnavn,
  lagFulltNavn,
} from "~/utils";

type SkjemaoppsummeringProps = {
  opplysninger: OpplysningerDto;
  skjemaState:
    | InntektsmeldingSkjemaStateValid
    | InntektsmeldingSkjemaStateValidAGIUnntattAaregister;
};

export const Skjemaoppsummering = ({
  opplysninger,
  skjemaState,
}: SkjemaoppsummeringProps) => {
  const kanEndres = opplysninger.forespørselStatus !== "UTGÅTT";

  if (opplysninger.ytelse === "OMSORGSPENGER") {
    const fravær = opplysninger.etterspurtePerioder;
    const harUtbetaltLønn = skjemaState.skalRefunderes === "JA_LIK_REFUSJON";
    return (
      <VStack gap="4">
        <ArbeidsgiverOgAnsattOppsummering
          kanEndres={kanEndres}
          opplysninger={opplysninger}
          skjemaState={skjemaState}
        />
        <FormSummary>
          <FormSummaryHeader>
            <FormSummaryHeading level="3">Om fraværet</FormSummaryHeading>
          </FormSummaryHeader>
          <FormSummaryAnswers>
            <FormSummaryAnswer>
              <FormSummaryLabel>Dager med oppgitt fravær</FormSummaryLabel>
              <FormSummaryValue>
                {fravær ? (
                  <Box marginBlock="space-16" asChild><List data-aksel-migrated-v8>
                      {fravær?.map((periode, index) =>
                        periode.fom && periode.tom ? (
                          <ListItem key={index}>
                            {formatDatoKort(new Date(periode.fom))}–
                            {formatDatoKort(new Date(periode.tom))}
                          </ListItem>
                        ) : null,
                      )}
                    </List></Box>
                ) : (
                  "Ingen dager med oppgitt fravær"
                )}
              </FormSummaryValue>
            </FormSummaryAnswer>

            {harUtbetaltLønn !== undefined && (
              <FormSummaryAnswer>
                <FormSummaryLabel>
                  Har dere utbetalt lønn for dette fraværet?
                </FormSummaryLabel>
                <FormSummaryValue>
                  {harUtbetaltLønn ? "Ja" : "Nei"}
                </FormSummaryValue>
              </FormSummaryAnswer>
            )}
          </FormSummaryAnswers>
          <FormSummaryFooter>
            <FormSummaryEditLink as={Link} to={"../inntekt-og-refusjon"} />
          </FormSummaryFooter>
        </FormSummary>
        <InntektOppsummering
          kanEndres={kanEndres}
          opplysninger={opplysninger}
          skjemaState={skjemaState}
        />
      </VStack>
    );
  }
  return (
    <VStack gap="4">
      <ArbeidsgiverOgAnsattOppsummering
        kanEndres={kanEndres}
        opplysninger={opplysninger}
        skjemaState={skjemaState}
      />
      <RefusjonOppsummering
        kanEndres={false}
        opplysninger={opplysninger}
        startdato={opplysninger.førsteUttaksdato}
      />
      <InntektOppsummering
        kanEndres={kanEndres}
        opplysninger={opplysninger}
        skjemaState={skjemaState}
      />
      <UtbetalingOgRefusjonOppsummering
        kanEndres={kanEndres}
        skjemaState={skjemaState}
      />
      <NaturalytelserOppsummering
        kanEndres={kanEndres}
        skjemaState={skjemaState}
      />
    </VStack>
  );
};

function InntektOppsummering({
  kanEndres,
  opplysninger,
  skjemaState,
}: SkjemaoppsummeringProps & { kanEndres: boolean }) {
  const harEndretInntekt = skjemaState.endringAvInntektÅrsaker.length > 0;
  const estimertInntekt = opplysninger.inntektsopplysninger.gjennomsnittLønn;
  const gjeldendeInntekt = skjemaState.korrigertInntekt ?? skjemaState.inntekt;
  const årsakerUtenTariffendring = skjemaState.endringAvInntektÅrsaker.filter(
    (årsak) => årsak.årsak !== EndringAvInntektÅrsakerSchema.enum.TARIFFENDRING,
  );
  const årsakerMedTariffendring = skjemaState.endringAvInntektÅrsaker.filter(
    (årsak) => årsak.årsak === EndringAvInntektÅrsakerSchema.enum.TARIFFENDRING,
  );

  return (
    <FormSummary>
      <FormSummary.Header>
        <FormSummary.Heading level="3">Månedslønn</FormSummary.Heading>
      </FormSummary.Header>
      <FormSummary.Answers>
        <FormSummary.Answer>
          <FormSummary.Label>Beregnet månedslønn</FormSummary.Label>
          <FormSummary.Value>
            {harEndretInntekt ? (
              <Box marginBlock="space-16" asChild><List data-aksel-migrated-v8>
                  <List.Item>
                    Estimert:{" "}
                    <span className="line-through">
                      {formatKroner(estimertInntekt)}
                    </span>
                  </List.Item>
                  <List.Item>
                    Endret til: {formatKroner(gjeldendeInntekt)}
                  </List.Item>
                </List></Box>
            ) : (
              formatKroner(gjeldendeInntekt)
            )}
          </FormSummary.Value>
        </FormSummary.Answer>
        {harEndretInntekt && (
          <>
            <FormSummary.Answer>
              <FormSummary.Label>Årsaker</FormSummary.Label>
              <FormSummary.Value>
                <FormSummary.Answers>
                  {årsakerUtenTariffendring.map(
                    ({ årsak, fom, tom, bleKjentFom, ignorerTom }) => {
                      const periodeStreng = formaterPeriodeStreng({
                        fom,
                        tom: ignorerTom ? undefined : bleKjentFom || tom,
                      });
                      return (
                        <FormSummary.Answer key={[årsak, fom, tom].join("-")}>
                          <FormSummary.Label>
                            {
                              endringsårsak.find((a) => a.value === årsak)
                                ?.label
                            }
                          </FormSummary.Label>
                          <FormSummary.Value>
                            {capitalize(periodeStreng)}
                          </FormSummary.Value>
                        </FormSummary.Answer>
                      );
                    },
                  )}
                  {årsakerMedTariffendring.map((årsak) => (
                    <FormSummary.Answer key={årsak.fom}>
                      <FormSummary.Label>Tariffendring</FormSummary.Label>
                      <FormSummary.Value>
                        {formaterPeriodeStreng({
                          fom: årsak.fom,
                        })}
                        {årsak.bleKjentFom && (
                          <>
                            {", ble kjent fra "}
                            {formatDatoKort(new Date(årsak.bleKjentFom))}
                          </>
                        )}
                      </FormSummary.Value>
                    </FormSummary.Answer>
                  ))}
                </FormSummary.Answers>
              </FormSummary.Value>
            </FormSummary.Answer>
          </>
        )}
      </FormSummary.Answers>
      {kanEndres && (
        <FormSummary.Footer>
          <FormSummary.EditLink
            aria-label="Endre inntekt"
            as={Link}
            to="../inntekt-og-refusjon#beregnet-manedslonn"
          />
        </FormSummary.Footer>
      )}
    </FormSummary>
  );
}

export const ArbeidsgiverOgAnsattOppsummering = ({
  kanEndres,
  opplysninger,
  skjemaState,
  editPath = "../dine-opplysninger",
}: {
  kanEndres: boolean;
  opplysninger: OpplysningerDto;
  skjemaState:
    | InntektsmeldingSkjemaStateValid
    | InntektsmeldingSkjemaStateValidAGIUnntattAaregister
    | InntektsmeldingSkjemaStateValidAGINyansatt;
  editPath?: string;
}) => (
  <FormSummary>
    <FormSummary.Header>
      <FormSummary.Heading level="3">
        Arbeidsgiver og den ansatte
      </FormSummary.Heading>
    </FormSummary.Header>
    <FormSummary.Answers>
      <FormSummary.Answer>
        <FormSummary.Label>Arbeidsgiver</FormSummary.Label>
        <FormSummary.Value>
          {opplysninger.arbeidsgiver.organisasjonNavn}, org.nr.{" "}
          {opplysninger.arbeidsgiver.organisasjonNummer}
        </FormSummary.Value>
      </FormSummary.Answer>
      <FormSummary.Answer>
        <FormSummary.Label>Kontaktperson</FormSummary.Label>
        <FormSummary.Value>
          {formatterKontaktperson(skjemaState.kontaktperson)}
        </FormSummary.Value>
      </FormSummary.Answer>
      <FormSummary.Answer>
        <FormSummary.Label>Den ansatte</FormSummary.Label>
        <FormSummary.Value>
          {lagFulltNavn(opplysninger.person)}
          {", f.nr. "}
          {formatFødselsnummer(opplysninger.person.fødselsnummer)}
        </FormSummary.Value>
      </FormSummary.Answer>
    </FormSummary.Answers>
    {kanEndres && (
      <FormSummary.Footer>
        <FormSummary.EditLink
          aria-label="Endre dine opplysninger"
          as={Link}
          to={editPath}
        />
      </FormSummary.Footer>
    )}
  </FormSummary>
);

export const RefusjonOppsummering = ({
  startdato,
  opplysninger,
  kanEndres = false,
  editPath = "",
}: {
  startdato: string;
  opplysninger: OpplysningerDto;
  kanEndres: boolean;
  editPath?: string;
}) => (
  <FormSummary>
    <FormSummary.Header>
      <FormSummary.Heading level="3">
        Første dag med {formatYtelsesnavn(opplysninger.ytelse)}
      </FormSummary.Heading>
    </FormSummary.Header>
    <FormSummary.Answers>
      <FormSummary.Answer>
        <FormSummary.Label>Fra og med</FormSummary.Label>
        <FormSummary.Value>
          {formatDatoLang(new Date(startdato))}
        </FormSummary.Value>
      </FormSummary.Answer>
    </FormSummary.Answers>
    {kanEndres && (
      <FormSummary.Footer>
        <FormSummary.EditLink
          aria-label="Endre første dag med fravær"
          as={Link}
          to={editPath}
        />
      </FormSummary.Footer>
    )}
  </FormSummary>
);

export const UtbetalingOgRefusjonOppsummering = ({
  kanEndres,
  skjemaState,
  editPath = "../inntekt-og-refusjon#refusjon",
}: {
  kanEndres: boolean;
  skjemaState:
    | InntektsmeldingSkjemaStateValid
    | InntektsmeldingSkjemaStateValidAGIUnntattAaregister
    | InntektsmeldingSkjemaStateValidAGINyansatt;
  editPath?: string;
}) => (
  <FormSummary>
    <FormSummary.Header>
      <FormSummary.Heading level="3">
        Utbetaling og refusjon
      </FormSummary.Heading>
    </FormSummary.Header>
    <FormSummary.Answers>
      <FormSummary.Answer>
        <FormSummary.Label>
          Betaler dere lønn under fraværet og krever refusjon?
        </FormSummary.Label>
        <FormSummary.Value>
          {REFUSJON_RADIO_VALG[skjemaState.skalRefunderes]}
        </FormSummary.Value>
      </FormSummary.Answer>
      {skjemaState.skalRefunderes === "JA_LIK_REFUSJON" && (
        <FormSummary.Answer>
          <FormSummary.Label>Refusjonsbeløp per måned</FormSummary.Label>
          <FormSummary.Value>
            {formatKroner(skjemaState.refusjon[0].beløp)}
          </FormSummary.Value>
        </FormSummary.Answer>
      )}
      {skjemaState.skalRefunderes === "JA_VARIERENDE_REFUSJON" && (
        <FormSummary.Answer>
          <FormSummary.Label>Endringer i refusjon</FormSummary.Label>
          <FormSummary.Value>
            <FormSummary.Answers>
              {skjemaState.refusjon.map((endring) => (
                <FormSummary.Answer
                  key={endring.fom!.toString() + endring?.beløp}
                >
                  <FormSummary.Label>
                    Refusjonsbeløp per måned
                  </FormSummary.Label>
                  <FormSummary.Value>
                    {formatKroner(endring.beløp)} (fra og med{" "}
                    {formatDatoLang(new Date(endring.fom!))})
                  </FormSummary.Value>
                </FormSummary.Answer>
              ))}
            </FormSummary.Answers>
          </FormSummary.Value>
        </FormSummary.Answer>
      )}
    </FormSummary.Answers>
    {kanEndres && (
      <FormSummary.Footer>
        <FormSummary.EditLink
          aria-label="Endre utbetaling og refusjon"
          as={Link}
          to={editPath}
        />
      </FormSummary.Footer>
    )}
  </FormSummary>
);

const NaturalytelserOppsummering = ({
  kanEndres,
  skjemaState,
}: {
  kanEndres: boolean;
  skjemaState:
    | InntektsmeldingSkjemaStateValid
    | InntektsmeldingSkjemaStateValidAGIUnntattAaregister;
}) => (
  <FormSummary>
    <FormSummary.Header>
      <FormSummary.Heading level="3">Naturalytelser</FormSummary.Heading>
    </FormSummary.Header>
    <FormSummary.Answers>
      <FormSummary.Answer>
        <FormSummary.Label>
          Har den ansatte naturalytelser som faller bort ved fraværet?
        </FormSummary.Label>
        <FormSummary.Value>
          {skjemaState.misterNaturalytelser ? "Ja" : "Nei"}
        </FormSummary.Value>
      </FormSummary.Answer>
      {skjemaState.misterNaturalytelser && (
        <FormSummary.Answer>
          <FormSummary.Label>Naturalytelser som faller bort</FormSummary.Label>
          <FormSummary.Value>
            <FormSummary.Answers>
              {skjemaState.bortfaltNaturalytelsePerioder.map(
                (naturalytelse) => {
                  return (
                    <FormSummary.Answer
                      key={`${naturalytelse.navn}-${naturalytelse.fom}`}
                    >
                      <FormSummary.Label>
                        {formatYtelsesnavn(naturalytelse.navn, true)}
                      </FormSummary.Label>
                      <FormSummary.Value>
                        {`Verdi ${formatKroner(naturalytelse.beløp)} (${formaterPeriodeStreng(naturalytelse)}) `}
                      </FormSummary.Value>
                    </FormSummary.Answer>
                  );
                },
              )}
            </FormSummary.Answers>
          </FormSummary.Value>
        </FormSummary.Answer>
      )}
    </FormSummary.Answers>
    {kanEndres && (
      <FormSummary.Footer>
        <FormSummary.EditLink
          aria-label="Endre naturalytelser"
          as={Link}
          to="../inntekt-og-refusjon#naturalytelser"
        />
      </FormSummary.Footer>
    )}
  </FormSummary>
);

/**
 * Gir en streng på formatet "fra og med DATO, til og med DATO" hvis begge datoene er satt. Ellers kun den ene.
 */
function formaterPeriodeStreng({
  fom,
  tom,
}: {
  fom?: Date | string;
  tom?: Date | string;
}) {
  const fomStreng = fom ? `fra og med ${formatDatoKort(new Date(fom))}` : "";
  const tomStreng = tom ? `til og med ${formatDatoKort(new Date(tom))}` : "";

  return [fomStreng, tomStreng].filter(Boolean).join(", ");
}

const formatterKontaktperson = (
  kontaktperson:
    | InntektsmeldingSkjemaStateValid["kontaktperson"]
    | InntektsmeldingSkjemaStateValidAGIUnntattAaregister["kontaktperson"],
) => {
  if (!kontaktperson) {
    return "";
  }
  return `${formatNavn(kontaktperson.navn)}, tlf. ${formatTelefonnummer(kontaktperson.telefonnummer)}`;
};
