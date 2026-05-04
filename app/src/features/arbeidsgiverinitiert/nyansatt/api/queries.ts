import { SERVER_URL } from "~/api/config";
import {
  feilmeldingSchema,
  OpplysningerRequest,
  opplysningerSchema,
} from "~/types/api-schemas";
import { logDev } from "~/utils.ts";

export async function hentOpplysninger(
  opplysningerRequest: OpplysningerRequest,
) {
  const response = await fetch(
    `${SERVER_URL}/arbeidsgiverinitiert/opplysninger/nyansatt`,
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
