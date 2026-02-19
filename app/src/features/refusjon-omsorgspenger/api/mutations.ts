import { MutationOptions, useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { SERVER_URL } from "~/api/mutations";
import { SendInntektsmeldingRequestDtoSchema } from "~/types/api-models.ts";

const RefusjonOmsorgspengerDtoSchema = SendInntektsmeldingRequestDtoSchema.omit(
  { foresporselUuid: true },
).extend({
  omsorgspenger: z.object({
    fraværHeleDager: z
      .array(
        z.object({
          fom: z.string(),
          tom: z.string(),
        }),
      )
      .optional(),
    fraværDelerAvDagen: z
      .array(
        z.object({
          dato: z.string(),
          timer: z.coerce.string(),
        }),
      )
      .optional(),
    harUtbetaltPliktigeDager: z.boolean(),
  }),
});

export const RefusjonOmsorgspengerResponseDtoSchema =
  RefusjonOmsorgspengerDtoSchema.extend({
    id: z.number(),
    opprettetTidspunkt: z.string(),
    innsendtTidspunkt: z.string().optional(),
    foresporselUuid: z.string(),
  });

export type RefusjonOmsorgspengerDto = z.infer<
  typeof RefusjonOmsorgspengerDtoSchema
>;

export type RefusjonOmsorgspengerResponseDto = z.infer<
  typeof RefusjonOmsorgspengerResponseDtoSchema
>;

export const sendInntektsmeldingOmsorgspengerRefusjonMutation = (
  options: MutationOptions<
    RefusjonOmsorgspengerResponseDto,
    Error,
    RefusjonOmsorgspengerDto
  >,
) =>
  useMutation<
    RefusjonOmsorgspengerResponseDto,
    Error,
    RefusjonOmsorgspengerDto
  >({
    mutationFn: async (request: RefusjonOmsorgspengerDto) => {
      const response = await fetch(
        `${SERVER_URL}/imdialog/send-inntektsmelding/omsorgspenger-refusjon`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        },
      );
      if (!response.ok) {
        throw new Error("Noe gikk galt.");
      }
      return response.json() as Promise<RefusjonOmsorgspengerResponseDto>;
    },
    ...options,
  });
