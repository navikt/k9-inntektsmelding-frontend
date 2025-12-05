import { Alert } from "@navikt/ds-react";

export function HentOpplysningerError({ error }: { error: Error | null }) {
  if (!error) {
    return null;
  }

  return <Alert variant="error">Kunne ikke hente personopplysninger</Alert>;
}
