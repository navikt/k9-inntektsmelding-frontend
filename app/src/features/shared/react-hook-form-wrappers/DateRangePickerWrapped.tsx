import {
  DatePicker,
  DatePickerProps,
  ErrorMessage,
  useRangeDatepicker,
} from "@navikt/ds-react";
import { forwardRef } from "react";
import { RegisterOptions, useController } from "react-hook-form";

import { formatIsoDatostempel } from "~/utils";

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
  const {
    datepickerProps: useRangeDatepickerProps,
    toInputProps,
    fromInputProps,
  } = useRangeDatepicker({
    ...datepickerProps,
    onRangeChange: (dateRange) => {
      fromField.onChange(
        dateRange?.from ? formatIsoDatostempel(dateRange.from) : "",
      );
      toField.onChange(dateRange?.to ? formatIsoDatostempel(dateRange.to) : "");
      fromField.onBlur();
      toField.onBlur();
    },
    onValidate: (dateRange) => {
      if (dateRange?.from && dateRange?.to) {
        return dateRange.from <= dateRange.to;
      }
      return true;
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
          ref={fromField.ref}
        />
        <DatePicker.Input
          {...toInputProps}
          aria-describedby={toFieldState.error ? tomFeilId : undefined}
          aria-invalid={!!toFieldState.error}
          className="w-full max-w-[50%]"
          label="Til og med"
          onBlur={toField.onBlur}
          ref={toField.ref}
        />
      </div>
      <div className="mt-2">
        {fromFieldState.error?.message && (
          <ErrorMessage id={fomFeilId} showIcon>
            Fra og med: {fromFieldState.error.message}
          </ErrorMessage>
        )}
        {toFieldState.error?.message && (
          <ErrorMessage id={tomFeilId} showIcon>
            Til og med: {toFieldState.error.message}
          </ErrorMessage>
        )}
      </div>
    </DatePicker>
  );
});

DateRangePickerWrapped.displayName = "DateRangePickerWrapped";
