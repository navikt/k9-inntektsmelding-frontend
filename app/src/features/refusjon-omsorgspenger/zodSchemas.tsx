import { idnr } from "@navikt/fnrvalidator";
import { isBefore } from "date-fns";
import { z } from "zod";

import { PÅKREVDE_ENDRINGSÅRSAK_FELTER } from "~/features/shared/skjema-moduler/Inntekt";
import { EndringAvInntektÅrsakerSchema } from "~/types/api-models";
import { beløpSchema, formatDatoKort } from "~/utils";
import { perioderOverlapper } from "~/utils/date-utils";
import { validateInntekt, validateTimer } from "~/validators";

import {
  datoErInnenforGyldigDatoIntervall,
  hasFullDayAbsenceInRange,
  hasPartialDayAbsenceInRange,
} from "./utils";

// Create a single unified form schema
const baseSchema = z.object({
  meta: z.object({
    step: z.number().min(1).max(5),
    skalKorrigereInntekt: z.boolean(),
    harSendtSøknad: z.boolean(),
  }),
  // Steg 1 fields
  harUtbetaltLønn: z.preprocess((val) => val || "", z.string()),
  årForRefusjon: z.preprocess((val) => val || "", z.string()),

  // Steg 2 fields
  kontaktperson: z.object({
    navn: z.string(),
    telefonnummer: z.string(),
  }),
  ansattesFødselsnummer: z.string().optional(),
  ansattesFornavn: z.string().optional(),
  ansattesEtternavn: z.string().optional(),
  ansattesAktørId: z.string().optional(),
  organisasjonsnummer: z.string().optional(),

  // Steg 3 fields
  harDekket10FørsteOmsorgsdager: z.preprocess((val) => val || "", z.string()),
  fraværHeleDager: z.array(
    z.object({
      fom: z.string(),
      tom: z.string(),
    }),
  ),
  fraværDelerAvDagen: z.array(
    z.object({
      dato: z.string(),
      timer: z.preprocess((val) => String(val) || "", z.string()),
    }),
  ),
  dagerSomSkalTrekkes: z.array(
    z.object({
      fom: z.string(),
      tom: z.string(),
    }),
  ),

  // Steg 4 fields
  inntekt: beløpSchema.optional(),
  korrigertInntekt: beløpSchema.optional(),
  endringAvInntektÅrsaker: z
    .array(
      z.object({
        årsak: EndringAvInntektÅrsakerSchema.or(z.literal("")),
        fom: z.string().optional(),
        tom: z.string().optional(),
        bleKjentFom: z.string().optional(),
        ignorerTom: z.boolean().optional(),
      }),
    )
    .optional(),
});

export const RefusjonOmsorgspengerSchema = baseSchema.extend({
  meta: z.object({
    step: z.number().min(1).max(5),
    skalKorrigereInntekt: z.boolean(),
    startdato: z.string().optional(),
    innsendtSøknadId: z.number().optional(),
    opprettetTidspunkt: z.string().optional(),
  }),
});

