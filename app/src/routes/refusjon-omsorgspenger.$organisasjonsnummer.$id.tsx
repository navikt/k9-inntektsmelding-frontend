import { Loader } from "@navikt/ds-react";
import { BodyShort } from "@navikt/ds-react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { SERVER_URL } from "~/api/mutations";
import { hentOpplysningerData } from "~/api/queries";
import { RefusjonOmsorgspengerResponseDtoSchema } from "~/features/refusjon-omsorgspenger/api/mutations";
import { VisInnsendtRefusjonskrav } from "~/features/refusjon-omsorgspenger/visningskomponenter/VisInnsendtRefusjonskrav.tsx";
import { logDev } from "~/utils";

enum FEILKODER {
  OPPGAVE_ER_UTGÅTT = "OPPGAVE_ER_UTGÅTT",
}

export async function hentEksisterendeInntektsmeldinger(uuid: string) {
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
  const parsedJson = z
    .array(RefusjonOmsorgspengerResponseDtoSchema)
    .safeParse(json);

  if (!parsedJson.success) {
    logDev(
      "error",
      "Responsen fra serveren matchet ikke forventet format",
      parsedJson.error,
    );
    throw new Error("Responsen fra serveren matchet ikke forventet format");
  }

  return parsedJson.data;
}

export const Route = createFileRoute(
  "/refusjon-omsorgspenger/$organisasjonsnummer/$id",
)({
  component: RouteComponent,
  pendingComponent: () => (
    <div className="my-6 flex flex-col items-center gap-4">
      <Loader className="mx-auto" size="2xlarge" />
      <BodyShort className="text-center">Henter opplysninger…</BodyShort>
    </div>
  ),
  loader: async ({ params }) => {
    const [opplysninger, eksisterendeInntektsmeldinger] = await Promise.all([
      hentOpplysningerData(params.id),
      hentEksisterendeInntektsmeldinger(params.id),
    ]);

    if (
      opplysninger.forespørselStatus === "UTGÅTT" &&
      eksisterendeInntektsmeldinger?.length === 0
    ) {
      throw new Error(FEILKODER.OPPGAVE_ER_UTGÅTT);
    }
    return { eksisterendeInntektsmeldinger, opplysninger };
  },
});

function RouteComponent() {
  return <VisInnsendtRefusjonskrav />;
}
