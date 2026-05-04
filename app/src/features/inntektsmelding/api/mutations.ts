import { SERVER_URL } from "~/api/config";
import {
  InntektsmeldingResponseDtoSchema,
  SendInntektsmeldingRequestDto,
} from "~/features/inntektsmelding/api-schemas";
import { logDev } from "~/utils.ts";

import { mapInntektsmeldingResponseTilValidState } from "./queries";

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
