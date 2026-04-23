import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import {
  BodyLong,
  Box,
  Button,
  Checkbox,
  Heading,
  Label,
  TextField,
  VStack,
} from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Controller } from "react-hook-form";

import { Informasjonsseksjon } from "~/features/shared/Informasjonsseksjon.tsx";
import { formatFodselsnummer } from "~/utils.ts";

import { HjelpetekstAlert } from "../../shared/Hjelpetekst.tsx";
import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle.tsx";
import { useScrollToTopOnMount } from "../../shared/hooks/useScrollToTopOnMount.tsx";
import { hentArbeidstakerOptions } from "../api/queries.ts";
import { useSkjemaState } from "../SkjemaStateContext";
import { OmsorgspengerFremgangsindikator } from "../visningskomponenter/OmsorgspengerFremgangsindikator.tsx";
import { ArbeidsgiverSeksjon } from "./ArbeidsgiverSeksjon.tsx";
import { ArbeidsgiverUnntattSeksjon } from "./ArbeidsgiverUnntattSeksjon.tsx";
import { NavnVisning } from "./NavnVisning.tsx";

export const RefusjonOmsorgspengerArbeidsgiverSteg2V2 = () => {
  useScrollToTopOnMount();
  useDocumentTitle(
    "Ansatt og arbeidsgiver – søknad om refusjon av omsorgspenger for arbeidsgiver",
  );

  const navigate = useNavigate();
  const {
    register,
    formState,
    watch,
    handleSubmit,
    setValue,
    getValues,
    control,
  } = useSkjemaState();

  const fødselsnummer = watch("ansattesFødselsnummer");
  const erUnntattAaregisteret = watch("erUnntattAaregisteret");

  const { data, error } = useQuery(
    hentArbeidstakerOptions(fødselsnummer ?? ""),
  );

  const fantIngenPersoner =
    error && "feilkode" in error && error.feilkode === "fant ingen personer";
  const visUnntattLøype = erUnntattAaregisteret ?? false;

  useEffect(() => {
    setValue("meta.step", 2);
    if (getValues("meta.innsendtSøknadId")) {
      navigate({
        from: "/refusjon-omsorgspenger/$organisasjonsnummer/2-ansatt-og-arbeidsgiver",
        to: "../6-kvittering",
      });
    }
  }, []);

  const onSubmit = handleSubmit(() => {
    navigate({
      from: "/refusjon-omsorgspenger/$organisasjonsnummer/2-ansatt-og-arbeidsgiver",
      to: "../3-omsorgsdager",
    });
  });

  return (
    <div className="bg-ax-bg-default rounded-md flex flex-col gap-6">
      <Heading level="1" size="large">
        Den ansatte og arbeidsgiver
      </Heading>
      <OmsorgspengerFremgangsindikator aktivtSteg={2} />
      <form className="space-y-4" onSubmit={onSubmit}>
        <Informasjonsseksjon tittel="Den ansatte">
          <div className="flex gap-4 flex-col ax-md:flex-row">
            <Controller
              control={control}
              name="ansattesFødselsnummer"
              render={({ field }) => (
                <TextField
                  className="flex-1"
                  error={formState.errors.ansattesFødselsnummer?.message}
                  label="Ansattes fødselsnummer (11 siffer)"
                  onChange={(e) => {
                    const nyVerdi = e.target.value.replaceAll(/\s/g, "");
                    if (nyVerdi !== field.value) {
                      setValue("erUnntattAaregisteret", false);
                      setValue("organisasjonsnummer", undefined);
                    }
                    field.onChange(nyVerdi);
                  }}
                  value={formatFodselsnummer(field.value || "")}
                />
              )}
            />
            <div className="flex-1 flex flex-col">
              <Label>Navn</Label>
              <NavnVisning />
            </div>
          </div>
          {fantIngenPersoner && (
            <Box
              background="warning-soft"
              borderColor="warning"
              borderWidth="1"
              borderRadius="8"
              padding="space-16"
            >
              <VStack gap="space-16">
                <BodyLong>
                  Vi fant ingen registrerte arbeidsforhold i dine virksomheter
                  knyttet til denne personen. Sjekk at du har skrevet riktig
                  fødselsnummer. Hvis arbeidstakeren er unntatt registrering i
                  Aa-registeret, kan du bekrefte dette nedenfor og fortsette.
                </BodyLong>
              </VStack>
              <Controller
                control={control}
                name="erUnntattAaregisteret"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value ?? false}
                    onChange={(e) => field.onChange(e.target.checked)}
                  >
                    Arbeidstakeren er unntatt Aa-registeret
                  </Checkbox>
                )}
              />
            </Box>
          )}
        </Informasjonsseksjon>
        {data && data.arbeidsforhold.length > 0 && (
          <Informasjonsseksjon kilde="Fra Altinn" tittel="Arbeidsgiver">
            <ArbeidsgiverSeksjon fødselsnummer={fødselsnummer} />
          </Informasjonsseksjon>
        )}
        {visUnntattLøype && (
          <Informasjonsseksjon kilde="Fra Altinn" tittel="Arbeidsgiver">
            <ArbeidsgiverUnntattSeksjon />
          </Informasjonsseksjon>
        )}
        <Informasjonsseksjon
          kilde="Fra Altinn og Folkeregisteret"
          tittel="Kontaktinformasjon"
        >
          <div className="flex gap-4 flex-col ax-md:flex-row">
            <div className="flex-1">
              <TextField
                label="Navn"
                {...register("kontaktperson.navn")}
                error={formState.errors.kontaktperson?.navn?.message}
              />
            </div>
            <div className="flex-1">
              <TextField
                label="Telefonnummer"
                type="tel"
                {...register("kontaktperson.telefonnummer")}
                error={formState.errors.kontaktperson?.telefonnummer?.message}
              />
            </div>
          </div>
          <HjelpetekstAlert>
            <Heading level="3" size="xsmall" spacing>
              Er kontaktinformasjonen riktig?
            </Heading>
            <BodyLong>
              Hvis vi har spørsmål om refusjonskravet, er det viktig at vi får
              kontakt med deg. Bruk derfor direktenummeret ditt i stedet for
              nummeret til sentralbordet. Hvis du vet at du vil være
              utilgjengelig fremover, kan du endre til en annen kontaktperson.
            </BodyLong>
          </HjelpetekstAlert>
        </Informasjonsseksjon>

        <div className="flex gap-4">
          <Button
            as={Link}
            icon={<ArrowLeftIcon />}
            to={"../1-intro"}
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
    </div>
  );
};
