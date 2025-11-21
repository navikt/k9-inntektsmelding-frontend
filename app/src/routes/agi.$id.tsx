import { BodyShort, Loader } from "@navikt/ds-react";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

import { SERVER_URL } from "~/api/mutations";
import { hentOpplysningerData } from "~/api/queries";
import { InntektsmeldingSkjemaStateValidAGI } from "~/features/arbeidsgiverinitiert/zodSchemas";
import { InntektsmeldingRootAGI } from "~/features/shared/rot-layout/InntektsmeldingRootLayout";
import { RotLayout } from "~/features/shared/rot-layout/RotLayout";
import {
  InntektsmeldingResponseDtoSchema,
  SendInntektsmeldingResponseDto,
} from "~/types/api-models";
import { OpplysningerDto } from "~/types/api-models";
import { logDev } from "~/utils";

import { ARBEIDSGIVERINITERT_NYANSATT_ID } from "./opprett";

const mapInntektsmeldingResponseTilValidState = (
  im: SendInntektsmeldingResponseDto,
): Omit<InntektsmeldingSkjemaStateValidAGI, "opprettetTidspunkt"> & {
  opprettetTidspunkt: string;
  id: number;
} => {
  return {
    kontaktperson: im.kontaktperson,
    refusjon: im.refusjon as { fom: string; beløp: string | number }[],
    skalRefunderes:
      im.refusjon?.length > 1
        ? "JA_VARIERENDE_REFUSJON"
        : im.refusjon?.length === 1
          ? "JA_LIK_REFUSJON"
          : "NEI",
    førsteFraværsdag: im.startdato,
    opprettetTidspunkt: im.opprettetTidspunkt,
    id: im.id,
  };
};

export async function hentEksisterendeInntektsmeldinger(uuid: string) {
  if (uuid === ARBEIDSGIVERINITERT_NYANSATT_ID) {
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
export const Route = createFileRoute("/agi/$id")({
  component: InntektsmeldingRootAGI,
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
