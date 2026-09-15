import { BodyShort, Loader } from "@navikt/ds-react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { hentInnloggetBrukerDataOptions } from "~/features/refusjon-omsorgspenger/api/queries";
import { RefusjonOmsorgspengerArbeidsgiverRotLayout } from "~/features/refusjon-omsorgspenger/RootLayoutRefusjonOmsorgspenger";
import { OppgaveErUtgåttFeilside } from "~/features/shared/error-boundary/OppgaveErUtgåttFeilside";
import { queryClient } from "~/main";

enum FEILKODER {
  OPPGAVE_ER_UTGÅTT = "OPPGAVE_ER_UTGÅTT",
}

export const Route = createFileRoute(
  "/refusjon-omsorgspenger/$organisasjonsnummer",
)({
  component: RefusjonOmsorgspengerArbeidsgiverRotLayout,
  pendingComponent: () => (
    <div className="my-6 flex flex-col items-center gap-4">
      <Loader className="mx-auto" size="2xlarge" />
      <BodyShort className="text-center">Henter opplysninger…</BodyShort>
    </div>
  ),
  errorComponent: ({ error }) => {
    if (
      error instanceof Error &&
      error.message === FEILKODER.OPPGAVE_ER_UTGÅTT
    ) {
      return <OppgaveErUtgåttFeilside />;
    }

    throw error;
  },
  loader: async ({ params }) => {
    const organisasjonsnummerSchema = z
      .string()
      .regex(/^\d+$/, "Organisasjonsnummer må bestå av kun tall")
      .refine((val) => {
        const num = Number(val);
        return num >= 100_000_000 && num <= 999_999_999;
      }, "Ugyldig organisasjonsnummer");

    const parsed = organisasjonsnummerSchema.safeParse(
      params.organisasjonsnummer,
    );
    if (!parsed.success) {
      throw new Error("Ugyldig organisasjonsnummer");
    }

    const organisasjonsnummer = parsed.data;

    const innloggetBruker = await queryClient.ensureQueryData(
      hentInnloggetBrukerDataOptions(organisasjonsnummer),
    );

    return { innloggetBruker };
  },
});
