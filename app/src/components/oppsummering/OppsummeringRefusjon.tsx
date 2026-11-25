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
import { Link } from "@tanstack/react-router";

import { useSkjemaState } from "~/features/refusjon-omsorgspenger/SkjemaStateContext";

import { ErrorMessage } from "./ErrorMessage";

export const OppsummeringRefusjon = ({
  redigerbar = false,
}: {
  redigerbar: boolean;
}) => {
  const { getValues, formState } = useSkjemaState();
  return (
    <FormSummary>
      <FormSummaryHeader>
        <FormSummaryHeading level="3">Om refusjon</FormSummaryHeading>
      </FormSummaryHeader>
      <FormSummaryAnswers>
        <FormSummaryAnswer>
          <FormSummaryLabel>
            Utbetaler dere lønn under fraværet, og krever refusjon?
          </FormSummaryLabel>
          <FormSummaryValue>
            {getValues("harUtbetaltLønn") ? "Ja" : "Nei"}
          </FormSummaryValue>
          <ErrorMessage message={formState.errors.harUtbetaltLønn?.message} />
        </FormSummaryAnswer>
        <FormSummaryAnswer>
          <FormSummaryLabel>
            Hvilket år søker dere refusjon for?
          </FormSummaryLabel>
          <FormSummaryValue>
            {getValues("årForRefusjon")}
            <ErrorMessage message={formState.errors.årForRefusjon?.message} />
          </FormSummaryValue>
        </FormSummaryAnswer>
      </FormSummaryAnswers>
      {redigerbar && (
        <FormSummaryFooter>
          <FormSummaryEditLink
            aria-label="Endre svar om refusjon"
            as={Link}
            to="../1-intro"
          />
        </FormSummaryFooter>
      )}
    </FormSummary>
  );
};
