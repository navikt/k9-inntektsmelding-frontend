import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { ARBEIDSGIVERINITIERT_UNNTATT_AAREGISTER_ID } from "~/routes/opprett";

import { useOpplysninger } from "../../../shared/hooks/useOpplysninger.tsx";
import { DineOpplysninger } from "../../../shared/skjema-moduler/steg/DineOpplysninger.tsx";
import { useInntektsmeldingSkjemaAGIUnntattAaRegister } from "../SkjemaStateContext.tsx";
import { InntektsmeldingSkjemaStateAGIUnntattAaregister } from "../zodSchemas.tsx";

export const Steg1DineOpplysningerAGIUnntattAaregister = () => {
  const opplysninger = useOpplysninger();
  const { inntektsmeldingSkjemaState, setInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjemaAGIUnntattAaRegister();

  useEffect(() => {
    setInntektsmeldingSkjemaState((prev) => ({
      ...prev,
      besøkteSteg: prev.besøkteSteg?.includes(1)
        ? prev.besøkteSteg
        : [...(prev.besøkteSteg ?? []), 1],
    }));
  }, []);
  const navigate = useNavigate();
  const { eksisterendeInntektsmeldinger } = getRouteApi(
    "/agi-unntatt-aaregister/$id",
  ).useLoaderData();
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
      eksisterendeInntektsmeldinger={eksisterendeInntektsmeldinger}
      inntektsmeldingSkjemaState={inntektsmeldingSkjemaState}
      onSubmit={onSubmit}
    />
  );
};
