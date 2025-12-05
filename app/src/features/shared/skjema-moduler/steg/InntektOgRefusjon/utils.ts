import { InntektsmeldingSkjemaStateValidAGIUnntattAaregister } from "~/features/arbeidsgiverinitiert/unntattAAregister/zodSchemas";
import { InntektsmeldingSkjemaStateValid } from "~/features/inntektsmelding/zodSchemas";
import {
  OpplysningerDto,
  SendInntektsmeldingRequestDto,
} from "~/types/api-models";
import { formatStrengTilTall } from "~/utils";

export function lagSendInntektsmeldingRequest(
  id: string,
  skjemaState:
    | InntektsmeldingSkjemaStateValid
    | InntektsmeldingSkjemaStateValidAGIUnntattAaregister,
  opplysninger: OpplysningerDto,
) {
  const gjeldendeInntekt = skjemaState.korrigertInntekt ?? skjemaState.inntekt;

  const refusjon =
    skjemaState.skalRefunderes === "JA_LIK_REFUSJON"
      ? skjemaState.refusjon.slice(0, 1)
      : skjemaState.skalRefunderes === "JA_VARIERENDE_REFUSJON"
        ? skjemaState.refusjon
        : [];

  const endringAvInntektÅrsaker = skjemaState.endringAvInntektÅrsaker.map(
    (endring) => ({
      årsak: endring.årsak,
      fom: endring.fom,
      tom: endring.ignorerTom ? undefined : endring.tom,
      bleKjentFom: endring.bleKjentFom,
    }),
  );

  return {
    foresporselUuid: id,
    aktorId: opplysninger.person.aktørId,
    ytelse: opplysninger.ytelse,
    arbeidsgiverIdent: opplysninger.arbeidsgiver.organisasjonNummer,
    kontaktperson: skjemaState.kontaktperson,
    startdato: opplysninger.førsteUttaksdato,
    inntekt: formatStrengTilTall(gjeldendeInntekt),
    refusjon:
      opplysninger.ytelse === "OMSORGSPENGER"
        ? []
        : refusjon.map((r) => ({
            ...r,
            beløp: formatStrengTilTall(r.beløp),
          })),
    bortfaltNaturalytelsePerioder: konverterNaturalytelsePerioder(
      skjemaState.bortfaltNaturalytelsePerioder,
    ),
    endringAvInntektÅrsaker,
  } satisfies SendInntektsmeldingRequestDto;
}

function konverterNaturalytelsePerioder(
  naturalytelsePerioder: InntektsmeldingSkjemaStateValidAGIUnntattAaregister["bortfaltNaturalytelsePerioder"],
): SendInntektsmeldingRequestDto["bortfaltNaturalytelsePerioder"] {
  return naturalytelsePerioder.map((periode) => ({
    naturalytelsetype: periode.navn,
    fom: periode.fom,
    beløp: formatStrengTilTall(periode.beløp),
    tom: periode.tom,
  }));
}
