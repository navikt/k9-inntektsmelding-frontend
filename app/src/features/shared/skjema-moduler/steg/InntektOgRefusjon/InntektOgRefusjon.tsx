import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Button, Heading } from "@navikt/ds-react";
import { Link, useLocation } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";

import { InntektsmeldingSkjemaStateAGIUnntattAaregister } from "~/features/arbeidsgiverinitiert/unntattAAregister/frontendSchemas.tsx";
import {
  InntektsmeldingSkjemaState,
  InntektsmeldingSkjemaStateValid,
} from "~/features/inntektsmelding/frontendSchemas.tsx";
import { useOpplysninger } from "~/features/shared/hooks/useOpplysninger";
import { Fremgangsindikator } from "~/features/shared/skjema-moduler/Fremgangsindikator.tsx";
import {
  EndringAvInntektÅrsaker,
  Naturalytelsetype,
} from "~/types/api-schemas";
import { formatYtelsesnavn } from "~/utils";

import { useDocumentTitle } from "../../../hooks/useDocumentTitle.tsx";
import { useScrollToTopOnMount } from "../../../hooks/useScrollToTopOnMount.tsx";
import { Inntekt } from "../../Inntekt.tsx";
import { Naturalytelser } from "../../Naturalytelser.tsx";
import OmFraværetOmsorgspenger from "../../OmFraværetOmsorgspenger.tsx";
import { UtbetalingOgRefusjon } from "../../UtbetalingOgRefusjon.tsx";
import { Ytelsesperiode } from "../../Ytelsesperiode.tsx";
import { defaultValues } from "./formDefaultValues.ts";

type JaNei = "ja" | "nei";

export type InntektOgRefusjonForm = {
  meta: {
    skalKorrigereInntekt: boolean;
  };
  skalRefunderes: "JA_LIK_REFUSJON" | "JA_VARIERENDE_REFUSJON" | "NEI";
  misterNaturalytelser: JaNei;
  bortfaltNaturalytelsePerioder: NaturalytelserSomMistesForm[];
  endringAvInntektÅrsaker: EndringsÅrsakerForm[];
  fraværHeleDager: { fom: string; tom: string }[];
  fraværDelerAvDagen: { dato: string; timer: string }[];
} & Pick<
  InntektsmeldingSkjemaState,
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

export function InntektOgRefusjon({
  inntektsmeldingSkjemaState,
  eksisterendeInntektsmeldinger,
  onSubmit,
}: {
  inntektsmeldingSkjemaState:
    | InntektsmeldingSkjemaState
    | InntektsmeldingSkjemaStateAGIUnntattAaregister;
  eksisterendeInntektsmeldinger: InntektsmeldingSkjemaStateValid[];
  onSubmit: (skjemadata: InntektOgRefusjonForm) => void;
}) {
  useScrollToTopOnMount();
  const opplysninger = useOpplysninger();
  useDocumentTitle(
    `Inntekt og refusjon – inntektsmelding for ${formatYtelsesnavn(opplysninger.ytelse)}`,
  );

  const harEksisterendeInntektsmeldinger =
    eksisterendeInntektsmeldinger.length > 0;

  const formMethods = useForm<InntektOgRefusjonForm>({
    defaultValues: defaultValues(inntektsmeldingSkjemaState, opplysninger),
  });

  const location = useLocation();
  const erAGIUnntattAaregister = location.pathname.startsWith(
    "/agi-unntatt-aaregister",
  );

  const validerOgSubmit = (data: InntektOgRefusjonForm) => {
    if (
      erAGIUnntattAaregister &&
      opplysninger.ytelse === "OMSORGSPENGER" &&
      data.fraværHeleDager.length === 0 &&
      data.fraværDelerAvDagen.length === 0
    ) {
      formMethods.setError("fraværHeleDager", {
        type: "required",
        message: "Du må legge til minst én fraværsperiode",
      });
      return;
    }
    onSubmit(data);
  };

  return (
    <FormProvider {...formMethods}>
      <section className="mt-2">
        <form
          className="bg-ax-bg-default px-5 py-6 rounded-md flex gap-6 flex-col"
          onSubmit={formMethods.handleSubmit(validerOgSubmit)}
        >
          <Heading level="3" size="large">
            Inntekt og refusjon
          </Heading>
          <Fremgangsindikator aktivtSteg={2} />
          {opplysninger.ytelse !== "OMSORGSPENGER" && <Ytelsesperiode />}
          {opplysninger.ytelse === "OMSORGSPENGER" && (
            <OmFraværetOmsorgspenger />
          )}
          <hr />
          <Inntekt
            harEksisterendeInntektsmeldinger={harEksisterendeInntektsmeldinger}
            opplysninger={opplysninger}
          />
          {opplysninger.ytelse !== "OMSORGSPENGER" && (
            <>
              <UtbetalingOgRefusjon />
              <Naturalytelser opplysninger={opplysninger} />
            </>
          )}
          <div className="flex gap-4 justify-center">
            <Button
              as={Link}
              icon={<ArrowLeftIcon />}
              to="../dine-opplysninger"
              variant="secondary"
            >
              Forrige steg
            </Button>
            <Button
              icon={<ArrowRightIcon />}
              iconPosition="right"
              type="submit"
              variant="primary"
            >
              Neste steg
            </Button>
          </div>
        </form>
      </section>
    </FormProvider>
  );
}
