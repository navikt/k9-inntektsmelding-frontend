import {
  DatePicker,
  DatePickerProps,
  ErrorMessage,
  useRangeDatepicker,
} from "@navikt/ds-react";
import { forwardRef, useState } from "react";
import { RegisterOptions, useController } from "react-hook-form";

import { formatIsoDatostempel } from "~/utils";
import { UGYLDIG_DATO_FEILMELDING } from "~/validators";

type DateRangePickerWrappedProps = {
  name: string;
  rules?: {
    fom: RegisterOptions;
    tom: RegisterOptions;
  };
  datepickerProps?: DatePickerProps;
};

export const DateRangePickerWrapped = forwardRef<
  HTMLDivElement,
  DateRangePickerWrappedProps
>(({ name, rules, datepickerProps }, ref) => {
  const { field: fromField, fieldState: fromFieldState } = useController({
    name: `${name}.fom`,
    rules: rules?.fom,
  });
  const { field: toField, fieldState: toFieldState } = useController({
    name: `${name}.tom`,
    rules: rules?.tom,
  });
  // Aksel gir ingen dato når teksten ikke kan tolkes, så feilen fra skjemaet sier bare at datoen mangler.
  const [tekst, setTekst] = useState({ fom: "", tom: "" });
  const [tomErFørFom, setTomErFørFom] = useState(false);
  const ugyldigeDatoer = {
    fom: tekst.fom.trim() !== "" && !fromField.value,
    tom: tekst.tom.trim() !== "" && !toField.value,
  };
  const {
    datepickerProps: useRangeDatepickerProps,
    toInputProps,
    fromInputProps,
  } = useRangeDatepicker({
    ...datepickerProps,
    onValidate: (validering) =>
      setTomErFørFom(validering.to.isBeforeFrom ?? false),
    onRangeChange: (dateRange) => {
      fromField.onChange(
        dateRange?.from ? formatIsoDatostempel(dateRange.from) : "",
      );
      toField.onChange(dateRange?.to ? formatIsoDatostempel(dateRange.to) : "");
      fromField.onBlur();
      toField.onBlur();
    },
    defaultSelected: {
      from: fromField.value ? new Date(fromField.value) : undefined,
      to: toField.value ? new Date(toField.value) : undefined,
    },
  });
  const fomFeilId = `${name}-fom-feil`;
  const tomFeilId = `${name}-tom-feil`;

  return (
    <DatePicker {...useRangeDatepickerProps}>
      <div className="flex gap-4" ref={ref}>
        <DatePicker.Input
          {...fromInputProps}
          aria-describedby={fromFieldState.error ? fomFeilId : undefined}
          aria-invalid={!!fromFieldState.error}
          className="w-full max-w-[50%]"
          label="Fra og med"
          onBlur={fromField.onBlur}
          onChange={(event) => {
            setTekst((forrige) => ({ ...forrige, fom: event.target.value }));
            fromInputProps.onChange?.(event);
          }}
          ref={fromField.ref}
        />
        <DatePicker.Input
          {...toInputProps}
          aria-describedby={toFieldState.error ? tomFeilId : undefined}
          aria-invalid={!!toFieldState.error}
          className="w-full max-w-[50%]"
          label="Til og med"
          onBlur={toField.onBlur}
          onChange={(event) => {
            setTekst((forrige) => ({ ...forrige, tom: event.target.value }));
            toInputProps.onChange?.(event);
          }}
          ref={toField.ref}
        />
      </div>
      <div aria-live="polite" className="mt-2">
        {fromFieldState.error?.message && (
          <ErrorMessage id={fomFeilId} showIcon>
            Fra og med:{" "}
            {ugyldigeDatoer.fom
              ? UGYLDIG_DATO_FEILMELDING
              : fromFieldState.error.message}
          </ErrorMessage>
        )}
        {toFieldState.error?.message && (
          <ErrorMessage id={tomFeilId} showIcon>
            Til og med:{" "}
            {ugyldigeDatoer.tom
              ? tomErFørFom
                ? "Datoen kan ikke være før fra og med."
                : UGYLDIG_DATO_FEILMELDING
              : toFieldState.error.message}
          </ErrorMessage>
        )}
      </div>
    </DatePicker>
  );
});

DateRangePickerWrapped.displayName = "DateRangePickerWrapped";
