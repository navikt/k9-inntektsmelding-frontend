import { XMarkIcon } from "@navikt/aksel-icons";
import { Button, HStack } from "@navikt/ds-react";
import { setBreadcrumbs } from "@navikt/nav-dekoratoren-moduler";
import { getRouteApi, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";

import { InntektsmeldingSkjemaStateProviderAGIUnntattAaRegister } from "~/features/arbeidsgiverinitiert/unntattAAregister/SkjemaStateContext";
import { InntektsmeldingSkjemaStateProvider } from "~/features/inntektsmelding/SkjemaStateContext";
import { RotLayout } from "~/features/shared/rot-layout/RotLayout";
import { formatYtelsesnavn } from "~/utils.ts";

import { InntektsmeldingSkjemaStateProviderAGINyansatt } from "../../arbeidsgiverinitiert/nyansatt/SkjemaStateContext";
import { useOpplysninger } from "../hooks/useOpplysninger";

type InntektsmeldingRootLayoutProps = {
  ytelse: string;
  organisasjonNavn?: string;
  organisasjonNummer?: string;
  skjemaId: string;
};
export const InntektsmeldingRootLayoutComponent = (
  props: InntektsmeldingRootLayoutProps,
) => {
  const location = useLocation();
  useEffect(() => {
    setBreadcrumbs([
      {
        title: "Min side – Arbeidsgiver",
        url: "/min-side-arbeidsgiver",
      },
      {
        title: "Inntektsmelding",
        url: location.pathname,
      },
    ]);
  }, []);

  const erPåKvitteringssiden = location.pathname.includes("kvittering");
  const skalViseUndertittel =
    props.organisasjonNavn && props.organisasjonNummer;
  return (
    <RotLayout
      background={erPåKvitteringssiden ? "bg-default" : "bg-subtle"}
      tittel={`Inntektsmelding ${formatYtelsesnavn(props.ytelse)}`}
      undertittel={
        skalViseUndertittel && (
          <div className="flex gap-3">
            <span>{props.organisasjonNavn}</span>
            <span aria-hidden="true">|</span>
            <span className="text-nowrap">
              Org.nr.: {props.organisasjonNummer}
            </span>
          </div>
        )
      }
    >
      <Outlet />
      {!erPåKvitteringssiden && (
        <HStack align="center" justify="center">
          <Button
            as="a"
            href="/min-side-arbeidsgiver"
            icon={<XMarkIcon />}
            variant="tertiary"
          >
            Avbryt
          </Button>
        </HStack>
      )}
    </RotLayout>
  );
};

export const InntektsmeldingRoot = () => {
  const route = getRouteApi("/$id");
  const { id } = route.useParams();
  const opplysninger = useOpplysninger();

  return (
    <InntektsmeldingSkjemaStateProvider skjemaId={id}>
      <InntektsmeldingRootLayoutComponent
        skjemaId={id}
        ytelse={opplysninger.ytelse}
        {...opplysninger.arbeidsgiver}
      />
    </InntektsmeldingSkjemaStateProvider>
  );
};

export const InntektsmeldingRootAGI = () => {
  const route = getRouteApi("/agi/$id");
  const { id } = route.useParams();
  const data = route.useLoaderData();
  return (
    <InntektsmeldingSkjemaStateProviderAGINyansatt skjemaId={id}>
      <InntektsmeldingRootLayoutComponent
        skjemaId={id}
        ytelse={data.opplysninger.ytelse}
        {...data.opplysninger.arbeidsgiver}
      />
    </InntektsmeldingSkjemaStateProviderAGINyansatt>
  );
};

export const InntektsmeldingRootUnntattAaregister = () => {
  const route = getRouteApi("/agi-unntatt-aaregister/$id");
  const { id } = route.useParams();
  const opplysninger = useOpplysninger();

  return (
    <InntektsmeldingSkjemaStateProviderAGIUnntattAaRegister skjemaId={id}>
      <InntektsmeldingRootLayoutComponent
        skjemaId={id}
        ytelse={opplysninger.ytelse}
        {...opplysninger.arbeidsgiver}
      />
    </InntektsmeldingSkjemaStateProviderAGIUnntattAaRegister>
  );
};
