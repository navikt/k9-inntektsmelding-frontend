import { z } from "zod";

import { formatNavn } from "~/utils.ts";

export const YtelsetypeSchema = z.enum([
  "PLEIEPENGER_SYKT_BARN",
  "PLEIEPENGER_I_LIVETS_SLUTTFASE",
  "OPPLÆRINGSPENGER",
  "OMSORGSPENGER",
]);

export type Ytelsetype = z.infer<typeof YtelsetypeSchema>;

export const NaturalytelseTypeSchema = z.enum([
  "ELEKTRISK_KOMMUNIKASJON",
  "AKSJER_GRUNNFONDSBEVIS_TIL_UNDERKURS",
  "LOSJI",
  "KOST_DOEGN",
  "BESØKSREISER_HJEMMET_ANNET",
  "KOSTBESPARELSE_I_HJEMMET",
  "RENTEFORDEL_LÅN",
  "BIL",
  "KOST_DAGER",
  "BOLIG",
  "SKATTEPLIKTIG_DEL_FORSIKRINGER",
  "FRI_TRANSPORT",
  "OPSJONER",
  "TILSKUDD_BARNEHAGEPLASS",
  "ANNET",
  "BEDRIFTSBARNEHAGEPLASS",
  "YRKEBIL_TJENESTLIGBEHOV_KILOMETER",
  "YRKEBIL_TJENESTLIGBEHOV_LISTEPRIS",
  "INNBETALING_TIL_UTENLANDSK_PENSJONSORDNING",
]);

export const EndringAvInntektÅrsakerSchema = z.enum([
  "PERMITTERING",
  "NY_STILLING",
  "NY_STILLINGSPROSENT",
  "SYKEFRAVÆR",
  "BONUS",
  "FERIETREKK_ELLER_UTBETALING_AV_FERIEPENGER",
  "NYANSATT",
  "MANGELFULL_RAPPORTERING_AORDNING",
  "INNTEKT_IKKE_RAPPORTERT_ENDA_AORDNING",
  "TARIFFENDRING",
  "FERIE",
  "VARIG_LØNNSENDRING",
  "PERMISJON",
]);

export type EndringAvInntektÅrsaker = z.infer<
  typeof EndringAvInntektÅrsakerSchema
>;
export type Naturalytelsetype = z.infer<typeof NaturalytelseTypeSchema>;

export const SlåOppArbeidstakerResponseDtoSchema = z.object({
  fornavn: z.string(),
  mellomnavn: z.string().optional(),
  etternavn: z.string(),
  arbeidsforhold: z.array(
    z.object({
      organisasjonsnavn: z.string(),
      organisasjonsnummer: z.string(),
    }),
  ),
  kjønn: z.enum(["MANN", "KVINNE", "UKJENT"]),
});
export type SlåOppArbeidstakerResponseDto = z.infer<
  typeof SlåOppArbeidstakerResponseDtoSchema
>;

export const SendInntektsmeldingRequestDtoSchemaArbeidsgiverInitiert = z.object(
  {
    aktorId: z.string(),
    ytelse: YtelsetypeSchema,
    arbeidsgiverIdent: z.string(),
    kontaktperson: z.object({
      telefonnummer: z.string(),
      navn: z.string(),
    }),
    refusjon: z.array(
      z.object({
        fom: z.string().optional(),
        beløp: z.number(),
      }),
    ),
    startdato: z.string(),
    foresporselUuid: z.string().optional(),
  },
);

export type SendInntektsmeldingRequestDtoSchemaArbeidsgiverInitiertType =
  z.infer<typeof SendInntektsmeldingRequestDtoSchemaArbeidsgiverInitiert>;

export const SendInntektsmeldingRequestDtoSchema =
  SendInntektsmeldingRequestDtoSchemaArbeidsgiverInitiert.extend({
    foresporselUuid: z.string(),
    inntekt: z.number(),
    endringAvInntektÅrsaker: z
      .array(
        z.object({
          årsak: EndringAvInntektÅrsakerSchema,
          fom: z.string().optional(),
          tom: z.string().optional(),
          bleKjentFom: z.string().optional(),
        }),
      )
      .optional(), //TODO: midlertidig optional
    bortfaltNaturalytelsePerioder: z
      .array(
        z.object({
          fom: z.string(),
          tom: z.string().optional(),
          beløp: z.number(),
          naturalytelsetype: NaturalytelseTypeSchema,
        }),
      )
      .optional(), // TODO: Når databasen er wipet, kan vi fjerne optional her.
  });

