import { createFileRoute, useSearch } from "@tanstack/react-router";
import { z } from "zod";

import { InntektsmeldingRootLayoutComponent } from "~/features/shared/rot-layout/InntektsmeldingRootLayout";
import { YtelsetypeSchema } from "~/types/api-models";

export const ARBEIDSGIVERINITERT_NYANSATT_ID = "agi";
export const ARBEIDSGIVERINITIERT_UNNTATT_AAREGISTER_ID =
  "agi-unntatt-aaregister";

const agiSearchParams = z.object({
  ytelseType: YtelsetypeSchema,
});

export const Route = createFileRoute("/opprett")({
  component: () => {
    const { ytelseType } = useSearch({ from: "/opprett" });
    return (
      <InntektsmeldingRootLayoutComponent
        skjemaId={ARBEIDSGIVERINITERT_NYANSATT_ID}
        ytelse={ytelseType}
      />
    );
  },

  validateSearch: (search) => agiSearchParams.parse(search),
});
