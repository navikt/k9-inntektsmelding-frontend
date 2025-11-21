import { useNavigate } from "@tanstack/react-router";

import { ARBEIDSGIVERINITERT_NYANSATT_ID } from "~/routes/opprett";

import { useOpplysninger } from "../../shared/hooks/useOpplysninger.tsx";
import { DineOpplysninger } from "../../shared/skjema-moduler/DineOpplysninger.tsx";
import { useInntektsmeldingSkjemaAGI } from "../SkjemaStateContext";
import { InntektsmeldingSkjemaStateAGI } from "../zodSchemas.tsx";

export const Steg1DineOpplysningerAGI = () => {
  const opplysninger = useOpplysninger();
  const { inntektsmeldingSkjemaState, setInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjemaAGI();
  const navigate = useNavigate();
  const onSubmit = (
    kontaktperson: InntektsmeldingSkjemaStateAGI["kontaktperson"],
  ) => {
    setInntektsmeldingSkjemaState((prev: InntektsmeldingSkjemaStateAGI) => ({
      ...prev,
      kontaktperson,
    }));
    navigate({
      from: "/agi/$id/dine-opplysninger",
      params: { id: opplysninger.forespørselUuid || ARBEIDSGIVERINITERT_NYANSATT_ID },
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
