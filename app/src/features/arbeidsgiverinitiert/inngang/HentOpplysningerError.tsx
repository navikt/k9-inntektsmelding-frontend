import { Alert } from "@navikt/ds-react";

export function HentOpplysningerError({ error }: { error: Error | null }) {
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

  return <Alert variant="error">Kunne ikke hente personopplysninger</Alert>;
}
