import { z } from "zod";

import { SERVER_URL } from "~/api/config";
import {
  InntektsmeldingResponseDtoUregistrertSchema,
  SendInntektsmeldingResponseDtoUregistrert,
} from "~/features/arbeidsgiverinitiert/unntattAAregister/api-schemas";
import { InntektsmeldingSkjemaStateValidAGIUnntattAaregister } from "~/features/arbeidsgiverinitiert/unntattAAregister/frontendSchemas";
import { PÅKREVDE_ENDRINGSÅRSAK_FELTER } from "~/features/shared/skjema-moduler/Inntekt.tsx";
import { ARBEIDSGIVERINITIERT_UNNTATT_AAREGISTER_ID } from "~/routes/opprett";
import { logDev } from "~/utils.ts";

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
  const parsedJson = z
    .array(InntektsmeldingResponseDtoUregistrertSchema)
    .safeParse(json);

  if (!parsedJson.success) {
    logDev("error", parsedJson.error);

    throw new Error("Responsen fra serveren matchet ikke forventet format");
  }

  return parsedJson.data.map((im) =>
    mapInntektsmeldingUregistrertResponseTilValidState(im),
  );
}

export function mapInntektsmeldingUregistrertResponseTilValidState(
  inntektsmelding: SendInntektsmeldingResponseDtoUregistrert,
): InntektsmeldingSkjemaStateValidAGIUnntattAaregister & {
  opprettetTidspunkt: string;
  id: number;
} {
  return {
    kontaktperson: inntektsmelding.kontaktperson,
    refusjon: inntektsmelding.refusjon ?? [],
    bortfaltNaturalytelsePerioder:
      inntektsmelding.bortfaltNaturalytelsePerioder?.map((periode) => ({
        navn: periode.naturalytelsetype,
        fom: periode.fom,
        beløp: periode.beløp,
        inkluderTom: periode.tom !== undefined,
        tom: periode.tom,
      })) ?? [],
    endringAvInntektÅrsaker: (
      inntektsmelding.endringAvInntektÅrsaker ?? []
    ).map((endringÅrsak) => ({
      ...endringÅrsak,
      ignorerTom:
        endringÅrsak.tom === undefined &&
        PÅKREVDE_ENDRINGSÅRSAK_FELTER[endringÅrsak.årsak]?.tomErValgfritt,
    })),
    inntekt: inntektsmelding.inntekt,
    skalRefunderes:
      (inntektsmelding.refusjon ?? []).length > 1
        ? "JA_VARIERENDE_REFUSJON"
        : (inntektsmelding.refusjon ?? []).length === 1
          ? "JA_LIK_REFUSJON"
          : "NEI",
    misterNaturalytelser:
      (inntektsmelding.bortfaltNaturalytelsePerioder?.length ?? 0) > 0,
    opprettetTidspunkt: inntektsmelding.opprettetTidspunkt,
    id: inntektsmelding.id,
    fraværDelerAvDagen:
      inntektsmelding.omsorgspenger?.fraværDelerAvDagen?.map((fravær) => ({
        dato: fravær.dato,
        timer: String(fravær.timer),
      })) ?? [],
    fraværHeleDager:
      inntektsmelding.omsorgspenger?.fraværHeleDager?.map((periode) => ({
        fom: periode.fom,
        tom: periode.tom,
      })) ?? [],
  };
}
