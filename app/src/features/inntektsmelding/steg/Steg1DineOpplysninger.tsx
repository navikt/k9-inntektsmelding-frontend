import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { InntektsmeldingSkjemaState } from "~/features/inntektsmelding/zodSchemas";

import { DineOpplysninger } from "../../shared/skjema-moduler/steg/DineOpplysninger";
import { useInntektsmeldingSkjema } from "../SkjemaStateContext";

export const Steg1DineOpplysninger = () => {
  const { inntektsmeldingSkjemaState, setInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjema();

  useEffect(() => {
    setInntektsmeldingSkjemaState((prev) => ({
      ...prev,
      besøkteSteg: prev.besøkteSteg?.includes(1)
        ? prev.besøkteSteg
        : [...(prev.besøkteSteg ?? []), 1],
    }));
  }, []);
  const navigate = useNavigate();
  const { eksisterendeInntektsmeldinger } = getRouteApi("/$id").useLoaderData();
  const handleSubmit = (
    kontaktperson: InntektsmeldingSkjemaState["kontaktperson"],
  ) => {
    setInntektsmeldingSkjemaState((prev: InntektsmeldingSkjemaState) => ({
      ...prev,
      kontaktperson,
    }));
    navigate({
      from: "/$id/dine-opplysninger",
      to: "../inntekt-og-refusjon",
    });
  };

  return (
    <DineOpplysninger
      eksisterendeInntektsmeldinger={eksisterendeInntektsmeldinger}
      inntektsmeldingSkjemaState={inntektsmeldingSkjemaState}
      onSubmit={handleSubmit}
    />
  );
};
