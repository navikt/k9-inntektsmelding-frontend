import { createFileRoute } from "@tanstack/react-router";

import { Steg1DineOpplysningerAGIUnntattAaregister } from "~/features/arbeidsgiverinitiert/unntattAAregister/steg/Steg1DineOpplysninger";
import { HjelpetekstToggle } from "~/features/shared/Hjelpetekst";

export const Route = createFileRoute(
  "/agi-unntatt-aaregister/$id/dine-opplysninger",
)({
  component: () => (
    <>
      <HjelpetekstToggle />
      <Steg1DineOpplysningerAGIUnntattAaregister />
    </>
  ),
});
