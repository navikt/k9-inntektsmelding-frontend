import { createFileRoute } from "@tanstack/react-router";

import { Steg2Refusjon } from "~/features/arbeidsgiverinitiert/nyansatt/steg/Steg2Refusjon";
import { HjelpetekstToggle } from "~/features/shared/Hjelpetekst";

export const Route = createFileRoute("/agi/$id/refusjon")({
  component: () => (
    <>
      <HjelpetekstToggle />
      <Steg2Refusjon />
    </>
  ),
});
