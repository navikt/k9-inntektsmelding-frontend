import { BodyShort, Loader } from "@navikt/ds-react";
import { createFileRoute } from "@tanstack/react-router";

import {
  hentEksisterendeInntektsmeldinger,
  hentOpplysningerData,
} from "~/api/queries";
import { OppgaveErUtgåttFeilside } from "~/features/shared/error-boundary/OppgaveErUtgåttFeilside";
import { InntektsmeldingRoot } from "~/features/shared/rot-layout/InntektsmeldingRootLayout";
import { RotLayout } from "~/features/shared/rot-layout/RotLayout";

enum FEILKODER {
  OPPGAVE_ER_UTGÅTT = "OPPGAVE_ER_UTGÅTT",
}

export const Route = createFileRoute("/$id")({
  component: InntektsmeldingRoot,
  errorComponent: ({ error }) => {
    if (error.message === FEILKODER.OPPGAVE_ER_UTGÅTT) {
      return <OppgaveErUtgåttFeilside />;
    }

    throw error;
  },
  pendingComponent: () => (
    <RotLayout medHvitBoks={true} tittel="Inntektsmelding" undertittel={null}>
      <div className="my-6 flex flex-col items-center gap-4">
        <Loader className="mx-auto" size="2xlarge" />
        <BodyShort className="text-center">Henter opplysninger…</BodyShort>
      </div>
    </RotLayout>
  ),
  loader: async ({ params }) => {
    const [opplysninger, eksisterendeInntektsmeldinger] = await Promise.all([
      hentOpplysningerData(params.id),
      hentEksisterendeInntektsmeldinger(params.id),
    ]);

    if (
      opplysninger.forespørselStatus === "UTGÅTT" &&
      eksisterendeInntektsmeldinger.length === 0
    ) {
      throw new Error(FEILKODER.OPPGAVE_ER_UTGÅTT);
    }

    return {
      opplysninger: opplysninger,
      eksisterendeInntektsmeldinger,
    };
  },
});
