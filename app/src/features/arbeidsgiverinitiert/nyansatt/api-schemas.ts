import { z } from "zod";

import {
  kontaktpersonDtoSchema,
  refusjonDtoSchema,
  YtelsetypeSchema,
} from "~/types/api-schemas.ts";

export const SendInntektsmeldingRequestDtoSchemaArbeidsgiverInitiert = z.object(
  {
    aktorId: z.string(),
    ytelse: YtelsetypeSchema,
    arbeidsgiverIdent: z.string(),
    kontaktperson: kontaktpersonDtoSchema,
    refusjon: refusjonDtoSchema,
    startdato: z.string(),
    foresporselUuid: z.string().optional(),
  },
);

export type SendInntektsmeldingRequestDtoSchemaArbeidsgiverInitiertType =
  z.infer<typeof SendInntektsmeldingRequestDtoSchemaArbeidsgiverInitiert>;
