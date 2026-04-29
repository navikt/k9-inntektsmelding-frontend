import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

import { parseStorageItem } from "~/features/shared/hooks/usePersistedState";
import {
  ARBEIDSGIVERINITERT_NYANSATT_ID,
  ARBEIDSGIVERINITIERT_UNNTATT_AAREGISTER_ID,
} from "~/routes/opprett";
import {
  feilmeldingSchema,
  grunnbeløpSchema,
  OpplysningerDto,
  OpplysningerRequest,
  opplysningerSchema,
  SlåOppArbeidstakerResponseDtoSchema,
  Ytelsetype,
} from "~/types/api-schemas";
import { logDev } from "~/utils.ts";

const SERVER_URL = `${import.meta.env.BASE_URL}/server/api`;

export const hentInntektsmeldingPdfUrl = (id: number) =>
  `${SERVER_URL}/imdialog/last-ned-pdf?id=${id}`;

export function hentGrunnbeløpOptions() {
  return queryOptions({
    queryKey: ["GRUNNBELØP"],
    queryFn: hentGrunnbeløp,
    initialData: Infinity,
  });
}

async function hentGrunnbeløp() {
  try {
    const response = await fetch("https://g.nav.no/api/v1/grunnbel%C3%B8p");
    if (!response.ok) {
      return Infinity;
    }

    const json = await response.json();
    const parsedJson = grunnbeløpSchema.safeParse(json);

    if (!parsedJson.success) {
      return Infinity;
    }
    return parsedJson.data.grunnbeløp;
  } catch {
    return Infinity;
  }
}

export async function hentOpplysningerData(
  uuid: string,
): Promise<OpplysningerDto> {
  if (uuid === ARBEIDSGIVERINITERT_NYANSATT_ID) {
    // Da har vi en fakeId. Hent fra sessionstorage
    const opplysninger = parseStorageItem(
      sessionStorage,
      ARBEIDSGIVERINITERT_NYANSATT_ID,
      opplysningerSchema,
    );
    if (!opplysninger) {
      throw new Error("Finner ikke arbeidsgiverinitierte opplysninger");
    }
    return opplysninger;
  }

  if (uuid === ARBEIDSGIVERINITIERT_UNNTATT_AAREGISTER_ID) {
    // Da har vi en fakeId. Hent fra sessionstorage
    const opplysninger = parseStorageItem(
      sessionStorage,
      ARBEIDSGIVERINITIERT_UNNTATT_AAREGISTER_ID,
      opplysningerSchema,
    );
    if (!opplysninger) {
      throw new Error(
        "Finner ikke arbeidsgiverinitierte unntatt aaregistrering opplysninger",
      );
    }
    return opplysninger;
  }

  const response = await fetch(
    `${SERVER_URL}/imdialog/opplysninger?foresporselUuid=${uuid}`,
  );
  if (response.status === 404) {
    throw new Error("Forespørsel ikke funnet");
  }
  if (!response.ok) {
    throw new Error("Kunne ikke hente forespørsel");
  }
  const json = await response.json();
  const parsedJson = opplysningerSchema.safeParse(json);

  if (!parsedJson.success) {
    logDev("error", parsedJson.error);
    throw new Error("Responsen fra serveren matchet ikke forventet format");
  }
  return parsedJson.data;
}

export async function hentPersonFraFnr(
  fnr: string,
  ytelsetype: Ytelsetype,
  førsteFraværsdag: string,
) {
  const response = await fetch(
    `${SERVER_URL}/arbeidsgiverinitiert/arbeidsforhold/nyansatt`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fødselsnummer: fnr,
        ytelseType: ytelsetype,
        førsteFraværsdag,
      }),
    },
  );

  if (!response.ok) {
    const json = await response.json();
    const parsedFeil = feilmeldingSchema.safeParse(json);
    if (!parsedFeil.success) {
      logDev("error", parsedFeil.error);
      throw new Error("Kunne ikke hente opplysninger");
    }
    throw new Error(parsedFeil.data.type);
  }

  const json = await response.json();
  const parsedJson = SlåOppArbeidstakerResponseDtoSchema.safeParse(json);
  if (!parsedJson.success) {
    logDev("error", parsedJson.error);

    throw new Error("Responsen fra serveren matchet ikke forventet format");
  }

  return parsedJson.data;
}

export async function hentPersonFraFnrUnntattAareg(
  fnr: string,
  ytelsetype: Ytelsetype,
  førsteFraværsdag: string,
) {
  const response = await fetch(
    `${SERVER_URL}/arbeidsgiverinitiert/arbeidsgivere/uregistrert`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fødselsnummer: fnr,
        ytelseType: ytelsetype,
        førsteFraværsdag,
      }),
    },
  );

  if (!response.ok) {
    const json = await response.json();
    const parsedFeil = feilmeldingSchema.safeParse(json);
    if (!parsedFeil.success) {
      logDev("error", parsedFeil.error);
      throw new Error("Kunne ikke hente opplysninger");
    }
    throw new Error(parsedFeil.data.type);
  }

  const json = await response.json();
  const parsedJson = SlåOppArbeidstakerResponseDtoSchema.safeParse(json);
  if (!parsedJson.success) {
    logDev("error", parsedJson.error);
    throw new Error("Responsen fra serveren matchet ikke forventet format");
  }

  return parsedJson.data;
}

export async function hentOpplysningerUnntattAaregister(
  opplysningerRequest: OpplysningerRequest,
) {
  const response = await fetch(
    `${SERVER_URL}/arbeidsgiverinitiert/opplysninger/uregistrert`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(opplysningerRequest),
    },
  );
  if (!response.ok) {
    const json = await response.json();
    const parsedFeil = feilmeldingSchema.safeParse(json);
    if (!parsedFeil.success) {
      logDev("error", parsedFeil.error);
      throw new Error("Kunne ikke hente opplysninger");
    }
    throw new Error(parsedFeil.data.type);
  }

  const json = await response.json();
  const parsedJson = opplysningerSchema.safeParse(json);

  if (!parsedJson.success) {
    logDev("error", parsedJson.error);
    throw new Error("Responsen fra serveren matchet ikke forventet format");
  }

  return parsedJson.data;
}

export async function hentArbeidsgiversOrganisasjoner() {
  const response = await fetch(
    `${SERVER_URL}/arbeidsgiverinitiert/arbeidsgiver/organisasjoner`,
  );
  if (!response.ok) {
    throw new Error("Kunne ikke hente organisasjoner");
  }
  const json = await response.json();
  const parsedJson = z
    .object({
      organisasjoner: z.array(
        z.object({
          organisasjonsnavn: z.string(),
          organisasjonsnummer: z.string(),
        }),
      ),
    })
    .safeParse(json);

  if (!parsedJson.success) {
    logDev("error", parsedJson.error);
  }

  return parsedJson.data;
}
