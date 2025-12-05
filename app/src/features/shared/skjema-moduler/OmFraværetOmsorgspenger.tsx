import { ArrowRightIcon } from "@navikt/aksel-icons";
import {
  Alert,
  BodyLong,
  BodyShort,
  Box,
  Button,
  Detail,
  Heading,
  Label,
  Link,
  List,
  Radio,
  RadioGroup,
  ReadMore,
  Theme,
} from "@navikt/ds-react";
import { createLink } from "@tanstack/react-router";
import { useFormContext } from "react-hook-form";

import type { InntektOgRefusjonForm } from "~/features/shared/skjema-moduler/steg/InntektOgRefusjon/InntektOgRefusjon.tsx";
import { formatDatoKort, lagFulltNavn } from "~/utils";

import { useHjelpetekst } from "../../shared/Hjelpetekst";
import { useOpplysninger } from "../../shared/hooks/useOpplysninger";

const OmFraværetOmsorgspenger = () => {
  const { register, formState, watch } =
    useFormContext<InntektOgRefusjonForm>();
  const opplysninger = useOpplysninger();
  const { vis } = useHjelpetekst().visHjelpetekster;

  const { name, ...radioGroupProps } = register("skalRefunderes", {
    required: "Du må svare på dette spørsmålet",
    validate: (value) => {
      if (value === "JA_LIK_REFUSJON") {
        return "Hvis dere ikke er pliktig til å betale for omsorgsdagene, men likevel har betalt og skal søke om refusjon, må dere sende refusjonskrav omsorgspenger";
      }
      return true;
    },
  });

  const ButtonLink = createLink(Button);
  return (
    <div className="flex gap-4 flex-col">
      <Heading id="om-fraværet-omsorgspenger" level="4" size="medium">
        Om fraværet
      </Heading>
      <Fraværsdager navn={lagFulltNavn(opplysninger.person)} />
      <RadioGroup
        className="mt-5"
        error={formState.errors.skalRefunderes?.message}
        legend="Har dere utbetalt lønn for dette fraværet?"
        name={name}
      >
        <Radio value="JA_LIK_REFUSJON" {...radioGroupProps}>
          Ja
        </Radio>
        <Radio value="NEI" {...radioGroupProps}>
          Nei
        </Radio>
      </RadioGroup>
      {watch("skalRefunderes") === "JA_LIK_REFUSJON" && vis && (
        <Alert variant="info">
          <div className="flex flex-col gap-4">
            <BodyLong>
              Har dere utbetalt full lønn for fraværet skal dere ikke sende inn
              denne inntektsmeldingen. Hvis dere ikke er pliktig til å betale
              for omsorgsdagene, men likevel har betalt og skal søke om
              refusjon, må dere sende refusjonskrav omsorgspenger.
            </BodyLong>
          </div>
          <ButtonLink
            className="mt-4"
            icon={<ArrowRightIcon />}
            iconPosition="right"
            params={{
              organisasjonsnummer: opplysninger.arbeidsgiver.organisasjonNummer,
            }}
            size="small"
            to="/refusjon-omsorgspenger/$organisasjonsnummer/1-intro"
          >
            Gå til refusjonskrav
          </ButtonLink>
        </Alert>
      )}
      {watch("skalRefunderes") === "NEI" && vis && (
        <Alert variant="info">
          <div className="flex flex-col gap-4">
            <BodyLong>
              Hvis dere ikke har utbetalt lønn på grunn av uenighet om fraværet,
              må dere i tillegg til inntektsmeldingen sende inn en forklaring
              som beskriver hvorfor dere ikke utbetaler omsorgspenger. Har dere
              utbetalt lønn for deler av fraværet må dere også sende inn en
              forklaring.
            </BodyLong>
            <ReadMore header="Slik sender du dokumentasjon">
              <BodyShort>
                Dokumentasjon kan sendes til oss på to måter:
                <List>
                  <List.Item>
                    Gi dokumentasjonen til den ansatte, som selv ettersender den
                    digitalt ved å logge inn på nav.no.
                  </List.Item>
                  <List.Item>
                    Gå til{" "}
                    <Link
                      href="https://www.nav.no/start/ettersend-soknad-utbetaling-omsorgspenger-arbeidsgiver-ikke-utbetaler"
                      target="_blank"
                    >
                      siden for ettersendelse
                    </Link>
                    , og velg ettersend i posten. Husk å notere den ansatte sitt
                    fødsels- og personnummer når du henter ut førsteside for
                    innsendelse.
                  </List.Item>
                </List>
              </BodyShort>
            </ReadMore>
          </div>
        </Alert>
      )}
    </div>
  );
};

const Fraværsdager = ({ navn }: { navn?: string }) => {
  const opplysninger = useOpplysninger();

  return (
    <Box className="bg-bg-subtle p-4">
      <div className="flex justify-between">
        <Label size="small">{`Dager ${navn ? `${navn} har oppgitt fravær` : "med oppgitt fravær"}`}</Label>
        <BodyShort size="small">FRA SØKNAD</BodyShort>
      </div>
      <Theme theme="dark">
        <div className="bg-bg-subtle mt-4 flex flex-col text-text-default gap-4">
          {opplysninger.etterspurtePerioder &&
          opplysninger.etterspurtePerioder?.length > 0 ? (
            <div>
              <List className="flex flex-col gap-2 mt-1">
                {opplysninger.etterspurtePerioder?.map((periode) => (
                  <List.Item key={periode.fom}>
                    {formatDatoKort(new Date(periode.fom))} -{" "}
                    {formatDatoKort(new Date(periode.tom))}
                  </List.Item>
                ))}
              </List>
            </div>
          ) : (
            <BodyLong>Ingen dager med oppgitt fravær</BodyLong>
          )}
        </div>
      </Theme>
      <Detail className="mt-4">
        Dette er dager den ansatte har søkt omsorgspenger, hvis du mener
        fraværet er feil må du ta kontakt med den ansatte. Har den ansatte hatt
        fravær deler av dagen, viser vi kun datoen for fraværet og ikke antall
        timer.
      </Detail>
    </Box>
  );
};

export default OmFraværetOmsorgspenger;
