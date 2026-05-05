import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import {
  Alert,
  BodyLong,
  BodyShort,
  Button,
  Heading,
  Label,
  Loader,
  Select,
  TextField,
} from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Controller } from "react-hook-form";

import { Informasjonsseksjon } from "~/features/shared/Informasjonsseksjon.tsx";
import { formatFodselsnummer, lagFulltNavn } from "~/utils.ts";

import { HjelpetekstAlert } from "../../shared/Hjelpetekst.tsx";
import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle.tsx";
import { useScrollToTopOnMount } from "../../shared/hooks/useScrollToTopOnMount.tsx";
import { hentArbeidstakerOptions } from "../api/queries.ts";
import { useSkjemaState } from "../SkjemaStateContext";
import { OmsorgspengerFremgangsindikator } from "../visningskomponenter/OmsorgspengerFremgangsindikator.tsx";

export const RefusjonOmsorgspengerArbeidsgiverSteg2 = () => {
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
  const { data, error, isLoading } = useQuery(
    hentArbeidstakerOptions(fødselsnummer ?? ""),
  );

  useEffect(() => {
    setValue("meta.step", 2);
    if (getValues("meta.innsendtSøknadId")) {
      navigate({
        from: "/refusjon-omsorgspenger/$organisasjonsnummer/2-ansatt-og-arbeidsgiver",
        to: "../6-kvittering",
      });
    }
  }, []);

  const fantIngenPersoner =
    error && "feilkode" in error && error.feilkode === "fant ingen personer";
  const harFlereEnnEttArbeidsforhold =
    data?.arbeidsforhold && data.arbeidsforhold.length > 1;
  const harEttArbeidsforhold =
    data?.arbeidsforhold && data.arbeidsforhold.length === 1;

  const onSubmit = handleSubmit(() => {
    navigate({
      from: "/refusjon-omsorgspenger/$organisasjonsnummer/2-ansatt-og-arbeidsgiver",
      to: "../3-omsorgsdager",
    });
  });

  const fulltNavn = data ? lagFulltNavn(data.personinformasjon) : "";
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
                    // Store raw value without spaces in form state
                    field.onChange(e.target.value.replaceAll(/\s/g, ""));
                  }}
                  value={formatFodselsnummer(field.value || "")}
                />
              )}
            />
            <div className="flex-1 flex flex-col">
              <Label>Navn</Label>
              {isLoading ? (
                <Loader className="block mt-5" title="Henter informasjon" />
              ) : fantIngenPersoner ? (
                <BodyShort className="flex-1 flex flex-col justify-center">
                  Fant ingen personer som du har tilgang til å se
                  arbeidsforholdet til. Dobbeltsjekk fødselsnummer og prøv
                  igjen.
                </BodyShort>
              ) : error ? (
                <BodyShort className="flex-1 flex flex-col justify-center">
                  Kunne ikke hente data
                </BodyShort>
              ) : data ? (
                <BodyShort className="flex-1 flex flex-col justify-center">
                  {fulltNavn}
                  <input
                    type="hidden"
                    {...register("ansattesFornavn", {
                      value: data.personinformasjon.fornavn,
                    })}
                  />
                  <input
                    type="hidden"
                    {...register("ansattesEtternavn", {
                      value: data.personinformasjon.etternavn,
                    })}
                  />
                  <input
                    type="hidden"
                    {...register("ansattesAktørId", {
                      value: data.personinformasjon.aktørId,
                    })}
                  />
                </BodyShort>
              ) : null}
            </div>
          </div>
        </Informasjonsseksjon>
        {data && (
          <Informasjonsseksjon kilde="Fra Altinn" tittel="Arbeidsgiver">
            {harFlereEnnEttArbeidsforhold ? (
              <>
                <Select
                  label="Velg arbeidsforhold"
                  {...register("organisasjonsnummer", {
                    value: "",
                  })}
                  error={formState.errors.organisasjonsnummer?.message}
                >
                  {data.arbeidsforhold.map((arbeidsforhold) => (
                    <option
                      key={arbeidsforhold.organisasjonsnummer}
                      value={arbeidsforhold.organisasjonsnummer}
                    >
                      {arbeidsforhold.organisasjonsnavn} (
                      {arbeidsforhold.organisasjonsnummer})
                    </option>
                  ))}
                </Select>
              </>
            ) : harEttArbeidsforhold ? (
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Virksomhetsnavn</Label>
                  <BodyShort>
                    {data.arbeidsforhold[0].organisasjonsnavn}
                  </BodyShort>
                  <input
                    type="hidden"
                    {...register("organisasjonsnummer", {
                      value: data.arbeidsforhold[0].organisasjonsnummer,
                    })}
                  />
                </div>
                <div className="flex-1">
                  <Label>Org.nr. for underenhet</Label>
                  <BodyShort>
                    {data.arbeidsforhold[0].organisasjonsnummer}
                  </BodyShort>
                </div>
              </div>
            ) : (
              <Alert variant="warning">
                <BodyLong>
                  Kunne ikke finne noen arbeidsforhold for {fulltNavn}. Vent
                  litt, og prøv igjen.
                </BodyLong>
              </Alert>
            )}
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
