import { SERVER_URL } from "~/api/config";
import { SendInntektsmeldingRequestDtoUregistrert } from "~/features/arbeidsgiverinitiert/unntattAAregister/api-schemas";
import { mapInntektsmeldingResponseTilValidState } from "~/features/inntektsmelding/api/queries";
import { InntektsmeldingResponseDtoSchema } from "~/features/inntektsmelding/api-schemas";
import { logDev } from "~/utils.ts";

export async function sendInntektsmeldingArbeidsgiverInitiertUnntattAaregister(
  sendInntektsmeldingRequest: SendInntektsmeldingRequestDtoUregistrert,
) {
  const response = await fetch(
    `${SERVER_URL}/imdialog/send-inntektsmelding/arbeidsgiverinitiert-uregistrert`,
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

  return mapInntektsmeldingResponseTilValidState(parsedJson.data);
}