export const InntektsmeldingResponseDtoSchema =
  SendInntektsmeldingRequestDtoSchema.extend({
    opprettetTidspunkt: z.string(),
    id: z.number(),
  });

export type SendInntektsmeldingResponseDto = z.infer<
  typeof InntektsmeldingResponseDtoSchema
>;

export type SendInntektsmeldingRequestDto = z.infer<
  typeof SendInntektsmeldingRequestDtoSchema
>;

export const opplysningerSchema = z.object({
  forespørselUuid: z.string().optional(),
  person: z.object({
    aktørId: z.string(),
    fødselsnummer: z.string(),
    fornavn: z.string().transform(formatNavn),
    mellomnavn: z
      .string()
      .transform((mellomnavn) => formatNavn(mellomnavn || ""))
      .optional(),
    etternavn: z.string().transform(formatNavn),
  }),
  innsender: z.object({
    fornavn: z.string(),
    mellomnavn: z.string().optional(),
    etternavn: z.string(),
    telefon: z.string().optional(),
  }),
  arbeidsgiver: z.object({
    organisasjonNavn: z.string(),
    organisasjonNummer: z.string(),
  }),
  inntektsopplysninger: z.object({
    gjennomsnittLønn: z.number().optional(),
    månedsinntekter: z.array(
      z.object({
        fom: z.string(),
        tom: z.string(),
        beløp: z.number().optional(),
        status: z.enum([
          "NEDETID_AINNTEKT",
          "BRUKT_I_GJENNOMSNITT",
          "IKKE_RAPPORTERT_MEN_BRUKT_I_GJENNOMSNITT",
          "IKKE_RAPPORTERT_RAPPORTERINGSFRIST_IKKE_PASSERT",
        ]),
      }),
    ),
  }),
  forespørselStatus: z.enum(["UNDER_BEHANDLING", "FERDIG", "UTGÅTT"]),
  forespørselType: z.enum([
    "BESTILT_AV_FAGSYSTEM",
    "ARBEIDSGIVERINITIERT_NYANSATT",
    "ARBEIDSGIVERINITIERT_UREGISTRERT",
    "OMSORGSPENGER_REFUSJON",
  ]),
  skjæringstidspunkt: z.string(),
  førsteUttaksdato: z.string(),
  ytelse: z.enum([
    "PLEIEPENGER_SYKT_BARN",
    "PLEIEPENGER_I_LIVETS_SLUTTFASE",
    "OPPLÆRINGSPENGER",
    "OMSORGSPENGER",
  ]),
  etterspurtePerioder: z
    .array(
      z.object({
        fom: z.string(),
        tom: z.string(),
      }),
    )
    .optional(),
});

export type OpplysningerDto = z.infer<typeof opplysningerSchema>;

export const grunnbeløpSchema = z.object({
  dato: z.string(),
  grunnbeløp: z.number(),
  grunnbeløpPerMåned: z.number(),
  gjennomsnittPerÅr: z.number(),
  omregningsfaktor: z.number(),
  virkningstidspunktForMinsteinntekt: z.string(),
});

export const feilmeldingSchema = z.object({
  callId: z.string().optional().nullable(),
  feilmelding: z.string().optional().nullable(),
  type: z.enum([
    "INGEN_SAK_FUNNET",
    "GENERELL_FEIL",
    "TOMT_RESULTAT_FEIL",
    "MANGLER_TILGANG_FEIL",
    "SENDT_FOR_TIDLIG",
  ]),
});

export const organisasjonsnummerSchema = z
  .string()
  .regex(/^\d+$/, "Må være tall")
  .refine((val) => {
    const num = Number(val);
    return num >= 100_000_000 && num <= 999_999_999;
  }, "Ugyldig organisasjonsnummer");

export const OpplysningerRequestSchema = z.object({
  fødselsnummer: z.string(),
  ytelseType: YtelsetypeSchema,
  førsteFraværsdag: z.string(),
  organisasjonsnummer: z.string(),
});

export type OpplysningerRequest = z.infer<typeof OpplysningerRequestSchema>;
