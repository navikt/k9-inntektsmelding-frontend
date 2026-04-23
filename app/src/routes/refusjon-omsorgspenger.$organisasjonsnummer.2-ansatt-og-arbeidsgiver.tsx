import { createFileRoute } from "@tanstack/react-router";

import { featureToggles } from "~/feature-toggles/featureToggles";
import { RefusjonOmsorgspengerArbeidsgiverSteg2 } from "~/features/refusjon-omsorgspenger/steg/Steg2AnsattOgArbeidsgiver";
import { RefusjonOmsorgspengerArbeidsgiverSteg2V2 } from "~/features/refusjon-omsorgspenger/steg/Steg2AnsattOgArbeidsgiverV2";

export const Route = createFileRoute(
  "/refusjon-omsorgspenger/$organisasjonsnummer/2-ansatt-og-arbeidsgiver",
)({
  component: featureToggles.REFUSJON_STEG2_V2
    ? RefusjonOmsorgspengerArbeidsgiverSteg2V2
    : RefusjonOmsorgspengerArbeidsgiverSteg2,
});
