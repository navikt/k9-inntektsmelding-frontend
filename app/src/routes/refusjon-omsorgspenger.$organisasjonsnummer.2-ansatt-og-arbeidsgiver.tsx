import { createFileRoute } from "@tanstack/react-router";

import { RefusjonOmsorgspengerArbeidsgiverSteg2 } from "~/features/refusjon-omsorgspenger/steg/Steg2AnsattOgArbeidsgiver";

export const Route = createFileRoute(
  "/refusjon-omsorgspenger/$organisasjonsnummer/2-ansatt-og-arbeidsgiver",
)({
  component: RefusjonOmsorgspengerArbeidsgiverSteg2,
});
