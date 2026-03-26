import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import {
  Alert,
  BodyLong,
  BodyShort,
  Button,
  Checkbox,
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
import { DatePickerWrapped } from "~/features/shared/react-hook-form-wrappers/DatePickerWrapped.tsx";
import { formatFodselsnummer, lagFulltNavn } from "~/utils.ts";

import { HjelpetekstAlert } from "../../shared/Hjelpetekst.tsx";
import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle.tsx";
import { useScrollToTopOnMount } from "../../shared/hooks/useScrollToTopOnMount.tsx";
import {
  hentArbeidsgiverOptions,
  hentArbeidstakerOptions,
  hentPersonUnntattAaregisterOptions,
} from "../api/queries.ts";
import { useSkjemaState } from "../SkjemaStateContext";
import { OmsorgspengerFremgangsindikator } from "../visningskomponenter/OmsorgspengerFremgangsindikator.tsx";

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
  const førsteFraværsdatoForÅret = watch("førsteFraværsdatoForÅret");
  const valgtOrganisasjonsnummer = watch("organisasjonsnummer");

  const { data, error, isLoading } = useQuery(
    hentArbeidstakerOptions(fødselsnummer ?? ""),
  );

  const fantIngenPersoner =
    error && "feilkode" in error && error.feilkode === "fant ingen personer";
  const visUnntattLøype = erUnntattAaregisteret ?? false;

  const arbeidsgiverArgs =
    visUnntattLøype && fødselsnummer && førsteFraværsdatoForÅret
      ? { fødselsnummer, førsteFraværsdatoForÅret }
      : null;

  const { data: arbeidsgivereData, isLoading: isLoadingArbeidsgivere } =
    useQuery(hentArbeidsgiverOptions(arbeidsgiverArgs));

  const unntattOppslagArgs =
    visUnntattLøype &&
    fødselsnummer &&
    førsteFraværsdatoForÅret &&
    valgtOrganisasjonsnummer
      ? {
          fødselsnummer,
          førsteFraværsdatoForÅret,
          organisasjonsnummer: valgtOrganisasjonsnummer,
        }
      : null;

  const {
    data: personUnntatt,
    isLoading: isLoadingPersonUnntatt,
    error: errorPersonUnntatt,
  } = useQuery(hentPersonUnntattAaregisterOptions(unntattOppslagArgs));

  useEffect(() => {
    setValue("meta.step", 2);
    if (getValues("meta.innsendtSøknadId")) {
      navigate({
        from: "/refusjon-omsorgspenger/$organisasjonsnummer/2-ansatt-og-arbeidsgiver",
        to: "../6-kvittering",
      });
    }
  }, []);

  const harFlereEnnEttArbeidsforhold =
    data?.arbeidsforhold && data.arbeidsforhold.length > 1;
  const harEttArbeidsforhold =
    data?.arbeidsforhold && data.arbeidsforhold.length === 1;
  const ingenArbeidsforhold =
    data?.arbeidsforhold && data.arbeidsforhold.length === 0;

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
        {(data || fantIngenPersoner) && (
          <Informasjonsseksjon kilde="Fra Altinn" tittel="Arbeidsgiver">
            {harFlereEnnEttArbeidsforhold ? (
              <Select
                label="Velg arbeidsforhold"
                {...register("organisasjonsnummer", { value: "" })}
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
            ) : ingenArbeidsforhold || fantIngenPersoner ? (
              <div className="flex flex-col gap-4">
                <Alert variant="warning">
                  <BodyLong>
                    Fant ingen arbeidsforhold for {fulltNavn || fødselsnummer}.
                    Dette kan skyldes at fødselsnummeret er feil, eller at
                    arbeidstakeren er unntatt Aa-registeret.
                  </BodyLong>
                </Alert>
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
                {visUnntattLøype && (
                  <>
                    <DatePickerWrapped
                      label="Første fraværsdato for inneværende år"
                      name="førsteFraværsdatoForÅret"
                    />
                    {isLoadingArbeidsgivere ? (
                      <Loader title="Henter virksomheter" />
                    ) : arbeidsgivereData &&
                      arbeidsgivereData.arbeidsforhold.length > 1 ? (
                      <Select
                        label="Velg virksomhet"
                        {...register("organisasjonsnummer", { value: "" })}
                        error={formState.errors.organisasjonsnummer?.message}
                      >
                        {arbeidsgivereData.arbeidsforhold.map((ag) => (
                          <option
                            key={ag.organisasjonsnummer}
                            value={ag.organisasjonsnummer}
                          >
                            {ag.organisasjonsnavn} ({ag.organisasjonsnummer})
                          </option>
                        ))}
                      </Select>
                    ) : arbeidsgivereData?.arbeidsforhold.length === 1 ? (
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <Label>Virksomhetsnavn</Label>
                          <BodyShort>
                            {
                              arbeidsgivereData.arbeidsforhold[0]
                                .organisasjonsnavn
                            }
                          </BodyShort>
                          <input
                            type="hidden"
                            {...register("organisasjonsnummer", {
                              value:
                                arbeidsgivereData.arbeidsforhold[0]
                                  .organisasjonsnummer,
                            })}
                          />
                        </div>
                        <div className="flex-1">
                          <Label>Org.nr. for underenhet</Label>
                          <BodyShort>
                            {
                              arbeidsgivereData.arbeidsforhold[0]
                                .organisasjonsnummer
                            }
                          </BodyShort>
                        </div>
                      </div>
                    ) : null}
                    {unntattOppslagArgs && (
                      <div className="flex flex-col">
                        <Label>Navn</Label>
                        {isLoadingPersonUnntatt ? (
                          <Loader
                            className="block mt-2"
                            title="Henter informasjon"
                          />
                        ) : errorPersonUnntatt ? (
                          <Alert variant="error">
                            Kunne ikke slå opp personen. Sjekk at fødselsnummer
                            og fraværsdato er korrekte.
                          </Alert>
                        ) : personUnntatt ? (
                          <BodyShort>
                            {lagFulltNavn(personUnntatt.person)}
                            <input
                              type="hidden"
                              {...register("ansattesFornavn", {
                                value: personUnntatt.person.fornavn,
                              })}
                            />
                            <input
                              type="hidden"
                              {...register("ansattesEtternavn", {
                                value: personUnntatt.person.etternavn,
                              })}
                            />
                            <input
                              type="hidden"
                              {...register("ansattesAktørId", {
                                value: personUnntatt.person.aktørId,
                              })}
                            />
                          </BodyShort>
                        ) : null}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : null}
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
