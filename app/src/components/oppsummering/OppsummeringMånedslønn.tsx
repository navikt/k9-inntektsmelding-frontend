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
import { endringsårsak } from "~/features/shared/skjema-moduler/Inntekt";
import { formatDatoKort, formatKroner } from "~/utils";

import { ErrorMessage } from "./ErrorMessage";

export const OppsummeringMånedslønn = ({
  redigerbar,
}: {
  redigerbar: boolean;
}) => {
  const { getValues, formState } = useSkjemaState();

  return (
    <FormSummary>
      <FormSummaryHeader>
        <FormSummaryHeading level="3">
          Beregnet månedslønn for refusjon
        </FormSummaryHeading>
      </FormSummaryHeader>
      <FormSummaryAnswers>
        <FormSummaryAnswer>
          <FormSummaryLabel>Beregnet månedslønn</FormSummaryLabel>
          <FormSummaryValue>
            {formatKroner(
              getValues("korrigertInntekt") || getValues("inntekt"),
            )}
            <ErrorMessage
              message={
                formState.errors.korrigertInntekt?.message ||
                formState.errors.inntekt?.message
              }
            />
          </FormSummaryValue>
        </FormSummaryAnswer>
        {!!getValues("endringAvInntektÅrsaker")?.length && (
          <FormSummaryAnswer>
            <FormSummaryLabel>Årsaker til endring av inntekt</FormSummaryLabel>
            <FormSummaryValue>
              {getValues("endringAvInntektÅrsaker")?.map((årsak) => (
                <div key={årsak.årsak}>
                  {endringsårsak.find((a) => a.value === årsak.årsak)?.label}
                  {årsak.fom && (
                    <>
                      {" "}
                      {formatDatoKort(new Date(årsak.fom))}
                      {årsak.tom &&
                        ` til ${formatDatoKort(new Date(årsak.tom))}`}
                    </>
                  )}
                </div>
              ))}
              <ErrorMessage
                message={formState.errors.endringAvInntektÅrsaker?.message}
              />
            </FormSummaryValue>
          </FormSummaryAnswer>
        )}
      </FormSummaryAnswers>
      {redigerbar && (
        <FormSummaryFooter>
          <FormSummaryEditLink as={Link} to="../4-refusjon">
            Endre beregnet månedslønn
          </FormSummaryEditLink>
        </FormSummaryFooter>
      )}
    </FormSummary>
  );
};
