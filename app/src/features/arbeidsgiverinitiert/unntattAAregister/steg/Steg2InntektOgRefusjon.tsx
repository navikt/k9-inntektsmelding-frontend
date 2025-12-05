import { getRouteApi, useNavigate } from "@tanstack/react-router";

import { useDocumentTitle } from "~/features/shared/hooks/useDocumentTitle";
import { useOpplysninger } from "~/features/shared/hooks/useOpplysninger";
import { useScrollToTopOnMount } from "~/features/shared/hooks/useScrollToTopOnMount";
import { InntektOgRefusjon } from "~/features/shared/skjema-moduler/steg/InntektOgRefusjon/InntektOgRefusjon.tsx";
import { EndringAvInntektÅrsaker, Naturalytelsetype } from "~/types/api-models";
import { formatYtelsesnavn } from "~/utils";

import { useInntektsmeldingSkjemaAGIUnntattAaRegister } from "../SkjemaStateContext.tsx";
import { InntektsmeldingSkjemaStateAGIUnntattAaregister } from "../zodSchemas.tsx";

type JaNei = "ja" | "nei";

export type InntektOgRefusjonForm = {
  meta: {
    skalKorrigereInntekt: boolean;
  };
  skalRefunderes: "JA_LIK_REFUSJON" | "JA_VARIERENDE_REFUSJON" | "NEI";
  misterNaturalytelser: JaNei;
  bortfaltNaturalytelsePerioder: NaturalytelserSomMistesForm[];
  endringAvInntektÅrsaker: EndringsÅrsakerForm[];
} & Pick<
  InntektsmeldingSkjemaStateAGIUnntattAaregister,
  "refusjon" | "inntekt" | "korrigertInntekt"
>;

type EndringsÅrsakerForm = {
  årsak: EndringAvInntektÅrsaker | "";
  fom?: string;
  tom?: string;
  bleKjentFom?: string;
  ignorerTom: boolean;
};
type NaturalytelserSomMistesForm = {
  navn: Naturalytelsetype | "";
  beløp: number | string;
  fom?: string;
  tom?: string;
  inkluderTom?: JaNei;
};

export const Steg2InntektOgRefusjon = () => {
  const { inntektsmeldingSkjemaState, setInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjemaAGIUnntattAaRegister();
  useScrollToTopOnMount();
  const opplysninger = useOpplysninger();
  useDocumentTitle(
    `Inntekt og refusjon - inntektsmelding for ${formatYtelsesnavn(opplysninger.ytelse)}`,
  );
  const { eksisterendeInntektsmeldinger } = getRouteApi(
    "/agi-unntatt-aaregister/$id",
  ).useLoaderData();
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
      from: "/agi-unntatt-aaregister/$id/inntekt-og-refusjon",
      to: "/agi-unntatt-aaregister/$id/oppsummering",
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
