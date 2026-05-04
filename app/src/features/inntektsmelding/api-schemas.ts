import { z } from "zod";

import {
  endringAvInntektDtoSchema,
  kontaktpersonDtoSchema,
  naturalytelsePerioderDtoSchema,
  OmsorgspengerRequestDtoSchema,
  refusjonDtoSchema,
  YtelsetypeSchema,
} from "~/types/api-schemas.ts";

export const SendInntektsmeldingRequestDtoSchema = z.object({
  aktorId: z.string(),
  ytelse: YtelsetypeSchema,
  arbeidsgiverIdent: z.string(),
  kontaktperson: kontaktpersonDtoSchema,
  refusjon: refusjonDtoSchema,
  startdato: z.string(),
  foresporselUuid: z.string(),
  inntekt: z.number(),
  endringAvInntektÅrsaker: endringAvInntektDtoSchema,
  bortfaltNaturalytelsePerioder: naturalytelsePerioderDtoSchema,
});

export type SendInntektsmeldingRequestDto = z.infer<
  typeof SendInntektsmeldingRequestDtoSchema
>;

export const InntektsmeldingResponseDtoSchema = z.object({
  aktorId: z.string(),
  ytelse: YtelsetypeSchema,
  arbeidsgiverIdent: z.string(),
  kontaktperson: kontaktpersonDtoSchema,
  refusjon: refusjonDtoSchema,
  startdato: z.string(),
  foresporselUuid: z.string(),
  inntekt: z.number(),
  endringAvInntektÅrsaker: endringAvInntektDtoSchema,
  bortfaltNaturalytelsePerioder: naturalytelsePerioderDtoSchema,
  omsorgspenger: OmsorgspengerRequestDtoSchema.optional(),
  opprettetTidspunkt: z.string(),
  id: z.number(),
});

export type SendInntektsmeldingResponseDto = z.infer<
  typeof InntektsmeldingResponseDtoSchema
>;
