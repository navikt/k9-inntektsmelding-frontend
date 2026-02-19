import {
  BodyShort,
  Box,
  Button,
  Heading,
  HGrid,
  Page,
  VStack,
} from "@navikt/ds-react";
import { PageBlock } from "@navikt/ds-react/Page";

export const OppgaveErUtgåttFeilside = () => {
  return (
    <Page>
      <PageBlock as="main" gutters width="xl">
        <Box paddingBlock="space-80 space-32">
          <HGrid columns="minmax(auto,600px)" data-aksel-template="500-v2">
            <VStack gap="space-64">
              <VStack align="start" gap="space-48">
                <div>
                  <Heading level="1" size="large" spacing>
                    Oppgaven er utgått
                  </Heading>
                  <BodyShort spacing>
                    Det er ikke lenger nødvendig å sende denne
                    inntektsmeldingen. Det kan være fordi søknaden er trukket,
                    avslått eller at Nav har laget ny oppgave på grunn av
                    viktige endringer i søknaden. Kontakt din ansatte hvis du er
                    usikker på status på søknaden.
                  </BodyShort>
                </div>

                <Button as="a" href="/min-side-arbeidsgiver">
                  Gå til Min side - arbeidsgiver
                </Button>
              </VStack>
            </VStack>
          </HGrid>
        </Box>
      </PageBlock>
    </Page>
  );
};
