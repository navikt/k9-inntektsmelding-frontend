import { z } from "zod";

import {
  InntektsmeldingSkjemaStateSchema,
  InntektsmeldingSkjemaStateSchemaValidated,
} from "~/features/inntektsmelding/zodSchemas";

// Før vi er i oppsummeringssteget
export const InntektsmeldingSkjemaStateSchemaUnntattAaregister =
  InntektsmeldingSkjemaStateSchema.extend({
    id: z.number().optional(),
    opprettetTidspunkt: z.string().optional(),
  });

// Klar for innsending til backend. Når vi er i oppsummeringssteget, eller tidligere innsendt skjema.
export const AGIValidatedInntektsmeldingUnntattAaregister =
  InntektsmeldingSkjemaStateSchemaValidated.extend({
    id: z.number().optional(),
    opprettetTidspunkt: z.string().optional(),
  });

export type InntektsmeldingSkjemaStateAGIUnntattAaregister = z.infer<
  typeof InntektsmeldingSkjemaStateSchemaUnntattAaregister
>;

export type InntektsmeldingSkjemaStateValidAGIUnntattAaregister = z.infer<
  typeof AGIValidatedInntektsmeldingUnntattAaregister
>;
