import {
  CheckmarkIcon,
  ClockIcon,
  DocPencilIcon,
  DownloadIcon,
  InformationIcon,
  SackKronerIcon,
} from "@navikt/aksel-icons";
import {
  Alert,
  BodyLong,
  Button,
  ExpansionCard,
  Heading,
  HStack,
  Link,
  VStack,
} from "@navikt/ds-react";
import { setBreadcrumbs } from "@navikt/nav-dekoratoren-moduler";
import { useEffect } from "react";

import { hentInntektsmeldingPdfUrl } from "~/api/queries";
import { useDocumentTitle } from "~/features/shared/hooks/useDocumentTitle";
import type { OpplysningerDto } from "~/types/api-models";
import { formatYtelsesnavn, lagFulltNavn, slugify } from "~/utils";

import { useScrollToTopOnMount } from "../../hooks/useScrollToTopOnMount";

type Steg4KvitteringBaseProps = {
  breadcrumbUrl: string;
  inntektsmeldingsId?: number;
  opplysninger: OpplysningerDto;
  skalRefunderes?: string;
};

export const Kvittering = ({
  breadcrumbUrl,
  inntektsmeldingsId,
  opplysninger,
  skalRefunderes,
}: Steg4KvitteringBaseProps) => {
  useScrollToTopOnMount();
  useDocumentTitle(
    `Kvittering – inntektsmelding for ${formatYtelsesnavn(opplysninger.ytelse)}`,
  );
  useEffect(() => {
    setBreadcrumbs([
      {
        title: "Min side – Arbeidsgiver",
        url: "/arbeidsgiver/min-side",
      },
      {
        title: "Kvittering, inntektsmelding",
        url: breadcrumbUrl,
      },
    ]);
  }, [breadcrumbUrl]);

  const erRefusjon = skalRefunderes !== "NEI";
  const ofteStilteSpørsmål = () => {
    if (erRefusjon && opplysninger.ytelse !== "OMSORGSPENGER") {
      return ofteStilteSpørsmålRefusjon;
    }
    return ofteStilteSpørsmålIkkeRefusjon;
  };

  return (
    <div className="mx-4 mt-12 ax-md:mx-0">
      <div className="p-6 bg-ax-bg-success-soft rounded-full mx-auto w-fit">
        <CheckmarkIcon aria-hidden fontSize="2.5em" />
      </div>
      <Heading className="mt-6 mb-12 text-center" level="2" size="medium">
        Inntektsmelding for {lagFulltNavn(opplysninger.person)} er sendt
      </Heading>
      <Alert className="mb-12" variant="success">
        <BodyLong>
          Vi har mottatt inntektsmeldingen. Saken til den ansatte ligger nå til
          behandling hos oss. Vi tar kontakt hvis vi trenger flere opplysninger
          fra deg.
        </BodyLong>
      </Alert>

      <VStack className="mb-12" gap="4">
        <Heading size="medium">Ofte stilte spørsmål</Heading>
        {ofteStilteSpørsmål().map((spørsmål) => (
          <ExpansionCard
            aria-labelledby={slugify(spørsmål.spørsmål)}
            key={spørsmål.spørsmål}
            size="small"
          >
            <ExpansionCard.Header>
              <ExpansionCard.Title id={slugify(spørsmål.spørsmål)} size="small">
                <HStack align="center" gap="4">
                  <div
                    aria-hidden
                    className="p-2 bg-ax-bg-info-soft rounded-full w-fit"
                  >
                    {spørsmål.ikon}
                  </div>
                  <div className="flex-1">{spørsmål.spørsmål}</div>
                </HStack>
              </ExpansionCard.Title>
            </ExpansionCard.Header>
            <ExpansionCard.Content>{spørsmål.svar}</ExpansionCard.Content>
          </ExpansionCard>
        ))}
      </VStack>
      <HStack gap="2" justify="center" wrap={true}>
        <Button as="a" href="/min-side-arbeidsgiver" variant="primary">
          Gå til min side – arbeidsgiver
        </Button>
        {inntektsmeldingsId && (
          <Button
            as="a"
            download={`inntektsmelding-${inntektsmeldingsId}.pdf`}
            href={hentInntektsmeldingPdfUrl(inntektsmeldingsId)}
            icon={<DownloadIcon />}
            iconPosition="left"
            variant="secondary"
          >
            Last ned inntektsmeldingen
          </Button>
        )}
      </HStack>
    </div>
  );
};

