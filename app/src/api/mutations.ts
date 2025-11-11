import { mapInntektsmeldingResponseTilValidState } from "~/api/queries.ts";
import {
  InntektsmeldingResponseDtoSchema,
  SendInntektsmeldingRequestDto,
  SendInntektsmeldingRequestDtoSchemaArbeidsgiverInitiertType,
} from "~/types/api-models.ts";
import { logDev } from "~/utils.ts";

export const SERVER_URL = `${import.meta.env.BASE_URL}/server/api`;

export async function sendInntektsmelding(
  sendInntektsmeldingRequest: SendInntektsmeldingRequestDto,
) {
  const response = await fetch(`${SERVER_URL}/imdialog/send-inntektsmelding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sendInntektsmeldingRequest),
  });

  if (!response.ok) {
    throw new Error("Noe gikk galt.");
  }

  const json = await response.json();
  const parsedJson = InntektsmeldingResponseDtoSchema.safeParse(json);

  if (!parsedJson.success) {
    logDev("error", parsedJson.error);

    throw new Error("Responsen fra serveren matchet ikke forventet format");
  }

  return mapInntektsmeldingResponseTilValidState(parsedJson.data);
}

export async function sendInntektsmeldingArbeidsgiverInitiert(
  sendInntektsmeldingRequest: SendInntektsmeldingRequestDtoSchemaArbeidsgiverInitiertType,
) {
  const response = await fetch(
    `${SERVER_URL}/imdialog/send-inntektsmelding/arbeidsgiverinitiert-nyansatt`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendInntektsmeldingRequest),
    },
  );

  if (!response.ok) {
    throw new Error("Noe gikk galt.");
  }

  const json = await response.json();

  const parsedJson = InntektsmeldingResponseDtoSchema.safeParse(json);

  if (!parsedJson.success) {
    logDev("error", parsedJson.error);

    throw new Error("Responsen fra serveren matchet ikke forventet format");
  }

  return parsedJson.data;
}
