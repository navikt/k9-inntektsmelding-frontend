import { getRouteApi, useNavigate } from "@tanstack/react-router";

import { InntektsmeldingSkjemaState } from "~/features/inntektsmelding/zodSchemas";

import { DineOpplysninger } from "../../shared/skjema-moduler/steg/DineOpplysninger";
import { useInntektsmeldingSkjema } from "../SkjemaStateContext";

export const Steg1DineOpplysninger = () => {
  const { inntektsmeldingSkjemaState, setInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjema();
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
