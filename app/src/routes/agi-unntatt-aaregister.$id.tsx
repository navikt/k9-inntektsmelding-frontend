import { BodyShort, Loader } from "@navikt/ds-react";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

import { SERVER_URL } from "~/api/mutations";
import {
  hentOpplysningerData,
  mapInntektsmeldingResponseTilValidState,
} from "~/api/queries";
import { InntektsmeldingRootUnntattAaregister } from "~/features/shared/rot-layout/InntektsmeldingRootLayout";
import { RotLayout } from "~/features/shared/rot-layout/RotLayout";
import { InntektsmeldingResponseDtoSchema } from "~/types/api-models";
import { OpplysningerDto } from "~/types/api-models";
import { logDev } from "~/utils";

import { ARBEIDSGIVERINITIERT_UNNTATT_AAREGISTER_ID } from "./opprett";

export async function hentEksisterendeInntektsmeldinger(uuid: string) {
  if (uuid === ARBEIDSGIVERINITIERT_UNNTATT_AAREGISTER_ID) {
    return [];
  }
  const response = await fetch(
    `${SERVER_URL}/imdialog/inntektsmeldinger?foresporselUuid=${uuid}`,
  );

  if (response.status === 404) {
    throw new Error("Forespørsel ikke funnet");
  }

  if (!response.ok) {
    throw new Error(
      "Kunne ikke hente eksisterende inntektsmeldinger for forespørsel",
    );
  }
  const json = await response.json();
  const parsedJson = z.array(InntektsmeldingResponseDtoSchema).safeParse(json);

  if (!parsedJson.success) {
    logDev("error", parsedJson.error);

    throw new Error("Responsen fra serveren matchet ikke forventet format");
  }

  return parsedJson.data.map((im) =>
    mapInntektsmeldingResponseTilValidState(im),
  );
}
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