type OfteStilteSpørsmål = {
  spørsmål: string;
  ikon: React.ReactNode;
  svar: React.ReactNode;
};

const ofteStilteSpørsmålRefusjon = [
  {
    spørsmål: "Når får den ansatte svar på søknaden sin?",
    ikon: <ClockIcon />,
    svar: (
      <BodyLong>
        <Link href="https://www.nav.no/saksbehandlingstider">
          Her finner du oversikt over saksbehandlingstiden til Nav.
        </Link>
        <br />
        Vedtaket sendes til den ansatte når søknaden er ferdig behandlet.
      </BodyLong>
    ),
  },
  {
    spørsmål: "Når blir refusjon utbetalt?",
    ikon: <SackKronerIcon />,
    svar: (
      <BodyLong>
        Refusjon utbetales ved hvert månedsskifte, etter at søknaden er
        behandlet. Vi utbetaler til det kontonummeret som arbeidsgiver har
        registrert i Altinn.
        <br />
        Du får ikke beskjed når søknaden er behandlet, og må derfor ha dialog
        med den ansatte om status på søknad og utbetaling av refusjon.
      </BodyLong>
    ),
  },
  {
    spørsmål: "Hvordan skal arbeidsgiver melde fra om endringer?",
    ikon: <DocPencilIcon />,
    svar: (
      <BodyLong>
        Du kan se tidligere innsendte inntektsmeldinger i saksoversikten på min
        side - arbeidsgiver.
        <br />
        Hvis du skal endre noe på inntektsmeldingen må du sende den inn på nytt.
        Når vi mottar en ny inntektsmelding, revurderer vi saken.
      </BodyLong>
    ),
  },
  {
    spørsmål: "Hvilken informasjon kan arbeidsgiver få?",
    ikon: <InformationIcon />,
    svar: (
      <VStack gap="4">
        <BodyLong>
          Nav sender vedtaket til den ansatte, og du må ha dialog med den
          ansatte om status på søknaden. Nav deler ikke sensitiv informasjon fra
          søknaden som er knyttet til den ansatte.
        </BodyLong>
        <BodyLong>
          Hvis du har spørsmål om utbetaling av refusjon, kan du{" "}
          <Link href="https://www.nav.no/arbeidsgiver/kontaktoss">
            kontakte Nav
          </Link>{" "}
          for mer informasjon.
        </BodyLong>
      </VStack>
    ),
  },
] satisfies OfteStilteSpørsmål[];

const ofteStilteSpørsmålIkkeRefusjon = [
  {
    spørsmål: "Når får den ansatte svar på søknaden sin?",
    ikon: <ClockIcon />,
    svar: (
      <BodyLong>
        <Link href="https://www.nav.no/saksbehandlingstider">
          Her finner du oversikt over saksbehandlingstiden til Nav.
        </Link>{" "}
        Vi tar kontakt hvis vi trenger flere opplysninger.
        <br />
        Vedtaket sendes til den ansatte når søknaden er ferdig behandlet.
      </BodyLong>
    ),
  },
  {
    spørsmål: "Hvordan skal arbeidsgiver melde fra om endringer?",
    ikon: <DocPencilIcon />,
    svar: (
      <BodyLong>
        Du kan se tidligere innsendte inntektsmeldinger i saksoversikten på min
        side - arbeidsgiver.
        <br />
        Hvis du skal endre noe på inntektsmeldingen må du sende den inn på nytt.
        Når vi mottar en ny inntektsmelding, revurderer vi saken.
      </BodyLong>
    ),
  },
  {
    spørsmål: "Hvilken informasjon kan arbeidsgiver få?",
    ikon: <InformationIcon />,
    svar: (
      <VStack gap="4">
        <BodyLong>
          Nav sender vedtaket til den ansatte, og du må ha dialog med den
          ansatte om status på søknaden. Nav deler ikke sensitiv informasjon fra
          søknaden som er knyttet til den ansatte.
        </BodyLong>
      </VStack>
    ),
  },
] satisfies OfteStilteSpørsmål[];
