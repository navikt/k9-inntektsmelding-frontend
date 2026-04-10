import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

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
  const { eksisterendeInntektsmeldinger } = getRouteApi("/$id").useLoaderData();
  const { inntektsmeldingSkjemaState, setInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjema();

  useEffect(() => {
    setInntektsmeldingSkjemaState((prev) => ({
      ...prev,
      besøkteSteg: prev.besøkteSteg?.includes(2)
        ? prev.besøkteSteg
        : [...(prev.besøkteSteg ?? []), 2],
    }));
  }, []);

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
      eksisterendeInntektsmeldinger={eksisterendeInntektsmeldinger}
      inntektsmeldingSkjemaState={inntektsmeldingSkjemaState}
      onSubmit={onSubmit}
    />
  );
};