export const RefusjonOmsorgspengerSchemaMedValidering =
  RefusjonOmsorgspengerSchema.superRefine((data, ctx) => {
    // Validations for Step 1
    if (data.meta.step === 1 || data.meta.step === 5) {
      if (!data.harUtbetaltLønn) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Du må svare på om dere har utbetalt lønn under fraværet",
          path: ["harUtbetaltLønn"],
        });
      }
      if (!data.årForRefusjon) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Du må svare på hvilket år du søker refusjon for",
          path: ["årForRefusjon"],
        });
      }
    }

    // Validations for Step 2
    if (data.meta.step === 2 || data.meta.step === 5) {
      if (!data.kontaktperson?.navn) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Du må oppgi navn på kontaktperson",
          path: ["kontaktperson", "navn"],
        });
      }
      if (!data.kontaktperson?.telefonnummer) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Du må oppgi et telefonnummer for kontaktpersonen",
          path: ["kontaktperson", "telefonnummer"],
        });
      }
      if (!/^(\d{8}|\+\d+)$/.test(data.kontaktperson.telefonnummer)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Telefonnummer må være 8 siffer, eller 10 siffer med landkode",
          path: ["kontaktperson", "telefonnummer"],
        });
      }
      if (!data.ansattesFødselsnummer) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Du må oppgi fødselsnummer eller d-nummer for den ansatte",
          path: ["ansattesFødselsnummer"],
        });
      }
      if (data.ansattesFødselsnummer) {
        const validationResult = idnr(data.ansattesFødselsnummer);
        const ugyldig = validationResult.status !== "valid";

        if (ugyldig) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Fødselsnummer eller d-nummer er ikke gyldig",
            path: ["ansattesFødselsnummer"],
          });
        }
      }
      if (!data.organisasjonsnummer) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Du må oppgi et organisasjonsnummer",
          path: ["organisasjonsnummer"],
        });
      }
    }

    // Validations for Step 3
    if (data.meta.step === 3 || data.meta.step === 5) {
      if (!data.harDekket10FørsteOmsorgsdager) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Du må svare på om dere har dekket 10 første omsorgsdager",
          path: ["harDekket10FørsteOmsorgsdager"],
        });
      }

      const hasHeleDager = data.fraværHeleDager.length > 0;
      const hasDelerAvDagen = data.fraværDelerAvDagen.length > 0;
      const hasDagerSomSkalTrekkes = data.dagerSomSkalTrekkes.length > 0;

      if (!hasHeleDager && !hasDelerAvDagen && !hasDagerSomSkalTrekkes) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Du må oppgi fravær enten som hele dager, deler av dager eller dager som skal trekkes",
          path: ["fraværHeleDager"],
        });
      }

      // Validate each item in fraværHeleDager array
      for (const [index, periode] of data.fraværHeleDager.entries()) {
        if (!periode.fom) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Du må oppgi en fra og med dato",
            path: ["fraværHeleDager", index, "fom"],
          });
        }
        if (!periode.tom) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Du må oppgi en til og med dato",
            path: ["fraværHeleDager", index, "tom"],
          });
        }
        if (
          periode.fom &&
          !datoErInnenforGyldigDatoIntervall(
            periode.fom,
            Number(data.årForRefusjon),
          )
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              Number(data.årForRefusjon) === new Date().getFullYear()
                ? `Fraværet må være mellom ${data.årForRefusjon}.01.01 og ${formatDatoKort(new Date())}`
                : `Fraværet må være mellom ${data.årForRefusjon}.01.01 og ${data.årForRefusjon}.12.31`,
            path: ["fraværHeleDager", index, "fom"],
          });
        }
        if (
          periode.tom &&
          !datoErInnenforGyldigDatoIntervall(
            periode.tom,
            Number(data.årForRefusjon),
          )
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              Number(data.årForRefusjon) === new Date().getFullYear()
                ? `Fraværet må være mellom ${data.årForRefusjon}.01.01 og ${formatDatoKort(new Date())}`
                : `Fraværet må være mellom ${data.årForRefusjon}.01.01 og ${data.årForRefusjon}.12.31`,
            path: ["fraværHeleDager", index, "tom"],
          });
        }
        if (
          data.harDekket10FørsteOmsorgsdager === "ja" &&
          hasFullDayAbsenceInRange(
            [periode],
            new Date(`${data.årForRefusjon}-01-01`),
            new Date(`${data.årForRefusjon}-01-10`),
          )
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Du oppgir å ha dekket 10 omsorgsdager i år, samtidig som du ber om refusjon for fravær innenfor de 10 første dagene av året",
            path: ["fraværHeleDager", index, "fom"],
          });
        }
      }

      // Validate each item in fraværDelerAvDagen array
      for (const [index, dag] of data.fraværDelerAvDagen.entries()) {
        if (!dag.dato) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Du må oppgi en dato",
            path: ["fraværDelerAvDagen", index, "dato"],
          });
        }
        if (dag.dato) {
          // Fravær deler av dag må ikke overlappe med fravær hele dager
          const overlap = perioderOverlapper(
            [{ fom: dag.dato, tom: dag.dato }],
            data.fraværHeleDager,
          );
          if (overlap) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                "Fravær deler av dag må ikke overlappe med fravær hele dager",
              path: ["fraværDelerAvDagen", index, "dato"],
            });
          }
          if (
            data.harDekket10FørsteOmsorgsdager === "ja" &&
            hasPartialDayAbsenceInRange(
              [dag],
              new Date(`${data.årForRefusjon}-01-01`),
              new Date(`${data.årForRefusjon}-01-10`),
            )
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                "Du oppgir å ha dekket 10 omsorgsdager i år, samtidig som du ber om refusjon for fravær innenfor de 10 første dagene av året",
              path: ["fraværDelerAvDagen", index, "dato"],
            });
          }
        }
        if (dag.timer) {
          const feilmelding = validateTimer(dag.timer);
          if (typeof feilmelding === "string") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: feilmelding,
              path: ["fraværDelerAvDagen", index, "timer"],
            });
          }
          // kun to desimaler
          if (dag.timer.split(".")?.[1]?.length > 2) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Timer kan ikke ha mer enn 2 desimaler",
              path: ["fraværDelerAvDagen", index, "timer"],
            });
          }
        } else {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Du må oppgi antall timer",
            path: ["fraværDelerAvDagen", index, "timer"],
          });
        }
        if (
          !datoErInnenforGyldigDatoIntervall(
            dag.dato,
            Number(data.årForRefusjon),
          )
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              Number(data.årForRefusjon) === new Date().getFullYear()
                ? `Fraværet må være mellom ${data.årForRefusjon}.01.01 og ${formatDatoKort(new Date())}`
                : `Fraværet må være mellom ${data.årForRefusjon}.01.01 og ${data.årForRefusjon}.12.31`,
            path: ["fraværDelerAvDagen", index, "dato"],
          });
        }
      }
      // Validate each item in dagerSomSkalTrekkes array
      for (const [index, dag] of data.dagerSomSkalTrekkes.entries()) {
        if (!dag.fom) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Du må oppgi en fra og med dato",
            path: ["dagerSomSkalTrekkes", index, "fom"],
          });
        }
        if (!dag.tom) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Du må oppgi en til og med dato",
            path: ["dagerSomSkalTrekkes", index, "tom"],
          });
        }
        if (
          dag.fom &&
          dag.tom &&
          isBefore(new Date(dag.tom), new Date(dag.fom))
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Fra og med dato må være før til og med dato",
            path: ["dagerSomSkalTrekkes", index, "fom"],
          });
        }
        // kan ikke overlappe med fravær hele dager
        const overlap = perioderOverlapper(data.fraværHeleDager, [
          { fom: dag.fom, tom: dag.tom },
        ]);

        if (overlap) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Dagene kan ikke overlappe med fravær hele dager",
            path: ["dagerSomSkalTrekkes", index, "fom"],
          });
        }
        // kan ikke overlappe med fravær deler av dag
        const overlapDelerAvDag = data.fraværDelerAvDagen.some((v) => {
          return perioderOverlapper(
            [{ fom: v.dato, tom: v.dato }],
            [{ fom: dag.fom, tom: dag.tom }],
          );
        });
        if (overlapDelerAvDag) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Dagene kan ikke overlappe med fravær deler av dag",
            path: ["dagerSomSkalTrekkes", index, "fom"],
          });
        }
      }
    }

    // Validations for Step 4
    if (data.meta.step === 4 || data.meta.step === 5) {
      if (!data.meta.skalKorrigereInntekt && !data.inntekt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Månedsinntekten er satt til kr 0. Dersom dere har utbetalt lønn og krever refusjon må månedsinntekten være større en kr 0.",
          path: ["inntekt"],
        });
      }
      if (
        data.meta.skalKorrigereInntekt &&
        (!data.korrigertInntekt || Number(data.korrigertInntekt) <= 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Månedsinntekten er satt til kr 0. Dersom dere har utbetalt lønn og krever refusjon må månedsinntekten være større en kr 0.",
          path: ["inntekt"],
        });
      }
      if (data.korrigertInntekt) {
        const feilmelding = validateInntekt(data.korrigertInntekt, 0);
        if (typeof feilmelding === "string") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: feilmelding,
            path: ["korrigertInntekt"],
          });
        }
        if (data.endringAvInntektÅrsaker) {
          for (const [index, årsak] of data.endringAvInntektÅrsaker.entries()) {
            if (årsak.årsak) {
              // Validate required fields based on the selected årsak
              const endringsårsakRules =
                PÅKREVDE_ENDRINGSÅRSAK_FELTER[årsak.årsak];

              if (endringsårsakRules.fom && !årsak.fom) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Du må oppgi fra og med dato",
                  path: ["endringAvInntektÅrsaker", index, "fom"],
                });
              }

              if (
                årsak.tom &&
                årsak.fom &&
                isBefore(new Date(årsak.tom), new Date(årsak.fom))
              ) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Fra og med dato må være før til og med dato",
                  path: ["endringAvInntektÅrsaker", index, "fom"],
                });
              }

              if (
                endringsårsakRules.tom &&
                !årsak.tom &&
                (!endringsårsakRules.tomErValgfritt ||
                  (endringsårsakRules.tomErValgfritt && !årsak.ignorerTom))
              ) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Du må oppgi til og med dato",
                  path: ["endringAvInntektÅrsaker", index, "tom"],
                });
              }
            } else {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Du må oppgi en endringsårsak",
                path: ["endringAvInntektÅrsaker", index, "årsak"],
              });
            }
          }
        } else {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Du må oppgi endringsårsak",
            path: ["endringAvInntektÅrsaker"],
          });
        }
      }
    }
  });

// Define form data type based on the schema
export type RefusjonOmsorgspengerFormData = z.infer<
  typeof RefusjonOmsorgspengerSchemaMedValidering
>;
