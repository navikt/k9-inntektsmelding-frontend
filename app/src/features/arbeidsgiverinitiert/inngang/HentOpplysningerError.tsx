import { Alert } from "@navikt/ds-react";

export const HentOpplysningerError = ({ error }: { error: Error | null }) => {
  if (!error) {
    return null;
  }

  if (error.message === "FINNES_I_AAREG") {
    return (
      <Alert role="status" variant="warning">
        Det ser ut til at den ansatte allerede er registrert i Aa-registeret.
        Sjekk at fødselsnummeret er riktig, og at den ansatte ikke er registrert
        i Aa-registeret før du prøver igjen.
      </Alert>
    );
  }

  const feilmeldinger: Record<string, string> = {
    FINNES_IKKE_I_AAREG:
      "Kunne ikke hente opplysninger. Sjekk at opplysningene er riktige, og prøv igjen.",
    INGEN_INNTEKT:
      "Kunne ikke hente opplysninger. Sjekk at opplysningene er riktige, og prøv igjen.",
    A_INNTEKT_NEDE:
      "Vi kan ikke hente inntekt fra A-inntekt nå. Prøv igjen senere.",
    INGEN_SAK_FUNNET:
      "Kunne ikke hente opplysninger. Sjekk at opplysningene er riktige, og prøv igjen.",
    SENDT_FOR_TIDLIG:
      "Kunne ikke hente opplysninger. Sjekk at opplysningene er riktige, og prøv igjen.",
    PERSON_IKKE_FUNNET:
      "Kunne ikke hente opplysninger. Sjekk at opplysningene er riktige, og prøv igjen.",
    MANGLER_TILGANG_FEIL:
      "Du har ikke tilgang til den valgte virksomheten. Sjekk tilgangene dine i Altinn.",
  };
  const feilmelding = feilmeldinger[error.message];

  const erFeil = !feilmelding || error.message === "A_INNTEKT_NEDE";
  return (
    <Alert
      role={erFeil ? "alert" : "status"}
      variant={erFeil ? "error" : "warning"}
    >
      {feilmelding ?? "Kunne ikke hente personopplysninger. Prøv igjen senere."}
    </Alert>
  );
};
