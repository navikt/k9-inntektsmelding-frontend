import { z } from "zod";

import {
  FraværDelerAvDagSchema,
  FraværHeleDagSchema,
} from "~/features/shared/skjema-moduler/omsorgspengerFraværSchema";
import {
  EndringAvInntektÅrsakerSchema,
  NaturalytelseTypeSchema,
} from "~/types/api-schemas.ts";
import { beløpSchema } from "~/utils.ts";

/**
 * Minst streng skjema-state. Denne brukes underveis der mange av feltene er optional fordi de ikke er utfylt enda.
 */
export const InntektsmeldingSkjemaStateSchema = z.object({
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
});

/**
 * En strengere skjema state. Her er alle verdiene validert mot skjema-logikken.
 */
export const InntektsmeldingSkjemaStateSchemaValidated = z.object({
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
  fraværHeleDager: z.array(FraværHeleDagSchema).optional(),
  fraværDelerAvDagen: z
    .array(
      z.object({
        dato: z.string(),
        timer: z.string(),
      }),
    )
    .optional(),
  opprettetTidspunkt: z.string().optional(),
  id: z.number().optional(),
  // TODO: Disse burde flyttes til en egen schema for eksisterende inntektsmeldinger
});

export type InntektsmeldingSkjemaState = z.infer<
  typeof InntektsmeldingSkjemaStateSchema
>;

export type InntektsmeldingSkjemaStateValid = z.infer<
  typeof InntektsmeldingSkjemaStateSchemaValidated
>;
