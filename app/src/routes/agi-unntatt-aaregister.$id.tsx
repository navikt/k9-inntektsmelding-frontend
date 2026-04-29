import { BodyShort, Loader } from "@navikt/ds-react";
import { createFileRoute } from "@tanstack/react-router";

import { hentOpplysningerData } from "~/api/queries";
import { hentEksisterendeInntektsmeldinger } from "~/features/arbeidsgiverinitiert/unntattAAregister/api/queries";
import { InntektsmeldingRootUnntattAaregister } from "~/features/shared/rot-layout/InntektsmeldingRootLayout";
import { RotLayout } from "~/features/shared/rot-layout/RotLayout";
import { OpplysningerDto } from "~/types/api-schemas";

export const Route = createFileRoute("/agi-unntatt-aaregister/$id")({
  component: InntektsmeldingRootUnntattAaregister,
  errorComponent: ({ error }) => {
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
    const opplysninger = await hentOpplysningerData(params.id);
    const eksisterendeInntektsmeldinger =
      await hentEksisterendeInntektsmeldinger(params.id);

    return {
      opplysninger: opplysninger as OpplysningerDto,
      eksisterendeInntektsmeldinger: eksisterendeInntektsmeldinger,
    };
  },
});
