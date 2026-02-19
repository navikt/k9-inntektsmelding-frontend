import { zodResolver } from "@hookform/resolvers/zod";
import { DownloadIcon } from "@navikt/aksel-icons";
import { Alert, Button, Detail, Heading, VStack } from "@navikt/ds-react";
import { getRouteApi, Link, useParams } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";

import { hentInntektsmeldingPdfUrl } from "~/api/queries.ts";
import { OppsummeringArbeidsgiverOgAnsatt } from "~/components/oppsummering/OppsummeringArbeidsgiverOgAnsatt.tsx";
import { OppsummeringMånedslønn } from "~/components/oppsummering/OppsummeringMånedslønn.tsx";
import { OppsummeringOmsorgsdager } from "~/components/oppsummering/OppsummeringOmsorgsdager.tsx";
import { OppsummeringRefusjon } from "~/components/oppsummering/OppsummeringRefusjon.tsx";
import { formatDatoTidKort } from "~/utils.ts";
import { navnPåMåned } from "~/utils/date-utils.ts";

import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle.tsx";
import { mapSendInntektsmeldingTilSkjema } from "../utils.ts";
import {
  RefusjonOmsorgspengerFormData,
  RefusjonOmsorgspengerSchemaMedValidering,
} from "../zodSchemas.tsx";

export const VisInnsendtRefusjonskrav = () => {
  useDocumentTitle(
    "Innsendt refusjonskrav – søknad om refusjon av omsorgspenger for arbeidsgiver",
  );

  const route = getRouteApi("/refusjon-omsorgspenger/$organisasjonsnummer/$id");
  const { eksisterendeInntektsmeldinger, opplysninger } = route.useLoaderData();
  const { id } = useParams({
    from: "/refusjon-omsorgspenger/$organisasjonsnummer/$id",
  });

  const inntektsmelding = eksisterendeInntektsmeldinger?.find(
    (inntektsmelding) => inntektsmelding.foresporselUuid === id,
  );

  if (!inntektsmelding) {
    return <div>Inntektsmelding ikke funnet</div>;
  }

  const defaultValues = mapSendInntektsmeldingTilSkjema(
    opplysninger,
    inntektsmelding,
  );

  const form = useForm<RefusjonOmsorgspengerFormData>({
    resolver: zodResolver(RefusjonOmsorgspengerSchemaMedValidering),
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  const måneder = [
    ...(inntektsmelding?.omsorgspenger.fraværHeleDager?.map((dag) =>
      navnPåMåned(dag.fom).toLowerCase(),
    ) ?? []),
    ...(inntektsmelding?.omsorgspenger.fraværDelerAvDagen?.map((dag) =>
      navnPåMåned(dag.dato).toLowerCase(),
    ) ?? []),
  ];

  const unikeMåneder = [...new Set(måneder)];

  const sisteMåned = unikeMåneder?.at(-1);

  const månedtekst =
    unikeMåneder.length === 1
      ? `for ${unikeMåneder[0]}`
      : `for ${unikeMåneder?.slice(0, -1).join(", ")} og ${sisteMåned}`;
  return (
    <FormProvider {...form}>
      <div className="bg-ax-bg-default rounded-md flex flex-col gap-6">
        <div>
          <Heading level="2" size="medium">
            {`Innsendt refusjonskrav ${månedtekst}`}
          </Heading>
          <Detail uppercase>
            sendt inn{" "}
            {formatDatoTidKort(
              new Date(inntektsmelding?.opprettetTidspunkt || ""),
            )}
          </Detail>
        </div>
        <Alert variant="info">
          For å korrigere eller melde fra om endringer må du opprette et nytt
          refusjonskrav.
          <Button
            as={Link}
            className="mt-5"
            size="small"
            to="../1-intro"
            variant="secondary"
          >
            Opprett nytt refusjonskrav
          </Button>
        </Alert>
        <VStack gap="space-16">
          <OppsummeringRefusjon redigerbar={false} />
          <OppsummeringArbeidsgiverOgAnsatt redigerbar={false} />
          <OppsummeringOmsorgsdager
            dagerSomSkalTrekkes={form.getValues("dagerSomSkalTrekkes")}
            fraværDelerAvDagen={form.getValues("fraværDelerAvDagen")}
            fraværHeleDager={form.getValues("fraværHeleDager")}
            harDekket10FørsteOmsorgsdager={
              form.getValues("harDekket10FørsteOmsorgsdager") === "ja"
            }
            redigerbar={false}
          />
          <OppsummeringMånedslønn redigerbar={false} />
        </VStack>
        <div className="flex justify-around">
          <Button
            as="a"
            download={`refusjon-omsorgspenger-søknad-kvittering-${inntektsmelding?.id}.pdf`}
            href={hentInntektsmeldingPdfUrl(inntektsmelding?.id)}
            icon={<DownloadIcon />}
            iconPosition="left"
            variant="tertiary"
          >
            Last ned PDF
          </Button>
        </div>
      </div>
    </FormProvider>
  );
};
