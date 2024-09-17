import { createFileRoute } from "@tanstack/react-router";

import { RefusjonOmsorgspengerArbeidsgiverSteg4 } from "~/features/refusjon-omsorgspenger-arbeidsgiver/Steg4";

export const Route = createFileRoute("/refusjon-omsorgspenger-arbeidsgiver/4")({
  component: RefusjonOmsorgspengerArbeidsgiverSteg4,
});
