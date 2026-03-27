import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import {
  BodyLong,
  BodyShort,
  Box,
  Button,
  Checkbox,
  Heading,
  Label,
  Loader,
  Select,
  TextField,
  VStack,
} from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Controller } from "react-hook-form";

import { Informasjonsseksjon } from "~/features/shared/Informasjonsseksjon.tsx";
import { DatePickerWrapped } from "~/features/shared/react-hook-form-wrappers/DatePickerWrapped.tsx";
import { formatFodselsnummer, lagFulltNavn } from "~/utils.ts";

import { HjelpetekstAlert } from "../../shared/Hjelpetekst.tsx";
import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle.tsx";
import { useScrollToTopOnMount } from "../../shared/hooks/useScrollToTopOnMount.tsx";
import {
  ArbeidstakerOppslagDto,
  hentArbeidsgiverOptions,
  hentArbeidstakerOptions,
  hentPersonUnntattAaregisterOptions,
} from "../api/queries.ts";
import { useSkjemaState } from "../SkjemaStateContext";
import { OmsorgspengerFremgangsindikator } from "../visningskomponenter/OmsorgspengerFremgangsindikator.tsx";

type ArbeidsgiverSeksjonProps = {
  arbeidsforhold: ArbeidstakerOppslagDto["arbeidsforhold"];
};

const ArbeidsgiverSeksjon = ({ arbeidsforhold }: ArbeidsgiverSeksjonProps) => {
  const { register, formState } = useSkjemaState();

  if (arbeidsforhold.length > 1) {
    return (
      <Select
        label="Velg arbeidsforhold"
        {...register("organisasjonsnummer")}
        error={formState.errors.organisasjonsnummer?.message}
      >
        <option value="">Velg arbeidsforhold</option>
        {arbeidsforhold.map((af) => (
          <option key={af.organisasjonsnummer} value={af.organisasjonsnummer}>
            {af.organisasjonsnavn} ({af.organisasjonsnummer})
          </option>
        ))}
      </Select>
    );
  }

  const [enkelt] = arbeidsforhold;
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <Label>Virksomhetsnavn</Label>
        <BodyShort>{enkelt.organisasjonsnavn}</BodyShort>
        <input
          type="hidden"
          {...register("organisasjonsnummer", {
            value: enkelt.organisasjonsnummer,
          })}
        />
      </div>
      <div className="flex-1">
        <Label>Org.nr. for underenhet</Label>
        <BodyShort>{enkelt.organisasjonsnummer}</BodyShort>
      </div>
    </div>
  );
};

type ArbeidsgiverUnntattSeksjonProps = {
  fødselsnummer: string;
  førsteFraværsdatoForÅret: string;
};

const ArbeidsgiverUnntattSeksjon = ({
  fødselsnummer,
  førsteFraværsdatoForÅret,
}: ArbeidsgiverUnntattSeksjonProps) => {
  const { register, formState } = useSkjemaState();
  const { data, isLoading, error } = useQuery(
    hentArbeidsgiverOptions({ førsteFraværsdatoForÅret, fødselsnummer }),
  );

  if (isLoading) return <Loader title="Henter virksomheter" />;

  if (error || data?.arbeidsforhold.length === 0) {
    return (
      <BodyShort>
        Vi finner ikke fravær på denne datoen for denne personen. Sjekk at
        opplysningene er korrekte.
      </BodyShort>
    );
  }

  if (!data) return null;

  if (data.arbeidsforhold.length > 1) {
    return (
      <Select
        label="Velg virksomhet"
        {...register("organisasjonsnummer", { value: "" })}
        error={formState.errors.organisasjonsnummer?.message}
      >
        <option value="">Velg virksomhet</option>
        {data.arbeidsforhold.map((ag) => (
          <option key={ag.organisasjonsnummer} value={ag.organisasjonsnummer}>
            {ag.organisasjonsnavn} ({ag.organisasjonsnummer})
          </option>
        ))}
      </Select>
    );
  }

  const [enkelt] = data.arbeidsforhold;
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <Label>Virksomhetsnavn</Label>
        <BodyShort>{enkelt.organisasjonsnavn}</BodyShort>
        <input
          type="hidden"
          {...register("organisasjonsnummer", {
            value: enkelt.organisasjonsnummer,
          })}
        />
      </div>
      <div className="flex-1">
        <Label>Org.nr. for underenhet</Label>
        <BodyShort>{enkelt.organisasjonsnummer}</BodyShort>
      </div>
    </div>
  );
};

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

  const { data: personUnntatt, isLoading: isLoadingPersonUnntatt } = useQuery(
    hentPersonUnntattAaregisterOptions(unntattOppslagArgs),
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

  const fraværsdatoRef = useRef(førsteFraværsdatoForÅret);
  useEffect(() => {
    if (
      fraværsdatoRef.current &&
      fraværsdatoRef.current !== førsteFraværsdatoForÅret
    ) {
      setValue("organisasjonsnummer", undefined);
    }
    fraværsdatoRef.current = førsteFraværsdatoForÅret;
  }, [førsteFraværsdatoForÅret]);

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
                    const nyVerdi = e.target.value.replaceAll(/\s/g, "");
                    if (nyVerdi !== field.value) {
                      setValue("erUnntattAaregisteret", false);
                      setValue("førsteFraværsdatoForÅret", undefined);
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
              {isLoading ? (
                <Loader className="block mt-5" title="Henter informasjon" />
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
              ) : isLoadingPersonUnntatt ? (
                <Loader className="block mt-5" title="Henter informasjon" />
              ) : personUnntatt ? (
                <BodyShort className="flex-1 flex flex-col justify-center">
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
              ) : fantIngenPersoner ? (
                <BodyShort className="flex-1 flex flex-col justify-center">
                  Fant ikke person
                </BodyShort>
              ) : error ? (
                <BodyShort className="flex-1 flex flex-col justify-center">
                  Kunne ikke hente data
                </BodyShort>
              ) : null}
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
                  fødselsnummer. Hvis arbeidstakeren ikke er registrert i
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
          {visUnntattLøype && (
            <DatePickerWrapped
              label={`Første fraværsdato for ${new Date().getFullYear()}`}
              name="førsteFraværsdatoForÅret"
            />
          )}
        </Informasjonsseksjon>
        {data && data.arbeidsforhold.length > 0 && (
          <Informasjonsseksjon kilde="Fra Altinn" tittel="Arbeidsgiver">
            <ArbeidsgiverSeksjon arbeidsforhold={data.arbeidsforhold} />
          </Informasjonsseksjon>
        )}
        {visUnntattLøype && fødselsnummer && førsteFraværsdatoForÅret && (
          <Informasjonsseksjon kilde="Fra Altinn" tittel="Arbeidsgiver">
            <ArbeidsgiverUnntattSeksjon
              fødselsnummer={fødselsnummer}
              førsteFraværsdatoForÅret={førsteFraværsdatoForÅret}
            />
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
