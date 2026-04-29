import { z } from "zod";

import {
  FraværDelerAvDagSchema,
  FraværHeleDagSchema,
} from "~/features/shared/skjema-moduler/omsorgspengerFraværSchema";
import {
  EndringAvInntektÅrsakerSchema,
  NaturalytelseTypeSchema,
} from "~/types/api-models.ts";
import { beløpSchema } from "~/utils.ts";

// Før vi er i oppsummeringssteget
export const InntektsmeldingSkjemaStateSchemaUnntattAaregister = z.object({
  besøkteSteg: z.array(z.number()).default([]),
  kontaktperson: z
    .object({
      navn: z.string(),
      telefonnummer: z.string(),
    })
    .optional(),
  inntekt: beløpSchema,
  korrigertInntekt: beløpSchema.optional(),
  endringAvInntektÅrsaker: z.array(
    z.object({
      årsak: z.union([EndringAvInntektÅrsakerSchema, z.literal("")]),
      fom: z.string().optional(),
      tom: z.string().optional(),
      bleKjentFom: z.string().optional(),
      ignorerTom: z.boolean().optional(),
    }),
  ),
  skalRefunderes: z
    .union([
      z.literal("JA_LIK_REFUSJON"),
      z.literal("JA_VARIERENDE_REFUSJON"),
      z.literal("NEI"),
    ])
    .optional(),
  refusjon: z.array(
    z.object({
      fom: z.string().optional(),
      beløp: beløpSchema,
    }),
  ),
  misterNaturalytelser: z.boolean().optional(),
  bortfaltNaturalytelsePerioder: z.array(
    z.object({
      navn: z.union([NaturalytelseTypeSchema, z.literal("")]),
      beløp: beløpSchema,
      fom: z.string().optional(),
      tom: z.string().optional(),
      inkluderTom: z.boolean(),
    }),
  ),
  fraværHeleDager: z.array(FraværHeleDagSchema).optional(),
  fraværDelerAvDagen: z.array(FraværDelerAvDagSchema).optional(),
  id: z.number().optional(),
  opprettetTidspunkt: z.string().optional(),
});

// Klar for innsending til backend. Når vi er i oppsummeringssteget, eller tidligere innsendt skjema.
export const AGIValidatedInntektsmeldingUnntattAaregister = z.object({
  kontaktperson: z.object({
    navn: z.string(),
    telefonnummer: z.string(),
  }),
  inntekt: beløpSchema,
  korrigertInntekt: beløpSchema.optional(),
  endringAvInntektÅrsaker: z.array(
    z.object({
      årsak: EndringAvInntektÅrsakerSchema,
      fom: z.string().optional(),
      tom: z.string().optional(),
      ignorerTom: z.boolean(),
      bleKjentFom: z.string().optional(),
    }),
  ),
  misterNaturalytelser: z.boolean(),
  bortfaltNaturalytelsePerioder: z.array(
    z.object({
      navn: NaturalytelseTypeSchema,
      beløp: beløpSchema,
      fom: z.string(),
      tom: z.string().optional(),
      inkluderTom: z.boolean(),
    }),
  ),
  skalRefunderes: z.union([
    z.literal("JA_LIK_REFUSJON"),
    z.literal("JA_VARIERENDE_REFUSJON"),
    z.literal("NEI"),
  ]),
  refusjon: z.array(
    z.object({
      fom: z.string().optional(),
      beløp: beløpSchema,
    }),
  ),
  fraværHeleDager: z.array(FraværHeleDagSchema).optional(),
  fraværDelerAvDagen: z
    .array(
      z.object({
        dato: z.string(),
        timer: z.string(),
      }),
    )
    .optional(),
  id: z.number().optional(),
  opprettetTidspunkt: z.string().optional(),
});

export type InntektsmeldingSkjemaStateAGIUnntattAaregister = z.infer<
  typeof InntektsmeldingSkjemaStateSchemaUnntattAaregister
>;

export type InntektsmeldingSkjemaStateValidAGIUnntattAaregister = z.infer<
  typeof AGIValidatedInntektsmeldingUnntattAaregister
>;
