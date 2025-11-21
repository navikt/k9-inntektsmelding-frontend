import { createFileRoute } from "@tanstack/react-router";

import { Steg2InntektOgRefusjon } from "~/features/inntektsmelding/steg/Steg2InntektOgRefusjon";
import { HjelpetekstToggle } from "~/features/shared/Hjelpetekst";

export const Route = createFileRoute(
  "/agi-unntatt-aaregister/$id/inntekt-og-refusjon",
)({
  component: () => (
    <>
      <HjelpetekstToggle />
      <Steg2InntektOgRefusjon />
    </>
  ),
});
