import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { BodyLong, Button, GuidePanel, Heading } from "@navikt/ds-react";
import { Link } from "@tanstack/react-router";

import { OpplysningerDto } from "~/api/queries";
import { RotLayout } from "~/features/rot-layout/RotLayout";

import { Inntekt } from "../skjema-moduler/Inntekt";
import { Fremgangsindikator } from "./Fremgangsindikator";
import { IndreLayout } from "./IndreLayout";

export const RefusjonOmsorgspengerArbeidsgiverSteg4 = () => {
  const dummyOpplysninger: OpplysningerDto = {
    startdatoPermisjon: new Date().toString(),
    person: {
      aktørId: "1234567890",
      fødselsnummer: "1234567890",
      fornavn: "Ola",
      etternavn: "Nordmann",
    },
    innsender: {
      fornavn: "Ola",
      etternavn: "Nordmann",
    },
    arbeidsgiver: {
      organisasjonNavn: "Bedrift AS",
      organisasjonNummer: "123456789",
    },
    ytelse: "OMSORGSPENGER",
    inntekter: [
      {
        fom: new Date(2023, 0, 1).toISOString(),
        tom: new Date(2023, 0, 31).toISOString(),
        arbeidsgiverIdent: "123456789",
        beløp: 30_000,
      },
      {
        fom: new Date(2023, 1, 1).toISOString(),
        tom: new Date(2023, 1, 28).toISOString(),
        arbeidsgiverIdent: "123456789",
        beløp: 31_000,
      },
      {
        fom: new Date(2023, 2, 1).toISOString(),
        tom: new Date(2023, 2, 31).toISOString(),
        arbeidsgiverIdent: "123456789",
        beløp: 32_000,
      },
    ],
  };
  return (
    <RotLayout tittel="Søknad om refusjon for omsorgspenger">
      <IndreLayout>
        <Heading level="1" size="large">
          Beregnet månedslønn for refusjon
        </Heading>
        <Fremgangsindikator aktivtSteg={4} />
        <GuidePanel>
          <BodyLong>
            Oppgi kun dager dere søker refusjon for. Har det vært en varig
            lønnsendring mellom perioder som dere ønsker vi skal ta hensyn til,
            må dere sende inn to søknader med periodene før og etter
            lønnsendring.
          </BodyLong>
        </GuidePanel>
        <Inntekt opplysninger={dummyOpplysninger} />
        <div className="flex gap-4">
          <Button
            as={Link}
            href="../3-omsorgsdager"
            icon={<ArrowLeftIcon />}
            variant="secondary"
          >
            Forrige steg
          </Button>
          <Button
            as={Link}
            href="../5-oppsummering"
            icon={<ArrowRightIcon />}
            iconPosition="right"
            variant="primary"
          >
            Neste steg
          </Button>
        </div>
      </IndreLayout>
    </RotLayout>
  );
};
