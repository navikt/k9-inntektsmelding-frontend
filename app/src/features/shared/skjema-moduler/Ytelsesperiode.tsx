import { BodyLong, Heading, VStack } from "@navikt/ds-react";

import {
  capitalize,
  capitalizeSetning,
  formatDatoLang,
  formatYtelsesnavn,
  leggTilGenitiv,
} from "~/utils";

import { HjelpetekstReadMore } from "../Hjelpetekst";
import { useOpplysninger } from "../hooks/useOpplysninger";
import { Informasjonsseksjon } from "../Informasjonsseksjon";

export function Ytelsesperiode() {
  const opplysninger = useOpplysninger();
  const { person, ytelse, førsteUttaksdato } = opplysninger;

  const førsteDag = capitalize(formatDatoLang(new Date(førsteUttaksdato)));
  if (ytelse === "OMSORGSPENGER") {
    return null;
  }

  return (
    <VStack gap="space-16">
      <hr />
      <Heading level="4" size="medium">
        Periode med {formatYtelsesnavn(ytelse)}
      </Heading>
      <Informasjonsseksjon
        kilde={`Fra søknaden til ${person.fornavn}`}
        tittel={`${capitalizeSetning(leggTilGenitiv(person.fornavn))} første dag med ${formatYtelsesnavn(ytelse)}`}
      >
        <BodyLong size="medium">{førsteDag}</BodyLong>
      </Informasjonsseksjon>
      <HjelpetekstReadMore header="Hva betyr dette?">
        <>
          Dette er den første dagen den ansatte har søkt om{" "}
          {formatYtelsesnavn(ytelse)}. Det betyr at vi trenger opplysninger om
          den ansattes inntekt de siste tre månedene før denne datoen. Vi
          baserer oss på datoen som er oppgitt i søknaden, du kan derfor ikke
          endre denne i inntektsmeldingen.
          <br />
          <br />
          Hvis du er usikker på om dato for første fraværsdag er riktig, må du
          kontakte den ansatte før du sender inntektsmeldingen. Hvis den ansatte
          endrer søknadsperioden, vil du få en ny oppgave med riktig dato for
          første fraværsdag.
        </>
      </HjelpetekstReadMore>
    </VStack>
  );
}
