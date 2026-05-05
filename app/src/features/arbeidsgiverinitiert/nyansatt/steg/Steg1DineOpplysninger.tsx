import { getRouteApi, useNavigate } from "@tanstack/react-router";

import { ARBEIDSGIVERINITERT_NYANSATT_ID } from "~/routes/opprett";

import { useOpplysninger } from "../../../shared/hooks/useOpplysninger.tsx";
import { DineOpplysninger } from "../../../shared/skjema-moduler/steg/DineOpplysninger.tsx";
import { InntektsmeldingSkjemaStateAGINyansatt } from "../frontendSchemas.tsx";
import { useInntektsmeldingSkjemaAGINyansatt } from "../SkjemaStateContext.tsx";

export const Steg1DineOpplysninger = () => {
  const opplysninger = useOpplysninger();
  const { inntektsmeldingSkjemaState, setInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjemaAGINyansatt();

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
