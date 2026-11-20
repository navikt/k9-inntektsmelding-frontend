import { PlusIcon, TrashIcon } from "@navikt/aksel-icons";
import { Button, Fieldset, Heading, HStack, VStack } from "@navikt/ds-react";
import { useLocation } from "@tanstack/react-router";
import { useFieldArray, useFormContext } from "react-hook-form";

import { DateRangePickerWrapped } from "~/features/shared/react-hook-form-wrappers/DateRangePickerWrapped.tsx";

import { OmsorgspengerFravær } from "./omsorgspengerFraværSchema";

type Props = {
  overskrift: string;
  år?: number;
  overskriftsnivå?: "3" | "4";
};

function utledDefaultMonth(år: number) {
  const iDag = new Date();
  if (år === iDag.getFullYear()) {
    return iDag;
  }
  return new Date(år, 11, 31);
}

export const FraværHeleDagerListeInput = ({
  overskrift,
  år,
  overskriftsnivå = "3",
}: Props) => {
  const { control, getValues } =
    useFormContext<Pick<OmsorgspengerFravær, "fraværHeleDager">>();
  const location = useLocation();
  const erAGIUnntattAaregister = location.pathname.startsWith(
    "/agi-unntatt-aaregister",
  );
  const { fields, append, remove } = useFieldArray({
    control,
    name: "fraværHeleDager",
  });

  const defaultMonth = år === undefined ? undefined : utledDefaultMonth(år);

  return (
    <VStack gap="space-16">
      <Heading level={overskriftsnivå} size="small">
        {overskrift}
      </Heading>
      {fields.map((periode, index) => (
        <Fieldset
          key={periode.id}
          legend={`Fraværsperiode ${index + 1}`}
          hideLegend
        >
          <HStack
            className="border-solid border-0 border-l-4 border-ax-bg-neutral-soft pl-4 py-2 relative"
            gap="space-16"
          >
            <DateRangePickerWrapped
              datepickerProps={{ defaultMonth }}
              name={`fraværHeleDager.${index}`}
              rules={{
                fom: {
                  required: "Fra-dato er påkrevd",
                  validate: () => {
                    if (!erAGIUnntattAaregister) return true;
                    const allePerioder = getValues("fraværHeleDager");
                    const aktivPeriode = allePerioder[index];
                    if (!aktivPeriode?.fom || !aktivPeriode?.tom) return true;
                    const overlap = allePerioder.some(
                      (p, i) =>
                        i !== index &&
                        p.fom &&
                        p.tom &&
                        !(aktivPeriode.tom < p.fom || aktivPeriode.fom > p.tom),
                    );
                    return overlap
                      ? "Perioden overlapper med en annen periode"
                      : true;
                  },
                },
                tom: {
                  required: "Til-dato er påkrevd",
                  validate: () => {
                    if (!erAGIUnntattAaregister) return true;
                    const allePerioder = getValues("fraværHeleDager");
                    const aktivPeriode = allePerioder[index];
                    if (!aktivPeriode?.fom || !aktivPeriode?.tom) return true;
                    const overlap = allePerioder.some(
                      (p, i) =>
                        i !== index &&
                        p.fom &&
                        p.tom &&
                        !(aktivPeriode.tom < p.fom || aktivPeriode.fom > p.tom),
                    );
                    return overlap
                      ? "Perioden overlapper med en annen periode"
                      : true;
                  },
                },
              }}
            />
            <Button
              aria-label="Slett periode"
              className="absolute top-9 right-20"
              icon={<TrashIcon aria-hidden />}
              onClick={() => remove(index)}
              size="small"
              type="button"
              variant="tertiary"
            >
              Slett
            </Button>
          </HStack>
        </Fieldset>
      ))}
      <div>
        <Button
          icon={<PlusIcon aria-hidden />}
          onClick={() => append({ fom: "", tom: "" }, { shouldFocus: false })}
          size="small"
          type="button"
          variant="secondary"
        >
          Legg til periode
        </Button>
      </div>
    </VStack>
  );
};
