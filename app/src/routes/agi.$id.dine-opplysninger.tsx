import { createFileRoute } from "@tanstack/react-router";

import { Steg1DineOpplysninger } from "~/features/arbeidsgiverinitiert/nyansatt/steg/Steg1DineOpplysninger";
import { HjelpetekstToggle } from "~/features/shared/Hjelpetekst";

export const Route = createFileRoute("/agi/$id/dine-opplysninger")({
  component: () => {
    return (
      <>
        <HjelpetekstToggle />
        <Steg1DineOpplysninger />
      </>
    );
  },
});
