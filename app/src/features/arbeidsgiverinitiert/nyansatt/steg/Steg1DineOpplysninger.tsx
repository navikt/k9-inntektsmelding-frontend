import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { ARBEIDSGIVERINITERT_NYANSATT_ID } from "~/routes/opprett";

import { useOpplysninger } from "../../../shared/hooks/useOpplysninger.tsx";
import { DineOpplysninger } from "../../../shared/skjema-moduler/steg/DineOpplysninger.tsx";
import { useInntektsmeldingSkjemaAGINyansatt } from "../SkjemaStateContext.tsx";
import { InntektsmeldingSkjemaStateAGINyansatt } from "../zodSchemas.tsx";

export const Steg1DineOpplysninger = () => {
  const opplysninger = useOpplysninger();
  const { inntektsmeldingSkjemaState, setInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjemaAGINyansatt();

  useEffect(() => {
    setInntektsmeldingSkjemaState((prev) => ({
      ...prev,
      besøkteSteg: prev.besøkteSteg?.includes(1)
        ? prev.besøkteSteg
        : [...(prev.besøkteSteg ?? []), 1],
    }));
  }, []);
  const navigate = useNavigate();
  const { eksisterendeInntektsmeldinger } =
    getRouteApi("/agi/$id").useLoaderData();
  const onSubmit = (
    kontaktperson: InntektsmeldingSkjemaStateAGINyansatt["kontaktperson"],
  ) => {
    setInntektsmeldingSkjemaState(
      (prev: InntektsmeldingSkjemaStateAGINyansatt) => ({
        ...prev,
        kontaktperson,
      }),
    );
    navigate({
      from: "/agi/$id/dine-opplysninger",
      params: {
        id: opplysninger.forespørselUuid || ARBEIDSGIVERINITERT_NYANSATT_ID,
      },
      to: "../refusjon",
    });
  };
  return (
    <DineOpplysninger
      eksisterendeInntektsmeldinger={eksisterendeInntektsmeldinger}
      inntektsmeldingSkjemaState={inntektsmeldingSkjemaState}
      onSubmit={onSubmit}
    />
  );
};
