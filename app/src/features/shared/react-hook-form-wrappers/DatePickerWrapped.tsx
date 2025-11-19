import type { DateInputProps, DatePickerProps } from "@navikt/ds-react";
import { DatePicker, useDatepicker } from "@navikt/ds-react";
import { useController } from "react-hook-form";

import { formatIsoDatostempel } from "~/utils.ts";

type DatePickerWrappedProps = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- usikker på hvordan rules skal types, og om det er såå viktig.
  rules?: any;
  shouldUnregister?: boolean;
  datepickerProps?: DatePickerProps;
  callback?: () => void;
} & DateInputProps;

export function DatePickerWrapped({
  name,
  rules = {},
  shouldUnregister,
  datepickerProps = {},
  callback = () => {},
  ...dateInputProps
}: DatePickerWrappedProps) {
  const { field, fieldState } = useController({
    name,
    rules,
    shouldUnregister,
  });
  const datePickerProperties = useDatepicker({
    ...datepickerProps,
    onDateChange: (date) => {
      field.onChange(date ? formatIsoDatostempel(date) : undefined);
      field.onBlur();
      callback();
    },
    defaultSelected: field.value ? new Date(field.value) : undefined,
  });

  return (
    <DatePicker {...datePickerProperties.datepickerProps}>
      <DatePicker.Input
        {...dateInputProps}
        {...datePickerProperties.inputProps}
        error={fieldState.error?.message}
        onBlur={field.onBlur}
        ref={field.ref}
      />
    </DatePicker>
  );
}
