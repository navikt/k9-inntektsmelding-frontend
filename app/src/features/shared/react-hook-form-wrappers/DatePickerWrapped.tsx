import type { DateInputProps, DatePickerProps } from "@navikt/ds-react";
import { DatePicker, useDatepicker } from "@navikt/ds-react";
import { useState } from "react";
import { useController } from "react-hook-form";

import { formatIsoDatostempel } from "~/utils.ts";
import { UGYLDIG_DATO_FEILMELDING } from "~/validators";

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
  // Aksel gir ingen dato når teksten ikke kan tolkes, så feilen fra skjemaet sier bare at datoen mangler.
  const [tekst, setTekst] = useState("");
  const erUgyldigDato = tekst.trim() !== "" && !field.value;
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
        error={
          fieldState.error && erUgyldigDato
            ? UGYLDIG_DATO_FEILMELDING
            : fieldState.error?.message
        }
        onBlur={field.onBlur}
        onChange={(event) => {
          setTekst(event.target.value);
          datePickerProperties.inputProps.onChange?.(event);
        }}
        ref={field.ref}
      />
    </DatePicker>
  );
}
