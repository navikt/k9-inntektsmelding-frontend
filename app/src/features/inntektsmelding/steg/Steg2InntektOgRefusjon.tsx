import { useNavigate } from "@tanstack/react-router";

import { useOpplysninger } from "~/features/shared/hooks/useOpplysninger";
import { formatYtelsesnavn } from "~/utils";

import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle";
import { useScrollToTopOnMount } from "../../shared/hooks/useScrollToTopOnMount";
import {
  InntektOgRefusjon,
  InntektOgRefusjonForm,
} from "../../shared/skjema-moduler/steg/InntektOgRefusjon/InntektOgRefusjon";
import { useInntektsmeldingSkjema } from "../SkjemaStateContext";

export const Steg2InntektOgRefusjon = () => {
  useScrollToTopOnMount();
  const opplysninger = useOpplysninger();
  useDocumentTitle(
    `Inntekt og refusjon – inntektsmelding for ${formatYtelsesnavn(opplysninger.ytelse)}`,
  );

  const { inntektsmeldingSkjemaState, setInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjema();

  const navigate = useNavigate();

  const onSubmit = (skjemadata: InntektOgRefusjonForm) => {
    const { refusjon, skalRefunderes, inntekt, korrigertInntekt } = skjemadata;

    const misterNaturalytelser = skjemadata.misterNaturalytelser === "ja";
    const bortfaltNaturalytelsePerioder = misterNaturalytelser
      ? skjemadata.bortfaltNaturalytelsePerioder.map((naturalYtelse) => ({
          ...naturalYtelse,
          inkluderTom: naturalYtelse.inkluderTom === "ja",
        }))
      : [];
    const endringAvInntektÅrsaker = korrigertInntekt
      ? skjemadata.endringAvInntektÅrsaker
      : [];

    setInntektsmeldingSkjemaState((prev) => ({
      ...prev,
      inntekt,
      korrigertInntekt,
      endringAvInntektÅrsaker,
      refusjon,
      skalRefunderes,
      misterNaturalytelser,
      bortfaltNaturalytelsePerioder,
    }));
    navigate({
      from: "/$id/inntekt-og-refusjon",
      to: "../oppsummering",
    });
  };

  return (
    <InntektOgRefusjon
      inntektsmeldingSkjemaState={inntektsmeldingSkjemaState}
      onSubmit={onSubmit}
    />
  );
};
