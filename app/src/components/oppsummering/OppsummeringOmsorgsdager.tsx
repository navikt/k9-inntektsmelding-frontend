import { Box, List } from "@navikt/ds-react";
import {
  FormSummary,
  FormSummaryAnswer,
  FormSummaryAnswers,
  FormSummaryEditLink,
  FormSummaryFooter,
  FormSummaryHeader,
  FormSummaryHeading,
  FormSummaryLabel,
  FormSummaryValue,
} from "@navikt/ds-react/FormSummary";
import { ListItem } from "@navikt/ds-react/List";
import { Link } from "@tanstack/react-router";

import { useSkjemaState } from "~/features/refusjon-omsorgspenger/SkjemaStateContext";
import { formatDatoKort } from "~/utils.ts";

import { ErrorMessage } from "./ErrorMessage";

export const OppsummeringOmsorgsdager = ({
  fraværHeleDager,
  fraværDelerAvDagen,
  dagerSomSkalTrekkes,
  harUtbetaltLønn,
  harDekket10FørsteOmsorgsdager,
  redigerbar,
  heading = "Omsorgsdager dere søker utbetaling for",
  editPath = "../3-omsorgsdager",
}: {
  fraværHeleDager: { fom: string; tom: string }[];
  fraværDelerAvDagen: { dato: string; timer: string }[];
  dagerSomSkalTrekkes: { fom: string; tom: string }[];
  // brukes i inntektsmelding initiert av arbeidstaker
  harUtbetaltLønn?: boolean;
  harDekket10FørsteOmsorgsdager?: boolean;
  redigerbar: boolean;
  heading?: string;
  editPath?: string;
}) => {
  const context = useSkjemaState();
  const { formState } = context || {};

  const harFraværHeleDager = (fraværHeleDager?.length ?? 0) > 0;
  const harFraværDelerAvDagen = (fraværDelerAvDagen?.length ?? 0) > 0;
  const harDagerSomSkalTrekkes = (dagerSomSkalTrekkes?.length ?? 0) > 0;
  return (
    <FormSummary>
      <FormSummaryHeader>
        <FormSummaryHeading level="3">{heading}</FormSummaryHeading>
      </FormSummaryHeader>
      <FormSummaryAnswers>
        {harDekket10FørsteOmsorgsdager !== undefined && (
          <FormSummaryAnswer>
            <FormSummaryLabel>
              Har dere dekket de 10 første omsorgsdagene i år?
            </FormSummaryLabel>
            <FormSummaryValue>
              {harDekket10FørsteOmsorgsdager ? "Ja" : "Nei"}
              <ErrorMessage
                message={
                  formState?.errors?.harDekket10FørsteOmsorgsdager?.message
                }
              />
            </FormSummaryValue>
          </FormSummaryAnswer>
        )}
        <FormSummaryAnswer>
          <FormSummaryLabel>Dager med fravær hele dagen</FormSummaryLabel>
          <FormSummaryValue>
            {harFraværHeleDager ? (
              <Box marginBlock="space-16" asChild>
                <List data-aksel-migrated-v8>
                  {fraværHeleDager?.map((periode, index) =>
                    periode.fom && periode.tom ? (
                      <ListItem key={index}>
                        {formatDatoKort(new Date(periode.fom))}–
                        {formatDatoKort(new Date(periode.tom))}
                      </ListItem>
                    ) : null,
                  )}
                </List>
              </Box>
            ) : (
              "Ingen dager med fravær hele dagen"
            )}
            <ErrorMessage
              message={formState?.errors?.fraværHeleDager?.message}
            />
          </FormSummaryValue>
        </FormSummaryAnswer>
        <FormSummaryAnswer>
          <FormSummaryLabel>
            Dager med fravær bare deler av dagen
          </FormSummaryLabel>
          <FormSummaryValue>
            {harFraværDelerAvDagen ? (
              <Box marginBlock="space-16" asChild>
                <List data-aksel-migrated-v8>
                  {fraværDelerAvDagen
                    ?.filter((fravær) => Number(fravær.timer) > 0)
                    .map((fravær, index) => (
                      <ListItem key={index}>
                        {formatDatoKort(new Date(fravær.dato))}
                        {fravær.timer &&
                          ` (${fravær.timer} ${
                            Number(fravær.timer) === 1 ? "time" : "timer"
                          })`}
                      </ListItem>
                    ))}
                </List>
              </Box>
            ) : (
              "Ingen dager med fravær bare deler av dagen"
            )}
            <ErrorMessage
              message={formState?.errors?.fraværDelerAvDagen?.message}
            />
          </FormSummaryValue>
        </FormSummaryAnswer>
        {harDagerSomSkalTrekkes && (
          <FormSummaryAnswer>
            <FormSummaryLabel>Dager som skal trekkes</FormSummaryLabel>
            <FormSummaryValue>
              <Box marginBlock="space-16" asChild>
                <List data-aksel-migrated-v8>
                  {dagerSomSkalTrekkes?.map((dag, index) => (
                    <ListItem key={index}>
                      {formatDatoKort(new Date(dag.fom))}–
                      {formatDatoKort(new Date(dag.tom))}
                    </ListItem>
                  ))}
                </List>
              </Box>
            </FormSummaryValue>
          </FormSummaryAnswer>
        )}
        {harUtbetaltLønn !== undefined && (
          <FormSummaryAnswer>
            <FormSummaryLabel>
              Har dere utbetalt lønn for dette fraværet?
            </FormSummaryLabel>
            <FormSummaryValue>
              {harUtbetaltLønn ? "Ja" : "Nei"}
            </FormSummaryValue>
          </FormSummaryAnswer>
        )}
      </FormSummaryAnswers>
      {redigerbar && (
        <FormSummaryFooter>
          <FormSummaryEditLink as={Link} to={editPath} />
        </FormSummaryFooter>
      )}
    </FormSummary>
  );
};
