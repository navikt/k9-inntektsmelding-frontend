import { Alert, BodyShort, Heading } from "@navikt/ds-react";

import { Ytelsetype } from "~/types/api-models.ts";
import { formatYtelsesnavn } from "~/utils";

interface PersonOppslagErrorProps {
  error: Error | null;
  ytelse: Ytelsetype;
  context: "person_oppslag" | "dato_validering";
}

export function PersonOppslagError({
  error,
  ytelse,
  context,
}: PersonOppslagErrorProps) {
  if (!error) {
    return null;
  }

  if (error.message.includes("FANT_IKKE_PERSON")) {
    return (
      <Alert variant="error">
        <Heading level="3" size="small">
          Vi finner ingen ansatt registrert hos dere med dette fødselsnummeret
        </Heading>
        <BodyShort>
          Sjekk om fødselsnummeret er riktig og at den ansatte er registrert hos
          dere i Aa-registeret. Den ansatte må være registrert i Aa-registeret
          for å kunne sende inn inntektsmelding.
        </BodyShort>
      </Alert>
    );
  }

  if (error.message === "SENDT_FOR_TIDLIG") {
    return (
      <Alert variant="warning">
        <BodyShort>
          Du kan ikke sende inn inntektsmelding mer enn fire uker før personen
          starter med {formatYtelsesnavn(ytelse)}.
        </BodyShort>
      </Alert>
    );
  }

  if (error.message === "INGEN_SAK_FUNNET") {
    if (context === "dato_validering") {
      return (
        <Alert variant="warning">
          <BodyShort>
            Du kan ikke sende inn inntektsmelding for{" "}
            {formatYtelsesnavn(ytelse)} med denne datoen som første fraværsdag
            med refusjon.
          </BodyShort>
        </Alert>
      );
    }

    return (
      <Alert variant="warning">
        <Heading level="3" size="small">
          Kan ikke opprette inntektsmelding
        </Heading>
        <BodyShort>
          Du kan ikke sende inn inntektsmelding på {formatYtelsesnavn(ytelse)}{" "}
          på denne personen.
        </BodyShort>
      </Alert>
    );
  }

  const errorMessage =
    context === "dato_validering"
      ? "Kunne ikke validere første fraværsdag"
      : "Kunne ikke hente personopplysninger";

  const errorDescription =
    context === "dato_validering"
      ? "Det oppsto en feil ved validering av første fraværsdag. Vennligst prøv igjen."
      : "Det oppsto en feil ved henting av personopplysninger. Vennligst prøv igjen.";

  return (
    <Alert variant="error">
      <Heading level="3" size="small">
        {errorMessage}
      </Heading>
      <BodyShort>{errorDescription}</BodyShort>
    </Alert>
  );
}
