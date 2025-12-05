import { Alert, BodyShort, Heading } from "@navikt/ds-react";

export function AnnenÅrsak() {
  return (
    <Alert variant="warning">
      <Heading level="2" size="small" spacing>
        Det er ikke mulig å opprette inntektsmelding for andre årsaker enda
      </Heading>
      <BodyShort>
        Den ansatte må søke om ytelse før du kan sende inntektsmelding. Varsel
        med oppgave blir tilgjengelig i saksoversikten når den ansatte har sendt
        inn søknad til oss, men tidligst 4 uker før første fraværsdag. Trenger
        du hjelp, kontakt oss på{" "}
        <a href="tel:55553336">tlf.&nbsp;55&nbsp;55&nbsp;33&nbsp;36.</a>
      </BodyShort>
    </Alert>
  );
}
