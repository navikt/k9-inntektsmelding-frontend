import { useNavigate } from "@tanstack/react-router";

import { ARBEIDSGIVERINITIERT_UNNTATT_AAREGISTER_ID } from "~/routes/opprett";

import { useOpplysninger } from "../../../shared/hooks/useOpplysninger.tsx";
import { DineOpplysninger } from "../../../shared/skjema-moduler/steg/DineOpplysninger.tsx";
import { useInntektsmeldingSkjemaAGIUnntattAaRegister } from "../SkjemaStateContext.tsx";
import { InntektsmeldingSkjemaStateAGIUnntattAaregister } from "../zodSchemas.tsx";

export const Steg1DineOpplysningerAGIUnntattAaregister = () => {
  const opplysninger = useOpplysninger();
  const { inntektsmeldingSkjemaState, setInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjemaAGIUnntattAaRegister();
  const navigate = useNavigate();
  const onSubmit = (
    kontaktperson: InntektsmeldingSkjemaStateAGIUnntattAaregister["kontaktperson"],
  ) => {
    setInntektsmeldingSkjemaState(
      (prev: InntektsmeldingSkjemaStateAGIUnntattAaregister) => ({
        ...prev,
        kontaktperson,
      }),
    );
    navigate({
      from: "/agi-unntatt-aaregister/$id/dine-opplysninger",
      params: {
        id:
          opplysninger.forespørselUuid ||
          ARBEIDSGIVERINITIERT_UNNTATT_AAREGISTER_ID,
      },
      to: "../inntekt-og-refusjon",
    });
  };
  return (
    <DineOpplysninger
      inntektsmeldingSkjemaState={inntektsmeldingSkjemaState}
      onSubmit={onSubmit}
    />
  );
};
