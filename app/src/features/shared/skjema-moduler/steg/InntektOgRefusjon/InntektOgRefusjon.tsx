import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Button, Heading } from "@navikt/ds-react";
import { Link } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";

import { InntektsmeldingSkjemaStateAGIUnntattAaregister } from "~/features/arbeidsgiverinitiert/unntattAAregister/zodSchemas.tsx";
import { InntektsmeldingSkjemaState } from "~/features/inntektsmelding/zodSchemas.tsx";
import { useOpplysninger } from "~/features/shared/hooks/useOpplysninger";
import { Fremgangsindikator } from "~/features/shared/skjema-moduler/Fremgangsindikator.tsx";
import { EndringAvInntektÅrsaker, Naturalytelsetype } from "~/types/api-models";
import { formatYtelsesnavn } from "~/utils";

import { useDocumentTitle } from "../../../hooks/useDocumentTitle.tsx";
import { useEksisterendeInntektsmeldinger } from "../../../hooks/useEksisterendeInntektsmeldinger.tsx";
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
  onSubmit,
}: {
  inntektsmeldingSkjemaState:
    | InntektsmeldingSkjemaState
    | InntektsmeldingSkjemaStateAGIUnntattAaregister;
  onSubmit: (skjemadata: InntektOgRefusjonForm) => void;
}) {
  useScrollToTopOnMount();
  const opplysninger = useOpplysninger();
  useDocumentTitle(
    `Inntekt og refusjon – inntektsmelding for ${formatYtelsesnavn(opplysninger.ytelse)}`,
  );

  const eksisterendeInntektsmeldinger = useEksisterendeInntektsmeldinger();
  const harEksisterendeInntektsmeldinger =
    eksisterendeInntektsmeldinger.length > 0;

  const formMethods = useForm<InntektOgRefusjonForm>({
    defaultValues: defaultValues(inntektsmeldingSkjemaState, opplysninger),
  });

  return (
    <FormProvider {...formMethods}>
      <section className="mt-2">
        <form
          className="bg-bg-default px-5 py-6 rounded-md flex gap-6 flex-col"
          onSubmit={formMethods.handleSubmit(onSubmit)}
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
