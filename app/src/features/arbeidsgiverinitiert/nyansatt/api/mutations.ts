import { SERVER_URL } from "~/api/config";
import { SendInntektsmeldingRequestDtoSchemaArbeidsgiverInitiertType } from "~/features/arbeidsgiverinitiert/nyansatt/api-schemas";
import { InntektsmeldingResponseDtoSchema } from "~/features/inntektsmelding/api-schemas";
import { logDev } from "~/utils.ts";

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
