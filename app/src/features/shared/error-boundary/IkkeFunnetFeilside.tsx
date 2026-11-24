import {
  BodyShort,
  Box,
  Button,
  Heading,
  Page,
  VStack,
} from "@navikt/ds-react";

import { useDocumentTitle } from "~/features/shared/hooks/useDocumentTitle";
import { useErIRotLayout } from "~/features/shared/rot-layout/RotLayout";

export const IkkeFunnetFeilside = () => {
  useDocumentTitle("Beklager, vi fant ikke siden");
  const erIRotLayout = useErIRotLayout();

  const innhold = (
    <Box data-aksel-template="404-v2" paddingBlock="space-80 space-64">
      <VStack align="start" gap="space-48">
        <div>
          <Heading level={erIRotLayout ? "2" : "1"} size="large" spacing>
            Beklager, vi fant ikke siden
          </Heading>
          <BodyShort>
            Denne siden kan være slettet eller flyttet, eller det er en feil i
            lenken.
          </BodyShort>
        </div>
        <Button as="a" href="https://arbeidsgiver.nav.no/min-side-arbeidsgiver">
          Gå til Min side – arbeidsgiver
        </Button>
      </VStack>
    </Box>
  );

  if (erIRotLayout) {
    return innhold;
  }

  return (
    <Page>
      <Page.Block as="main" gutters width="xl">
        {innhold}
      </Page.Block>
    </Page>
  );
};
