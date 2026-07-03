import {
  type ComboboxProps,
  UNSAFE_Combobox as Combobox,
} from "@navikt/ds-react";
import { type RegisterOptions, useController } from "react-hook-form";

export type ComboboxWrappedOption = {
  label: string;
  value: string;
};

type ComboboxWrappedProps = {
  name: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  options: ComboboxWrappedOption[];
  rules?: RegisterOptions;
  shouldUnregister?: boolean;
  onOptionSelected?: (option?: ComboboxWrappedOption) => void;
} & Omit<
  ComboboxProps,
  | "options"
  | "label"
  | "description"
  | "selectedOptions"
  | "onToggleSelected"
  | "value"
  | "onChange"
  | "name"
  | "error"
  | "onBlur"
>;

/**
 * Wrapper rundt Aksel sin `UNSAFE_Combobox` som lar brukeren søke i en liste med
 * `{ label, value }`-alternativer (f.eks. navn og org.nr.), integrert med react-hook-form.
 * Kun single-select er støttet.
 *
 * Vi lar Combobox styre sin egen søketekst internt (uncontrolled `value`), og lar den
 * innebygde visningen av valgt alternativ (via `selectedOptions`) vise navnet/label etter
 * at et valg er gjort – i tråd med hvordan Aksel sin single-select-variant er designet.
 */
export function ComboboxWrapped({
  name,
  label,
  description,
  options,
  rules = {},
  shouldUnregister,
  onOptionSelected,
  ...comboboxProps
}: ComboboxWrappedProps) {
  const { field, fieldState } = useController({
    name,
    rules,
    shouldUnregister,
  });

  const valgtAlternativ = options.find(
    (option) => option.value === field.value,
  );

  return (
    <Combobox
      {...comboboxProps}
      label={label}
      description={description}
      options={options}
      error={fieldState.error?.message}
      name={field.name}
      ref={field.ref}
      onBlur={field.onBlur}
      selectedOptions={valgtAlternativ ? [valgtAlternativ] : []}
      onToggleSelected={(verdi, erValgt) => {
        if (erValgt) {
          const nyttValgtAlternativ = options.find(
            (option) => option.value === verdi,
          );
          field.onChange(nyttValgtAlternativ?.value ?? verdi);
          onOptionSelected?.(nyttValgtAlternativ);
        } else {
          // eslint-disable-next-line unicorn/no-useless-undefined
          field.onChange(undefined);
          onOptionSelected?.();
        }
      }}
    />
  );
}
