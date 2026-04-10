import { z } from "zod";

import {
  EndringAvInntektÅrsakerSchema,
  NaturalytelseTypeSchema,
} from "~/types/api-models.ts";
import { beløpSchema } from "~/utils.ts";

/**
 * Minst streng skjema-state. Denne brukes underveis der mange av feltene er optional fordi de ikke er utfylt enda.
 */
export const InntektsmeldingSkjemaStateSchema = z.object({
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
});

export const InntektsmeldingSkjemaStateSchemaValidatedArbeidsgiverInitiert =
  z.object({
    kontaktperson: z.object({
      navn: z.string(),
      telefonnummer: z.string(),
    }),
    refusjon: z.array(
      z.object({
        fom: z.string().optional(),
        beløp: beløpSchema,
      }),
    ),
    skalRefunderes: z.union([
      z.literal("JA_LIK_REFUSJON"),
      z.literal("JA_VARIERENDE_REFUSJON"),
      z.literal("NEI"),
    ]),
    opprettetTidspunkt: z.string().optional(),
    id: z.number().optional(),
  });

export type InntektsmeldingSkjemaStateValidArbeidsgiverInitiert = z.infer<
  typeof InntektsmeldingSkjemaStateSchemaValidatedArbeidsgiverInitiert
>;

/**
 * En strengere skjema state. Her er alle verdiene validert mot skjema-logikken.
 */
export const InntektsmeldingSkjemaStateSchemaValidated =
  InntektsmeldingSkjemaStateSchemaValidatedArbeidsgiverInitiert.extend({
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
    // TODO: Disse burde flyttes til en egen schema for eksisterende inntektsmeldinger
  });

export type InntektsmeldingSkjemaState = z.infer<
  typeof InntektsmeldingSkjemaStateSchema
>;

export type InntektsmeldingSkjemaStateValid = z.infer<
  typeof InntektsmeldingSkjemaStateSchemaValidated
>;
