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
import {
  formatFodselsnummer,
  formatTelefonnummer,
  lagFulltNavn,
} from "~/utils";

import { ErrorMessage } from "./ErrorMessage";

export const OppsummeringArbeidsgiverOgAnsatt = ({
  redigerbar,
}: {
  redigerbar: boolean;
}) => {
  const { getValues, formState } = useSkjemaState();
  return (
    <FormSummary>
      <FormSummaryHeader>
        <FormSummaryHeading level="3">
          Arbeidsgiver og den ansatte
        </FormSummaryHeading>
      </FormSummaryHeader>
      <FormSummaryAnswers>
        <FormSummaryAnswer>
          <FormSummaryAnswer>
            <FormSummaryLabel>Virksomhetsnavn</FormSummaryLabel>
            <FormSummaryValue>
              {getValues("meta.organisasjonsnavn")}
            </FormSummaryValue>
          </FormSummaryAnswer>
          <FormSummaryAnswer>
            <FormSummaryLabel>Org.nr. for underenhet</FormSummaryLabel>
            <FormSummaryValue>
              {getValues("organisasjonsnummer")}
              <ErrorMessage
                message={formState.errors?.organisasjonsnummer?.message}
              />
            </FormSummaryValue>
          </FormSummaryAnswer>
        </FormSummaryAnswer>
        <FormSummaryAnswer>
          <FormSummaryLabel>Kontaktperson og innsender</FormSummaryLabel>
          <FormSummaryValue>
            {getValues("kontaktperson.navn")} (tlf.{" "}
            {formatTelefonnummer(getValues("kontaktperson.telefonnummer"))})
            <ErrorMessage
              message={
                formState.errors.kontaktperson?.message ||
                formState.errors.kontaktperson?.telefonnummer?.message
              }
            />
          </FormSummaryValue>
        </FormSummaryAnswer>
        <FormSummaryAnswer>
          <FormSummaryLabel>Den ansatte</FormSummaryLabel>
          <FormSummaryValue>
            {lagFulltNavn({
              fornavn: getValues("ansattesFornavn")!,
              etternavn: getValues("ansattesEtternavn")!,
            })}
            , f.nr. {formatFodselsnummer(getValues("ansattesFødselsnummer"))}
            <ErrorMessage
              message={formState.errors.ansattesFødselsnummer?.message}
            />
          </FormSummaryValue>
        </FormSummaryAnswer>
      </FormSummaryAnswers>
      {redigerbar && (
        <FormSummaryFooter>
          <FormSummaryEditLink as={Link} to="../2-ansatt-og-arbeidsgiver" />
        </FormSummaryFooter>
      )}
    </FormSummary>
  );
};
