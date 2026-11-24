import { Alert, BodyLong } from "@navikt/ds-react";

type ValideringsfeilProps = {
  melding?: string;
};

/**
 * Feil i utfyllingen som ikke hører til ett felt. Containeren finnes alltid, slik at skjermlesere leser opp
 * feilen når den dukker opp, uten å avbryte brukeren.
 */
export const Valideringsfeil = ({ melding }: ValideringsfeilProps) => (
  <div aria-live="polite" className="empty:absolute">
    {melding && (
      <Alert variant="error">
        <BodyLong>{melding}</BodyLong>
      </Alert>
    )}
  </div>
);
