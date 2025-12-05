import { DefaultValues } from "react-hook-form";

import { InntektsmeldingSkjemaState } from "~/features/inntektsmelding/zodSchemas";
import { ENDRINGSÅRSAK_TEMPLATE } from "~/features/shared/skjema-moduler/Inntekt";
import { OpplysningerDto } from "~/types/api-models";

import { NATURALYTELSE_SOM_MISTES_TEMPLATE } from "../../Naturalytelser";
import { InntektOgRefusjonForm } from "./InntektOgRefusjon";

function konverterTilRadioValg(verdi: boolean | undefined) {
  return verdi === undefined ? undefined : verdi ? "ja" : "nei";
}

export const defaultValues = (
  inntektsmeldingSkjemaState: InntektsmeldingSkjemaState,
  opplysninger: OpplysningerDto,
) => {
  const defaultInntekt =
    inntektsmeldingSkjemaState.inntekt ||
    opplysninger.inntektsopplysninger.gjennomsnittLønn;

  return {
    inntekt: defaultInntekt,
    korrigertInntekt:
      inntektsmeldingSkjemaState.korrigertInntekt ??
      (inntektsmeldingSkjemaState.endringAvInntektÅrsaker.length > 0
        ? inntektsmeldingSkjemaState.inntekt
        : undefined),
    endringAvInntektÅrsaker:
      inntektsmeldingSkjemaState.endringAvInntektÅrsaker.length === 0
        ? [ENDRINGSÅRSAK_TEMPLATE]
        : inntektsmeldingSkjemaState.endringAvInntektÅrsaker,
    skalRefunderes: inntektsmeldingSkjemaState.skalRefunderes,
    misterNaturalytelser: konverterTilRadioValg(
      inntektsmeldingSkjemaState.misterNaturalytelser,
    ),
    bortfaltNaturalytelsePerioder:
      inntektsmeldingSkjemaState.bortfaltNaturalytelsePerioder.length === 0
        ? [NATURALYTELSE_SOM_MISTES_TEMPLATE]
        : inntektsmeldingSkjemaState.bortfaltNaturalytelsePerioder.map(
            (naturalYtelse) => ({
              ...naturalYtelse,
              inkluderTom: konverterTilRadioValg(naturalYtelse.inkluderTom),
            }),
          ),
    refusjon:
      inntektsmeldingSkjemaState.refusjon.length === 0
        ? [
            { fom: opplysninger.førsteUttaksdato, beløp: defaultInntekt },
            { fom: undefined, beløp: 0 },
          ]
        : inntektsmeldingSkjemaState.refusjon.length === 1
          ? [
              ...inntektsmeldingSkjemaState.refusjon,
              { fom: undefined, beløp: 0 },
            ]
          : inntektsmeldingSkjemaState.refusjon,
  } satisfies DefaultValues<InntektOgRefusjonForm>;
};
