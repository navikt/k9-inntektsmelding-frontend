import {
  BodyShort,
  Box,
  Button,
  Heading,
  HGrid,
  Link,
  List,
  Page,
  VStack,
} from "@navikt/ds-react";
import { PageBlock } from "@navikt/ds-react/Page";

export const GenerellFeilside = () => {
  return (
    <Page>
      <PageBlock as="main" gutters width="xl">
        <Box paddingBlock="space-80 space-32">
          <HGrid columns="minmax(auto,600px)" data-aksel-template="500-v2">
            <VStack gap="space-64">
              <VStack align="start" gap="space-48">
                <div>
                  <Heading level="1" size="large" spacing>
                    Beklager, noe gikk galt.
                  </Heading>
                  <BodyShort spacing>
                    En teknisk feil på våre servere gjør at siden er
                    utilgjengelig. Dette skyldes ikke noe du gjorde.
                  </BodyShort>
                  <BodyShort>Du kan prøve å</BodyShort>
                  <Box marginBlock="space-16" asChild>
                    <List data-aksel-migrated-v8>
                      <List.Item>
                        vente noen minutter og{" "}
                        <Link href="#" onClick={() => location.reload()}>
                          laste siden på nytt
                        </Link>
                      </List.Item>
                      <List.Item>
                        {globalThis.history.length > 1 && (
                          <Link href="#" onClick={() => history.back()}>
                            gå tilbake til forrige side
                          </Link>
                        )}
                      </List.Item>
                    </List>
                  </Box>
                  <BodyShort>
                    Hvis problemet vedvarer, kan du{" "}
                    <Link href="https://nav.no/kontaktoss" target="_blank">
                      kontakte oss (åpnes i ny fane)
                    </Link>
                    .
                  </BodyShort>
                </div>

                <Button as="a" href="/min-side-arbeidsgiver">
                  Gå til Min side - arbeidsgiver
                </Button>
              </VStack>

              <div>
                <Heading level="1" size="large" spacing>
                  Something went wrong
                </Heading>
                <BodyShort spacing>
                  This was caused by a technical fault on our servers. Please
                  refresh this page or try again in a few minutes.{" "}
                </BodyShort>
                <BodyShort>
                  <Link href="https://www.nav.no/kontaktoss/en" target="_blank">
                    Contact us (opens in new tab)
                  </Link>{" "}
                  if the problem persists.
                </BodyShort>
              </div>
            </VStack>
          </HGrid>
        </Box>
      </PageBlock>
    </Page>
  );
};
