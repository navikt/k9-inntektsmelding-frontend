import { useNavigate } from "@tanstack/react-router";

import { ARBEIDSGIVERINITERT_NYANSATT_ID } from "~/routes/opprett";

import { useOpplysninger } from "../../../shared/hooks/useOpplysninger.tsx";
import { DineOpplysninger } from "../../../shared/skjema-moduler/DineOpplysninger.tsx";
import { useInntektsmeldingSkjemaAGINyansatt } from "../SkjemaStateContext.tsx";
import { InntektsmeldingSkjemaStateAGINyansatt } from "../zodSchemas.tsx";

export const Steg1DineOpplysningerAGINyansatt = () => {
  const opplysninger = useOpplysninger();
  const { inntektsmeldingSkjemaState, setInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjemaAGINyansatt();
  const navigate = useNavigate();
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
      inntektsmeldingSkjemaState={inntektsmeldingSkjemaState}
      onSubmit={onSubmit}
    />
  );
};
