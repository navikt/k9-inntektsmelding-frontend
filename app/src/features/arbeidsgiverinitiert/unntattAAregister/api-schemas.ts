import { z } from "zod";

import {
  endringAvInntektDtoSchema,
  kontaktpersonDtoSchema,
  naturalytelsePerioderDtoSchema,
  OmsorgspengerRequestDtoSchema,
  refusjonDtoSchema,
  YtelsetypeSchema,
} from "~/types/api-schemas.ts";

export const SendInntektsmeldingRequestDtoUregistrertSchema = z.object({
  aktorId: z.string(),
  ytelse: YtelsetypeSchema,
  arbeidsgiverIdent: z.string(),
  kontaktperson: kontaktpersonDtoSchema,
  refusjon: refusjonDtoSchema,
  startdato: z.string(),
  foresporselUuid: z.string().optional(),
  inntekt: z.number(),
  endringAvInntektÅrsaker: endringAvInntektDtoSchema,
  bortfaltNaturalytelsePerioder: naturalytelsePerioderDtoSchema,
  omsorgspenger: OmsorgspengerRequestDtoSchema.optional(),
});

export type SendInntektsmeldingRequestDtoUregistrert = z.infer<
  typeof SendInntektsmeldingRequestDtoUregistrertSchema
>;

export const InntektsmeldingResponseDtoUregistrertSchema = z.object({
  aktorId: z.string(),
  ytelse: YtelsetypeSchema,
  arbeidsgiverIdent: z.string(),
  kontaktperson: kontaktpersonDtoSchema,
  refusjon: refusjonDtoSchema,
  startdato: z.string(),
  foresporselUuid: z.string().optional(),
  inntekt: z.number(),
  endringAvInntektÅrsaker: endringAvInntektDtoSchema,
  bortfaltNaturalytelsePerioder: naturalytelsePerioderDtoSchema,
  omsorgspenger: OmsorgspengerRequestDtoSchema.optional(),
  opprettetTidspunkt: z.string(),
  id: z.number(),
});

export type SendInntektsmeldingResponseDtoUregistrert = z.infer<
  typeof InntektsmeldingResponseDtoUregistrertSchema
>;
