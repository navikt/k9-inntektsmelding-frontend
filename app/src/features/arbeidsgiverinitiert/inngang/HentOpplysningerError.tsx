import { Alert } from "@navikt/ds-react";

import { Ytelsetype } from "~/types/api-schemas";
import { formatYtelsesnavn } from "~/utils";

export const HentOpplysningerError = ({
  error,
  ytelse,
}: {
  error: Error | null;
  ytelse: Ytelsetype;
}) => {
  if (!error) {
    return null;
  }

  if (error.message === "FINNES_I_AAREG") {
    return (
      <Alert variant="warning">
        Det ser ut til at den ansatte allerede er registrert i Aa-registeret.
        Sjekk at fødselsnummeret er riktig, og at den ansatte ikke er registrert
        i Aa-registeret før du prøver igjen.
      </Alert>
    );
  }

  const feilmeldinger: Record<string, string> = {
    FINNES_IKKE_I_AAREG:
      "Arbeidsforholdet er ikke registrert i Aa-registeret for den valgte virksomheten. Sjekk fødselsnummer, virksomhet og første fraværsdag.",
    INGEN_INNTEKT:
      "Vi finner ingen inntekt over 0 kroner rapportert for den ansatte i den valgte virksomheten. Sjekk fødselsnummer, virksomhet og første fraværsdag.",
    A_INNTEKT_NEDE:
      "Vi kan ikke hente inntekt fra A-inntekt nå. Prøv igjen senere.",
    INGEN_SAK_FUNNET: `Du kan ikke sende inn inntektsmelding for ${formatYtelsesnavn(ytelse)} med denne datoen som første fraværsdag.`,
    SENDT_FOR_TIDLIG: `Du kan ikke sende inn inntektsmelding mer enn fire uker før personen starter med ${formatYtelsesnavn(ytelse)}.`,
    PERSON_IKKE_FUNNET:
      "Vi finner ikke personen. Sjekk at fødselsnummeret er riktig.",
    MANGLER_TILGANG_FEIL:
      "Du har ikke tilgang til den valgte virksomheten. Sjekk tilgangene dine i Altinn.",
  };
  const feilmelding = feilmeldinger[error.message];

  return (
    <Alert
      variant={
        feilmelding && error.message !== "A_INNTEKT_NEDE" ? "warning" : "error"
      }
    >
      {feilmelding ?? "Kunne ikke hente personopplysninger. Prøv igjen senere."}
    </Alert>
  );
};
